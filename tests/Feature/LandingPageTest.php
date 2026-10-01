<?php

namespace Tests\Feature;

use App\Models\PickupRequest;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class LandingPageTest extends TestCase
{
    use RefreshDatabase;

    public function test_public_landing_endpoint_returns_database_backed_content(): void
    {
        $owner = $this->user('owner@example.com', 'user', 80);
        $this->user('volunteer@example.com', 'volunteer', 20);

        $completed = $this->pickup($owner, [
            'status' => 'completed',
            'quantity' => 8,
            'quantity_unit' => 'kg',
            'earned_points' => 40,
            'completed_at' => now(),
        ]);

        $this->getJson('/api/landing')
            ->assertOk()
            ->assertJsonPath('data.stats.waste_diverted_kg', 8)
            ->assertJsonPath('data.stats.completed_pickups', 1)
            ->assertJsonPath('data.stats.total_eco_points', 100)
            ->assertJsonPath('data.stats.active_volunteers', 1)
            ->assertJsonPath('data.activities.0.id', $completed->id)
            ->assertJsonCount(3, 'data.rewards');
    }

    public function test_authenticated_user_can_view_their_wallet(): void
    {
        $user = $this->user('wallet@example.com', 'user', 650);
        $pickup = $this->pickup($user, [
            'status' => 'completed',
            'earned_points' => 30,
            'completed_at' => now(),
        ]);

        $this->actingAs($user, 'sanctum')
            ->getJson('/api/landing/wallet')
            ->assertOk()
            ->assertJsonPath('data.points', 650)
            ->assertJsonPath('data.recent_pickups.0.id', $pickup->id)
            ->assertJsonPath('data.recent_pickups.0.earned_points', 30)
            ->assertJsonPath('data.next_reward.name', 'Reusable eco kit')
            ->assertJsonPath('data.points_to_next_reward', 550);
    }

    public function test_wallet_requires_authentication(): void
    {
        $this->getJson('/api/landing/wallet')->assertUnauthorized();
    }

    private function user(string $email, string $role, int $points): User
    {
        return User::create([
            'first_name' => 'CleanBee',
            'email' => $email,
            'password' => 'password123',
            'role' => $role,
            'eco_points' => $points,
        ]);
    }

    private function pickup(User $owner, array $overrides = []): PickupRequest
    {
        $pickup = PickupRequest::create([
            'user_id' => $owner->id,
            'waste_type' => 'plastic',
            'quantity' => 2,
            'quantity_unit' => 'kg',
            'pickup_address' => 'Dhanmondi, Dhaka',
            'pickup_date' => now()->toDateString(),
            'pickup_time' => '11:00',
            'contact_phone' => '+8801712345678',
        ]);

        $pickup->forceFill($overrides)->save();

        return $pickup->fresh();
    }
}
