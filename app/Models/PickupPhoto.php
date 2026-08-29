<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;

class PickupPhoto extends Model
{
    use HasFactory;

    protected $fillable = [
        'pickup_request_id',
        'uploaded_by',
        'photo_type',
        'image_path',
        'status',
        'rejection_reason',
        'verified_by',
        'verified_at',
    ];

    protected $appends = ['image_url'];

    protected function casts(): array
    {
        return ['verified_at' => 'datetime'];
    }

    public function getImageUrlAttribute(): string
    {
        return Storage::disk('public')->url($this->image_path);
    }

    public function pickupRequest(): BelongsTo
    {
        return $this->belongsTo(PickupRequest::class);
    }

    public function uploader(): BelongsTo
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }

    public function verifier(): BelongsTo
    {
        return $this->belongsTo(User::class, 'verified_by');
    }
}
