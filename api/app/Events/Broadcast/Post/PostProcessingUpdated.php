<?php

namespace App\Events\Broadcast\Post;

use App\Enums\Post\PostStatusEnum;
use App\Models\Post;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class PostProcessingUpdated implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public Post $post
    ) {}

    /**
     * @return array<int, PrivateChannel>
     */
    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('App.Models.User.'.$this->post->user_id),
        ];
    }

    public function broadcastAs(): string
    {
        return 'reel.processing.updated';
    }

    /**
     * @return array<string, mixed>
     */
    public function broadcastWith(): array
    {
        $status = $this->post->status instanceof PostStatusEnum
            ? $this->post->status->value
            : (string) $this->post->status;

        // Private channel is the owner — include temporary original while encoding.
        $playback = $this->post->playbackPayload((int) $this->post->user_id);

        return [
            'post_id' => $this->post->id,
            'status' => $status,
            'processing_error' => $this->post->videoRaw('processing_error'),
            'playback' => [
                'type' => $playback['type'],
                'url' => $playback['url'],
                'poster_url' => $this->post->thumbnailUrl(),
                'hls_url' => $playback['hls_url'],
                'is_processed' => $playback['is_processed'],
            ],
            'ready_at' => $this->post->video?->ready_at?->toIso8601String(),
        ];
    }
}
