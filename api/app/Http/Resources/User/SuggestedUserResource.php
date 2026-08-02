<?php

namespace App\Http\Resources\User;

use App\Support\Media\MediaDisk;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Number;

class SuggestedUserResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $followersCount = (int) ($this->followers_count ?? 0);
        $playingRole = $this->playing_role?->label();
        $isOfficial = (bool) $this->is_official;

        return [
            'id' => $this->id,
            'name' => $this->name,
            'nickname' => $this->nickname,
            'avatar_url' => MediaDisk::url($this->avatar),
            'is_official' => $isOfficial,
            'followers_count' => $followersCount,
            'playing_role' => $playingRole,
            'is_following' => false,
            'subtitle' => $this->resolveSubtitle($playingRole, $isOfficial, $followersCount),
        ];
    }

    private function resolveSubtitle(?string $playingRole, bool $isOfficial, int $followersCount): string
    {
        if ($playingRole) {
            return $playingRole;
        }

        if ($isOfficial) {
            return 'Official account';
        }

        if ($followersCount <= 0) {
            return 'New on Tapeya';
        }

        $formatted = Number::abbreviate($followersCount);

        return $formatted.' '.($followersCount === 1 ? 'follower' : 'followers');
    }
}
