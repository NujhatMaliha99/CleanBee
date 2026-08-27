<?php

namespace App\Http\Controllers;

use App\Models\PickupPhoto;
use App\Models\PickupRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Symfony\Component\HttpFoundation\Response;

class PickupPhotoController extends Controller
{
    public function index(Request $request, PickupRequest $pickup): JsonResponse
    {
        $this->authorizePickupAccess($request, $pickup);

        return response()->json([
            'data' => $pickup->photos()
                ->with(['uploader:id,first_name,last_name', 'verifier:id,first_name,last_name'])
                ->latest()
                ->get(),
        ]);
    }

    public function store(Request $request, PickupRequest $pickup): JsonResponse
    {
        $this->authorizePickupAccess($request, $pickup);

        $validated = $request->validate([
            'photo' => ['required', 'image', 'mimes:jpeg,jpg,png', 'max:5120'],
            'photo_type' => ['required', Rule::in(['before', 'after'])],
        ]);

        $path = $request->file('photo')->store("pickup-photos/{$pickup->id}", 'public');

        try {
            $photo = $pickup->photos()->create([
                'uploaded_by' => $request->user()->id,
                'photo_type' => $validated['photo_type'],
                'image_path' => $path,
            ]);
        } catch (\Throwable $exception) {
            Storage::disk('public')->delete($path);
            throw $exception;
        }

        return response()->json([
            'message' => 'Pickup photo uploaded successfully',
            'data' => $photo->refresh()->load('uploader:id,first_name,last_name'),
        ], Response::HTTP_CREATED);
    }

    public function approve(Request $request, PickupPhoto $photo): JsonResponse
    {
        $this->ensurePending($photo);

        $photo->update([
            'status' => 'approved',
            'rejection_reason' => null,
            'verified_by' => $request->user()->id,
            'verified_at' => now(),
        ]);

        return response()->json([
            'message' => 'Pickup photo approved successfully',
            'data' => $photo->fresh(),
        ]);
    }

    public function reject(Request $request, PickupPhoto $photo): JsonResponse
    {
        $validated = $request->validate([
            'reason' => ['required', 'string', 'max:1000'],
        ]);

        $this->ensurePending($photo);

        $photo->update([
            'status' => 'rejected',
            'rejection_reason' => $validated['reason'],
            'verified_by' => $request->user()->id,
            'verified_at' => now(),
        ]);

        return response()->json([
            'message' => 'Pickup photo rejected successfully',
            'data' => $photo->fresh(),
        ]);
    }

    private function authorizePickupAccess(Request $request, PickupRequest $pickup): void
    {
        $user = $request->user();
        $hasAccess = $pickup->user_id === $user->id
            || $pickup->assigned_volunteer_id === $user->id
            || $user->role === 'admin';

        abort_unless($hasAccess, Response::HTTP_FORBIDDEN, 'You cannot access photos for this pickup request.');
    }

    private function ensurePending(PickupPhoto $photo): void
    {
        abort_unless(
            $photo->status === 'pending',
            Response::HTTP_UNPROCESSABLE_ENTITY,
            'Only pending photos can be reviewed.'
        );
    }
}
