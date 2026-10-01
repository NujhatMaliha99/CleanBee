<?php

namespace Tests\Feature;

use App\Models\AreaReport;
use App\Models\Notification;
use App\Models\PickupRequest;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class NotificationTest extends TestCase
{
    use RefreshDatabase;

    public function test_notification_endpoints_require_authentication(): void
    {
        $this->getJson('/api/notifications')->assertUnauthorized();
        $this->patchJson('/api/notifications/read')->assertUnauthorized();
        $this->patchJson('/api/notifications/1/read')->assertUnauthorized();
    }

    public function test_user_can_list_only_their_notifications_and_unread_count(): void
    {
        $user = $this->user('user@example.com');
        $other = $this->user('other@example.com');
        $unread = $this->notification($user);
        $read = $this->notification($user, ['read_at' => now()]);
        $this->notification($other);

        $this->actingAs($user, 'sanctum')
            ->getJson('/api/notifications')
            ->assertOk()
            ->assertJsonCount(2, 'data')
            ->assertJsonPath('unread_count', 1)
            ->assertJsonPath('data.0.id', $read->id)
            ->assertJsonPath('data.0.read', true)
            ->assertJsonPath('data.1.id', $unread->id)
            ->assertJsonPath('data.1.read', false);
    }

    public function test_user_can_mark_their_notification_as_read_but_not_another_users(): void
    {
        $user = $this->user('user@example.com');
        $other = $this->user('other@example.com');
        $ownNotification = $this->notification($user);
        $otherNotification = $this->notification($other);

        $this->actingAs($user, 'sanctum')
            ->patchJson("/api/notifications/{$ownNotification->id}/read")
            ->assertOk()
            ->assertJsonPath('data.read', true);

        $this->assertNotNull($ownNotification->fresh()->read_at);
        $this->patchJson("/api/notifications/{$otherNotification->id}/read")->assertNotFound();
    }

    public function test_mark_all_as_read_only_updates_the_authenticated_users_notifications(): void
    {
        $user = $this->user('user@example.com');
        $other = $this->user('other@example.com');
        $ownNotification = $this->notification($user);
        $otherNotification = $this->notification($other);

        $this->actingAs($user, 'sanctum')
            ->patchJson('/api/notifications/read')
            ->assertOk()
            ->assertJsonPath('unread_count', 0);

        $this->assertNotNull($ownNotification->fresh()->read_at);
        $this->assertNull($otherNotification->fresh()->read_at);
    }

    public function test_pickup_and_area_report_events_create_notifications(): void
    {
        $owner = $this->user('owner@example.com');
        $volunteer = $this->user('volunteer@example.com', 'volunteer');
        $pickup = $this->pickup($owner);
        $this->assertDatabaseHas('notifications', ['user_id' => $owner->id, 'type' => 'pickup']);

        $pickup->forceFill(['assigned_volunteer_id' => $volunteer->id, 'status' => 'accepted'])->save();
        $this->assertDatabaseHas('notifications', ['user_id' => $owner->id, 'type' => 'volunteer']);
        $this->assertDatabaseHas('notifications', ['user_id' => $volunteer->id, 'type' => 'volunteer']);

        $report = AreaReport::create([
            'user_id' => $owner->id,
            'title' => 'Overflowing bin',
            'description' => 'Waste is accumulating beside the park.',
            'waste_type' => 'plastic',
            'address' => 'Dhanmondi, Dhaka',
            'latitude' => 23.7465,
            'longitude' => 90.3760,
        ]);
        $this->assertDatabaseHas('notifications', ['user_id' => $owner->id, 'type' => 'area_report']);

        $report->update(['status' => 'resolved']);
        $this->assertSame(2, Notification::where('user_id', $owner->id)->where('type', 'area_report')->count());
    }

    private function user(string $email, string $role = 'user'): User
    {
        return User::create([
            'first_name' => 'CleanBee',
            'email' => $email,
            'password' => 'password123',
            'role' => $role,
            'volunteer_enabled' => $role === 'volunteer',
            'volunteer_availability' => $role === 'volunteer' ? 'available' : 'unavailable',
        ]);
    }

    private function notification(User $user, array $attributes = []): Notification
    {
        return Notification::create(array_merge([
            'user_id' => $user->id,
            'title' => 'Pickup updated',
            'message' => 'Your pickup changed.',
            'type' => 'pickup',
        ], $attributes));
    }

    private function pickup(User $owner): PickupRequest
    {
        return PickupRequest::create([
            'user_id' => $owner->id,
            'waste_type' => 'plastic',
            'quantity' => 3,
            'quantity_unit' => 'kg',
            'pickup_address' => 'Dhanmondi, Dhaka',
            'pickup_date' => now()->addDay()->toDateString(),
            'pickup_time' => '11:00',
            'contact_phone' => '+8801712345678',
        ]);
    }
}
