<?php

namespace App\Http\Controllers;

use App\Http\Requests\StorePickupRequest;
use App\Http\Requests\UpdatePickupRequest;
use App\Models\PickupRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\Response;

class PickupRequestController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $pickups = $request->user()
            ->pickupRequests()
            ->with('assignedVolunteer:id,first_name,last_name,phone')
            ->latest()
            ->get();

        return response()->json(['data' => $pickups]);
    }

    public function store(StorePickupRequest $request): JsonResponse
    {
        $data = $request->validated();

        if ($request->hasFile('image')) {
            $data['image_path'] = $request->file('image')->store('pickup-images', 'public');
        }

        unset($data['image']);
        $pickup = $request->user()->pickupRequests()->create($data)->refresh();

        return response()->json([
            'message' => 'Pickup request created successfully',
            'data' => $pickup,
        ], Response::HTTP_CREATED);
    }

    public function show(Request $request, PickupRequest $pickup): JsonResponse
    {
        $this->ensureOwner($request, $pickup);

        return response()->json([
            'data' => $pickup->load('assignedVolunteer:id,first_name,last_name,phone'),
        ]);
    }

    public function update(UpdatePickupRequest $request, PickupRequest $pickup): JsonResponse
    {
        $this->ensureOwner($request, $pickup);
        $this->ensurePending($pickup);
        $data = $request->validated();

        if ($request->hasFile('image')) {
            if ($pickup->image_path) {
                Storage::disk('public')->delete($pickup->image_path);
            }

            $data['image_path'] = $request->file('image')->store('pickup-images', 'public');
        }

        unset($data['image']);
        $pickup->update($data);

        return response()->json([
            'message' => 'Pickup request updated successfully',
            'data' => $pickup->fresh(),
        ]);
    }

    public function destroy(Request $request, PickupRequest $pickup): JsonResponse
    {
        $this->ensureOwner($request, $pickup);
        $this->ensurePending($pickup);
        $pickup->forceFill(['status' => 'cancelled'])->save();

        return response()->json([
            'message' => 'Pickup request cancelled successfully',
            'data' => $pickup->fresh(),
        ]);
    }

    private function ensureOwner(Request $request, PickupRequest $pickup): void
    {
        abort_unless($pickup->user_id === $request->user()->id, Response::HTTP_FORBIDDEN);
    }

    private function ensurePending(PickupRequest $pickup): void
    {
        abort_unless(
            $pickup->status === 'pending',
            Response::HTTP_UNPROCESSABLE_ENTITY,
            'Only pending pickup requests can be modified.'
        );
    }
}
