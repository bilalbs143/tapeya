<?php

namespace App\Services\Post;

use App\Enums\Post\PostBackgroundId;
use App\Enums\Post\PostStatusEnum;
use App\Enums\Post\PostTypeEnum;
use App\Enums\Post\PostVisibilityEnum;
use App\Events\Broadcast\Post\PostProcessingUpdated;
use App\Events\PostPublished;
use App\Jobs\CleanupPostMediaJob;
use App\Jobs\ExtractPostPosterJob;
use App\Jobs\ProcessPostVideoJob;
use App\Models\Post;
use App\Models\PostMedia;
use App\Models\User;
use App\Support\Media\MediaDisk;
use Illuminate\Support\Facades\DB;

class PostService
{
    /**
     * Create a video post shell awaiting original upload.
     *
     * @param  array{caption?: string|null, body?: string|null, visibility?: string|null, client_duration_ms?: int|null}  $data
     */
    public function create(User $user, array $data): Post
    {
        $visibility = PostVisibilityEnum::tryFrom($data['visibility'] ?? '')
            ?? PostVisibilityEnum::Public;

        $body = $data['body'] ?? $data['caption'] ?? null;

        $post = DB::transaction(function () use ($user, $body, $visibility, $data) {
            $post = Post::query()->create([
                'user_id' => $user->id,
                'type' => PostTypeEnum::Video,
                'body' => isset($body) ? trim((string) $body) : null,
                'status' => PostStatusEnum::Uploading,
                'visibility' => $visibility,
            ]);

            $post->video()->create([
                'duration_ms' => $data['client_duration_ms'] ?? null,
            ]);

            return $post;
        });

        app(PostHashtagParser::class)->syncForPost($post);

        return $post->load('video');
    }

    /**
     * Immediate-publish text post.
     *
     * @param  array{body: string, title?: string|null, visibility?: string|null, background_id?: string|null}  $data
     */
    public function createText(User $user, array $data): Post
    {
        $body = trim((string) ($data['body'] ?? ''));
        if ($body === '') {
            throw new \InvalidArgumentException('Text posts require a body.');
        }

        $visibility = PostVisibilityEnum::tryFrom($data['visibility'] ?? '')
            ?? PostVisibilityEnum::Public;

        $backgroundId = PostBackgroundId::normalize($data['background_id'] ?? null);

        $post = DB::transaction(function () use ($user, $body, $visibility, $backgroundId, $data) {
            $post = Post::query()->create([
                'user_id' => $user->id,
                'type' => PostTypeEnum::Text,
                'title' => isset($data['title']) ? trim((string) $data['title']) : null,
                'body' => $body,
                'background_id' => $backgroundId,
                'status' => PostStatusEnum::Ready,
                'visibility' => $visibility,
                'published_at' => now(),
            ]);

            $this->bumpPostsCount((int) $user->id, 1);

            return $post;
        });

        app(PostHashtagParser::class)->syncForPost($post);
        event(new PostPublished($post));

        return $post->fresh(['user', 'hashtags']) ?? $post;
    }

    /**
     * Immediate-publish image post (paths already stored or passed).
     *
     * @param  array{body?: string|null, title?: string|null, visibility?: string|null, images: list<array{path: string, disk?: string|null, mime?: string|null, width?: int|null, height?: int|null, size_bytes?: int|null}>}  $data
     */
    public function createImage(User $user, array $data): Post
    {
        $images = $data['images'] ?? [];
        if ($images === []) {
            throw new \InvalidArgumentException('Image posts require at least one image.');
        }

        $visibility = PostVisibilityEnum::tryFrom($data['visibility'] ?? '')
            ?? PostVisibilityEnum::Public;
        $body = isset($data['body']) ? trim((string) $data['body']) : null;
        if ($body === '') {
            $body = null;
        }

        $post = DB::transaction(function () use ($user, $body, $visibility, $data, $images) {
            $cover = MediaDisk::requirePath($images[0]['path'] ?? null);
            $post = Post::query()->create([
                'user_id' => $user->id,
                'type' => PostTypeEnum::Image,
                'title' => isset($data['title']) ? trim((string) $data['title']) : null,
                'body' => $body,
                'status' => PostStatusEnum::Ready,
                'visibility' => $visibility,
                'cover_path' => $cover,
                'published_at' => now(),
            ]);

            foreach (array_values($images) as $i => $image) {
                $path = MediaDisk::requirePath($image['path'] ?? null);
                PostMedia::query()->create([
                    'post_id' => $post->id,
                    'kind' => 'image',
                    'path' => $path,
                    'disk' => $image['disk'] ?? MediaDisk::name(),
                    'mime' => $image['mime'] ?? null,
                    'width' => $image['width'] ?? null,
                    'height' => $image['height'] ?? null,
                    'size_bytes' => $image['size_bytes'] ?? null,
                    'sort_order' => $i,
                ]);
            }

            $this->bumpPostsCount((int) $user->id, 1);

            return $post;
        });

        app(PostHashtagParser::class)->syncForPost($post);
        event(new PostPublished($post->load('media')));

        return $post->fresh(['user', 'media', 'hashtags']) ?? $post;
    }

    private function bumpPostsCount(int $userId, int $delta): void
    {
        if ($delta === 0) {
            return;
        }

        if ($delta > 0) {
            User::query()->whereKey($userId)->update([
                'posts_count' => DB::raw('COALESCE(posts_count, 0) + '.abs($delta)),
            ]);

            return;
        }

        User::query()
            ->whereKey($userId)
            ->where('posts_count', '>', 0)
            ->update([
                'posts_count' => DB::raw('COALESCE(posts_count, 0) - '.abs($delta)),
            ]);
    }

    /**
     * Sync caption @mentions and notify users newly mentioned on a Ready post.
     */
    private function syncCaptionMentions(Post $post): void
    {
        $status = $post->status instanceof PostStatusEnum
            ? $post->status
            : PostStatusEnum::tryFrom((string) $post->status);
        if ($status !== PostStatusEnum::Ready) {
            return;
        }

        $newIds = app(PostMentionSync::class)->syncForPost($post);
        if ($newIds === []) {
            return;
        }

        $post->loadMissing('user');
        $actor = $post->user;
        if (! $actor) {
            return;
        }

        app(PostCaptionMentionNotifier::class)->notifyNewMentions($post, $actor, $newIds);
    }

    /**
     * @param  array{caption?: string|null, body?: string|null, visibility?: string|null}  $data
     */
    public function updateCaptionAndVisibility(Post $post, array $data): Post
    {
        if (array_key_exists('body', $data) || array_key_exists('caption', $data)) {
            $post->body = $data['body'] ?? $data['caption'];
        }

        if (array_key_exists('visibility', $data)) {
            $this->applyVisibility($post, PostVisibilityEnum::from($data['visibility']));
        } else {
            $post->save();
        }

        if (array_key_exists('body', $data) || array_key_exists('caption', $data)) {
            app(PostHashtagParser::class)->syncForPost($post);
            $this->syncCaptionMentions($post);
        }

        return $post->fresh(['video']) ?? $post;
    }

    /**
     * Admin moderation update — status/body/visibility with the same repost cap + cascade as user updates.
     *
     * @param  array{status?: string|null, body?: string|null, caption?: string|null, visibility?: string|null}  $data
     */
    public function adminUpdate(Post $post, array $data): Post
    {
        $bodyTouched = array_key_exists('body', $data) || array_key_exists('caption', $data);
        if ($bodyTouched) {
            $post->body = $data['body'] ?? $data['caption'];
        }

        if (array_key_exists('status', $data) && $data['status'] !== null && $data['status'] !== '') {
            $post->status = PostStatusEnum::from($data['status']);
        }

        if (array_key_exists('visibility', $data) && $data['visibility'] !== null && $data['visibility'] !== '') {
            $this->applyVisibility($post, PostVisibilityEnum::from($data['visibility']));
        } else {
            $post->save();
        }

        if ($bodyTouched) {
            app(PostHashtagParser::class)->syncForPost($post);
            $this->syncCaptionMentions($post);
        }

        return $post->fresh(['video', 'media', 'user']) ?? $post;
    }

    /**
     * Cap repost visibility ≤ original; cascade-tighten child reposts when an original is closed down.
     */
    public function applyVisibility(Post $post, PostVisibilityEnum $requested): Post
    {
        $previousVisibility = $post->visibility instanceof PostVisibilityEnum
            ? $post->visibility
            : PostVisibilityEnum::tryFrom((string) $post->visibility);

        if ($post->type === PostTypeEnum::Repost) {
            $post->loadMissing('repostOf');
            $original = $post->repostOf;
            $max = $original?->visibility instanceof PostVisibilityEnum
                ? $original->visibility
                : PostVisibilityEnum::tryFrom((string) ($original?->visibility ?? '')) ?? PostVisibilityEnum::Private;
            $post->visibility = $requested->capTo($max);
        } else {
            $post->visibility = $requested;
        }

        $post->save();

        if (
            $post->type !== PostTypeEnum::Repost
            && $previousVisibility !== null
            && $post->visibility->opennessRank() < $previousVisibility->opennessRank()
        ) {
            $this->cascadeCapChildReposts($post);
        }

        return $post;
    }

    /**
     * When an original is tightened, child reposts must not stay more open.
     */
    public function cascadeCapChildReposts(Post $original): void
    {
        $max = $original->visibility instanceof PostVisibilityEnum
            ? $original->visibility
            : PostVisibilityEnum::Public;

        Post::query()
            ->where('repost_of_post_id', $original->id)
            ->where('type', PostTypeEnum::Repost)
            ->each(function (Post $repost) use ($max) {
                $current = $repost->visibility instanceof PostVisibilityEnum
                    ? $repost->visibility
                    : PostVisibilityEnum::tryFrom((string) $repost->visibility) ?? PostVisibilityEnum::Public;
                $capped = $current->capTo($max);
                if ($capped !== $current) {
                    $repost->forceFill(['visibility' => $capped])->save();
                }
            });
    }

    /**
     * Called after the original video file is stored on media_disk.
     */
    public function markOriginalUploaded(Post $post): Post
    {
        $firstPublish = false;

        $published = DB::transaction(function () use ($post, &$firstPublish) {
            $post->refresh();
            $post->loadMissing('video');

            if ($post->status === PostStatusEnum::Ready) {
                return $post;
            }

            $firstPublish = $post->published_at === null;

            $post->forceFill([
                'status' => PostStatusEnum::Processing,
                'published_at' => $post->published_at ?? now(),
            ])->save();

            $post->fillVideo([
                'processing_error' => null,
                'file_size_bytes' => $this->resolveOriginalSize($post),
            ]);

            if ($firstPublish) {
                $this->bumpVideoPostCount((int) $post->user_id, 1);
            }

            ExtractPostPosterJob::dispatch($post->id, true);
            ProcessPostVideoJob::dispatch($post->id);
            event(new PostProcessingUpdated($post->fresh(['video']) ?? $post));

            return $post->fresh(['video']) ?? $post;
        });

        if ($firstPublish && $published) {
            event(new PostPublished($published));
        }

        return $published;
    }

    public function markFailed(Post $post, string $message): void
    {
        $wasCounted = $post->published_at !== null
            && in_array($post->status, [PostStatusEnum::Processing, PostStatusEnum::Ready], true);

        $post->forceFill([
            'status' => PostStatusEnum::Failed,
        ])->save();

        $post->fillVideo([
            'processing_error' => $message,
        ]);

        if ($wasCounted) {
            $this->bumpVideoPostCount((int) $post->user_id, -1);
        }

        event(new PostProcessingUpdated($post->load('video')));
    }

    public function remove(Post $post): void
    {
        $wasCounted = $post->published_at !== null
            && in_array($post->status, [PostStatusEnum::Processing, PostStatusEnum::Ready], true);
        $userId = (int) $post->user_id;
        $snapshot = app(PostMediaCleanupService::class)->snapshot($post);

        DB::transaction(function () use ($post) {
            $post->hashtags()->detach();
            $post->delete();
        });

        if ($wasCounted) {
            $this->bumpVideoPostCount($userId, -1);
        }

        CleanupPostMediaJob::dispatch($snapshot);
    }

    public function markReadyCounters(Post $post): void
    {
        event(new PostProcessingUpdated($post));
    }

    public function reprocess(Post $post): Post
    {
        if (! $post->videoRaw('original_path')) {
            throw new \InvalidArgumentException('Post has no original media to reprocess.');
        }

        $wasFailed = $post->status === PostStatusEnum::Failed;

        $post->forceFill([
            'status' => PostStatusEnum::Processing,
        ])->save();

        $post->fillVideo([
            'processing_error' => null,
        ]);

        if ($wasFailed && $post->published_at !== null) {
            $this->bumpVideoPostCount((int) $post->user_id, 1);
        }

        ExtractPostPosterJob::dispatch($post->id, true);
        ProcessPostVideoJob::dispatch($post->id);
        event(new PostProcessingUpdated($post->load('video')));

        return $post->fresh(['video']) ?? $post;
    }

    /**
     * Safe ±1 on users.reels_count + posts_count (COALESCE so NULL never sticks).
     */
    private function bumpVideoPostCount(int $userId, int $delta): void
    {
        if ($delta === 0) {
            return;
        }

        if ($delta > 0) {
            User::query()->whereKey($userId)->update([
                'reels_count' => DB::raw('COALESCE(reels_count, 0) + '.abs($delta)),
                'posts_count' => DB::raw('COALESCE(posts_count, 0) + '.abs($delta)),
            ]);

            return;
        }

        User::query()
            ->whereKey($userId)
            ->where('reels_count', '>', 0)
            ->update([
                'reels_count' => DB::raw('COALESCE(reels_count, 0) - '.abs($delta)),
            ]);

        User::query()
            ->whereKey($userId)
            ->where('posts_count', '>', 0)
            ->update([
                'posts_count' => DB::raw('COALESCE(posts_count, 0) - '.abs($delta)),
            ]);
    }

    private function resolveOriginalSize(Post $post): ?int
    {
        $path = $post->videoRaw('original_path');
        if (! $path) {
            return null;
        }

        try {
            $size = MediaDisk::disk()->size($path);

            return is_numeric($size) ? (int) $size : null;
        } catch (\Throwable) {
            return null;
        }
    }
}
