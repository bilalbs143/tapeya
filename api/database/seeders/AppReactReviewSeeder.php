<?php

namespace Database\Seeders;

use App\Enums\Post\PostStatusEnum;
use App\Enums\Post\PostTypeEnum;
use App\Enums\User\UserTypeEnum;
use App\Models\Post;
use App\Models\PostComment;
use App\Models\PostLike;
use App\Models\PostMedia;
use App\Models\PostSave;
use App\Models\User;
use App\Models\UserFollow;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

/**
 * Social + profile review data on top of ScoringDemoSeeder.
 *
 * Prerequisites:
 *   php artisan db:seed --class=ScoringDemoSeeder
 *
 * Then:
 *   php artisan db:seed --class=AppReactReviewSeeder
 *
 * Login (APP_DEBUG=true): request OTP for a player phone; code is in the JSON response.
 * Review phone printed at the end (Babar Azam by default).
 *
 * Covers app-react surfaces: Feed, Reels, Explore follows, public profile shelves,
 * rankings/stats already come from ScoringDemo scored matches.
 */
class AppReactReviewSeeder extends Seeder
{
    private const MARKER = '[app-react-review]';

    public function run(): void
    {
        $players = User::query()
            ->where('type', UserTypeEnum::USER)
            ->whereNotNull('phone')
            ->whereNotNull('nickname')
            ->orderBy('id')
            ->limit(12)
            ->get();

        if ($players->count() < 4) {
            $this->command?->error('Need ScoringDemo players first: php artisan db:seed --class=ScoringDemoSeeder');

            return;
        }

        if (Post::query()->where('body', 'like', '%'.self::MARKER.'%')->exists()) {
            $this->command?->warn('AppReactReviewSeeder already applied (marker posts found). Skipping.');
            $this->printLoginHint($players->first());

            return;
        }

        $this->command?->info('Seeding app-react review social data…');

        DB::transaction(function () use ($players) {
            $owners = $players->take(6)->values();
            $viewer = $owners[0];
            $creators = $owners->slice(1)->values();

            // Mutual-ish follows for Explore / Following tabs.
            foreach ($creators as $creator) {
                $this->follow($viewer->id, $creator->id);
            }
            $this->follow($creators[0]->id, $viewer->id);
            $this->follow($creators[1]->id, $creators[2]->id);
            $this->follow($creators[2]->id, $creators[0]->id);

            $posts = [];

            foreach ($creators->take(4) as $i => $creator) {
                $posts[] = $this->textPost(
                    $creator,
                    'What a session at the nets. '.self::MARKER.' #'.$i,
                    'turf'
                );
            }

            $posts[] = $this->imagePost($creators[0], 'Match day vibes '.self::MARKER);
            $posts[] = $this->imagePost($creators[1], 'New kit drop '.self::MARKER);

            foreach ($creators->take(5) as $i => $creator) {
                $posts[] = $this->reel($creator, 'Tape ball six #'.($i + 1).' '.self::MARKER, 18000 + ($i * 1000));
            }

            // Engagement from viewer + a couple of peers.
            foreach ($posts as $index => $post) {
                $this->like($post, $viewer);
                if ($index % 2 === 0) {
                    $this->like($post, $creators[0]);
                    $this->save($post, $viewer);
                }
                $this->comment($post, $viewer, 'Fire clip '.self::MARKER);
                if ($index % 3 === 0) {
                    $this->comment($post, $creators[1], 'Need that shot in the match '.self::MARKER);
                }
            }

            foreach ($owners as $user) {
                $this->refreshUserCounts($user);
            }
        });

        $this->command?->info('Done. Posts: '.Post::query()->where('body', 'like', '%'.self::MARKER.'%')->count());
        $this->printLoginHint($players->first());
    }

    private function printLoginHint(?User $user): void
    {
        if (! $user) {
            return;
        }

        $this->command?->newLine();
        $this->command?->info('Review login (OTP auth, APP_DEBUG=true returns code in JSON):');
        $this->command?->line('  Phone: '.$user->phone);
        $this->command?->line('  Name:  '.$user->name.' (@'.$user->nickname.')');
        $this->command?->line('  curl -s '.$this->apiBase().'/auth/request-otp -H "Content-Type: application/json" -H "Accept: application/json" -d \'{"phone":"'.$user->phone.'"}\'');
        $this->command?->line('  App:   '.($this->appUrl()).'  API: '.$this->apiBase());
    }

    private function apiBase(): string
    {
        return rtrim((string) config('app.url'), '/').'/api/v1';
    }

    private function appUrl(): string
    {
        return 'http://localhost:5180';
    }

    private function follow(int $followerId, int $followedId): void
    {
        if ($followerId === $followedId) {
            return;
        }

        UserFollow::query()->firstOrCreate([
            'follower_id' => $followerId,
            'followed_user_id' => $followedId,
        ]);
    }

    private function textPost(User $owner, string $body, string $background = 'turf'): Post
    {
        return Post::query()->create([
            'user_id' => $owner->id,
            'type' => PostTypeEnum::Text,
            'body' => $body,
            'background_id' => $background,
            'status' => PostStatusEnum::Ready,
            'published_at' => now()->subMinutes(random_int(5, 240)),
            'likes_count' => 0,
            'comments_count' => 0,
            'views_count' => random_int(20, 400),
            'saves_count' => 0,
            'shares_count' => 0,
            'reposts_count' => 0,
        ]);
    }

    private function imagePost(User $owner, string $body): Post
    {
        $post = Post::query()->create([
            'user_id' => $owner->id,
            'type' => PostTypeEnum::Image,
            'body' => $body,
            'cover_path' => 'posts/images/covers/review-'.$owner->id.'.webp',
            'status' => PostStatusEnum::Ready,
            'published_at' => now()->subMinutes(random_int(5, 180)),
            'likes_count' => 0,
            'comments_count' => 0,
            'views_count' => random_int(40, 900),
            'saves_count' => 0,
            'shares_count' => 0,
            'reposts_count' => 0,
        ]);

        PostMedia::query()->create([
            'post_id' => $post->id,
            'kind' => 'image',
            'path' => 'posts/images/review/'.$post->id.'/shot.webp',
            'sort_order' => 0,
            'width' => 1080,
            'height' => 1350,
        ]);

        return $post;
    }

    private function reel(User $owner, string $caption, int $durationMs): Post
    {
        $post = Post::query()->create([
            'user_id' => $owner->id,
            'type' => PostTypeEnum::Video,
            'body' => $caption,
            'status' => PostStatusEnum::Ready,
            'published_at' => now()->subMinutes(random_int(1, 120)),
            'likes_count' => 0,
            'comments_count' => 0,
            'views_count' => random_int(100, 5000),
            'saves_count' => 0,
            'shares_count' => 0,
            'reposts_count' => 0,
        ]);

        $post->video()->create([
            'thumbnail_path' => 'posts/videos/thumbs/review-'.$post->id.'.webp',
            'hls_master_path' => 'posts/videos/hls/review-'.$post->id.'/master.m3u8',
            'processed_path' => null,
            'duration_ms' => $durationMs,
            'width' => 1080,
            'height' => 1920,
            'abr_complete' => true,
            'ready_at' => now(),
        ]);

        return $post->fresh(['video']) ?? $post;
    }

    private function like(Post $post, User $user): void
    {
        $created = PostLike::query()->firstOrCreate([
            'post_id' => $post->id,
            'user_id' => $user->id,
        ]);
        if ($created->wasRecentlyCreated) {
            $post->increment('likes_count');
        }
    }

    private function save(Post $post, User $user): void
    {
        $created = PostSave::query()->firstOrCreate([
            'post_id' => $post->id,
            'user_id' => $user->id,
        ]);
        if ($created->wasRecentlyCreated) {
            $post->increment('saves_count');
        }
    }

    private function comment(Post $post, User $user, string $body): void
    {
        PostComment::query()->create([
            'post_id' => $post->id,
            'user_id' => $user->id,
            'body' => $body,
            'likes_count' => 0,
            'is_pinned' => false,
        ]);
        $post->increment('comments_count');
    }

    private function refreshUserCounts(User $user): void
    {
        $user->forceFill([
            'followers_count' => UserFollow::query()->where('followed_user_id', $user->id)->count(),
            'following_count' => UserFollow::query()->where('follower_id', $user->id)->count(),
            'reels_count' => Post::query()
                ->where('user_id', $user->id)
                ->where('type', PostTypeEnum::Video)
                ->where('status', PostStatusEnum::Ready)
                ->whereNotNull('published_at')
                ->count(),
            'posts_count' => Post::query()
                ->where('user_id', $user->id)
                ->whereIn('type', [PostTypeEnum::Text, PostTypeEnum::Image])
                ->where('status', PostStatusEnum::Ready)
                ->whereNotNull('published_at')
                ->count(),
        ])->save();
    }
}
