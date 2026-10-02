<?php

namespace App\Observers;

use App\Models\AreaReport;
use App\Models\Notification;

class AreaReportObserver
{
    public function created(AreaReport $report): void
    {
        Notification::create([
            'user_id' => $report->user_id,
            'type' => 'area_report',
            'title' => 'Area report submitted',
            'message' => "Your area report ‘{$report->title}’ has been submitted.",
        ]);
    }

    public function updated(AreaReport $report): void
    {
        $changes = [];
        if ($report->wasChanged('status')) {
            $changes[] = 'status is now ' . str_replace('_', ' ', $report->status);
        }
        if ($report->wasChanged('admin_review_status')) {
            $changes[] = 'administrator review is ' . $report->admin_review_status;
        }

        if (!$changes) {
            return;
        }

        $recipients = collect([$report->user_id, $report->assigned_volunteer_id])->filter()->unique();
        foreach ($recipients as $userId) {
            Notification::create([
                'user_id' => $userId,
                'type' => 'area_report',
                'title' => 'Area report updated',
                'message' => "Area report ‘{$report->title}’: " . implode('; ', $changes) . '.',
            ]);
        }
    }
}
