<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreAreaReportRequest;
use App\Http\Requests\UpdateAreaReportRequest;
use App\Models\AreaReport;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class AreaReportController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        $reports = AreaReport::where('user_id', $user->id)
            ->latest()
            ->get();

        return response()->json([
            'success' => true,
            'message' => 'Area reports retrieved successfully.',
            'data' => $reports,
        ]);
    }

    public function store(StoreAreaReportRequest $request)
    {
        $data = $request->validated();

        if ($request->hasFile('image')) {
            $data['image_path'] = $request->file('image')
                ->store('area-reports', 'public');

            unset($data['image']);
        }

        $data['user_id'] = $request->user()->id;
        $data['status'] = 'pending';

        $report = AreaReport::create($data);

        return response()->json([
            'success' => true,
            'message' => 'Area report submitted successfully.',
            'data' => $report,
        ], 201);
    }

    public function show(Request $request, AreaReport $report)
    {
        if ($report->user_id !== $request->user()->id) {
            return response()->json([
                'success' => false,
                'message' => 'You are not authorized to view this report.',
            ], 403);
        }

        return response()->json([
            'success' => true,
            'message' => 'Area report retrieved successfully.',
            'data' => $report,
        ]);
    }

    public function update(
        UpdateAreaReportRequest $request,
        AreaReport $report
    ) {
        if ($report->user_id !== $request->user()->id) {
            return response()->json([
                'success' => false,
                'message' => 'You are not authorized to modify this report.',
            ], 403);
        }

        if ($report->status !== 'pending') {
            return response()->json([
                'success' => false,
                'message' => 'Only pending reports can be modified.',
            ], 422);
        }

        $data = $request->validated();

        if ($request->hasFile('image')) {
            if ($report->image_path) {
                Storage::disk('public')->delete($report->image_path);
            }

            $data['image_path'] = $request->file('image')
                ->store('area-reports', 'public');

            unset($data['image']);
        }

        $report->update($data);

        return response()->json([
            'success' => true,
            'message' => 'Area report updated successfully.',
            'data' => $report->fresh(),
        ]);
    }

    public function assign(Request $request, AreaReport $report)
    {
        $user = $request->user();

        if (!in_array($user->role, ['admin', 'volunteer'])) {
            return response()->json([
                'success' => false,
                'message' => 'You are not authorized to assign reports.',
            ], 403);
        }

        if ($report->status !== 'pending') {
            return response()->json([
                'success' => false,
                'message' => 'Only pending reports can be assigned.',
            ], 422);
        }

        $data = $request->validate([
            'assigned_volunteer_id' => 'nullable|exists:users,id',
        ]);

        $report->update([
            'assigned_volunteer_id' => $data['assigned_volunteer_id'] ?? $user->id,
            'assigned_at' => now(),
            'status' => 'assigned',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Area report assigned successfully.',
            'data' => $report->fresh(),
        ]);
    }

    public function resolve(Request $request, AreaReport $report)
    {
        $user = $request->user();

        if (!in_array($user->role, ['admin', 'volunteer'])) {
            return response()->json([
                'success' => false,
                'message' => 'You are not authorized to resolve reports.',
            ], 403);
        }

        if (!in_array($report->status, ['assigned', 'in_progress'])) {
            return response()->json([
                'success' => false,
                'message' => 'This report cannot be resolved from its current status.',
            ], 422);
        }

        $report->update([
            'status' => 'resolved',
            'resolved_at' => now(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Area report resolved successfully.',
            'data' => $report->fresh(),
        ]);
    }
}