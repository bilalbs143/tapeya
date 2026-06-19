<?php

namespace App\Http\Resources\User;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

class TournamentResource extends JsonResource
{
    private function getTeamsCount(): int
    {
        if (! array_key_exists('teams_count', $this->resource->getAttributes())) {
            $this->resource->loadCount('teams');
        }

        return (int) ($this->resource->teams_count ?? 0);
    }

    private function getMatchesCount(): int
    {
        if ($this->resource->relationLoaded('matches')) {
            return $this->resource->matches->count();
        }

        if (! array_key_exists('matches_count', $this->resource->getAttributes())) {
            $this->resource->loadCount('matches');
        }

        return (int) ($this->resource->matches_count ?? 0);
    }

    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $disk = Storage::disk(config('filesystems.media_disk'));

        return [
            'id' => $this->id,
            'tournament_name' => $this->tournament_name,
            'short_name' => $this->short_name,
            'tournament_type' => $this->tournament_type?->value,
            'tournament_type_label' => $this->tournament_type?->label(),
            'cricket_format' => $this->cricket_format?->value,
            'cricket_format_label' => $this->cricket_format?->label(),
            'venue_name' => $this->venue_name,
            'start_date' => $this->start_date?->format('Y-m-d'),
            'end_date' => $this->end_date?->format('Y-m-d'),
            'number_of_teams' => $this->number_of_teams,
            'number_of_groups' => (int) ($this->number_of_groups ?? 1),
            'country' => $this->country,
            'city' => $this->city,
            'match_timings' => $this->match_timings?->value,
            'match_timings_label' => $this->match_timings?->label(),
            'status' => $this->status?->value,
            'status_label' => $this->status?->label(),
            'display_image' => $this->display_image ? $disk->url($this->display_image) : null,
            'cover_image' => $this->cover_image ? $disk->url($this->cover_image) : null,
            'prize' => $this->prize,
            'likes_count' => (int) ($this->likes_count ?? 0),
            'dislikes_count' => (int) ($this->dislikes_count ?? 0),
            'shares_count' => (int) ($this->shares_count ?? 0),
            'my_reaction' => $this->when(isset($this->my_reaction), $this->my_reaction),
            'interest_campaign_slug' => $this->when(
                array_key_exists('interest_campaign_slug', $this->resource->getAttributes()),
                fn () => $this->interest_campaign_slug,
            ),

            'teams_count' => (int) $this->getTeamsCount(),
            'matches_count' => (int) $this->getMatchesCount(),
            'can_manage' => $this->canManage($request),
            'matches' => $this->whenLoaded('matches', fn () => TournamentMatchResource::collection($this->matches)),

            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }

    private function canManage(Request $request): bool
    {
        $user = $request->user();
        if (! $user) {
            return false;
        }

        $preloaded = $request->attributes->get('manageable_tournament_ids');
        if ($preloaded !== null) {
            return isset($preloaded[$this->id]);
        }

        return $user->canOperateTournamentInApp($this->resource);
    }
}
