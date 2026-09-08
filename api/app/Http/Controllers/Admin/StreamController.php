<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\BaseControllerTrait;
use App\Http\Controllers\Controller;
use App\Http\Resources\Admin\StreamAdminResource;
use App\Models\LiveStream;
use App\Models\TournamentMatch;
use App\Rules\AvailableYoutubeStreamKey;
use App\Services\Push\PushNotificationService;
use App\Settings\StreamingSettings;
use App\Streaming\Data\CreateStreamData;
use App\Streaming\Data\StreamIngestConfig;
use App\Streaming\LiveStreamService;
use App\Streaming\StreamProviderManager;
use App\Streaming\StreamProviderResolver;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rule;

class StreamController extends Controller
{
    use BaseControllerTrait;

    public function __construct(
        private LiveStreamService $service,
        private StreamProviderManager $manager,
        private StreamProviderResolver $resolver,
        private PushNotificationService $pushService,
    ) {}

    public function create(Request $request, TournamentMatch $match): JsonResponse
    {
        // Resolve provider slug without building a live YouTube client (OAuth).
        $providerSlug = $this->resolver->slugForMatch($match);

        $request->validate([
            'title' => ['sometimes', 'string', 'max:100'],
            'privacy' => ['sometimes', 'in:public,unlisted'],
            'scheduled_at' => ['sometimes', 'date'],
            'streaming_url' => ['sometimes', 'url', 'starts_with:https', 'max:2048'],
            'youtube_stream_key_id' => [
                Rule::requiredIf($providerSlug === 'youtube'),
                'nullable',
                'integer',
                new AvailableYoutubeStreamKey(excludingStreamId: $match->stream?->id),
            ],
        ]);

        $settings = app(StreamingSettings::class);
        $match->loadMissing(['homeTeam', 'awayTeam']);

        // First-time match stream only — replace / New RTMP Setup must not re-notify.
        $isNewStream = $match->stream === null;

        $data = new CreateStreamData(
            title: $request->input('title', "{$match->homeTeam?->name} vs {$match->awayTeam?->name}"),
            description: "Live cricket match streamed via Tapeya. Follow live scores at tapeya.com/match/{$match->id}",
            privacy: $request->input('privacy', $settings->youtubeDefaultPrivacy ?? 'public'),
            streamingUrl: $request->input('streaming_url'),
            youtubeStreamKeyId: $request->filled('youtube_stream_key_id') ? (int) $request->input('youtube_stream_key_id') : null,
        );

        $userId = (int) $request->user()->id;
        $stream = $this->service->createForMatch($match, $data, $userId);
        $match->refresh();
        $ingest = $this->manager->driver($stream->provider)->ingestConfig($stream);

        if ($isNewStream) {
            try {
                $this->pushService->notifyLiveStreamCreated($stream, $userId);
            } catch (\Throwable $e) {
                Log::warning('Live stream created push failed: '.$e->getMessage(), ['stream_id' => $stream->id]);
            }
        }

        return $this->success($this->streamPayload($match, $stream, $ingest), 'Stream Created.', 'CREATED');
    }

    public function show(TournamentMatch $match): JsonResponse
    {
        $stream = $match->stream;

        if (! $stream) {
            return $this->success($this->streamPayload($match));
        }

        $ingest = $this->manager->driver($stream->provider)->ingestConfig($stream);

        return $this->success($this->streamPayload($match, $stream, $ingest));
    }

    public function end(TournamentMatch $match): JsonResponse
    {
        $stream = $match->stream ?? abort(404, 'No stream found.');
        $this->service->end($stream);

        return $this->success(['status' => 'ended'], 'Stream Ended.');
    }

    public function destroy(TournamentMatch $match): JsonResponse
    {
        $stream = $match->stream ?? abort(404, 'No stream found.');
        $this->service->delete($stream);

        return $this->noContent();
    }

    public function sync(TournamentMatch $match): JsonResponse
    {
        $stream = $match->stream ?? abort(404, 'No stream found.');
        $this->service->syncStatus($stream);

        return $this->success(['status' => $match->stream?->status ?? 'idle']);
    }

    public function setProvider(Request $request, TournamentMatch $match): JsonResponse
    {
        $request->validate([
            'provider' => ['required', 'string', 'in:youtube'],
        ]);

        if ($match->stream?->status === 'live') {
            return $this->failure('Cannot change provider while stream is live.', 'VALIDATION_ERROR');
        }

        $match->update(['stream_provider_override' => $request->input('provider')]);

        return $this->success(['provider' => $match->stream_provider_override]);
    }

    /**
     * @return array<string, mixed>
     */
    private function streamPayload(
        TournamentMatch $match,
        ?LiveStream $stream = null,
        ?StreamIngestConfig $ingest = null,
    ): array {
        $match->loadMissing('stream');

        return [
            'stream' => $stream ? new StreamAdminResource($stream) : null,
            'ingest' => $ingest ? [
                'rtmp_url' => $ingest->rtmpUrl,
                'stream_key' => $ingest->streamKey,
                'backup_rtmp_url' => $ingest->backupRtmpUrl,
            ] : null,
            'thumbnail_url' => $match->streamThumbnailUrl(),
            'has_custom_thumbnail' => (bool) $match->getRawOriginal('stream_thumbnail'),
        ];
    }
}
