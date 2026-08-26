<?php

namespace Tests\Feature;

use App\Models\PickupRequest;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class PickupRequestTest extends TestCase
{
    use RefreshDatabase;

    public function test_verified_user_can_create_pickup_request(): void
    {
        Storage::fake('public');
        $user = $this->verifiedUser();

        $response = $this->actingAs($user, 'sanctum')->postJson('/api/pickups', [
            ...$this->validPayload(),
            'image' => UploadedFile::fake()->create('waste.jpg', 100, 'image/jpeg'),
        ]);

        $response->assertCreated()
            ->assertJsonPath('data.status', 'pending')
            ->assertJsonPath('data.user_id', $user->id);

        $this->assertDatabaseHas('pickup_requests', [
            'user_id' => $user->id,
            'waste_type' => 'plastic',
            'status' => 'pending',
        ]);
        Storage::disk('public')->assertExists($response->json('data.image_path'));
    }

    public function test_user_only_lists_their_own_pickup_requests(): void
    {
        $user = $this->verifiedUser();
        $other = $this->verifiedUser('other@example.com');
        PickupRequest::create(['user_id' => $user->id, ...$this->validPayload()]);
        PickupRequest::create(['user_id' => $other->id, ...$this->validPayload()]);

        $this->actingAs($user, 'sanctum')
            ->getJson('/api/pickups')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.user_id', $user->id);
    }

    public function test_user_cannot_view_another_users_pickup_request(): void
    {
        $user = $this->verifiedUser();
        $other = $this->verifiedUser('other@example.com');
        $pickup = PickupRequest::create(['user_id' => $other->id, ...$this->validPayload()]);

        $this->actingAs($user, 'sanctum')
            ->getJson("/api/pickups/{$pickup->id}")
            ->assertForbidden();
    }

    public function test_pickup_request_validation_rejects_invalid_input(): void
    {
        $user = $this->verifiedUser();

        $this->actingAs($user, 'sanctum')
            ->postJson('/api/pickups', [
                'waste_type' => 'unknown',
                'quantity' => 0,
                'pickup_date' => now()->subDay()->toDateString(),
                'contact_phone' => 'abc',
            ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors([
                'waste_type',
                'quantity',
                'quantity_unit',
                'pickup_address',
                'pickup_date',
                'pickup_time',
                'contact_phone',
            ]);
    }

    public function test_owner_can_cancel_a_pending_pickup_request(): void
    {
        $user = $this->verifiedUser();
        $pickup = PickupRequest::create(['user_id' => $user->id, ...$this->validPayload()]);

        $this->actingAs($user, 'sanctum')
            ->deleteJson("/api/pickups/{$pickup->id}")
            ->assertOk()
            ->assertJsonPath('data.status', 'cancelled');
    }

    public function test_non_pending_pickup_request_cannot_be_cancelled(): void
    {
        $user = $this->verifiedUser();
        $pickup = PickupRequest::create(['user_id' => $user->id, ...$this->validPayload()]);
        $pickup->forceFill(['status' => 'accepted'])->save();

        $this->actingAs($user, 'sanctum')
            ->deleteJson("/api/pickups/{$pickup->id}")
            ->assertUnprocessable();
    }

    private function verifiedUser(string $email = 'user@example.com'): User
    {
        $user = User::create([
            'first_name' => 'CleanBee',
            'email' => $email,
            'password' => 'password123',
        ]);

        $user->markEmailAsVerified();

        return $user;
    }

    private function validPayload(): array
    {
        return [
            'waste_type' => 'plastic',
            'quantity' => 2.5,
            'quantity_unit' => 'kg',
            'pickup_address' => 'Dhanmondi, Dhaka',
            'pickup_date' => now()->addDay()->toDateString(),
            'pickup_time' => '10:30',
            'contact_phone' => '+8801712345678',
            'instructions' => 'Call before arrival.',
        ];
    }
}
