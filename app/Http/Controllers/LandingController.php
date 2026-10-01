<?php

namespace App\Http\Controllers;

use App\Models\PickupRequest;
use App\Models\Reward;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class LandingController extends Controller
{
    public function index(): JsonResponse
    {
        $completedPickups = PickupRequest::query()->where('status', 'completed');

        $activities = PickupRequest::query()
            ->whereIn('status', ['accepted', 'in_progress', 'completed'])
            ->latest('updated_at')
            ->limit(5)
            ->get(['id', 'status', 'waste_type', 'updated_at']);

        return response()->json([
            'data' => [
                'stats' => [
                    'waste_diverted_kg' => (float) (clone $completedPickups)
                        ->where('quantity_unit', 'kg')
                        ->sum('quantity'),
                    'completed_pickups' => (clone $completedPickups)->count(),
                    'total_eco_points' => (int) User::query()->sum('eco_points'),
                    'active_volunteers' => User::query()->where('role', 'volunteer')->count(),
                ],
                'activities' => $activities,
                'rewards' => Reward::query()
                    ->where('is_active', true)
                    ->orderBy('points_required')
                    ->get(['id', 'name', 'description', 'points_required', 'icon']),
            ],
        ]);
    }

    public function wallet(Request $request): JsonResponse
    {
        $user = $request->user();
        $points = (int) $user->eco_points;
        $nextReward = Reward::query()
            ->where('is_active', true)
            ->where('points_required', '>', $points)
            ->orderBy('points_required')
            ->first(['id', 'name', 'points_required']);

        return response()->json([
            'data' => [
                'points' => $points,
                'recent_pickups' => $user->pickupRequests()
                    ->latest('updated_at')
                    ->limit(2)
                    ->get(['id', 'status', 'earned_points', 'updated_at']),
                'next_reward' => $nextReward,
                'points_to_next_reward' => $nextReward
                    ? max(0, $nextReward->points_required - $points)
                    : 0,
            ],
        ]);
    }
}
