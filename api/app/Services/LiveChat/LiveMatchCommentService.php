<?php

namespace App\Services\LiveChat;

use App\Events\Broadcast\MatchChatMessageReceived;
use App\Models\TournamentMatch;
use App\Settings\LiveChatSettings;
use App\Support\LiveChat\LiveChatRedisKeys;
use Illuminate\Support\Facades\Redis;
use Illuminate\Support\Str;

class LiveMatchCommentService
{
    public function __construct(private readonly LiveChatSettings $settings) {}

    /**
     * Validate, guard, and broadcast a chat comment. Returns the generated ULID.
     */
    public function send(TournamentMatch $match, int $userId, string $displayName, string $rawBody): string
    {
        if ($this->settings->enabled !== 1) {
            abort(403, 'Live chat is currently disabled.');
        }

        $stream = $match->stream;
        if (! $stream || ! in_array($stream->status, ['live', 'starting'], true)) {
            abort(422, 'This match does not have an active stream.');
        }

        if (Redis::exists(LiveChatRedisKeys::mute($match->id, $userId))) {
            abort(403, 'You are currently muted from this chat.');
        }

        $body = mb_substr(strip_tags(trim($rawBody)), 0, $this->settings->bodyMax);

        if ($body === '') {
            abort(422, 'Comment cannot be empty.');
        }

        $intervalKey = LiveChatRedisKeys::interval($match->id, $userId);
        $set = Redis::set($intervalKey, '1', 'NX', 'EX', $this->settings->minIntervalSec);

        if ($set === null || $set === false) {
            abort(429, 'You are sending comments too quickly.');
        }

        $burstKey = LiveChatRedisKeys::burst($match->id, $userId);
        $count = (int) Redis::incr($burstKey);

        if ($count === 1) {
            Redis::expire($burstKey, $this->settings->burstWindowSec);
        }

        if ($count > $this->settings->burstMax) {
            abort(429, 'You have reached the comment limit for this session.');
        }

        $hash = hash('xxh3', mb_strtolower($body));
        $dedupKey = LiveChatRedisKeys::dedup($match->id, $userId);
        $dedup = Redis::set($dedupKey, $hash, 'NX', 'EX', 10);

        if ($dedup === null || $dedup === false) {
            abort(422, 'Duplicate message.');
        }

        $id = (string) Str::ulid();
        $sentAt = now()->toIso8601String();

        MatchChatMessageReceived::dispatch(
            matchId: $match->id,
            id: $id,
            name: $displayName,
            body: $body,
            sentAt: $sentAt,
        );

        return $id;
    }
}
