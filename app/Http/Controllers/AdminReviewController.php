<?php

namespace App\Http\Controllers;

use App\Models\AreaReport;
use App\Models\PickupPhoto;
use App\Models\PickupRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Symfony\Component\HttpFoundation\Response;

class AdminReviewController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $filters = $request->validate([
            'type' => ['nullable', Rule::in(['pickup', 'photo', 'claim', 'area-report'])],
            'status' => ['nullable', Rule::in(['pending', 'approved', 'rejected'])],
        ]);
        $types = isset($filters['type']) ? [$filters['type']] : ['pickup', 'photo', 'claim', 'area-report'];
        $status = $filters['status'] ?? 'pending';
        $data = [];

        if (in_array('pickup', $types, true)) {
            $data['pickups'] = PickupRequest::query()->where('admin_review_status', $status)->with('user:id,first_name,last_name,email')->latest()->paginate(20, ['*'], 'pickups_page');
        }
        if (in_array('photo', $types, true)) {
            $data['photos'] = PickupPhoto::query()->where('status', $status)->with(['pickupRequest:id,user_id,waste_type,status', 'uploader:id,first_name,last_name'])->latest()->paginate(20, ['*'], 'photos_page');
        }
        if (in_array('claim', $types, true)) {
            $data['claims'] = PickupRequest::query()->whereNotNull('assigned_volunteer_id')->where('claim_review_status', $status)->with(['user:id,first_name,last_name', 'assignedVolunteer:id,first_name,last_name,email'])->latest('assigned_at')->paginate(20, ['*'], 'claims_page');
        }
        if (in_array('area-report', $types, true)) {
            $data['area_reports'] = AreaReport::query()->where('admin_review_status', $status)->with('user:id,first_name,last_name,email')->latest()->paginate(20, ['*'], 'area_reports_page');
        }

        return response()->json(['data' => $data]);
    }

    public function approve(Request $request, string $type, int $id): JsonResponse
    {
        return $this->review($request, $type, $id, true);
    }

    public function reject(Request $request, string $type, int $id): JsonResponse
    {
        $validated = $request->validate(['reason' => ['required', 'string', 'max:1000']]);
        return $this->review($request, $type, $id, false, $validated['reason']);
    }

    private function review(Request $request, string $type, int $id, bool $approve, ?string $reason = null): JsonResponse
    {
        abort_unless(in_array($type, ['pickup', 'photo', 'claim', 'area-report'], true), Response::HTTP_NOT_FOUND);
        $record = DB::transaction(function () use ($request, $type, $id, $approve, $reason) {
            $model = match ($type) {
                'pickup', 'claim' => PickupRequest::class,
                'photo' => PickupPhoto::class,
                'area-report' => AreaReport::class,
            };
            $item = $model::query()->lockForUpdate()->findOrFail($id);
            if ($type === 'pickup') {
                abort_unless($item->admin_review_status === 'pending', Response::HTTP_CONFLICT, 'This pickup has already been reviewed.');
                $item->forceFill(['admin_review_status' => $approve ? 'approved' : 'rejected', 'admin_reviewed_by' => $request->user()->id, 'admin_reviewed_at' => now(), 'admin_rejection_reason' => $reason]);
                if (!$approve) {
                    $item->forceFill(['status' => 'rejected']);
                }
                $item->save();
            } elseif ($type === 'photo') {
                abort_unless($item->status === 'pending', Response::HTTP_CONFLICT, 'This photo has already been reviewed.');
                $item->forceFill(['status' => $approve ? 'approved' : 'rejected', 'rejection_reason' => $reason, 'verified_by' => $request->user()->id, 'verified_at' => now()])->save();
            } elseif ($type === 'claim') {
                abort_unless($item->claim_review_status === 'pending' && $item->assigned_volunteer_id, Response::HTTP_CONFLICT, 'This volunteer claim has already been reviewed.');
                $item->forceFill(['claim_review_status' => $approve ? 'approved' : 'rejected', 'claim_reviewed_by' => $request->user()->id, 'claim_reviewed_at' => now(), 'claim_rejection_reason' => $reason]);
                if (!$approve) {
                    $item->forceFill(['assigned_volunteer_id' => null, 'assigned_at' => null, 'status' => 'pending']);
                }
                $item->save();
            } else {
                abort_unless($item->admin_review_status === 'pending', Response::HTTP_CONFLICT, 'This area report has already been reviewed.');
                $item->forceFill(['admin_review_status' => $approve ? 'approved' : 'rejected', 'admin_reviewed_by' => $request->user()->id, 'admin_reviewed_at' => now(), 'admin_rejection_reason' => $reason]);
                if (!$approve) {
                    $item->forceFill(['status' => 'rejected']);
                }
                $item->save();
            }
            return $item->fresh();
        });

        return response()->json(['message' => $approve ? 'Record approved.' : 'Record rejected.', 'data' => $record]);
    }
}
