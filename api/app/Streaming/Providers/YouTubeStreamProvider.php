<?php

namespace App\Streaming\Providers;

use App\Models\MatchStream;
use App\Settings\StreamingSettings;
use App\Streaming\Contracts\StreamProviderContract;
use App\Streaming\Data\CreateStreamData;
use App\Streaming\Data\StreamIngestConfig;
use App\Streaming\Data\StreamPlayback;
use App\Streaming\Support\YouTubeEmbedUrl;
use Google\Client as GoogleClient;
use Google\Service\YouTube;
use Google\Service\YouTube\CdnSettings;
use Google\Service\YouTube\LiveBroadcast;
use Google\Service\YouTube\LiveBroadcastContentDetails;
use Google\Service\YouTube\LiveBroadcastSnippet;
use Google\Service\YouTube\LiveBroadcastStatus;
use Google\Service\YouTube\LiveStream;
use Google\Service\YouTube\LiveStreamSnippet;
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

    public function createStream(MatchStream $stream, CreateStreamData $data): void
    {
        $liveStream = new LiveStream(['kind' => 'youtube#liveStream']);
        $liveStream->setSnippet(new LiveStreamSnippet(['title' => $data->title]));
        $liveStream->setCdn(new CdnSettings([
            'ingestionType' => 'rtmp',
            'resolution' => '1080p',
            'frameRate' => '30fps',
        ]));

        $streamResponse = $this->yt->liveStreams->insert('snippet,cdn', $liveStream);
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
        $broadcastId = $broadcastResponse->getId();

        $this->yt->liveBroadcasts->bind($broadcastId, 'id,contentDetails', ['streamId' => $streamId]);

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

    public function syncStatus(MatchStream $stream): void
    {
        if (! $stream->provider_stream_id) {
            return;
        }

        try {
            $response = $this->yt->liveBroadcasts->listLiveBroadcasts('id,status', [
                'id' => $stream->provider_stream_id,
            ]);
            $items = $response->getItems();

            if (empty($items)) {
                $stream->update(['status' => 'ended']);

                return;
            }

            $lifecycle = $items[0]->getStatus()->getLifeCycleStatus();

            $status = match ($lifecycle) {
                'live' => 'live',
                'complete' => 'ended',
                'testStarting', 'testing' => 'starting',
                default => 'idle',
            };

            $updates = ['status' => $status];
            if ($status === 'live' && ! $stream->started_at) {
                $updates['started_at'] = now();
            }
            if ($status === 'ended' && ! $stream->ended_at) {
                $updates['ended_at'] = now();
            }

            $stream->update($updates);
        } catch (\Exception $e) {
            Log::error("YouTube syncStatus failed for stream {$stream->id}: ".$e->getMessage());
        }
    }

    public function endStream(MatchStream $stream): void
    {
        if (! $stream->provider_stream_id) {
            return;
        }

        try {
            $this->yt->liveBroadcasts->transition('complete', $stream->provider_stream_id, 'status');
        } catch (\Exception $e) {
            Log::warning("YouTube broadcast transition failed for stream {$stream->id}: ".$e->getMessage());
        }

        $stream->update(['status' => 'ended', 'ended_at' => now()]);
    }

    public function deleteStream(MatchStream $stream): void
    {
        if (! $stream->provider_stream_id) {
            return;
        }

        try {
            $this->yt->liveBroadcasts->delete($stream->provider_stream_id);
        } catch (\Exception $e) {
            Log::warning("YouTube broadcast delete failed for stream {$stream->id}: ".$e->getMessage());
        }

        $stream->update(['status' => 'ended', 'ended_at' => $stream->ended_at ?? now()]);
    }

    public function playback(MatchStream $stream): StreamPlayback
    {
        return new StreamPlayback(
            mode: 'iframe',
            url: null,
            embedId: $stream->provider_playback_id,
            embedUrl: YouTubeEmbedUrl::normalize($stream->embed_url, $stream->provider_playback_id),
            playerOptions: YouTubeEmbedUrl::defaultParams(),
        );
    }

    public function ingestConfig(MatchStream $stream): StreamIngestConfig
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
}
