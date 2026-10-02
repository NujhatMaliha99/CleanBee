<?php

namespace App\Http\Controllers;

use App\Models\AreaReport;
use App\Models\PickupPhoto;
use App\Models\PickupRequest;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Symfony\Component\HttpFoundation\Response;

class AdminReviewController extends Controller
{
    public function dashboard(): JsonResponse
    {
        $pickups = PickupRequest::query()
            ->with('user:id,first_name,last_name,email')
            ->latest()
            ->limit(100)
            ->get();

        $photos = PickupPhoto::query()
            ->with([
                'pickupRequest:id,user_id,waste_type,pickup_address',
                'uploader:id,first_name,last_name,email',
            ])
            ->latest()
            ->limit(100)
            ->get();

        $claims = PickupRequest::query()
            ->whereNotNull('assigned_volunteer_id')
            ->with([
                'user:id,first_name,last_name,email',
                'assignedVolunteer:id,first_name,last_name,email,volunteer_availability',
            ])
            ->latest('assigned_at')
            ->limit(100)
            ->get();

        $areaReports = AreaReport::query()
            ->with('user:id,first_name,last_name,email')
            ->latest()
            ->limit(100)
            ->get();

        $users = User::query()
            ->select([
                'id',
                'first_name',
                'last_name',
                'email',
                'role',
                'volunteer_enabled',
                'volunteer_availability',
                'created_at',
            ])
            ->latest()
            ->limit(200)
            ->get();

        $history = collect()
            ->concat($pickups->whereNotNull('admin_reviewed_at')->map(fn (PickupRequest $pickup) => [
                'id' => "pickup-{$pickup->id}",
                'request_type' => 'pickup',
                'target_name' => trim(($pickup->user?->first_name ?? '') . ' ' . ($pickup->user?->last_name ?? '')) ?: "Pickup #{$pickup->id}",
                'action' => $pickup->admin_review_status,
                'reason' => $pickup->admin_rejection_reason,
                'reviewed_at' => $pickup->admin_reviewed_at,
            ]))
            ->concat($photos->whereNotNull('verified_at')->map(fn (PickupPhoto $photo) => [
                'id' => "photo-{$photo->id}",
                'request_type' => 'photo',
                'target_name' => trim(($photo->uploader?->first_name ?? '') . ' ' . ($photo->uploader?->last_name ?? '')) ?: "Photo #{$photo->id}",
                'action' => $photo->status,
                'reason' => $photo->rejection_reason,
                'reviewed_at' => $photo->verified_at,
            ]))
            ->concat($claims->whereNotNull('claim_reviewed_at')->map(fn (PickupRequest $claim) => [
                'id' => "claim-{$claim->id}",
                'request_type' => 'volunteer',
                'target_name' => trim(($claim->assignedVolunteer?->first_name ?? '') . ' ' . ($claim->assignedVolunteer?->last_name ?? '')) ?: "Claim #{$claim->id}",
                'action' => $claim->claim_review_status,
                'reason' => $claim->claim_rejection_reason,
                'reviewed_at' => $claim->claim_reviewed_at,
            ]))
            ->concat($areaReports->whereNotNull('admin_reviewed_at')->map(fn (AreaReport $report) => [
                'id' => "area-report-{$report->id}",
                'request_type' => 'area report',
                'target_name' => trim(($report->user?->first_name ?? '') . ' ' . ($report->user?->last_name ?? '')) ?: "Area report #{$report->id}",
                'action' => $report->admin_review_status,
                'reason' => $report->admin_rejection_reason,
                'reviewed_at' => $report->admin_reviewed_at,
            ]))
            ->sortByDesc('reviewed_at')
            ->values();

        return response()->json([
            'data' => [
                'pickups' => $pickups,
                'photos' => $photos,
                'claims' => $claims,
                'area_reports' => $areaReports,
                'users' => $users,
                'history' => $history,
                'stats' => [
                    'pending_pickups' => PickupRequest::where('admin_review_status', 'pending')->count(),
                    'pending_photos' => PickupPhoto::where('status', 'pending')->count(),
                    'pending_volunteers' => PickupRequest::whereNotNull('assigned_volunteer_id')->where('claim_review_status', 'pending')->count(),
                    'pending_area_reports' => AreaReport::where('admin_review_status', 'pending')->count(),
                    'approved_total' => PickupRequest::where('admin_review_status', 'approved')->count()
                        + PickupPhoto::where('status', 'approved')->count()
                        + PickupRequest::whereNotNull('claim_reviewed_at')->where('claim_review_status', 'approved')->count()
                        + AreaReport::where('admin_review_status', 'approved')->count(),
                    'rejected_total' => PickupRequest::where('admin_review_status', 'rejected')->count()
                        + PickupPhoto::where('status', 'rejected')->count()
                        + PickupRequest::whereNotNull('claim_reviewed_at')->where('claim_review_status', 'rejected')->count()
                        + AreaReport::where('admin_review_status', 'rejected')->count(),
                    'total_users' => User::count(),
                ],
            ],
        ]);
    }

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
