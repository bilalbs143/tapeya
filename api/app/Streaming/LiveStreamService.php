<?php

namespace App\Streaming;

use App\Events\Broadcast\LiveHubUpdated;
use App\Events\Broadcast\LiveStreamStatusUpdated;
use App\Http\Controllers\User\LiveBroadcastController;
use App\Models\MatchStream;
use App\Models\TournamentMatch;
use App\Settings\StreamingSettings;
use App\Streaming\Data\CreateStreamData;
use App\Streaming\Data\StreamPlayback;
use App\Support\LiveChat\LiveChatRedisKeys;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Log;

class LiveStreamService
{
    /**
     * Fixed v1 cap for self-serve mobile broadcasts — single source of truth, shared by
     * EndExpiredBroadcasts (server enforcement) and the app's startBroadcast() call
     * (client enforcement). See LIVE_STREAM_MOBILE_BROADCAST.md.
     */
    public const SELF_SERVE_MAX_DURATION_SECONDS = 7200;

    public function __construct(private StreamProviderResolver $resolver) {}

    public function createForMatch(TournamentMatch $match, CreateStreamData $data, int $createdBy): MatchStream
    {
        if ($match->stream?->status === 'live') {
            abort(422, 'A stream is already live for this match.');
        }

        if ($match->stream) {
            $this->resolver->forMatch($match)->deleteStream($match->stream);
            $match->stream->delete();
        }

        $provider = $this->resolver->forMatch($match);

        $stream = MatchStream::create([
            'match_id' => $match->id,
            'title' => $data->title,
            'description' => $data->description,
            'streaming_url' => $data->streamingUrl,
            'provider' => $provider->slug(),
            'status' => 'idle',
            'created_by' => $createdBy,
        ]);

        $provider->createStream($stream, $data);
        $stream->refresh();

        Log::info("Stream created for match {$match->id}", [
            'provider' => $stream->provider,
            'stream_id' => $stream->provider_stream_id,
        ]);

        return $stream;
    }

    /**
     * @param  array{title: string, description?: ?string, streaming_url: string, status?: string}  $data
     */
    public function createStandalone(array $data, int $createdBy): MatchStream
    {
        return MatchStream::create([
            'match_id' => null,
            'title' => $data['title'],
            'description' => $data['description'] ?? null,
            'streaming_url' => $data['streaming_url'],
            'provider' => 'external',
            'status' => $data['status'] ?? 'idle',
            'created_by' => $createdBy,
        ]);
    }

    /**
     * Standalone YouTube RTMP stream (no match) — same provider flow as match-linked streams.
     *
     * @param  array{title: string, description?: ?string, streaming_url?: ?string, privacy?: string}  $data
     */
    public function createStandaloneYoutube(array $data, int $createdBy): MatchStream
    {
        $settings = app(StreamingSettings::class);
        $providerSlug = $settings->defaultProvider;

        $createData = new CreateStreamData(
            title: $data['title'],
            description: $data['description'] ?? '',
            privacy: $data['privacy'] ?? $settings->youtubeDefaultPrivacy ?? 'public',
            streamingUrl: $data['streaming_url'] ?? null,
        );

        $stream = MatchStream::create([
            'match_id' => null,
            'owner_user_id' => $data['owner_user_id'] ?? null,
            'title' => $data['title'],
            'description' => $data['description'] ?? null,
            'streaming_url' => $data['streaming_url'] ?? null,
            'provider' => $providerSlug,
            'status' => 'idle',
            'created_by' => $createdBy,
        ]);

        $this->resolver->forStream($stream)->createStream($stream, $createData);
        $stream->refresh();

        Log::info('Standalone YouTube stream created', [
            'stream_id' => $stream->id,
            'provider' => $stream->provider,
            'provider_stream_id' => $stream->provider_stream_id,
        ]);

        return $stream;
    }

    /**
     * Self-serve mobile broadcast — thin wrapper over createStandaloneYoutube() enforcing
     * the rules that only apply to user-initiated broadcasts: one active stream at a time,
     * always unlisted, always YouTube (never silently falls back to another provider).
     *
     * @see LiveBroadcastController::store()
     */
    public function createSelfServe(int $ownerUserId, string $title, ?string $description): MatchStream
    {
        $this->assertNoActiveSelfServeStream($ownerUserId);

        // Self-serve's entire design (iframe playback, RTMP ingest shape) assumes YouTube.
        // Fail loudly rather than silently provisioning against a different default provider.
        abort_unless(
            app(StreamingSettings::class)->defaultProvider === 'youtube',
            503,
            'Self-serve broadcasting is temporarily unavailable.',
        );

        return $this->createStandaloneYoutube([
            'title' => $title,
            'description' => $description,
            'privacy' => 'unlisted',
            'owner_user_id' => $ownerUserId,
        ], $ownerUserId);
    }

    private function assertNoActiveSelfServeStream(int $ownerUserId): void
    {
        $exists = MatchStream::query()
            ->where('owner_user_id', $ownerUserId)
            ->whereIn('status', ['idle', 'starting', 'live'])
            ->exists();

        abort_if($exists, 422, 'You already have an active broadcast.');
    }

    /**
     * Replace YouTube RTMP credentials on an existing stream row (keeps stream id).
     */
    public function provisionProviderStream(MatchStream $stream, CreateStreamData $data): MatchStream
    {
        if ($stream->provider === 'external') {
            abort(422, 'External streams cannot be provisioned via RTMP.');
        }

        if ($stream->status === 'live') {
            abort(422, 'Cannot replace setup while stream is live.');
        }

        $provider = $this->resolver->forStream($stream);

        if ($stream->provider_stream_id) {
            $provider->deleteStream($stream);
        }

        $stream->update([
            'title' => $data->title,
            'description' => $data->description,
            'streaming_url' => $data->streamingUrl,
            'status' => 'idle',
            'ended_at' => null,
        ]);

        $provider->createStream($stream, $data);
        $stream->refresh();

        return $stream;
    }

    public function markLive(MatchStream $stream): void
    {
        $stream->update(['status' => 'live', 'started_at' => $stream->started_at ?? now()]);
        $stream->refresh();

        $this->broadcastStatusChange($stream);
    }

    public function end(MatchStream $stream): void
    {
        if ($stream->provider === 'external') {
            $stream->update(['status' => 'ended', 'ended_at' => now()]);
            $stream->refresh();
        } else {
            $this->resolver->forStream($stream)->endStream($stream);
            $stream->refresh();
        }

        LiveChatRedisKeys::purgeStream($stream->id);
        $this->broadcastStatusChange($stream, 'ended', null);
    }

    public function delete(MatchStream $stream): void
    {
        if ($stream->provider !== 'external') {
            $this->resolver->forStream($stream)->deleteStream($stream);
        }

        $stream->delete();
    }

    public function playback(TournamentMatch $match): StreamPlayback
    {
        $stream = $match->stream ?? abort(404, 'No stream found.');

        return $this->resolver->forMatch($match)->playback($stream);
    }

    public function syncStatus(MatchStream $stream): void
    {
        if ($stream->provider === 'external' || in_array($stream->status, ['ended', 'error'], true)) {
            return;
        }

        $before = $stream->status;
        $this->resolver->forStream($stream)->syncStatus($stream);
        $stream->refresh();

        $this->reconcileStatusChange($stream, $before);
    }

    /**
     * Batch equivalent of syncStatus() — groups by provider so each vendor driver can poll many
     * streams in as few API calls as possible (see YouTubeStreamProvider::syncStatuses()) instead
     * of one round-trip per stream, since `streams:sync` runs every minute against every active
     * stream and vendor quota is shared across the whole app.
     *
     * @param  Collection<int, MatchStream>  $streams
     */
    public function syncStatuses(Collection $streams): void
    {
        $eligible = $streams->filter(
            fn (MatchStream $stream) => $stream->provider !== 'external' && ! in_array($stream->status, ['ended', 'error'], true)
        )->values();

        if ($eligible->isEmpty()) {
            return;
        }

        $before = $eligible->pluck('status', 'id');

        $eligible->groupBy('provider')->each(
            fn (Collection $group) => $this->resolver->forStream($group->first())->syncStatuses($group)
        );

        foreach ($eligible->fresh() as $stream) {
            $this->reconcileStatusChange($stream, $before->get($stream->id));
        }
    }

    private function reconcileStatusChange(MatchStream $stream, string $before): void
    {
        if ($stream->status === $before) {
            return;
        }

        if ($stream->status === 'ended') {
            LiveChatRedisKeys::purgeStream($stream->id);
        }

        $this->broadcastStatusChange($stream);

        if ($stream->match_id) {
            Log::info("Stream status changed for match {$stream->match_id}", [
                'from' => $before,
                'to' => $stream->status,
            ]);
        }
    }

    private function broadcastStatusChange(
        MatchStream $stream,
        ?string $status = null,
        ?StreamPlayback $playback = null,
    ): void {
        $resolvedStatus = $status ?? $stream->status;
        $resolvedPlayback = $playback;

        if ($resolvedPlayback === null && in_array($resolvedStatus, ['live', 'ended'], true)) {
            $resolvedPlayback = $this->playbackPayload($stream);
        }

        broadcast(new LiveStreamStatusUpdated($stream->id, $resolvedStatus, $resolvedPlayback));

        $visibleInApp = MatchStream::query()->visibleInApp()->whereKey($stream->id)->exists();
        broadcast(new LiveHubUpdated($stream, $visibleInApp));
    }

    private function playbackPayload(MatchStream $stream): ?StreamPlayback
    {
        $playback = $stream->playbackForApp();

        if (! $playback) {
            return null;
        }

        return new StreamPlayback(
            mode: $playback['mode'],
            url: $playback['url'] ?? null,
            embedId: $playback['embed_id'] ?? null,
            embedUrl: $playback['embed_url'] ?? null,
            playerOptions: $playback['player_options'] ?? [],
        );
    }
}
