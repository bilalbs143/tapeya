<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\BaseControllerTrait;
use App\Http\Controllers\Controller;
use App\Http\Requests\User\Post\StoreComposePostRequest;
use App\Http\Requests\User\Post\StoreRepostRequest;
use App\Http\Resources\User\PostResource;
use App\Models\Post;
use App\Models\User;
use App\Services\Post\PostFeedService;
use App\Services\Post\PostInteractionService;
use App\Services\Post\PostRepostService;
use App\Services\Post\PostService;
use App\Support\Media\MediaDisk;
use App\Support\Post\PostImageStorage;
use Illuminate\Contracts\Pagination\CursorPaginator;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

/**
 * Mixed Home feed + compose / repost.
 *
 * Compose contract (POST /posts):
 * - type=text  → ready post (optional background_id)
 * - type=image → ready post + stored images (multipart `images` or `images[]`)
 * - type=video → uploading shell; client continues with POST /reels/{id}/upload/*
 *               (same pipeline as POST /reels). Response includes data.upload.
 */
class FeedController extends Controller
{
    use BaseControllerTrait;

    public function __construct(
        private readonly PostFeedService $feedService,
        private readonly PostInteractionService $interactions,
        private readonly PostService $postService,
        private readonly PostRepostService $repostService,
    ) {}

    /** Home Explore — mixed public posts. */
    public function explore(Request $request): JsonResponse
    {
        $paginator = $this->feedService->explore(
            $request->query('cursor'),
            (int) $request->query('per_page', 10),
            videosOnly: false,
        );

        return $this->cursorSuccess($paginator, $request);
    }

    /** Home Following — mixed posts from followed authors (public + followers). */
    public function following(Request $request): JsonResponse
    {
        $paginator = $this->feedService->following(
            (int) $request->user()->id,
            $request->query('cursor'),
            (int) $request->query('per_page', 10),
            videosOnly: false,
        );

        return $this->cursorSuccess($paginator, $request);
    }

    /** Home Saved — mixed bookmarked posts for the authenticated viewer. */
    public function saved(Request $request): JsonResponse
    {
        $paginator = $this->feedService->saved(
            (int) $request->user()->id,
            $request->query('cursor'),
            (int) $request->query('per_page', 10),
            videosOnly: false,
        );

        return $this->cursorSuccess($paginator, $request);
    }

    public function show(Request $request, Post $post): JsonResponse
    {
        $visible = $this->feedService->findVisible((int) $post->id, $request->user()?->id);
        if (! $visible) {
            return $this->notFound('Post not found.');
        }

        $visible->loadMissing([
            User::socialSummaryWith(),
            'video',
            'media',
            'hashtags',
            User::socialSummaryWith('repostOf.user'),
            'repostOf.video',
            'repostOf.media',
        ]);
        $this->interactions->attachViewerState($visible, $request->user());

        return $this->success(new PostResource($visible));
    }

    public function store(StoreComposePostRequest $request): JsonResponse
    {
        $data = $request->validated();
        $type = $data['type'];
        $user = $request->user();

        $post = match ($type) {
            'text' => $this->postService->createText($user, $data),
            'image' => $this->postService->createImage($user, $this->storeUploadedImages($request, $data)),
            'video' => $this->postService->create($user, $data),
            default => throw ValidationException::withMessages([
                'type' => ['Unsupported post type.'],
            ]),
        };

        $post->loadMissing([User::socialSummaryWith(), 'video', 'media', 'hashtags']);
        $this->interactions->attachViewerState($post, $user);

        $payload = (new PostResource($post))->resolve();
        if ($type === 'video') {
            $payload['upload'] = [
                'type' => 'reel',
                'field' => 'original',
                'next' => [
                    'init' => 'POST /api/v1/reels/{id}/upload/init',
                    'part' => 'POST /api/v1/reels/{id}/upload/part',
                    'complete' => 'POST /api/v1/reels/{id}/upload/complete',
                ],
            ];
        }

        return $this->success($payload, 'Post created.', 'CREATED');
    }

    public function repost(StoreRepostRequest $request, Post $post): JsonResponse
    {
        $repost = $this->repostService->repost(
            $request->user(),
            $post,
            $request->validated(),
        );

        $this->interactions->attachViewerState($repost, $request->user());

        return $this->success(new PostResource($repost), 'Reposted.', 'CREATED');
    }

    /**
     * @param  array<string, mixed>  $data
     * @return array<string, mixed>
     */
    private function storeUploadedImages(Request $request, array $data): array
    {
        $files = $request->file('images', []);
        if ($files instanceof UploadedFile) {
            $files = [$files];
        }
        if (! is_array($files)) {
            $files = [];
        }

        $disk = MediaDisk::name();
        $images = [];
        foreach (array_values($files) as $file) {
            if (! $file instanceof UploadedFile || ! $file->isValid()) {
                Log::warning('Compose image skipped: invalid upload', [
                    'user_id' => $request->user()?->id,
                    'client_name' => $file instanceof UploadedFile ? $file->getClientOriginalName() : null,
                    'error' => $file instanceof UploadedFile ? $file->getErrorMessage() : 'not_uploaded_file',
                ]);

                continue;
            }

            try {
                $stored = PostImageStorage::storeFromUpload($file, (string) Str::uuid());
                $images[] = [
                    'path' => $stored['path'],
                    'disk' => $disk,
                    'mime' => $stored['mime'],
                    'width' => $stored['width'],
                    'height' => $stored['height'],
                    'size_bytes' => $stored['size_bytes'],
                ];
            } catch (\Throwable $e) {
                Log::warning('Compose image WebP encode failed; falling back to original upload', [
                    'user_id' => $request->user()?->id,
                    'message' => $e->getMessage(),
                ]);
                $path = MediaDisk::storeUploaded($file, 'posts/images/'.Str::uuid());
                $size = @getimagesize($file->getRealPath() ?: $file->getPathname());
                $images[] = [
                    'path' => $path,
                    'disk' => $disk,
                    'mime' => $file->getMimeType(),
                    'width' => is_array($size) ? (int) ($size[0] ?? 0) ?: null : null,
                    'height' => is_array($size) ? (int) ($size[1] ?? 0) ?: null : null,
                    'size_bytes' => $file->getSize() ?: null,
                ];
            }
        }

        if ($images === []) {
            throw ValidationException::withMessages([
                'images' => ['At least one valid image is required.'],
            ]);
        }

        $data['images'] = $images;

        return $data;
    }

    /**
     * @param  CursorPaginator<int, Post>  $paginator
     */
    private function cursorSuccess($paginator, Request $request): JsonResponse
    {
        $items = $this->interactions->attachViewerStateMany(
            $paginator->items(),
            $request->user(),
        );

        /** @var AnonymousResourceCollection $collection */
        $collection = PostResource::collection($items);

        return $this->success([
            'items' => $collection,
            'next_cursor' => $paginator->nextCursor()?->encode(),
            'prev_cursor' => $paginator->previousCursor()?->encode(),
            'has_more' => $paginator->hasMorePages(),
            'per_page' => $paginator->perPage(),
        ]);
    }
}
