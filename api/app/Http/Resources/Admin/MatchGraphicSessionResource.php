<?php

namespace App\Http\Resources\Admin;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MatchGraphicSessionResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'match_id' => $this->match_id,
            'graphic_theme_id' => $this->graphic_theme_id,
            'config' => $this->config,
            'context' => $this->context,
            'active_command_id' => $this->active_command_id,
            'theme' => $this->whenLoaded('theme', fn () => new GraphicThemeResource($this->theme)),
            'active_command' => $this->whenLoaded('activeCommand', fn () => new MatchGraphicCommandResource($this->activeCommand)),
            'recent_commands' => $this->whenLoaded('commands', fn () => MatchGraphicCommandResource::collection($this->commands)),
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
