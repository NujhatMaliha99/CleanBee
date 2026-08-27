<?php

namespace Tests\Feature;

use App\Models\PickupPhoto;
use App\Models\PickupRequest;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class PickupPhotoTest extends TestCase
{
    use RefreshDatabase;

    public function test_pickup_owner_can_upload_a_photo(): void
    {
        Storage::fake('public');
        $owner = $this->verifiedUser();
        $pickup = $this->pickupFor($owner);

        $response = $this->actingAs($owner, 'sanctum')
            ->postJson("/api/pickups/{$pickup->id}/photos", [
                'photo_type' => 'before',
                'photo' => $this->fakePng('before.png'),
            ]);

        $response->assertCreated()
            ->assertJsonPath('data.photo_type', 'before')
            ->assertJsonPath('data.status', 'pending');

        Storage::disk('public')->assertExists($response->json('data.image_path'));
    }

    public function test_assigned_volunteer_can_upload_an_after_photo(): void
    {
        Storage::fake('public');
        $owner = $this->verifiedUser();
        $volunteer = $this->verifiedUser('volunteer@example.com', 'volunteer');
        $pickup = $this->pickupFor($owner);
        $pickup->forceFill(['assigned_volunteer_id' => $volunteer->id])->save();

        $this->actingAs($volunteer, 'sanctum')
            ->postJson("/api/pickups/{$pickup->id}/photos", [
                'photo_type' => 'after',
                'photo' => $this->fakePng('after.png'),
            ])
            ->assertCreated()
            ->assertJsonPath('data.uploaded_by', $volunteer->id);
    }

    public function test_photo_upload_validation_rejects_invalid_files(): void
    {
        Storage::fake('public');
        $owner = $this->verifiedUser();
        $pickup = $this->pickupFor($owner);

        $this->actingAs($owner, 'sanctum')
            ->postJson("/api/pickups/{$pickup->id}/photos", [
                'photo_type' => 'during',
                'photo' => UploadedFile::fake()->create('notes.txt', 10, 'text/plain'),
            ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['photo_type', 'photo']);
    }

    public function test_unrelated_user_cannot_access_pickup_photos(): void
    {
        $owner = $this->verifiedUser();
        $other = $this->verifiedUser('other@example.com');
        $pickup = $this->pickupFor($owner);

        $this->actingAs($other, 'sanctum')
            ->getJson("/api/pickups/{$pickup->id}/photos")
            ->assertForbidden();
    }

    public function test_admin_can_approve_a_pending_photo(): void
    {
        $owner = $this->verifiedUser();
        $admin = $this->verifiedUser('admin@example.com', 'admin');
        $photo = $this->photoFor($this->pickupFor($owner), $owner);

        $this->actingAs($admin, 'sanctum')
            ->patchJson("/api/pickup-photos/{$photo->id}/approve")
            ->assertOk()
            ->assertJsonPath('data.status', 'approved')
            ->assertJsonPath('data.verified_by', $admin->id);

        $this->assertNotNull($photo->fresh()->verified_at);
    }

    public function test_admin_can_reject_a_pending_photo_with_a_reason(): void
    {
        $owner = $this->verifiedUser();
        $admin = $this->verifiedUser('admin@example.com', 'admin');
        $photo = $this->photoFor($this->pickupFor($owner), $owner);

        $this->actingAs($admin, 'sanctum')
            ->patchJson("/api/pickup-photos/{$photo->id}/reject", [
                'reason' => 'The image is too blurry.',
            ])
            ->assertOk()
            ->assertJsonPath('data.status', 'rejected')
            ->assertJsonPath('data.rejection_reason', 'The image is too blurry.');
    }

    public function test_non_admin_cannot_review_a_photo(): void
    {
        $owner = $this->verifiedUser();
        $photo = $this->photoFor($this->pickupFor($owner), $owner);

        $this->actingAs($owner, 'sanctum')
            ->patchJson("/api/pickup-photos/{$photo->id}/approve")
            ->assertForbidden();
    }

    private function verifiedUser(string $email = 'owner@example.com', string $role = 'user'): User
    {
        $user = User::create([
            'first_name' => 'CleanBee',
            'email' => $email,
            'password' => 'password123',
            'role' => $role,
        ]);

        $user->markEmailAsVerified();

        return $user;
    }

    private function pickupFor(User $owner): PickupRequest
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
        ]);
    }

    private function photoFor(PickupRequest $pickup, User $uploader): PickupPhoto
    {
        return PickupPhoto::create([
            'pickup_request_id' => $pickup->id,
            'uploaded_by' => $uploader->id,
            'photo_type' => 'before',
            'image_path' => "pickup-photos/{$pickup->id}/before.jpg",
        ]);
    }

    private function fakePng(string $name): UploadedFile
    {
        return UploadedFile::fake()->createWithContent(
            $name,
            base64_decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Wl2nWQAAAAASUVORK5CYII=')
        );
    }
}
