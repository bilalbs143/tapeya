<?php

namespace App\Http\Resources\Admin\Event;

use App\Http\Resources\Admin\User\UserResource;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class EventRequestResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'user_id' => $this->user_id,
            'user' => $this->whenLoaded('user', fn () => new UserResource($this->user)),
            'contact_person_name' => $this->contact_person_name,
            'contact_phone' => $this->contact_phone,
            'event_name' => $this->event_name,
            'event_type' => $this->event_type?->value,
            'event_type_label' => $this->event_type?->label(),
            'cricket_format' => $this->cricket_format?->value,
            'cricket_format_label' => $this->cricket_format?->label(),
            'venue_name' => $this->venue_name,
            'start_date' => $this->start_date?->format('Y-m-d'),
            'end_date' => $this->end_date?->format('Y-m-d'),
            'number_of_matches' => $this->number_of_matches,
            'number_of_teams' => $this->number_of_teams,
            'expected_players_count' => $this->expected_players_count,
            'city' => $this->city,
            'match_timings' => $this->match_timings?->value,
            'match_timings_label' => $this->match_timings?->label(),
            'status' => $this->status?->value,
            'status_label' => $this->status?->label(),
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
