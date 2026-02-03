<?php

namespace App\Http\Resources\v1\Game;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class GameResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'launch_identifier' => $this->launch_identifier,
            'name' => $this->name,
            'image_url' => $this->image_url,
            'type' => $this->type,
            'description' => $this->description,
            'is_live_game' => $this->is_live_game,
            'has_freespins' => $this->has_freespins,
            'has_jackpot' => $this->has_jackpot,
            'is_slot_game' => $this->is_slot_game,
            'is_demo_game_available' => $this->is_demo_game_available,
            'is_new' => $this->is_new,
            'is_trending' => $this->is_trending,
            'is_video_slot' => $this->is_video_slot,
            'is_arcade_slot' => $this->is_arcade_slot,
            'is_casual_slot' => $this->is_casual_slot,
            'is_fishing_slot' => $this->is_fishing_slot,
            'is_table_slot' => $this->is_table_slot,
            'is_blackjack_casino' => $this->is_blackjack_casino,
            'is_baccarat_casino' => $this->is_baccarat_casino,
            'is_roulette_casino' => $this->is_roulette_casino,
            'is_poker' => $this->is_poker,
            'is_recommended' => $this->is_recommended,
            'is_sport' => $this->is_sport,
            'is_lobby_game' => $this->is_lobby_game,
            'company' => $this->company?->key?->label(),
            'provider' => $this->provider?->name,
        ];
    }
}
