<?php

namespace App\Http\Resources\Admin;

use App\Services\Broadcast\GraphicContextOrchestrator;
use App\Support\Broadcast\GraphicContextHash;
use App\Support\Scoring\MatchPendingState;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\App;

class MatchGraphicSessionResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $this->loadMissing('match');

        $context = is_array($this->context) ? $this->context : [];
        if ($this->match !== null) {
            $context = App::make(GraphicContextOrchestrator::class)
                ->mergeSessionContext($this->resource, $this->match);
        }

        $resolvedPending = $this->match !== null ? MatchPendingState::resolve($this->match) : [];

        return [
            'id' => $this->id,
            'match_id' => $this->match_id,
            'graphic_theme_id' => $this->graphic_theme_id,
            'config' => $this->config,
            'pending_players' => $resolvedPending === [] ? null : $resolvedPending,
            'context' => $context,
            'context_hash' => GraphicContextHash::hash($context),
            'active_command_id' => $this->active_command_id,
            'theme' => $this->whenLoaded('theme', fn () => new GraphicThemeResource($this->theme)),
            'active_command' => $this->whenLoaded('activeCommand', fn () => new MatchGraphicCommandResource($this->activeCommand)),
            'recent_commands' => $this->whenLoaded('commands', fn () => MatchGraphicCommandResource::collection($this->commands)),
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
