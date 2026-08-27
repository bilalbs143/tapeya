<?php

namespace App\Streaming\Providers;

use App\Models\LiveStream;
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
use Google\Service\YouTube\LiveStream;
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

    public function createStream(LiveStream $stream, CreateStreamData $data): void
    {
        $liveStream = new LiveStream(['kind' => 'youtube#liveStream']);
        $liveStream->setSnippet(new LiveStreamSnippet(['title' => $data->title]));
        $liveStream->setCdn(new CdnSettings([
            'ingestionType' => 'rtmp',
            'resolution' => '1080p',
            'frameRate' => '30fps',
        ]));

        $streamResponse = $this->yt->liveStreams->insert('snippet,cdn', $liveStream);
        YouTubeQuotaTracker::record(YouTubeQuotaTracker::COST_INSERT);
        $streamId = $streamResponse->getId();
        $ingestion = $streamResponse->getCdn()->getIngestionInfo();

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
            'enableAutoStop' => true,
            'enableDvr' => true,
            'recordFromStart' => true,
            'monitorStream' => ['enableMonitorStream' => false],
        ]));

        $broadcastResponse = $this->yt->liveBroadcasts->insert('snippet,status,contentDetails', $broadcast);
        YouTubeQuotaTracker::record(YouTubeQuotaTracker::COST_INSERT);
        $broadcastId = $broadcastResponse->getId();

        $this->yt->liveBroadcasts->bind($broadcastId, 'id,contentDetails', ['streamId' => $streamId]);
        YouTubeQuotaTracker::record(YouTubeQuotaTracker::COST_BIND);

        $stream->update([
            'provider_stream_id' => $broadcastId,
            'provider_ingest_id' => $streamId,
            'provider_playback_id' => $broadcastId,
            'ingest_rtmp_url' => $ingestion->getIngestionAddress(),
            'stream_key_encrypted' => Crypt::encryptString($ingestion->getStreamName()),
            'embed_url' => YouTubeEmbedUrl::build($broadcastId),
            'playback_url' => null,
            'status' => 'idle',
            'provider_metadata' => [
                'youtube_stream_id' => $streamId,
                'youtube_channel_id' => app(StreamingSettings::class)->youtubeChannelId,
                'privacy' => $data->privacy,
            ],
        ]);
    }

    public function syncStatus(LiveStream $stream): void
    {
        $this->syncStatuses(collect([$stream]));
    }

    /**
     * Batched status poll — one `liveBroadcasts.list` call and one `liveStreams.list` call per
     * 50 streams (YouTube's per-request `id` limit), instead of 2 calls per stream. This is the
     * dominant quota cost in the system (`streams:sync` runs every minute), so this is a real
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

        $lifecycleByBroadcastId = $this->fetchLifecycleStatuses($streams->pluck('provider_stream_id')->unique());
        $ingestStatusByStreamId = $this->fetchIngestStatuses($streams->pluck('provider_ingest_id')->filter()->unique());

        foreach ($streams as $stream) {
            $lifecycle = $lifecycleByBroadcastId[$stream->provider_stream_id] ?? null;
            $ingestStatus = $stream->provider_ingest_id ? ($ingestStatusByStreamId[$stream->provider_ingest_id] ?? null) : null;
            $providerStatus = $this->mapProviderStatus($lifecycle, $ingestStatus);
            $updates = LiveStreamStatusTransition::resolve($stream, $providerStatus);

            if ($updates !== null) {
                $stream->update($updates);
            }
        }
    }

    /**
     * @param  Collection<int, string>  $broadcastIds
     * @return array<string, string> provider_stream_id => lifecycle status
     */
    private function fetchLifecycleStatuses(Collection $broadcastIds): array
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
            }
        }

        return $result;
    }

    /**
     * @param  Collection<int, string>  $ingestIds
     * @return array<string, string> provider_ingest_id => stream status
     */
    private function fetchIngestStatuses(Collection $ingestIds): array
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
            'live' => $ingestStatus === 'active' ? 'live' : 'idle',
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
