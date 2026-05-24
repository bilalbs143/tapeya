<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\BaseControllerTrait;
use App\Http\Controllers\Controller;
use App\Http\Resources\Admin\StreamAdminResource;
use App\Models\MatchStream;
use App\Models\TournamentMatch;
use App\Settings\StreamingSettings;
use App\Streaming\Data\CreateStreamData;
use App\Streaming\Data\StreamIngestConfig;
use App\Streaming\MatchStreamService;
use App\Streaming\StreamProviderManager;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class StreamController extends Controller
{
    use BaseControllerTrait;

    public function __construct(
        private MatchStreamService $service,
        private StreamProviderManager $manager,
    ) {}

    public function create(Request $request, TournamentMatch $match): JsonResponse
    {
        $request->validate([
            'title' => ['sometimes', 'string', 'max:100'],
            'privacy' => ['sometimes', 'in:public,unlisted'],
            'scheduled_at' => ['sometimes', 'date'],
        ]);

        $settings = app(StreamingSettings::class);
        $match->loadMissing(['homeTeam', 'awayTeam']);

        $data = new CreateStreamData(
            title: $request->input('title', "{$match->homeTeam?->name} vs {$match->awayTeam?->name}"),
            description: "Live cricket match streamed via Tapeya. Follow live scores at tapeya.com/match/{$match->id}",
            privacy: $request->input('privacy', $settings->youtubeDefaultPrivacy ?? 'public'),
        );

        $stream = $this->service->create($match, $data, (int) $request->user()->id);
        $match->refresh();
        $ingest = $this->manager->driver($stream->provider)->ingestConfig($stream);

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
        $this->service->end($match);

        return $this->success(['status' => 'ended'], 'Stream Ended.');
    }

    public function destroy(TournamentMatch $match): JsonResponse
    {
        $this->service->delete($match);

        return $this->noContent();
    }

    public function sync(TournamentMatch $match): JsonResponse
    {
        $this->service->syncStatus($match);

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
        ?MatchStream $stream = null,
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
