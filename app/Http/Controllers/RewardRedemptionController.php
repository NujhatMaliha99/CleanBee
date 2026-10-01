<?php

namespace App\Http\Controllers;

use App\Models\Reward;
use App\Models\RewardRedemption;
use Illuminate\Database\QueryException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpFoundation\Response;

class RewardRedemptionController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(['data' => Reward::query()->where('is_active', true)->orderBy('points_required')->get()]);
    }

    public function history(Request $request): JsonResponse
    {
        return response()->json(['data' => $request->user()->rewardRedemptions()->with('reward:id,name,icon')->latest('redeemed_at')->paginate(20)]);
    }

    public function redeem(Request $request, Reward $reward): JsonResponse
    {
        $key = $request->header('Idempotency-Key');
        abort_unless(is_string($key) && strlen($key) >= 16 && strlen($key) <= 100, Response::HTTP_UNPROCESSABLE_ENTITY, 'A valid Idempotency-Key header is required.');

        $user = $request->user();
        $existing = $user->rewardRedemptions()->with('reward')->where('idempotency_key', $key)->first();
        if ($existing) {
            abort_unless($existing->reward_id === $reward->id, Response::HTTP_CONFLICT, 'This idempotency key was already used for another reward.');
            return response()->json(['message' => 'Reward already redeemed for this request.', 'data' => $existing, 'points' => (int) $user->fresh()->eco_points]);
        }

        try {
            $redemption = DB::transaction(function () use ($user, $reward, $key) {
                $lockedReward = Reward::query()->whereKey($reward->id)->lockForUpdate()->firstOrFail();
                abort_unless($lockedReward->is_active, Response::HTTP_UNPROCESSABLE_ENTITY, 'This reward is no longer available.');
                $lockedUser = $user->newQuery()->whereKey($user->id)->lockForUpdate()->firstOrFail();
                abort_if($lockedUser->eco_points < $lockedReward->points_required, Response::HTTP_UNPROCESSABLE_ENTITY, 'You do not have enough eco points for this reward.');

                $lockedUser->decrement('eco_points', $lockedReward->points_required);
                return RewardRedemption::create([
                    'user_id' => $lockedUser->id,
                    'reward_id' => $lockedReward->id,
                    'points_spent' => $lockedReward->points_required,
                    'status' => 'completed',
                    'idempotency_key' => $key,
                    'redeemed_at' => now(),
                ])->load('reward');
            });
        } catch (QueryException $exception) {
            $existing = $user->rewardRedemptions()->with('reward')->where('idempotency_key', $key)->first();
            if (!$existing || $existing->reward_id !== $reward->id) {
                throw $exception;
            }
            $redemption = $existing;
        }

        return response()->json(['message' => 'Reward redeemed successfully.', 'data' => $redemption, 'points' => (int) $user->fresh()->eco_points], Response::HTTP_CREATED);
    }
}
