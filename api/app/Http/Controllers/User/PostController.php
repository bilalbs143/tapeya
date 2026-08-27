<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\BaseControllerTrait;
use App\Http\Controllers\Controller;
use App\Http\Requests\User\Post\StorePostRequest;
use App\Http\Requests\User\Post\UpdatePostRequest;
use App\Http\Resources\User\PostResource;
use App\Models\Post;
use App\Models\User;
use App\Services\Post\PostFeedService;
use App\Services\Post\PostInteractionService;
use App\Services\Post\PostService;
use Illuminate\Contracts\Pagination\CursorPaginator;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class PostController extends Controller
{
    use BaseControllerTrait;

    public function __construct(
        private readonly PostService $postService,
        private readonly PostFeedService $feedService,
        private readonly PostInteractionService $interactions,
    ) {}

    /**
     * Explore feed — public ready reels (cursor pagination).
     */
    public function feed(Request $request): JsonResponse
    {
        $paginator = $this->feedService->explore(
            $request->query('cursor'),
            (int) $request->query('per_page', 10),
            videosOnly: true,
        );

        return $this->cursorSuccess($paginator, $request);
    }

    /**
     * Following feed — creators the user follows.
     */
    public function following(Request $request): JsonResponse
    {
        $paginator = $this->feedService->following(
            (int) $request->user()->id,
            $request->query('cursor'),
            (int) $request->query('per_page', 10),
            videosOnly: true,
        );

        return $this->cursorSuccess($paginator, $request);
    }

    /**
     * Trending reels (engagement-weighted, recent window).
     */
    public function trending(Request $request): JsonResponse
    {
        $paginator = $this->feedService->trending(
            $request->query('cursor'),
            (int) $request->query('per_page', 10),
        );

        return $this->cursorSuccess($paginator, $request);
    }

    /**
     * Search reels by caption / hashtag.
     */
    public function search(Request $request): JsonResponse
    {
        $q = trim((string) $request->query('q', ''));
        if ($q === '') {
            return $this->failure('Query is required.', 'VALIDATION_ERROR');
        }

        $paginator = $this->feedService->search(
            $q,
            $request->query('cursor'),
            (int) $request->query('per_page', 10),
        );

        return $this->cursorSuccess($paginator, $request);
    }

    /**
     * Authenticated user's reels (My Videos).
     */
    public function mine(Request $request): JsonResponse
    {
        $paginator = $this->feedService->mine(
            (int) $request->user()->id,
            $request->query('cursor'),
            (int) $request->query('per_page', 10),
            videosOnly: true,
        );

        return $this->cursorSuccess($paginator, $request);
    }

    /**
     * Saved (bookmarked) reels for the authenticated user.
     */
    public function saved(Request $request): JsonResponse
    {
        $paginator = $this->feedService->saved(
            (int) $request->user()->id,
            $request->query('cursor'),
            (int) $request->query('per_page', 10),
        );

        return $this->cursorSuccess($paginator, $request);
    }

    /**
     * Liked reels for the authenticated user.
     */
    public function liked(Request $request): JsonResponse
    {
        $paginator = $this->feedService->liked(
            (int) $request->user()->id,
            $request->query('cursor'),
            (int) $request->query('per_page', 10),
        );

        return $this->cursorSuccess($paginator, $request);
    }

    /**
     * Public reels for a user profile.
     */
    public function forUser(Request $request, User $user): JsonResponse
    {
        $paginator = $this->feedService->forUser(
            (int) $user->id,
            $request->user()?->id,
            $request->query('cursor'),
            (int) $request->query('per_page', 10),
        );

        return $this->cursorSuccess($paginator, $request);
    }

    /**
     * Public non-video posts for a user profile.
     */
    public function forUserPosts(Request $request, User $user): JsonResponse
    {
        $paginator = $this->feedService->forUserPosts(
            (int) $user->id,
            $request->user()?->id,
            $request->query('cursor'),
            (int) $request->query('per_page', 10),
        );

        return $this->cursorSuccess($paginator, $request);
    }

    public function show(Request $request, Post $post): JsonResponse
    {
        $visible = $this->feedService->findVisible(
            (int) $post->id,
            $request->user()?->id,
        );

        if (! $visible) {
            return $this->notFound('Post not found.');
        }

        $visible->loadMissing([User::socialSummaryWith()]);
        $this->interactions->attachViewerState($visible, $request->user());

        return $this->success(new PostResource($visible));
    }

    public function store(StorePostRequest $request): JsonResponse
    {
        $post = $this->postService->create(
            $request->user(),
            $request->validated(),
        );

        $post->load([User::socialSummaryWith(), 'hashtags:id,name']);
        $this->interactions->attachViewerState($post, $request->user());

        return $this->success([
            ...(new PostResource($post))->resolve(),
            'upload' => [
                'type' => 'reel',
                'field' => 'original',
            ],
        ], 'Post created.', 'CREATED');
    }

    public function update(UpdatePostRequest $request, Post $post): JsonResponse
    {
        $post = $this->postService->updateCaptionAndVisibility($post, $request->validated());
        $post->load([User::socialSummaryWith(), 'hashtags:id,name']);
        $this->interactions->attachViewerState($post, $request->user());

        return $this->success(new PostResource($post), 'Post updated.');
    }

    public function destroy(Request $request, Post $post): JsonResponse
    {
        if ($post->user_id !== $request->user()->id) {
            return $this->forbidden('You cannot delete this reel.');
        }

        $this->postService->remove($post);

        return $this->success(null, 'Post deleted.');
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
