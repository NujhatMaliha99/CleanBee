<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function show(Request $request): JsonResponse
    {
        $pickups = $request->user()->pickupRequests();
        $counts = (clone $pickups)->selectRaw('status, COUNT(*) as aggregate')->groupBy('status')->pluck('aggregate', 'status');
        $completed = (int) ($counts['completed'] ?? 0);

        return response()->json(['data' => [
            'stats' => [
                'total' => (int) array_sum($counts->all()),
                'completed' => $completed,
                'pending' => (int) ($counts['pending'] ?? 0),
                'accepted' => (int) ($counts['accepted'] ?? 0),
                'in_progress' => (int) ($counts['in_progress'] ?? 0),
                'points' => (int) $request->user()->eco_points,
            ],
            'activities' => (clone $pickups)->latest('updated_at')->limit(5)
                ->get(['id', 'status', 'waste_type', 'updated_at']),
        ]]);
    }
}
