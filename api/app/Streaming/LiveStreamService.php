<?php

namespace App\Streaming;

use App\Events\Broadcast\LiveStreamStatusUpdated;
use App\Models\MatchStream;
use App\Models\TournamentMatch;
use App\Settings\StreamingSettings;
use App\Streaming\Data\CreateStreamData;
use App\Streaming\Data\StreamPlayback;
use App\Support\LiveChat\LiveChatRedisKeys;
use Illuminate\Support\Facades\Log;

class LiveStreamService
{
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

        if ($stream->status !== $before) {
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
