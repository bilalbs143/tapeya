<?php

namespace App\Http\Controllers\User;

use App\Enums\Streaming\StreamOrientationEnum;
use App\Http\Controllers\BaseControllerTrait;
use App\Http\Controllers\Controller;
use App\Models\LiveStream;
use App\Streaming\LiveStreamService;
use App\Streaming\StreamProviderManager;
use App\Support\Media\MediaDisk;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

/**
 * Self-serve mobile broadcast lifecycle — create, reconnect, end, and thumbnail management
 * for a user's own live stream. Distinct from the read-only, public User\LiveStreamController
 * (hub/viewer) and the staff-only Admin\LiveStreamController: every action here is owner-gated.
 *
 * @see LiveStreamService::createSelfServe()
 */
class LiveBroadcastController extends Controller
{
    use BaseControllerTrait;

    public function __construct(
        private LiveStreamService $service,
        private StreamProviderManager $manager,
    ) {}

    public function acceptTerms(Request $request): JsonResponse
    {
        $request->user()->update(['broadcast_terms_accepted_at' => now()]);

        return $this->success([
            'broadcast_terms_accepted_at' => $request->user()->fresh()->broadcast_terms_accepted_at?->toIso8601String(),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $user = $request->user();

        abort_unless((bool) $user->can_broadcast, 403, 'You are not eligible to broadcast.');
        abort_unless($user->broadcast_terms_accepted_at !== null, 403, 'Please accept the broadcast terms first.');

        $validated = $request->validate([
            'title' => ['required', 'string', 'max:100'],
            'description' => ['nullable', 'string', 'max:500'],
            'orientation' => ['sometimes', Rule::enum(StreamOrientationEnum::class)],
        ]);

        $stream = $this->service->createSelfServe(
            (int) $user->id,
            $validated['title'],
            $validated['description'] ?? null,
            StreamOrientationEnum::normalize($validated['orientation'] ?? StreamOrientationEnum::Portrait),
        );

        $ingest = $this->manager->driver($stream->provider)->ingestConfig($stream);

        return $this->success([
            'stream_id' => $stream->id,
            'rtmp_url' => $ingest->rtmpUrl,
            'stream_key' => $ingest->streamKey,
            'orientation' => $stream->resolvedOrientation(),
        ], 'Broadcast created.', 'CREATED');
    }

    public function show(Request $request, LiveStream $stream): JsonResponse
    {
        $this->authorizeOwner($stream, $request);
        $this->authorizeStillEligible($request);

        if (! in_array($stream->status, ['idle', 'starting', 'live'], true)) {
            abort(410, 'This broadcast has ended.');
        }

        $ingest = $this->manager->driver($stream->provider)->ingestConfig($stream);

        return $this->success([
            'stream_id' => $stream->id,
            'rtmp_url' => $ingest->rtmpUrl,
            'stream_key' => $ingest->streamKey,
            'status' => $stream->status,
            'orientation' => $stream->resolvedOrientation(),
        ]);
    }

    /**
     * Owner tapped "Go live" — mark live immediately; optional provider poll for faster embed readiness.
     */
    public function start(Request $request, LiveStream $stream): JsonResponse
    {
        $this->authorizeOwner($stream, $request);
        $this->authorizeStillEligible($request);

        if (! in_array($stream->status, ['idle', 'starting', 'live'], true)) {
            abort(410, 'This broadcast has ended.');
        }

        $this->service->markPublishing($stream);

        if ($stream->provider !== 'external') {
            $this->service->syncStatus($stream->fresh());
        }

        $stream->refresh();

        return $this->success([
            'status' => $stream->status,
            'started_at' => $stream->started_at?->toIso8601String(),
        ]);
    }

    public function end(Request $request, LiveStream $stream): JsonResponse
    {
        $this->authorizeOwner($stream, $request);

        $this->service->end($stream);

        return $this->success(['status' => 'ended'], 'Broadcast Ended.');
    }

    public function uploadThumbnail(Request $request, LiveStream $stream): JsonResponse
    {
        $this->authorizeOwner($stream, $request);

        $request->validate(['file' => ['required', 'image', 'max:5120']]);

        $oldPath = $stream->getRawOriginal('stream_thumbnail');
        MediaDisk::delete($oldPath);

        $path = MediaDisk::storeUploaded($request->file('file'), 'match-stream-thumbnails');
        $stream->update(['stream_thumbnail' => $path]);

        return $this->success(['thumbnail_url' => MediaDisk::url($path)]);
    }

    public function deleteThumbnail(Request $request, LiveStream $stream): JsonResponse
    {
        $this->authorizeOwner($stream, $request);

        MediaDisk::delete($stream->getRawOriginal('stream_thumbnail'));
        $stream->update(['stream_thumbnail' => null]);

        return $this->noContent();
    }

    /**
     * Every action in this controller is owner-gated — a regular user can never touch
     * someone else's broadcast through these routes (unlike the read-only hub/viewer routes).
     */
    private function authorizeOwner(LiveStream $stream, Request $request): void
    {
        abort_unless($stream->owner_user_id === $request->user()->id, 403);
    }

    /**
     * Credential re-fetch (`show`) must keep enforcing the allowlist — otherwise an admin
     * who only clears `can_broadcast` (without `broadcast-ban`) still leaves the owner able
     * to reconnect with a fresh `stream_key`.
     */
    private function authorizeStillEligible(Request $request): void
    {
        abort_unless((bool) $request->user()->can_broadcast, 403, 'You are not eligible to broadcast.');
    }
}
