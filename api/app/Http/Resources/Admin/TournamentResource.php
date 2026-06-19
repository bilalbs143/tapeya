<?php

namespace App\Http\Resources\Admin;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

class TournamentResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $disk = Storage::disk(config('filesystems.media_disk'));

        return [
            'id' => $this->id,
            'organizer_id' => $this->organizer_id,
            'created_by' => $this->created_by,
            'creator' => $this->whenLoaded('creator', fn () => $this->creator ? [
                'id' => $this->creator?->id,
                'name' => $this->creator?->name,
                'nickname' => $this->creator?->nickname,
                'email' => $this->creator?->email,
                'phone' => $this->creator?->phone,
            ] : null),
            'organizer' => $this->whenLoaded('organizer', fn () => $this->organizer ? [
                'id' => $this->organizer?->id,
                'name' => $this->organizer?->name,
                'nickname' => $this->organizer?->nickname,
                'email' => $this->organizer?->email,
                'phone' => $this->organizer?->phone,
            ] : null),
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
            'squad_player_count' => (int) ($this->squad_player_count ?? 0),
            'number_of_groups' => (int) ($this->number_of_groups ?? 1),
            'country' => $this->country,
            'city' => $this->city,
            'match_timings' => $this->match_timings?->value,
            'match_timings_label' => $this->match_timings?->label(),
            'status' => $this->status?->value,
            'status_enum' => $this->status?->value,
            'status_label' => $this->status?->label(),
            'schedule_phase' => $this->schedulePhase()?->value,
            'schedule_phase_label' => $this->schedulePhase()?->label(),
            'display_image' => $this->display_image ? $disk->url($this->display_image) : null,
            'cover_image' => $this->cover_image ? $disk->url($this->cover_image) : null,
            'prize' => $this->prize,
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
