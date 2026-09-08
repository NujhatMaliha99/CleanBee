<?php

namespace App\Http\Controllers;

use App\Http\Requests\LoginRequest;
use App\Http\Requests\RegisterRequest;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Auth\Events\Verified;
use Illuminate\Support\Facades\Hash;
use Symfony\Component\HttpFoundation\Response;

class AuthController extends Controller
{
    public function register(RegisterRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $user = User::create([
            'first_name' => $validated['first_name'],
            'last_name'  => $validated['last_name'] ?? null,
            'email'      => $validated['email'],
            'password'   => Hash::make($validated['password']),
            'role'       => $validated['role'] ?? 'user',
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;
        if (config('app.require_email_verification')) {
            $user->sendEmailVerificationNotification();
        }

        return response()->json([
            'message' => 'User registered successfully',
            'user'    => $user,
            'token'   => $token,
        ], Response::HTTP_CREATED);
    }

    public function login(LoginRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $user = User::whereRaw('LOWER(email) = ?', [$validated['email']])->first();

        if (!$user || !Hash::check($validated['password'], $user->password)) {
            return response()->json([
                'message' => 'Invalid email or password'
            ], Response::HTTP_UNAUTHORIZED);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Login successful',
            'user'    => $user,
            'token'   => $token,
        ], Response::HTTP_OK);
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()?->delete();

        return response()->json([
            'message' => 'Successfully logged out'
        ], Response::HTTP_OK);
    }

    public function me(Request $request): JsonResponse
    {
        return response()->json([
            'user' => $request->user()
        ], Response::HTTP_OK);
    }

    public function resendVerification(Request $request): JsonResponse
    {
        if ($request->user()->hasVerifiedEmail()) {
            return response()->json([
                'message' => 'Email is already verified',
            ], Response::HTTP_OK);
        }

        $request->user()->sendEmailVerificationNotification();

        return response()->json([
            'message' => 'Verification email sent',
        ], Response::HTTP_OK);
    }

    public function verifyEmail(Request $request, string $id)
    {
        $user = User::findOrFail($id);

        abort_unless(
            hash_equals((string) $request->route('hash'), sha1($user->getEmailForVerification())),
            Response::HTTP_FORBIDDEN
        );

        if (! $user->hasVerifiedEmail() && $user->markEmailAsVerified()) {
            event(new Verified($user));
        }

        return redirect(rtrim(config('app.frontend_url'), '/') . '/verify-email?verified=1');
    }

    public function updateProfile(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'first_name' => ['required', 'string', 'max:255'],
            'last_name'  => ['nullable', 'string', 'max:255'],
            'email'      => [
                'required',
                'email',
                'max:255',
                'unique:users,email,' . $request->user()->id
            ],
            'phone'      => ['nullable', 'string', 'max:30'],
            'address'    => ['nullable', 'string', 'max:1000'],
            'bio'        => ['nullable', 'string', 'max:1000'],
        ]);

        $user = $request->user();
        $emailChanged = strtolower($validated['email']) !== strtolower($user->email);
        $user->update($validated);

        if ($emailChanged) {
            $user->forceFill(['email_verified_at' => null])->save();
            if (config('app.require_email_verification')) {
                $user->sendEmailVerificationNotification();
            }
        }

        return response()->json([
            'message' => 'Profile updated successfully',
            'user' => $user->fresh(),
        ], Response::HTTP_OK);
    }
}
