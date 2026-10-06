<?php

namespace App\Http\Resources\User;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class DramaSerialResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'description' => $this->description,
            'poster' => $this->posterUrl(),
            'episodes_count' => (int) $this->episodes_count,
            'first_episode_id' => $this->resolveFirstEpisodeId(),
            'episodes' => $this->whenLoaded('episodes', fn () => DramaEpisodeSummaryResource::collection($this->episodes)),
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }

    private function resolveFirstEpisodeId(): ?int
    {
        if (isset($this->first_episode_id) && $this->first_episode_id !== null) {
            return (int) $this->first_episode_id;
        }

        if ($this->relationLoaded('episodes')) {
            $first = $this->episodes->sortBy('episode_number')->first();

            return $first ? (int) $first->id : null;
        }

        $id = $this->episodes()
            ->where('is_active', true)
            ->orderBy('episode_number')
            ->value('id');

        return $id !== null ? (int) $id : null;
    }
}
