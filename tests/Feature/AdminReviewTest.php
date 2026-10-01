<?php

namespace Tests\Feature;

use App\Models\AreaReport;
use App\Models\PickupPhoto;
use App\Models\PickupRequest;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminReviewTest extends TestCase
{
    use RefreshDatabase;

    public function test_only_admin_can_access_review_endpoints(): void
    {
        $user = $this->user();
        $pickup = $this->pendingPickup($user);

        $this->actingAs($user, 'sanctum')
            ->getJson('/api/admin/reviews')
            ->assertForbidden();

        $this->actingAs($user, 'sanctum')
            ->postJson("/api/admin/reviews/pickup/{$pickup->id}/approve")
            ->assertForbidden();
    }

    public function test_admin_can_filter_pending_reviews_by_type(): void
    {
        $admin = $this->user('admin@example.com', 'admin');
        $owner = $this->user();
        $pickup = $this->pendingPickup($owner);

        $this->actingAs($admin, 'sanctum')
            ->getJson('/api/admin/reviews?type=pickup&status=pending')
            ->assertOk()
            ->assertJsonPath('data.pickups.data.0.id', $pickup->id)
            ->assertJsonMissingPath('data.photos');
    }

    public function test_admin_can_approve_and_reject_pickups_with_a_saved_decision(): void
    {
        $admin = $this->user('admin@example.com', 'admin');
        $owner = $this->user();
        $approved = $this->pendingPickup($owner);
        $rejected = $this->pendingPickup($owner);

        $this->actingAs($admin, 'sanctum')
            ->postJson("/api/admin/reviews/pickup/{$approved->id}/approve")
            ->assertOk()
            ->assertJsonPath('data.admin_review_status', 'approved');

        $this->actingAs($admin, 'sanctum')
            ->postJson("/api/admin/reviews/pickup/{$rejected->id}/reject", [
                'reason' => 'Address is outside the service area.',
            ])
            ->assertOk()
            ->assertJsonPath('data.admin_review_status', 'rejected')
            ->assertJsonPath('data.admin_rejection_reason', 'Address is outside the service area.');

        $this->assertDatabaseHas('pickup_requests', [
            'id' => $approved->id,
            'admin_review_status' => 'approved',
            'admin_reviewed_by' => $admin->id,
        ]);
        $this->assertNotNull($approved->fresh()->admin_reviewed_at);
        $this->assertSame('rejected', $rejected->fresh()->status);
    }

    public function test_admin_can_review_photo_volunteer_claim_and_area_report(): void
    {
        $admin = $this->user('admin@example.com', 'admin');
        $owner = $this->user();
        $volunteer = $this->user('volunteer@example.com', 'volunteer');
        $pickup = $this->pendingPickup($owner);
        $photo = PickupPhoto::create([
            'pickup_request_id' => $pickup->id,
            'uploaded_by' => $owner->id,
            'photo_type' => 'before',
            'image_path' => 'pickup-photos/test.jpg',
        ]);
        $claim = $this->pendingPickup($owner);
        $claim->forceFill([
            'assigned_volunteer_id' => $volunteer->id,
            'assigned_at' => now(),
            'status' => 'accepted',
            'claim_review_status' => 'pending',
        ])->save();
        $report = AreaReport::create([
            'user_id' => $owner->id,
            'title' => 'Roadside waste',
            'description' => 'Waste needs collection.',
            'waste_type' => 'mixed',
            'address' => 'Dhanmondi, Dhaka',
            'latitude' => 23.7465,
            'longitude' => 90.3760,
            'status' => 'pending',
            'admin_review_status' => 'pending',
        ]);

        $this->actingAs($admin, 'sanctum')
            ->postJson("/api/admin/reviews/photo/{$photo->id}/approve")
            ->assertOk()
            ->assertJsonPath('data.status', 'approved');

        $this->actingAs($admin, 'sanctum')
            ->postJson("/api/admin/reviews/claim/{$claim->id}/approve")
            ->assertOk()
            ->assertJsonPath('data.claim_review_status', 'approved');

        $this->actingAs($admin, 'sanctum')
            ->postJson("/api/admin/reviews/area-report/{$report->id}/reject", [
                'reason' => 'The report is a duplicate.',
            ])
            ->assertOk()
            ->assertJsonPath('data.admin_review_status', 'rejected')
            ->assertJsonPath('data.admin_rejection_reason', 'The report is a duplicate.');
    }

    public function test_rejection_requires_a_reason_and_records_cannot_be_reviewed_twice(): void
    {
        $admin = $this->user('admin@example.com', 'admin');
        $pickup = $this->pendingPickup($this->user());

        $this->actingAs($admin, 'sanctum')
            ->postJson("/api/admin/reviews/pickup/{$pickup->id}/reject")
            ->assertUnprocessable()
            ->assertJsonValidationErrors('reason');

        $this->actingAs($admin, 'sanctum')
            ->postJson("/api/admin/reviews/pickup/{$pickup->id}/approve")
            ->assertOk();

        $this->actingAs($admin, 'sanctum')
            ->postJson("/api/admin/reviews/pickup/{$pickup->id}/approve")
            ->assertConflict();
    }

    private function user(string $email = 'user@example.com', string $role = 'user'): User
    {
        return User::create([
            'first_name' => 'CleanBee',
            'email' => $email,
            'password' => 'password123',
            'role' => $role,
        ]);
    }

    private function pendingPickup(User $owner): PickupRequest
    {
        return PickupRequest::create([
            'user_id' => $owner->id,
            'waste_type' => 'plastic',
            'quantity' => 2,
            'quantity_unit' => 'kg',
            'pickup_address' => 'Dhanmondi, Dhaka',
            'pickup_date' => now()->addDay()->toDateString(),
            'pickup_time' => '10:30',
            'contact_phone' => '+8801712345678',
            'admin_review_status' => 'pending',
        ]);
    }
}
