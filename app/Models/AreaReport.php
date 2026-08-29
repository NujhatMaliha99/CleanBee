<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AreaReport extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'assigned_volunteer_id',
        'title',
        'description',
        'waste_type',
        'address',
        'latitude',
        'longitude',
        'image_path',
        'status',
        'assigned_at',
        'resolved_at',
    ];

    protected function casts(): array
    {
        return [
            'latitude' => 'decimal:7',
            'longitude' => 'decimal:7',
            'assigned_at' => 'datetime',
            'resolved_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function assignedVolunteer(): BelongsTo
    {
        return $this->belongsTo(
            User::class,
            'assigned_volunteer_id'
        );
    }
}