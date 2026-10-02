<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RewardRedemption extends Model
{
    protected $fillable = ['user_id', 'reward_id', 'points_spent', 'status', 'idempotency_key', 'redeemed_at'];

    protected function casts(): array
    {
        return ['points_spent' => 'integer', 'redeemed_at' => 'datetime'];
    }

    public function reward(): BelongsTo
    {
        return $this->belongsTo(Reward::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
