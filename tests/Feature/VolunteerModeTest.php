<?php

namespace Tests\Feature;

use App\Models\PickupRequest;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class VolunteerModeTest extends TestCase
{
    use RefreshDatabase;

    public function test_regular_user_can_enable_volunteer_mode(): void
    {
        $user = $this->user();

        $this->actingAs($user, 'sanctum')
            ->putJson('/api/volunteer/mode', ['enabled' => true])
            ->assertOk()
            ->assertJsonPath('user.volunteer_enabled', true)
            ->assertJsonPath('user.volunteer_availability', 'available');

        $this->assertDatabaseHas('users', [
            'id' => $user->id,
            'volunteer_enabled' => true,
            'volunteer_availability' => 'available',
        ]);

        $this->actingAs($user->fresh(), 'sanctum')
            ->getJson('/api/volunteer/tasks')
            ->assertOk();
    }

    public function test_volunteer_availability_is_persisted(): void
    {
        $user = $this->user([
            'volunteer_enabled' => true,
            'volunteer_availability' => 'available',
        ]);

        $this->actingAs($user, 'sanctum')
            ->putJson('/api/volunteer/availability', ['availability' => 'unavailable'])
            ->assertOk()
            ->assertJsonPath('user.volunteer_availability', 'unavailable');

        $this->assertDatabaseHas('users', [
            'id' => $user->id,
            'volunteer_availability' => 'unavailable',
        ]);
    }

    public function test_unavailable_volunteer_cannot_claim_a_new_task(): void
    {
        $volunteer = $this->user([
            'volunteer_enabled' => true,
            'volunteer_availability' => 'unavailable',
        ]);
        $pickup = $this->pickup();

        $this->actingAs($volunteer, 'sanctum')
            ->postJson("/api/volunteer/tasks/{$pickup->id}/claim")
            ->assertForbidden();
    }

    public function test_disabled_user_cannot_access_volunteer_tasks(): void
    {
        $user = $this->user();

        $this->actingAs($user, 'sanctum')
            ->getJson('/api/volunteer/tasks')
            ->assertForbidden();
    }

    public function test_user_with_active_task_cannot_disable_volunteer_mode(): void
    {
        $volunteer = $this->user([
            'volunteer_enabled' => true,
            'volunteer_availability' => 'available',
        ]);
        $this->pickup([
            'assigned_volunteer_id' => $volunteer->id,
            'status' => 'accepted',
        ]);

        $this->actingAs($volunteer, 'sanctum')
            ->putJson('/api/volunteer/mode', ['enabled' => false])
            ->assertUnprocessable();

        $this->assertTrue($volunteer->fresh()->volunteer_enabled);
    }

    private function user(array $overrides = []): User
    {
        return User::create(array_merge([
            'first_name' => 'Volunteer',
            'email' => uniqid('user-', true) . '@example.com',
            'password' => 'password123',
            'role' => 'user',
            'volunteer_enabled' => false,
            'volunteer_availability' => 'unavailable',
        ], $overrides));
    }

    private function pickup(array $overrides = []): PickupRequest
    {
        $owner = $this->user();
        $pickup = PickupRequest::create([
            'user_id' => $owner->id,
            'waste_type' => 'plastic',
            'quantity' => 2,
            'quantity_unit' => 'kg',
            'pickup_address' => 'Dhanmondi, Dhaka',
            'pickup_date' => now()->addDay()->toDateString(),
            'pickup_time' => '11:00',
            'contact_phone' => '+8801712345678',
        ]);

        $pickup->forceFill($overrides)->save();

        return $pickup->fresh();
    }
}
