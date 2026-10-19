<?php

namespace App\Services\Safety;

use App\Models\User;
use App\Models\UserBlock;
use App\Models\UserFollow;
use App\Models\UserReport;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class UserBlockService
{
    /**
     * @return list<int>
     */
    public function blockedUserIdsFor(int $blockerId): array
    {
        return UserBlock::query()
            ->where('blocker_id', $blockerId)
            ->pluck('blocked_user_id')
            ->map(fn ($id) => (int) $id)
            ->all();
    }

    public function isBlocked(int $blockerId, int $blockedUserId): bool
    {
        return UserBlock::query()
            ->where('blocker_id', $blockerId)
            ->where('blocked_user_id', $blockedUserId)
            ->exists();
    }

    /**
     * Block a user, drop follow edges both ways, and notify ops via user_reports.
     *
     * @return array{blocked: bool, already_blocked: bool}
     */
    public function block(User $blocker, User $target, string $reason = 'other', ?string $details = null): array
    {
        if ($blocker->id === $target->id) {
            throw ValidationException::withMessages([
                'user' => ['You cannot block yourself.'],
            ]);
        }

        $already = false;

        DB::transaction(function () use ($blocker, $target, $reason, $details, &$already) {
            $block = UserBlock::query()->firstOrCreate([
                'blocker_id' => $blocker->id,
                'blocked_user_id' => $target->id,
            ]);
            $already = ! $block->wasRecentlyCreated;

            UserFollow::query()
                ->where(function ($q) use ($blocker, $target) {
                    $q->where('follower_id', $blocker->id)->where('followed_user_id', $target->id);
                })
                ->orWhere(function ($q) use ($blocker, $target) {
                    $q->where('follower_id', $target->id)->where('followed_user_id', $blocker->id);
                })
                ->delete();

            // Always create a moderation signal so developers are notified (Guideline 1.2).
            UserReport::query()->create([
                'reporter_id' => $blocker->id,
                'reported_user_id' => $target->id,
                'reason' => $reason,
                'details' => $details,
                'source' => 'block',
                'status' => 'open',
            ]);
        });

        return [
            'blocked' => true,
            'already_blocked' => $already,
        ];
    }

    public function unblock(User $blocker, User $target): array
    {
        $deleted = UserBlock::query()
            ->where('blocker_id', $blocker->id)
            ->where('blocked_user_id', $target->id)
            ->delete();

        return [
            'blocked' => false,
            'was_blocked' => $deleted > 0,
        ];
    }

    /**
     * @return array{reported: bool, already_reported: bool}
     */
    public function report(User $reporter, User $target, string $reason, ?string $details = null): array
    {
        if ($reporter->id === $target->id) {
            throw ValidationException::withMessages([
                'user' => ['You cannot report yourself.'],
            ]);
        }

        $allowed = ['spam', 'harassment', 'inappropriate', 'violence', 'copyright', 'other'];
        if (! in_array($reason, $allowed, true)) {
            throw ValidationException::withMessages([
                'reason' => ['Invalid report reason.'],
            ]);
        }

        $existing = UserReport::query()
            ->where('reporter_id', $reporter->id)
            ->where('reported_user_id', $target->id)
            ->where('source', 'report')
            ->where('status', 'open')
            ->exists();

        if ($existing) {
            return ['reported' => true, 'already_reported' => true];
        }

        UserReport::query()->create([
            'reporter_id' => $reporter->id,
            'reported_user_id' => $target->id,
            'reason' => $reason,
            'details' => $details,
            'source' => 'report',
            'status' => 'open',
        ]);

        return ['reported' => true, 'already_reported' => false];
    }
}
