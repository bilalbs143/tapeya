<?php

namespace App\Http\Resources\Admin;

use App\Support\Media\MediaDisk;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PostReportResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'post_id' => $this->post_id,
            'reporter_id' => $this->reporter_id,
            'reason' => $this->reason?->value ?? $this->reason,
            'details' => $this->details,
            'status' => $this->status,
            'post' => $this->whenLoaded('post', fn () => $this->post ? [
                'id' => $this->post->id,
                'type' => $this->post->type?->value,
                'title' => $this->post->title,
                'body' => $this->post->body,
                'caption' => $this->post->body,
                'background_id' => $this->post->background_id,
                'cover_url' => MediaDisk::url($this->post->cover_path) ?? $this->post->thumbnailUrl(),
                'status' => $this->post->status?->value,
                'visibility' => $this->post->visibility?->value,
                'reports_count' => (int) $this->post->reports_count,
                'user_id' => $this->post->user_id,
            ] : null),
            'reporter' => $this->whenLoaded('reporter', fn () => $this->reporter ? [
                'id' => $this->reporter->id,
                'name' => $this->reporter->name,
                'nickname' => $this->reporter->nickname,
            ] : null),
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
