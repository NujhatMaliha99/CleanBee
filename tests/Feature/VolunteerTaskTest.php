<?php

namespace Tests\Feature;

use App\Models\PickupRequest;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class VolunteerTaskTest extends TestCase
{
    use RefreshDatabase;

    public function test_volunteer_can_view_available_tasks(): void
    {
        $volunteer = $this->user('volunteer@example.com', 'volunteer');
        $pickup = $this->pickup();

        $this->actingAs($volunteer, 'sanctum')
            ->getJson('/api/volunteer/tasks')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.id', $pickup->id);
    }

    public function test_regular_user_cannot_access_volunteer_tasks(): void
    {
        $user = $this->user('user@example.com', 'user');

        $this->actingAs($user, 'sanctum')
            ->getJson('/api/volunteer/tasks')
            ->assertForbidden();
    }

    public function test_only_one_volunteer_can_claim_a_task(): void
    {
        $first = $this->user('first@example.com', 'volunteer');
        $second = $this->user('second@example.com', 'volunteer');
        $pickup = $this->pickup();

        $this->actingAs($first, 'sanctum')
            ->postJson("/api/volunteer/tasks/{$pickup->id}/claim")
            ->assertOk()
            ->assertJsonPath('data.status', 'accepted')
            ->assertJsonPath('data.assigned_volunteer_id', $first->id);

        $this->actingAs($second, 'sanctum')
            ->postJson("/api/volunteer/tasks/{$pickup->id}/claim")
            ->assertConflict();
    }

    public function test_volunteer_can_list_their_assigned_tasks(): void
    {
        $volunteer = $this->user('volunteer@example.com', 'volunteer');
        $other = $this->user('other@example.com', 'volunteer');
        $this->pickup(['assigned_volunteer_id' => $volunteer->id, 'status' => 'accepted']);
        $this->pickup(['assigned_volunteer_id' => $other->id, 'status' => 'accepted']);

        $this->actingAs($volunteer, 'sanctum')
            ->getJson('/api/volunteer/my-tasks')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.assigned_volunteer_id', $volunteer->id);
    }

    public function test_assigned_volunteer_can_start_and_complete_task(): void
    {
        $volunteer = $this->user('volunteer@example.com', 'volunteer');
        $pickup = $this->pickup([
            'assigned_volunteer_id' => $volunteer->id,
            'status' => 'accepted',
            'assigned_at' => now(),
        ]);

        $this->actingAs($volunteer, 'sanctum')
            ->postJson("/api/volunteer/tasks/{$pickup->id}/start")
            ->assertOk()
            ->assertJsonPath('data.status', 'in_progress');

        $this->actingAs($volunteer, 'sanctum')
            ->postJson("/api/volunteer/tasks/{$pickup->id}/complete")
            ->assertOk()
            ->assertJsonPath('data.status', 'completed');

        $this->assertNotNull($pickup->fresh()->completed_at);
    }

    public function test_volunteer_cannot_update_another_volunteers_task(): void
    {
        $assigned = $this->user('assigned@example.com', 'volunteer');
        $other = $this->user('other@example.com', 'volunteer');
        $pickup = $this->pickup([
            'assigned_volunteer_id' => $assigned->id,
            'status' => 'accepted',
        ]);

        $this->actingAs($other, 'sanctum')
            ->postJson("/api/volunteer/tasks/{$pickup->id}/start")
            ->assertForbidden();
    }

    public function test_task_status_transitions_are_enforced(): void
    {
        $volunteer = $this->user('volunteer@example.com', 'volunteer');
        $pickup = $this->pickup([
            'assigned_volunteer_id' => $volunteer->id,
            'status' => 'accepted',
        ]);

        $this->actingAs($volunteer, 'sanctum')
            ->postJson("/api/volunteer/tasks/{$pickup->id}/complete")
            ->assertUnprocessable();
    }

    private function user(string $email, string $role): User
    {
        $user = User::create([
            'first_name' => ucfirst($role),
            'email' => $email,
            'password' => 'password123',
            'role' => $role,
        ]);
        $user->markEmailAsVerified();

        return $user;
    }

    private function pickup(array $overrides = []): PickupRequest
    {
        $owner = $this->user(uniqid('owner-', true) . '@example.com', 'user');

        $pickup = PickupRequest::create([
            'user_id' => $owner->id,
            'waste_type' => 'plastic',
            'quantity' => 3,
            'quantity_unit' => 'kg',
            'pickup_address' => 'Dhanmondi, Dhaka',
            'pickup_date' => now()->addDay()->toDateString(),
            'pickup_time' => '11:00',
            'contact_phone' => '+8801712345678',
        ]);

        if ($overrides) {
            $pickup->forceFill($overrides)->save();
        }

        return $pickup->fresh();
    }
}
