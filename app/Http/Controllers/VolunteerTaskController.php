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
        abort_unless($request->user()->role === 'volunteer', Response::HTTP_FORBIDDEN);

        $task = DB::transaction(function () use ($request, $pickup) {
            $task = PickupRequest::query()->lockForUpdate()->findOrFail($pickup->id);

            abort_if(
                $task->status !== 'pending' || $task->assigned_volunteer_id !== null,
                Response::HTTP_CONFLICT,
                'This task is no longer available.'
            );

            $task->forceFill([
                'assigned_volunteer_id' => $request->user()->id,
                'status' => 'accepted',
                'assigned_at' => now(),
            ])->save();

            return $task->fresh();
        });

        return response()->json([
            'message' => 'Task claimed successfully',
            'data' => $task,
        ]);
    }

    public function start(Request $request, PickupRequest $pickup): JsonResponse
    {
        $task = DB::transaction(function () use ($request, $pickup) {
            $task = PickupRequest::query()->lockForUpdate()->findOrFail($pickup->id);
            $this->ensureAssignedVolunteerOrAdmin($request, $task);
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

            $task->forceFill([
                'status' => 'completed',
                'completed_at' => now(),
            ])->save();

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
