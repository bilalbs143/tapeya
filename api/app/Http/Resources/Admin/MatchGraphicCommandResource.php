<?php

namespace App\Http\Resources\Admin;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MatchGraphicCommandResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'match_graphic_session_id' => $this->match_graphic_session_id,
            'command_type' => $this->command_type instanceof \BackedEnum ? $this->command_type->value : $this->command_type,
            'command_key' => $this->command_key,
            'payload' => $this->payload,
            'display_mode' => $this->display_mode,
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
