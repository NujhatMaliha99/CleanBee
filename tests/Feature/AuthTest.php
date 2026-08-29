<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Auth\Notifications\VerifyEmail;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\URL;
use Tests\TestCase;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_register_successfully(): void
    {
        Notification::fake();

        $response = $this->postJson('/api/register', [
            'first_name' => 'Nujhat',
            'last_name'  => 'Maliha',
            'email'      => 'nujhat@example.com',
            'password'   => 'password123',
        ]);

        $response->assertStatus(201)
                 ->assertJsonStructure(['message', 'user', 'token']);

        $this->assertDatabaseHas('users', [
            'email' => 'nujhat@example.com',
        ]);

        Notification::assertSentTo(User::where('email', 'nujhat@example.com')->first(), VerifyEmail::class);
    }

    public function test_user_can_verify_email_from_signed_link(): void
    {
        $user = User::create([
            'first_name' => 'Nujhat',
            'email' => 'nujhat@example.com',
            'password' => Hash::make('password123'),
        ]);

        $verificationUrl = URL::temporarySignedRoute(
            'verification.verify',
            now()->addMinutes(60),
            ['id' => $user->id, 'hash' => sha1($user->email)]
        );

        $this->get($verificationUrl)
            ->assertRedirect('http://localhost:5173/verify-email?verified=1');

        $this->assertTrue($user->fresh()->hasVerifiedEmail());
    }

    public function test_user_can_resend_verification_email(): void
    {
        Notification::fake();

        $user = User::create([
            'first_name' => 'Nujhat',
            'email' => 'nujhat@example.com',
            'password' => Hash::make('password123'),
        ]);

        $this->actingAs($user, 'sanctum')
            ->postJson('/api/email/verification-notification')
            ->assertOk()
            ->assertJson(['message' => 'Verification email sent']);

        Notification::assertSentTo($user, VerifyEmail::class);
    }

    public function test_unverified_user_cannot_update_profile(): void
    {
        $user = User::create([
            'first_name' => 'Nujhat',
            'email' => 'nujhat@example.com',
            'password' => Hash::make('password123'),
        ]);

        $this->actingAs($user, 'sanctum')
            ->putJson('/api/profile', [
                'first_name' => 'Updated',
                'email' => $user->email,
            ])
            ->assertForbidden();
    }

    public function test_registration_validation_fails_for_invalid_email(): void
    {
        $response = $this->postJson('/api/register', [
            'first_name' => 'Nujhat',
            'email'      => 'invalid-email',
            'password'   => '123',
        ]);

        $response->assertStatus(422)
                 ->assertJsonValidationErrors(['email', 'password']);
    }

    public function test_user_can_login_with_valid_credentials(): void
    {
        $user = User::create([
            'first_name' => 'Nujhat',
            'email'      => 'nujhat@example.com',
            'password'   => Hash::make('password123'),
        ]);

        $response = $this->postJson('/api/login', [
            'email'    => 'nujhat@example.com',
            'password' => 'password123',
        ]);

        $response->assertStatus(200)
                 ->assertJsonStructure(['message', 'user', 'token']);
    }

    public function test_login_normalizes_email_address(): void
    {
        User::create([
            'first_name' => 'Nujhat',
            'email'      => 'nujhat@example.com',
            'password'   => Hash::make('password123'),
        ]);

        $response = $this->postJson('/api/login', [
            'email'    => '  NUJHAT@EXAMPLE.COM  ',
            'password' => 'password123',
        ]);

        $response->assertStatus(200)
                 ->assertJsonPath('user.email', 'nujhat@example.com');
    }

    public function test_login_fails_with_invalid_credentials(): void
    {
        User::create([
            'first_name' => 'Nujhat',
            'email'      => 'nujhat@example.com',
            'password'   => Hash::make('password123'),
        ]);

        $response = $this->postJson('/api/login', [
            'email'    => 'nujhat@example.com',
            'password' => 'wrongpassword',
        ]);

        $response->assertStatus(401)
                 ->assertJson(['message' => 'Invalid email or password']);
    }

    public function test_protected_user_route_requires_authentication(): void
    {
        $response = $this->getJson('/api/user');
        $response->assertStatus(401);
    }

    public function test_role_middleware_blocks_regular_users_from_admin_route(): void
    {
        $user = User::create([
            'first_name' => 'Regular',
            'email'      => 'user@example.com',
            'password'   => Hash::make('password123'),
            'role'       => 'user',
        ]);

        $response = $this->actingAs($user, 'sanctum')->getJson('/api/admin/reports');
        $response->assertStatus(403);
    }

    public function test_user_can_logout_successfully(): void
    {
        $user = User::create([
            'first_name' => 'Nujhat',
            'email'      => 'nujhat@example.com',
            'password'   => Hash::make('password123'),
        ]);
        $token = $user->createToken('auth_token')->plainTextToken;

        $response = $this->withToken($token)->postJson('/api/logout');

        $response->assertStatus(200)
                 ->assertJson(['message' => 'Successfully logged out']);

        $this->assertDatabaseCount('personal_access_tokens', 0);
    }
}
