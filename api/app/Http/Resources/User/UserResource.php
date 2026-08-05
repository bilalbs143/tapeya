<?php

namespace App\Http\Resources\User;

use App\Support\Media\MediaDisk;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $user = $this->resource;
        $avatarUrl = MediaDisk::url($this->avatar);

        return [
            'id' => $this->id,
            'name' => $this->name,
            'nickname' => $this->nickname,
            'email' => $this->email,
            'phone' => $this->phone,
            'avatar_url' => $avatarUrl,
            'date_of_birth' => $this->date_of_birth?->format('Y-m-d'),
            'type' => $this->type?->label(),
            'type_enum' => $this->type?->name,
            'status' => $this->status?->label(),
            'status_enum' => $this->status?->name,
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
            'can_broadcast' => (bool) $this->can_broadcast,
            'is_official' => (bool) $this->is_official,
            'broadcast_terms_accepted_at' => $this->broadcast_terms_accepted_at?->toIso8601String(),
            'capabilities' => $user->appCapabilities(),
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
