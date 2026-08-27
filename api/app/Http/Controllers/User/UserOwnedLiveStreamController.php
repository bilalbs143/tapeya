<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\BaseControllerTrait;
use App\Http\Controllers\Controller;
use App\Http\Resources\User\LiveStreamResource;
use App\Models\LiveStream;
use App\Streaming\LiveStreamService;
use App\Support\Media\MediaDisk;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * App users create/manage standalone watch-URL streams (YouTube / HLS),
 * mirroring admin external live streams — no RTMP / can_broadcast gate.
 *
 * @see Admin\LiveStreamController
 * @see LiveStreamService::createStandalone()
 */
class UserOwnedLiveStreamController extends Controller
{
    use BaseControllerTrait;

    public function __construct(
        private LiveStreamService $service,
    ) {}

    public function index(Request $request): JsonResponse
    {
        $streams = LiveStream::query()
            ->where('owner_user_id', $request->user()->id)
            ->where('provider', 'external')
            ->whereNull('match_id')
            ->orderByDesc('id')
            ->get();

        return $this->success(LiveStreamResource::collection($streams));
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:100'],
            'description' => ['nullable', 'string', 'max:500'],
            'streaming_url' => ['required', 'url', 'starts_with:https', 'max:2048'],
        ]);

        $userId = (int) $request->user()->id;

        $stream = $this->service->createStandalone([
            ...$validated,
            'owner_user_id' => $userId,
        ], $userId);

        return $this->success(
            new LiveStreamResource($stream->fresh()),
            'Live stream created.',
            'CREATED',
        );
    }

    public function show(Request $request, LiveStream $stream): JsonResponse
    {
        $this->authorizeOwnedExternal($stream, $request);

        return $this->success(new LiveStreamResource($stream));
    }

    public function update(Request $request, LiveStream $stream): JsonResponse
    {
        $this->authorizeOwnedExternal($stream, $request);

        $validated = $request->validate([
            'title' => ['sometimes', 'string', 'max:100'],
            'description' => ['sometimes', 'nullable', 'string', 'max:500'],
            'streaming_url' => ['sometimes', 'url', 'starts_with:https', 'max:2048'],
        ]);

        $stream->update($validated);

        return $this->success(new LiveStreamResource($stream->fresh()), 'Live stream updated.');
    }

    public function start(Request $request, LiveStream $stream): JsonResponse
    {
        $this->authorizeOwnedExternal($stream, $request);

        if (! in_array($stream->status, ['idle', 'starting', 'live'], true)) {
            abort(410, 'This stream has ended.');
        }

        $this->service->markLive($stream);

        $stream->refresh();

        return $this->success([
            'status' => $stream->status,
            'started_at' => $stream->started_at?->toIso8601String(),
        ]);
    }

    public function end(Request $request, LiveStream $stream): JsonResponse
    {
        $this->authorizeOwnedExternal($stream, $request);

        $this->service->end($stream);

        return $this->success(['status' => 'ended'], 'Stream ended.');
    }

    public function uploadThumbnail(Request $request, LiveStream $stream): JsonResponse
    {
        $this->authorizeOwnedExternal($stream, $request);

        $request->validate(['file' => ['required', 'image', 'max:5120']]);

        $oldPath = $stream->getRawOriginal('stream_thumbnail');
        MediaDisk::delete($oldPath);

        $path = MediaDisk::storeUploaded($request->file('file'), 'match-stream-thumbnails');
        $stream->update(['stream_thumbnail' => $path]);

        return $this->success(['thumbnail_url' => MediaDisk::url($path)]);
    }

    public function deleteThumbnail(Request $request, LiveStream $stream): JsonResponse
    {
        $this->authorizeOwnedExternal($stream, $request);

        MediaDisk::delete($stream->getRawOriginal('stream_thumbnail'));
        $stream->update(['stream_thumbnail' => null]);

        return $this->noContent();
    }

    private function authorizeOwnedExternal(LiveStream $stream, Request $request): void
    {
        abort_unless(
            $stream->owner_user_id === $request->user()->id
            && $stream->provider === 'external'
            && $stream->match_id === null,
            403,
        );
    }
}
