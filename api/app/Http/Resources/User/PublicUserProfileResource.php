<?php

namespace App\Http\Resources\User;

use App\Support\Media\MediaDisk;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PublicUserProfileResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'nickname' => $this->nickname,
            'avatar_url' => MediaDisk::url($this->avatar),
            'is_official' => (bool) $this->is_official,
            'playing_role' => $this->playing_role?->label(),
            'playing_role_enum' => $this->playing_role?->name,
            'bowling_style' => $this->bowling_style?->label(),
            'bowling_style_enum' => $this->bowling_style?->name,
            'batting_style' => $this->batting_style?->label(),
            'batting_style_enum' => $this->batting_style?->name,
            'country' => $this->country,
            'city' => $this->city,
            'followers_count' => (int) ($this->followers_count ?? 0),
            'following_count' => (int) ($this->following_count ?? 0),
            'reels_count' => (int) ($this->reels_count ?? 0),
            'posts_count' => (int) ($this->posts_count ?? 0),
            'is_following' => (bool) ($this->viewer_is_following ?? false),
        ];
    }
}
