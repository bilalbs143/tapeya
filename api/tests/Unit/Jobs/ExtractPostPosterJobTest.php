<?php

namespace Tests\Unit\Jobs;

use App\Enums\Post\PostStatusEnum;
use App\Enums\Post\PostVisibilityEnum;
use App\Jobs\ExtractPostPosterJob;
use App\Models\Post;
use App\Models\User;
use App\Services\Post\PostPosterService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Mockery;
use Tests\Concerns\CreatesVideoPosts;
use Tests\TestCase;

class ExtractPostPosterJobTest extends TestCase
{
    use CreatesVideoPosts;
    use RefreshDatabase;

    public function test_job_targets_poster_queue(): void
    {
        $job = new ExtractPostPosterJob(42);

        $this->assertSame(config('posts.queues.poster'), $job->queue);
        $this->assertSame(42, $job->postId);
    }

    public function test_skips_when_thumbnail_already_set_without_force(): void
    {
        $user = User::factory()->create();
        $post = $this->makeVideoPost($user, [
            'body' => 'Has poster',
            'status' => PostStatusEnum::Processing,
            'visibility' => PostVisibilityEnum::Public,
            'original_path' => 'posts/videos/original/1/a.mp4',
            'thumbnail_path' => 'posts/videos/thumbs/1/poster.webp',
        ]);

        $posters = Mockery::mock(PostPosterService::class);
        $posters->shouldNotReceive('extractAndStore');

        (new ExtractPostPosterJob($post->id))->handle($posters);
    }

    public function test_calls_poster_service_when_thumbnail_missing(): void
    {
        $user = User::factory()->create();
        $post = $this->makeVideoPost($user, [
            'body' => 'Needs poster',
            'status' => PostStatusEnum::Processing,
            'visibility' => PostVisibilityEnum::Public,
            'original_path' => 'posts/videos/original/1/a.mp4',
            'thumbnail_path' => null,
        ]);

        $posters = Mockery::mock(PostPosterService::class);
        $posters->shouldReceive('extractAndStore')
            ->once()
            ->with(Mockery::on(fn (Post $r) => $r->id === $post->id), false)
            ->andReturn($post);

        (new ExtractPostPosterJob($post->id))->handle($posters);
    }

    public function test_force_refine_calls_poster_service_when_thumbnail_exists(): void
    {
        $user = User::factory()->create();
        $post = $this->makeVideoPost($user, [
            'body' => 'Provisional poster',
            'status' => PostStatusEnum::Processing,
            'visibility' => PostVisibilityEnum::Public,
            'original_path' => 'posts/videos/original/1/a.mp4',
            'thumbnail_path' => 'posts/videos/thumbs/1/client.jpg',
        ]);

        $posters = Mockery::mock(PostPosterService::class);
        $posters->shouldReceive('extractAndStore')
            ->once()
            ->with(Mockery::on(fn (Post $r) => $r->id === $post->id), true)
            ->andReturn($post);

        (new ExtractPostPosterJob($post->id, true))->handle($posters);
    }
}
