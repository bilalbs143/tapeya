<?php

namespace App\Http\Resources\User;

use App\Support\Media\MediaDisk;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PostCommentResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'post_id' => $this->post_id,
            'parent_id' => $this->parent_id,
            'body' => $this->body,
            'likes_count' => (int) $this->likes_count,
            'liked' => (bool) ($this->viewer_liked ?? false),
            'is_pinned' => (bool) $this->is_pinned,
            'replies_count' => (int) ($this->replies_count ?? 0),
            'user' => $this->whenLoaded('user', function () {
                return [
                    'id' => $this->user?->id,
                    'name' => $this->user?->name,
                    'nickname' => $this->user?->nickname,
                    'avatar_url' => MediaDisk::url($this->user?->avatar),
                    'is_official' => (bool) ($this->user?->is_official ?? false),
                ];
            }),
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
