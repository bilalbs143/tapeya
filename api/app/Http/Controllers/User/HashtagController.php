<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\BaseControllerTrait;
use App\Http\Controllers\Controller;
use App\Http\Resources\User\PostResource;
use App\Models\Hashtag;
use App\Services\Post\PostFeedService;
use App\Services\Post\PostInteractionService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class HashtagController extends Controller
{
    use BaseControllerTrait;

    public function __construct(
        private readonly PostFeedService $feedService,
        private readonly PostInteractionService $interactions,
    ) {}

    /**
     * Autocomplete / search hashtags.
     */
    public function search(Request $request): JsonResponse
    {
        $q = ltrim(mb_strtolower(trim((string) $request->query('q', ''))), '#');
        if ($q === '') {
            return $this->failure('Query is required.', 'VALIDATION_ERROR');
        }

        $tags = Hashtag::query()
            ->where('name', 'ilike', $q.'%')
            ->orderByDesc('posts_count')
            ->orderBy('name')
            ->limit(20)
            ->get(['id', 'name', 'posts_count']);

        return $this->success(
            $tags->map(fn (Hashtag $t) => [
                'id' => $t->id,
                'name' => $t->name,
                'posts_count' => (int) $t->posts_count,
            ])->values()->all()
        );
    }

    /**
     * Video posts for a hashtag name.
     */
    public function reels(Request $request, string $name): JsonResponse
    {
        $paginator = $this->feedService->forHashtag(
            $name,
            $request->query('cursor'),
            (int) $request->query('per_page', 10),
        );

        $items = $this->interactions->attachViewerStateMany(
            $paginator->items(),
            $request->user(),
        );

        return $this->success([
            'items' => PostResource::collection($items),
            'next_cursor' => $paginator->nextCursor()?->encode(),
            'prev_cursor' => $paginator->previousCursor()?->encode(),
            'has_more' => $paginator->hasMorePages(),
            'per_page' => $paginator->perPage(),
            'hashtag' => ltrim(mb_strtolower(trim($name)), '#'),
        ]);
    }
}
