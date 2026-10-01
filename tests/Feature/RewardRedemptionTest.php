<?php

namespace Tests\Feature;

use App\Models\Reward;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RewardRedemptionTest extends TestCase
{
    use RefreshDatabase;

    public function test_only_active_rewards_are_listed(): void
    {
        $user = $this->user();
        $active = Reward::create(['name' => 'Active reward', 'points_required' => 100, 'is_active' => true]);
        Reward::create(['name' => 'Inactive reward', 'points_required' => 100, 'is_active' => false]);

        $this->actingAs($user, 'sanctum')
            ->getJson('/api/rewards')
            ->assertOk()
            ->assertJsonCount(4, 'data')
            ->assertJsonFragment(['id' => $active->id, 'name' => 'Active reward'])
            ->assertJsonMissing(['name' => 'Inactive reward']);
    }

    public function test_successful_redemption_deducts_points_and_is_recorded(): void
    {
        $user = $this->user(500);
        $reward = Reward::create(['name' => 'Eco bag', 'points_required' => 200, 'is_active' => true]);

        $this->actingAs($user, 'sanctum')
            ->withHeader('Idempotency-Key', 'redeem-eco-bag-0001')
            ->postJson("/api/rewards/{$reward->id}/redeem")
            ->assertCreated()
            ->assertJsonPath('points', 300)
            ->assertJsonPath('data.points_spent', 200);

        $this->assertSame(300, $user->fresh()->eco_points);
        $this->assertDatabaseHas('reward_redemptions', [
            'user_id' => $user->id,
            'reward_id' => $reward->id,
            'points_spent' => 200,
            'status' => 'completed',
        ]);
    }

    public function test_failed_redemptions_do_not_deduct_points(): void
    {
        $user = $this->user(100);
        $expensive = Reward::create(['name' => 'Eco kit', 'points_required' => 200, 'is_active' => true]);
        $inactive = Reward::create(['name' => 'Old reward', 'points_required' => 50, 'is_active' => false]);

        $this->actingAs($user, 'sanctum')
            ->withHeader('Idempotency-Key', 'insufficient-points-01')
            ->postJson("/api/rewards/{$expensive->id}/redeem")
            ->assertUnprocessable();

        $this->actingAs($user, 'sanctum')
            ->withHeader('Idempotency-Key', 'inactive-reward-0001')
            ->postJson("/api/rewards/{$inactive->id}/redeem")
            ->assertUnprocessable();

        $this->assertSame(100, $user->fresh()->eco_points);
        $this->assertDatabaseCount('reward_redemptions', 0);
    }

    public function test_repeated_request_does_not_deduct_points_twice(): void
    {
        $user = $this->user(500);
        $reward = Reward::create(['name' => 'Eco bag', 'points_required' => 200, 'is_active' => true]);
        $request = $this->actingAs($user, 'sanctum')->withHeader('Idempotency-Key', 'same-redemption-0001');

        $request->postJson("/api/rewards/{$reward->id}/redeem")->assertCreated();
        $request->postJson("/api/rewards/{$reward->id}/redeem")
            ->assertOk()
            ->assertJsonPath('points', 300);

        $this->assertSame(300, $user->fresh()->eco_points);
        $this->assertDatabaseCount('reward_redemptions', 1);
    }

    public function test_user_can_view_only_their_redemption_history(): void
    {
        $user = $this->user(500);
        $other = $this->user(500, 'other@example.com');
        $reward = Reward::create(['name' => 'Eco bag', 'points_required' => 100, 'is_active' => true]);

        foreach ([[$user, 'history-request-001'], [$other, 'history-request-002']] as [$account, $key]) {
            $this->actingAs($account, 'sanctum')
                ->withHeader('Idempotency-Key', $key)
                ->postJson("/api/rewards/{$reward->id}/redeem")
                ->assertCreated();
        }

        $this->actingAs($user, 'sanctum')
            ->getJson('/api/reward-redemptions')
            ->assertOk()
            ->assertJsonCount(1, 'data.data')
            ->assertJsonPath('data.data.0.user_id', $user->id);
    }

    private function user(int $points = 0, string $email = 'user@example.com'): User
    {
        return User::create([
            'first_name' => 'CleanBee',
            'email' => $email,
            'password' => 'password123',
            'eco_points' => $points,
        ]);
    }
}
