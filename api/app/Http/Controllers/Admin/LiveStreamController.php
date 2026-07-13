<?php

namespace App\Http\Controllers\Admin;

use App\Http\Requests\Admin\LiveStream\StoreLiveStreamRequest;
use App\Http\Requests\Admin\LiveStream\UpdateLiveStreamRequest;
use App\Http\Resources\Admin\LiveStreamListResource;
use App\Http\Resources\Admin\StreamAdminResource;
use App\Models\MatchStream;
use App\Settings\StreamingSettings;
use App\Streaming\Data\CreateStreamData;
use App\Streaming\LiveStreamService;
use App\Streaming\StreamProviderManager;
use App\Support\Broadcast\LiveStreamPresenceOccupancy;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Spatie\QueryBuilder\QueryBuilder;

class LiveStreamController extends BaseAdminController
{
    public function __construct(
        private LiveStreamService $service,
        private StreamProviderManager $manager,
    ) {
        parent::__construct(MatchStream::class, LiveStreamListResource::class, 'live_stream');
    }

    protected function baseQuery()
    {
        // Unified admin list — both standalone and match-linked streams.
        return MatchStream::query();
    }

    public function index()
    {
        $query = QueryBuilder::for($this->baseQuery())
            ->allowedFilters($this->model->getFilters())
            ->defaultSort('-id')
            ->allowedSorts($this->model->getSorts());

        $page = $this->paginateOrAll($query);
        $rows = method_exists($page, 'getCollection') ? $page->getCollection() : $page;

        $eligibleIds = $rows
            ->filter(fn (MatchStream $stream) => in_array($stream->status, ['live', 'starting'], true))
            ->pluck('id');

        $counts = app(LiveStreamPresenceOccupancy::class)->countsFor($eligibleIds);

        $rows->each(function (MatchStream $stream) use ($counts): void {
            $stream->setAttribute('watching_count', $counts[$stream->id] ?? 0);
        });

        return LiveStreamListResource::collection($page);
    }

    public function store(StoreLiveStreamRequest $request): JsonResponse
    {
        $validated = $request->validated();
        $provider = $validated['provider'] ?? 'external';
        $createdBy = (int) $request->user()->id;

        $stream = $provider === 'youtube'
            ? $this->service->createStandaloneYoutube($validated, $createdBy)
            : $this->service->createStandalone($validated, $createdBy);

        return $this->success($this->payload($stream), 'Live stream created.', 'CREATED');
    }

    public function show(MatchStream $stream): JsonResponse
    {
        return $this->success($this->payload($stream));
    }

    public function update(UpdateLiveStreamRequest $request, MatchStream $stream): JsonResponse
    {
        $stream->update($request->validated());

        return $this->success(new StreamAdminResource($stream->fresh()), 'Live stream updated.');
    }

    public function destroy(MatchStream $stream): JsonResponse
    {
        $this->service->delete($stream);

        return $this->noContent();
    }

    public function start(MatchStream $stream): JsonResponse
    {
        if ($stream->provider !== 'external') {
            abort(422, 'Only external streams can be started manually.');
        }

        $this->service->markLive($stream);

        return $this->success(['status' => $stream->fresh()->status]);
    }

    public function end(MatchStream $stream): JsonResponse
    {
        $this->service->end($stream);

        return $this->success(['status' => 'ended'], 'Stream Ended.');
    }

    public function sync(MatchStream $stream): JsonResponse
    {
        if ($stream->provider === 'external') {
            return $this->success(['status' => $stream->status]);
        }

        $this->service->syncStatus($stream);

        return $this->success(['status' => $stream->fresh()->status]);
    }

    public function setup(Request $request, MatchStream $stream): JsonResponse
    {
        if ($stream->match_id !== null) {
            abort(422, 'Use match stream endpoints for match-linked streams.');
        }

        $request->validate([
            'title' => ['sometimes', 'string', 'max:100'],
            'description' => ['nullable', 'string', 'max:500'],
            'privacy' => ['sometimes', 'in:public,unlisted'],
            'streaming_url' => ['sometimes', 'nullable', 'url', 'starts_with:https', 'max:2048'],
        ]);

        $settings = app(StreamingSettings::class);

        $data = new CreateStreamData(
            title: $request->input('title', $stream->title ?? 'Live Stream'),
            description: $request->input('description', $stream->description ?? ''),
            privacy: $request->input('privacy', $settings->youtubeDefaultPrivacy ?? 'public'),
            streamingUrl: $request->input('streaming_url', $stream->streaming_url),
        );

        $stream = $this->service->provisionProviderStream($stream, $data);

        return $this->success($this->payload($stream), 'Stream setup updated.');
    }

    /**
     * @return array<string, mixed>
     */
    private function payload(MatchStream $stream): array
    {
        $stream->loadMissing('owner:id,name,nickname,email,phone');

        $ingest = $stream->provider !== 'external'
            ? $this->manager->driver($stream->provider)->ingestConfig($stream)
            : null;

        $watchingCount = 0;
        if (in_array($stream->status, ['live', 'starting'], true)) {
            $counts = app(LiveStreamPresenceOccupancy::class)->countsFor(collect([$stream->id]));
            $watchingCount = $counts[$stream->id] ?? 0;
        }

        return [
            'stream' => new StreamAdminResource($stream),
            'ingest' => $ingest ? [
                'rtmp_url' => $ingest->rtmpUrl,
                'stream_key' => $ingest->streamKey,
                'backup_rtmp_url' => $ingest->backupRtmpUrl,
            ] : null,
            'thumbnail_url' => $stream->thumbnailUrl(),
            'has_custom_thumbnail' => (bool) $stream->getRawOriginal('stream_thumbnail'),
            'watching_count' => $watchingCount,
            'playback' => $stream->playbackForMonitor(),
            'owner' => $stream->owner ? [
                'id' => $stream->owner->id,
                'name' => $stream->owner->name,
                'nickname' => $stream->owner->nickname,
                'email' => $stream->owner->email,
                'phone' => $stream->owner->phone,
            ] : null,
        ];
    }
}
