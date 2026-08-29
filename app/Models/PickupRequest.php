<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PickupRequest extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'waste_type',
        'quantity',
        'quantity_unit',
        'pickup_address',
        'pickup_date',
        'pickup_time',
        'contact_phone',
        'instructions',
        'image_path',
    ];

    protected function casts(): array
    {
        return [
            'quantity' => 'decimal:2',
            'pickup_date' => 'date:Y-m-d',
            'assigned_at' => 'datetime',
            'started_at' => 'datetime',
            'completed_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function assignedVolunteer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_volunteer_id');
    }

    public function photos(): HasMany
    {
        return $this->hasMany(PickupPhoto::class);
    }
}
