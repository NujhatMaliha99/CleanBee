<?php

namespace Tests\Feature;

use App\Models\PickupRequest;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DashboardTest extends TestCase
{
    use RefreshDatabase;

    public function test_dashboard_returns_authenticated_users_database_backed_summary(): void
    {
        $user = $this->user('user@example.com', 175);
        $other = $this->user('other@example.com');

        foreach (['pending', 'accepted', 'in_progress', 'completed'] as $status) {
            $pickup = $this->pickupFor($user);
            $pickup->forceFill(['status' => $status])->save();
        }

        $this->pickupFor($other);

        $this->actingAs($user, 'sanctum')
            ->getJson('/api/dashboard')
            ->assertOk()
            ->assertJsonPath('data.stats.total', 4)
            ->assertJsonPath('data.stats.pending', 1)
            ->assertJsonPath('data.stats.accepted', 1)
            ->assertJsonPath('data.stats.in_progress', 1)
            ->assertJsonPath('data.stats.completed', 1)
            ->assertJsonPath('data.stats.points', 175)
            ->assertJsonCount(4, 'data.activities');
    }

    public function test_new_pickup_is_persisted_and_immediately_appears_on_dashboard(): void
    {
        $user = $this->user();

        $this->actingAs($user, 'sanctum')
            ->postJson('/api/pickups', $this->pickupPayload())
            ->assertCreated()
            ->assertJsonPath('data.admin_review_status', 'pending');

        $this->assertDatabaseHas('pickup_requests', [
            'user_id' => $user->id,
            'waste_type' => 'plastic',
            'admin_review_status' => 'pending',
        ]);

        $this->actingAs($user, 'sanctum')
            ->getJson('/api/dashboard')
            ->assertOk()
            ->assertJsonPath('data.stats.total', 1)
            ->assertJsonPath('data.activities.0.waste_type', 'plastic');
    }

    public function test_dashboard_requires_authentication(): void
    {
        $this->getJson('/api/dashboard')->assertUnauthorized();
    }

    private function user(string $email = 'user@example.com', int $points = 0): User
    {
        return User::create([
            'first_name' => 'CleanBee',
            'email' => $email,
            'password' => 'password123',
            'eco_points' => $points,
        ]);
    }

    private function pickupFor(User $user): PickupRequest
    {
        return PickupRequest::create(['user_id' => $user->id, ...$this->pickupPayload()]);
    }

    private function pickupPayload(): array
    {
        return [
            'waste_type' => 'plastic',
            'quantity' => 2,
            'quantity_unit' => 'kg',
            'pickup_address' => 'Dhanmondi, Dhaka',
            'pickup_date' => now()->addDay()->toDateString(),
            'pickup_time' => '10:30',
            'contact_phone' => '+8801712345678',
        ];
    }
}
