<?php

namespace App\Http\Controllers;

use App\Models\PickupRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpFoundation\Response;

class VolunteerTaskController extends Controller
{
    public function index(): JsonResponse
    {
        $tasks = PickupRequest::query()
            ->where('status', 'pending')
            ->where('admin_review_status', 'approved')
            ->whereNull('assigned_volunteer_id')
            ->with('user:id,first_name,last_name,phone')
            ->orderBy('pickup_date')
            ->orderBy('pickup_time')
            ->get();

        return response()->json(['data' => $tasks]);
    }

    public function show(PickupRequest $pickup): JsonResponse
    {
        return response()->json([
            'data' => $pickup->load([
                'user:id,first_name,last_name,phone',
                'assignedVolunteer:id,first_name,last_name,phone',
            ]),
        ]);
    }

    public function myTasks(Request $request): JsonResponse
    {
        $tasks = $request->user()
            ->assignedPickups()
            ->with('user:id,first_name,last_name,phone')
            ->latest('assigned_at')
            ->get();

        return response()->json(['data' => $tasks]);
    }

    public function claim(Request $request, PickupRequest $pickup): JsonResponse
    {
        abort_unless(
            $request->user()->role === 'admin'
                || ($request->user()->volunteer_enabled
                    && $request->user()->volunteer_availability === 'available'),
            Response::HTTP_FORBIDDEN,
            'Volunteer mode must be enabled and available before claiming a task.'
        );

        $task = DB::transaction(function () use ($request, $pickup) {
            $task = PickupRequest::query()->lockForUpdate()->findOrFail($pickup->id);

            abort_if(
                $task->status !== 'pending' || $task->assigned_volunteer_id !== null || $task->admin_review_status !== 'approved',
                Response::HTTP_CONFLICT,
                'This task is no longer available.'
            );

            $task->forceFill([
                'assigned_volunteer_id' => $request->user()->id,
                'status' => 'accepted',
                'assigned_at' => now(),
                'claim_review_status' => 'pending',
                'claim_reviewed_by' => null,
                'claim_reviewed_at' => null,
                'claim_rejection_reason' => null,
            ])->save();

            return $task->fresh();
        });

        return response()->json([
            'message' => 'Task claim submitted for administrator approval.',
            'data' => $task,
        ]);
    }

    public function start(Request $request, PickupRequest $pickup): JsonResponse
    {
        $task = DB::transaction(function () use ($request, $pickup) {
            $task = PickupRequest::query()->lockForUpdate()->findOrFail($pickup->id);
            $this->ensureAssignedVolunteerOrAdmin($request, $task);
            abort_unless($task->claim_review_status === 'approved' || $request->user()->role === 'admin', Response::HTTP_FORBIDDEN, 'This volunteer claim is awaiting admin approval.');
            $this->ensureStatus($task, 'accepted');

            $task->forceFill([
                'status' => 'in_progress',
                'started_at' => now(),
            ])->save();

            return $task->fresh();
        });

        return response()->json([
            'message' => 'Pickup started successfully',
            'data' => $task,
        ]);
    }

    public function complete(Request $request, PickupRequest $pickup): JsonResponse
    {
        $task = DB::transaction(function () use ($request, $pickup) {
            $task = PickupRequest::query()->lockForUpdate()->findOrFail($pickup->id);
            $this->ensureAssignedVolunteerOrAdmin($request, $task);
            $this->ensureStatus($task, 'in_progress');

            $points = max(20, (int) round((float) $task->quantity * 5));

            $task->forceFill([
                'status' => 'completed',
                'completed_at' => now(),
                'earned_points' => $points,
            ])->save();

            $task->user()->increment('eco_points', $points);

            return $task->fresh();
        });

        return response()->json([
            'message' => 'Pickup completed successfully',
            'data' => $task,
        ]);
    }

    private function ensureAssignedVolunteerOrAdmin(Request $request, PickupRequest $task): void
    {
        abort_unless(
            $request->user()->role === 'admin'
                || $task->assigned_volunteer_id === $request->user()->id,
            Response::HTTP_FORBIDDEN
        );
    }

    private function ensureStatus(PickupRequest $task, string $requiredStatus): void
    {
        abort_unless(
            $task->status === $requiredStatus,
            Response::HTTP_UNPROCESSABLE_ENTITY,
            "Task must be {$requiredStatus} before this action."
        );
    }
}
