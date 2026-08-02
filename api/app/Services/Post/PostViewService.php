<?php

namespace App\Services\Post;

use App\Models\Post;
use App\Models\PostView;
use App\Models\User;
use App\Settings\PostsSettings;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class PostViewService
{
    public function __construct(private readonly PostsSettings $settings) {}

    /**
     * Record a view attempt. Counts at most once per (reel, viewer_key) when thresholds met.
     *
     * @param  array{watched_ms: int, completion_rate?: float|null}  $payload
     * @return array{counted: bool, views_count: int, already_counted: bool}
     */
    public function record(Post $post, ?User $user, array $payload, Request $request): array
    {
        if ($post->status->isUnavailable() || $post->published_at === null) {
            throw ValidationException::withMessages([
                'reel' => ['Post not found.'],
            ]);
        }

        if (! $user && ! $this->settings->viewAllowsAnonymous()) {
            throw ValidationException::withMessages([
                'auth' => ['Authentication required to record a view.'],
            ]);
        }

        $watchedMs = max(0, (int) ($payload['watched_ms'] ?? 0));
        $completionRate = isset($payload['completion_rate'])
            ? max(0, min(1, (float) $payload['completion_rate']))
            : null;

        if ($post->duration_ms) {
            $maxAllowed = (int) $post->duration_ms + 2000;
            if ($watchedMs > $maxAllowed) {
                $watchedMs = $maxAllowed;
            }
        }

        $viewerKey = $this->viewerKey($user, $request);
        $minWatched = $this->settings->viewMinWatchedMs;
        $minCompletion = $this->settings->viewMinCompletionRate();

        $meetsThreshold = $watchedMs >= $minWatched
            || ($completionRate !== null && $completionRate >= $minCompletion);

        $ipHash = $request->ip()
            ? hash_hmac('sha256', 'ip:'.$request->ip(), (string) config('app.key'))
            : null;
        $ua = (string) $request->userAgent();
        $uaHash = $ua !== ''
            ? hash_hmac('sha256', 'ua:'.$ua, (string) config('app.key'))
            : null;

        $countedNow = false;
        $alreadyCounted = false;

        DB::transaction(function () use (
            $post,
            $user,
            $viewerKey,
            $watchedMs,
            $completionRate,
            $meetsThreshold,
            $ipHash,
            $uaHash,
            &$countedNow,
            &$alreadyCounted
        ) {
            /** @var PostView $view */
            $view = PostView::query()->firstOrNew([
                'post_id' => $post->id,
                'viewer_key' => $viewerKey,
            ]);

            $alreadyCounted = (bool) $view->counted;

            $view->user_id = $user?->id ?? $view->user_id;
            $view->watched_ms = max((int) $view->watched_ms, $watchedMs);
            if ($completionRate !== null) {
                $view->completion_rate = max((float) ($view->completion_rate ?? 0), $completionRate);
            }
            $view->ip_hash = $ipHash;
            $view->user_agent_hash = $uaHash;

            if (! $view->counted && $meetsThreshold) {
                $view->counted = true;
                $countedNow = true;
            }

            $view->save();

            if ($countedNow) {
                app(PostViewCounterBuffer::class)->bump((int) $post->id);
            }
        });

        $post->refresh();
        $pending = app(PostViewCounterBuffer::class)->pendingFor((int) $post->id);

        return [
            'counted' => $countedNow || $alreadyCounted,
            'already_counted' => $alreadyCounted && ! $countedNow,
            'views_count' => (int) $post->views_count + $pending,
        ];
    }

    private function viewerKey(?User $user, Request $request): string
    {
        if ($user) {
            return hash_hmac('sha256', 'u:'.$user->id, (string) config('app.key'));
        }

        $device = (string) $request->header('X-Device-Id', '');
        if ($device !== '') {
            return hash_hmac('sha256', 'd:'.$device, (string) config('app.key'));
        }

        // Last resort for anonymous (if enabled) — still hashed.
        return hash_hmac(
            'sha256',
            'anon:'.$request->ip().'|'.$request->userAgent(),
            (string) config('app.key')
        );
    }
}
