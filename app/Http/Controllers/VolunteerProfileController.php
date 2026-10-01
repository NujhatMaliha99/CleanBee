<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class VolunteerProfileController extends Controller
{
    public function updateMode(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'enabled' => ['required', 'boolean'],
        ]);

        $user = $request->user();

        if (! $validated['enabled']) {
            $hasActiveTasks = $user->assignedPickups()
                ->whereIn('status', ['accepted', 'in_progress'])
                ->exists();

            if ($hasActiveTasks) {
                return response()->json([
                    'message' => 'Complete your active volunteer tasks before disabling volunteer mode.',
                ], Response::HTTP_UNPROCESSABLE_ENTITY);
            }
        }

        $user->forceFill([
            'volunteer_enabled' => $validated['enabled'],
            'volunteer_availability' => $validated['enabled'] ? 'available' : 'unavailable',
        ])->save();

        return response()->json([
            'message' => $validated['enabled']
                ? 'Volunteer mode enabled successfully.'
                : 'Volunteer mode disabled successfully.',
            'user' => $user->fresh(),
        ]);
    }

    public function updateAvailability(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'availability' => ['required', 'in:available,unavailable'],
        ]);

        $user = $request->user();

        abort_unless(
            $user->role === 'admin' || $user->volunteer_enabled,
            Response::HTTP_FORBIDDEN,
            'Enable volunteer mode before changing availability.'
        );

        $user->forceFill([
            'volunteer_availability' => $validated['availability'],
        ])->save();

        return response()->json([
            'message' => 'Volunteer availability updated successfully.',
            'user' => $user->fresh(),
        ]);
    }
}
