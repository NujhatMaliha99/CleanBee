<?php

namespace App\Observers;

use App\Models\Notification;
use App\Models\PickupRequest;

class PickupRequestObserver
{
    public function created(PickupRequest $pickup): void
    {
        Notification::create([
            'user_id' => $pickup->user_id,
            'type' => 'pickup',
            'title' => 'Pickup request submitted',
            'message' => "Your pickup request #{$pickup->id} has been submitted.",
        ]);
    }

    public function updated(PickupRequest $pickup): void
    {
        $changes = [];
        if ($pickup->wasChanged('status')) {
            $changes[] = 'status is now ' . str_replace('_', ' ', $pickup->status);
        }
        if ($pickup->wasChanged('admin_review_status')) {
            $changes[] = 'administrator review is ' . $pickup->admin_review_status;
        }
        if ($pickup->wasChanged('claim_review_status')) {
            $changes[] = 'volunteer claim review is ' . $pickup->claim_review_status;
        }

        if (!$changes) {
            return;
        }

        $isVolunteerUpdate = $pickup->wasChanged('claim_review_status')
            || ($pickup->wasChanged('status') && in_array($pickup->status, ['accepted', 'in_progress', 'completed'], true));
        $type = $isVolunteerUpdate ? 'volunteer' : 'pickup';
        $recipients = collect([
            $pickup->user_id,
            $pickup->assigned_volunteer_id,
            $pickup->getOriginal('assigned_volunteer_id'),
        ])->filter()->unique();
        foreach ($recipients as $userId) {
            Notification::create([
                'user_id' => $userId,
                'type' => $type,
                'title' => $isVolunteerUpdate ? 'Volunteer task updated' : 'Pickup request updated',
                'message' => "Pickup request #{$pickup->id}: " . implode('; ', $changes) . '.',
            ]);
        }
    }
}
