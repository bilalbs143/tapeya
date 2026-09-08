<?php

namespace App\Streaming\Providers;

use App\Models\LiveStream;
use App\Models\YoutubeStreamKey;
use App\Settings\StreamingSettings;
use App\Streaming\Contracts\StreamProviderContract;
use App\Streaming\Data\CreateStreamData;
use App\Streaming\Data\StreamIngestConfig;
use App\Streaming\Data\StreamPlayback;
use App\Streaming\Support\LiveStreamStatusTransition;
use App\Streaming\Support\YouTubeEmbedUrl;
use App\Streaming\Support\YouTubeQuotaTracker;
use Google\Client as GoogleClient;
use Google\Service\YouTube;
use Google\Service\YouTube\CdnSettings;
use Google\Service\YouTube\LiveBroadcast;
use Google\Service\YouTube\LiveBroadcastContentDetails;
use Google\Service\YouTube\LiveBroadcastSnippet;
use Google\Service\YouTube\LiveBroadcastStatus;
use Google\Service\YouTube\LiveStream as YouTubeLiveStream;
use Google\Service\YouTube\LiveStreamSnippet;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\Log;

class YouTubeStreamProvider implements StreamProviderContract
{
    private YouTube $yt;

    public function __construct()
    {
        $settings = app(StreamingSettings::class);

        $client = new GoogleClient;
        $client->setClientId($settings->youtubeClientId);
        $client->setClientSecret($settings->youtubeClientSecret);
        $client->setRedirectUri(StreamingSettings::OAUTH_REDIRECT_URI);
        $client->setAccessType('offline');

        $client->fetchAccessTokenWithRefreshToken($settings->youtubeRefreshToken);

        $this->yt = new YouTube($client);
    }

    /**
     * Bind a new broadcast to a reusable key, or mint a one-off key when $data->mintOwnKey
     * (self-serve mobile only).
     */
    public function createStream(LiveStream $stream, CreateStreamData $data): void
    {
        if ($data->mintOwnKey) {
            $minted = $this->createKey($data->title);
            $youtubeStreamId = $minted['youtube_stream_id'];
            $ingestRtmpUrl = $minted['ingest_rtmp_url'];
            $streamKeyEncrypted = $minted['stream_key_encrypted'];
            $keyId = null;
        } else {
            $key = $this->requireAvailableKey($data->youtubeStreamKeyId, excludingStreamId: $stream->id);
            $youtubeStreamId = $key->youtube_stream_id;
            $ingestRtmpUrl = $key->ingest_rtmp_url;
            $streamKeyEncrypted = $key->stream_key_encrypted;
            $keyId = $key->id;
        }

        $broadcast = new LiveBroadcast(['kind' => 'youtube#liveBroadcast']);
        $broadcast->setSnippet(new LiveBroadcastSnippet([
            'title' => $data->title,
            'description' => $data->description,
            'scheduledStartTime' => ($data->scheduledAt ?? now())->toAtomString(),
        ]));
        $broadcast->setStatus(new LiveBroadcastStatus([
            'privacyStatus' => $data->privacy,
        ]));
        $broadcast->setContentDetails(new LiveBroadcastContentDetails([
            'enableAutoStart' => true,
            // Keep broadcast open when RTMP drops so OBS can reconnect on the same session.
            'enableAutoStop' => false,
            'enableDvr' => true,
            'recordFromStart' => true,
            'monitorStream' => ['enableMonitorStream' => false],
        ]));

        $broadcastResponse = $this->yt->liveBroadcasts->insert('snippet,status,contentDetails', $broadcast);
        YouTubeQuotaTracker::record(YouTubeQuotaTracker::COST_INSERT);
        $broadcastId = $broadcastResponse->getId();

        $this->yt->liveBroadcasts->bind($broadcastId, 'id,contentDetails', ['streamId' => $youtubeStreamId]);
        YouTubeQuotaTracker::record(YouTubeQuotaTracker::COST_BIND);

        $stream->update([
            'provider_stream_id' => $broadcastId,
            'provider_ingest_id' => $youtubeStreamId,
            'youtube_stream_key_id' => $keyId,
            'provider_playback_id' => $broadcastId,
            // Denormalized so ingest reads don't need a key join.
            'ingest_rtmp_url' => $ingestRtmpUrl,
            'stream_key_encrypted' => $streamKeyEncrypted,
            'embed_url' => YouTubeEmbedUrl::build($broadcastId),
            'playback_url' => null,
            'status' => 'idle',
            'provider_metadata' => [
                'youtube_stream_id' => $youtubeStreamId,
                'youtube_channel_id' => app(StreamingSettings::class)->youtubeChannelId,
                'privacy' => $data->privacy,
            ],
        ]);
    }

    /**
     * Provision a reusable YouTube liveStream (backoffice Create Key).
     *
     * @return array{youtube_stream_id: string, ingest_rtmp_url: string, stream_key_encrypted: string}
     */
    public function createKey(string $title): array
    {
        $liveStream = new YouTubeLiveStream(['kind' => 'youtube#liveStream']);
        $liveStream->setSnippet(new LiveStreamSnippet(['title' => $title]));
        $liveStream->setCdn(new CdnSettings([
            'ingestionType' => 'rtmp',
            'resolution' => '1080p',
            'frameRate' => '30fps',
        ]));

        $streamResponse = $this->yt->liveStreams->insert('snippet,cdn', $liveStream);
        YouTubeQuotaTracker::record(YouTubeQuotaTracker::COST_INSERT);
        $ingestion = $streamResponse->getCdn()->getIngestionInfo();

        return [
            'youtube_stream_id' => $streamResponse->getId(),
            'ingest_rtmp_url' => $ingestion->getIngestionAddress(),
            'stream_key_encrypted' => Crypt::encryptString($ingestion->getStreamName()),
        ];
    }

    /** Best-effort remote delete; local row removal must not fail if YouTube already dropped it. */
    public function deleteKey(string $youtubeStreamId): void
    {
        try {
            $this->yt->liveStreams->delete($youtubeStreamId);
            YouTubeQuotaTracker::record(YouTubeQuotaTracker::COST_DELETE);
        } catch (\Exception $e) {
            Log::warning("YouTube liveStream delete failed for {$youtubeStreamId}: ".$e->getMessage());
        }
    }

    private function requireAvailableKey(?int $keyId, ?int $excludingStreamId): YoutubeStreamKey
    {
        if (! $keyId) {
            abort(422, 'A YouTube stream key must be selected.');
        }

        $key = YoutubeStreamKey::find($keyId);

        if (! $key || ! $key->is_active) {
            abort(422, 'Selected YouTube stream key is unavailable.');
        }

        if ($key->isInUse($excludingStreamId)) {
            abort(422, "Selected YouTube stream key (\"{$key->title}\") is already in use by another live stream.");
        }

        return $key;
    }

    public function syncStatus(LiveStream $stream): void
    {
        $this->syncStatuses(collect([$stream]));
    }

    /**
     * Batched status poll — one `liveBroadcasts.list` call and one `liveStreams.list` call per
     * 50 streams (YouTube's per-request `id` limit), instead of 2 calls per stream. This is the
     * dominant quota cost in the system (`streams:sync` runs every 5 minutes), so this is a real
     * cost reduction, not micro-optimization — see YouTubeQuotaTracker / MonitorBroadcastOperations
     * and the "reduce quota usage" discussion in LIVE_STREAM_MOBILE_BROADCAST.md's history.
     *
     * @param  Collection<int, LiveStream>  $streams
     */
    public function syncStatuses(Collection $streams): void
    {
        $streams = $streams->filter(fn (LiveStream $stream) => filled($stream->provider_stream_id))->values();

        if ($streams->isEmpty()) {
            return;
        }

        $failedBroadcastIds = [];
        $failedIngestIds = [];
        $lifecycleByBroadcastId = $this->fetchLifecycleStatuses($streams->pluck('provider_stream_id')->unique(), $failedBroadcastIds);
        $ingestStatusByStreamId = $this->fetchIngestStatuses($streams->pluck('provider_ingest_id')->filter()->unique(), $failedIngestIds);

        foreach ($streams as $stream) {
            // A failed poll this tick means "unknown", not "not live" — skip and let the next
            // minute's tick retry, rather than writing/broadcasting a false idle/ended status.
            if (in_array($stream->provider_stream_id, $failedBroadcastIds, true)) {
                continue;
            }
            if ($stream->provider_ingest_id && in_array($stream->provider_ingest_id, $failedIngestIds, true)) {
                continue;
            }

            $lifecycle = $lifecycleByBroadcastId[$stream->provider_stream_id] ?? null;
            $ingestStatus = $stream->provider_ingest_id ? ($ingestStatusByStreamId[$stream->provider_ingest_id] ?? null) : null;

            // OBS is pushing but the YouTube broadcast is already complete/gone — open a new
            // broadcast on the same ingest so the Tapeya session can go live again.
            if ($ingestStatus === 'active' && ! $this->broadcastAcceptsIngest($lifecycle)) {
                try {
                    $lifecycle = $this->reopenBroadcast($stream);
                } catch (\Throwable $e) {
                    Log::warning("YouTube broadcast reopen failed for stream {$stream->id}: ".$e->getMessage());

                    continue;
                }
            }

            $providerStatus = $this->mapProviderStatus($lifecycle, $ingestStatus);
            $updates = LiveStreamStatusTransition::resolve($stream, $providerStatus);

            if ($updates !== null) {
                $stream->update($updates);
            }
        }
    }

    /**
     * Lifecycle values that can still receive RTMP / auto-start for this outing.
     */
    private function broadcastAcceptsIngest(?string $lifecycle): bool
    {
        return in_array($lifecycle, [
            'ready',
            'created',
            'testStarting',
            'testing',
            'liveStarting',
            'live',
        ], true);
    }

    /**
     * Create + bind a fresh broadcast to this session's existing ingest (same OBS key).
     *
     * @return string New lifecycle hint for this sync tick ('live' once ingest is active).
     */
    private function reopenBroadcast(LiveStream $stream): string
    {
        $youtubeStreamId = $stream->provider_ingest_id;
        if (! filled($youtubeStreamId)) {
            throw new \RuntimeException('Stream has no YouTube ingest id to rebind.');
        }

        if (filled($stream->provider_stream_id)) {
            try {
                $this->yt->liveBroadcasts->transition('complete', $stream->provider_stream_id, 'status');
                YouTubeQuotaTracker::record(YouTubeQuotaTracker::COST_TRANSITION);
            } catch (\Exception) {
                // Already complete/missing — fine.
            }
        }

        $privacy = $stream->provider_metadata['privacy'] ?? app(StreamingSettings::class)->youtubeDefaultPrivacy ?? 'public';

        $broadcast = new LiveBroadcast(['kind' => 'youtube#liveBroadcast']);
        $broadcast->setSnippet(new LiveBroadcastSnippet([
            'title' => $stream->title ?: 'Tapeya Live',
            'description' => (string) ($stream->description ?? ''),
            'scheduledStartTime' => now()->toAtomString(),
        ]));
        $broadcast->setStatus(new LiveBroadcastStatus([
            'privacyStatus' => $privacy,
        ]));
        $broadcast->setContentDetails(new LiveBroadcastContentDetails([
            'enableAutoStart' => true,
            'enableAutoStop' => false,
            'enableDvr' => true,
            'recordFromStart' => true,
            'monitorStream' => ['enableMonitorStream' => false],
        ]));

        $broadcastResponse = $this->yt->liveBroadcasts->insert('snippet,status,contentDetails', $broadcast);
        YouTubeQuotaTracker::record(YouTubeQuotaTracker::COST_INSERT);
        $broadcastId = $broadcastResponse->getId();

        $this->yt->liveBroadcasts->bind($broadcastId, 'id,contentDetails', ['streamId' => $youtubeStreamId]);
        YouTubeQuotaTracker::record(YouTubeQuotaTracker::COST_BIND);

        $metadata = $stream->provider_metadata ?? [];
        $metadata['youtube_stream_id'] = $youtubeStreamId;

        $stream->update([
            'provider_stream_id' => $broadcastId,
            'provider_playback_id' => $broadcastId,
            'embed_url' => YouTubeEmbedUrl::build($broadcastId),
            'provider_metadata' => $metadata,
        ]);
        $stream->refresh();

        Log::info("Reopened YouTube broadcast for stream {$stream->id}", [
            'broadcast_id' => $broadcastId,
            'ingest_id' => $youtubeStreamId,
        ]);

        return 'live';
    }

    /**
     * @param  Collection<int, string>  $broadcastIds
     * @param  array<int, string>  $failedIds  Out param: ids whose chunk request threw.
     * @return array<string, string> provider_stream_id => lifecycle status
     */
    private function fetchLifecycleStatuses(Collection $broadcastIds, array &$failedIds = []): array
    {
        $result = [];

        foreach ($broadcastIds->chunk(50) as $chunk) {
            try {
                $response = $this->yt->liveBroadcasts->listLiveBroadcasts('id,status', [
                    'id' => $chunk->implode(','),
                    'maxResults' => $chunk->count(),
                ]);
                YouTubeQuotaTracker::record(YouTubeQuotaTracker::COST_LIST);

                foreach ($response->getItems() as $item) {
                    $result[$item->getId()] = $item->getStatus()->getLifeCycleStatus();
                }
            } catch (\Exception $e) {
                Log::error('YouTube batch broadcast status fetch failed: '.$e->getMessage());
                array_push($failedIds, ...$chunk->all());
            }
        }

        return $result;
    }

    /**
     * @param  Collection<int, string>  $ingestIds
     * @param  array<int, string>  $failedIds  Out param: ids whose chunk request threw.
     * @return array<string, string> provider_ingest_id => stream status
     */
    private function fetchIngestStatuses(Collection $ingestIds, array &$failedIds = []): array
    {
        $result = [];

        foreach ($ingestIds->chunk(50) as $chunk) {
            try {
                $response = $this->yt->liveStreams->listLiveStreams('status', [
                    'id' => $chunk->implode(','),
                    'maxResults' => $chunk->count(),
                ]);
                YouTubeQuotaTracker::record(YouTubeQuotaTracker::COST_LIST);

                foreach ($response->getItems() as $item) {
                    $result[$item->getId()] = $item->getStatus()->getStreamStatus();
                }
            } catch (\Exception $e) {
                Log::warning('YouTube batch ingest status fetch failed: '.$e->getMessage());
                array_push($failedIds, ...$chunk->all());
            }
        }

        return $result;
    }

    private function mapProviderStatus(?string $lifecycle, ?string $ingestStatus): string
    {
        if ($lifecycle === null) {
            return 'idle';
        }

        return match ($lifecycle) {
            'live', 'liveStarting' => $ingestStatus === 'active' ? 'live' : 'idle',
            'ready', 'created' => $ingestStatus === 'active' ? 'live' : 'idle',
            'testStarting', 'testing' => 'starting',
            default => 'idle',
        };
    }

    public function endStream(LiveStream $stream): void
    {
        if (! $stream->provider_stream_id) {
            return;
        }

        try {
            $this->yt->liveBroadcasts->transition('complete', $stream->provider_stream_id, 'status');
            YouTubeQuotaTracker::record(YouTubeQuotaTracker::COST_TRANSITION);
        } catch (\Exception $e) {
            // Common when the remote broadcast never went live, or is already complete.
            Log::warning("YouTube broadcast transition failed for stream {$stream->id}: ".$e->getMessage());
        }

        // DB row is usually already `ended` from LiveStreamService::end(); only fill gaps.
        if ($stream->status !== 'ended' || $stream->ended_at === null) {
            $stream->update([
                'status' => 'ended',
                'ended_at' => $stream->ended_at ?? now(),
                'provider_metadata' => $this->metadataWithoutIdleSince($stream),
            ]);
        }
    }

    public function deleteStream(LiveStream $stream): void
    {
        if (! $stream->provider_stream_id) {
            return;
        }

        try {
            $this->yt->liveBroadcasts->delete($stream->provider_stream_id);
            YouTubeQuotaTracker::record(YouTubeQuotaTracker::COST_DELETE);
        } catch (\Exception $e) {
            Log::warning("YouTube broadcast delete failed for stream {$stream->id}: ".$e->getMessage());
        }

        $stream->update(['status' => 'ended', 'ended_at' => $stream->ended_at ?? now()]);
    }

    public function playback(LiveStream $stream): StreamPlayback
    {
        return new StreamPlayback(
            mode: 'iframe',
            url: null,
            embedId: $stream->provider_playback_id,
            embedUrl: YouTubeEmbedUrl::normalize($stream->embed_url, $stream->provider_playback_id),
            playerOptions: YouTubeEmbedUrl::defaultParams(),
        );
    }

    public function ingestConfig(LiveStream $stream): StreamIngestConfig
    {
        return new StreamIngestConfig(
            rtmpUrl: $stream->ingest_rtmp_url ?? 'rtmp://a.rtmp.youtube.com/live2',
            streamKey: Crypt::decryptString($stream->stream_key_encrypted),
            backupRtmpUrl: 'rtmp://b.rtmp.youtube.com/live2?backup=1',
        );
    }

    public function slug(): string
    {
        return 'youtube';
    }

    public function supportsWebhooks(): bool
    {
        return false;
    }

    /**
     * @return array<string, mixed>
     */
    private function metadataWithoutIdleSince(LiveStream $stream): array
    {
        $metadata = $stream->provider_metadata ?? [];
        unset($metadata['idle_since']);

        return $metadata;
    }
}
