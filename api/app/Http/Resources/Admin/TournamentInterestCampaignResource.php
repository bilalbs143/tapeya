<?php

namespace App\Http\Resources\Admin;

use App\Http\Resources\Admin\User\UserResource;
use App\Support\Media\MediaDisk;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TournamentInterestCampaignResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'tournament_id' => $this->tournament_id,
            'is_linked' => $this->tournament_id !== null,
            'tournament_name' => $this->tournament_name,
            'slug' => $this->slug,
            'description' => $this->description,
            'form_fields' => $this->resolvedFormFields(),
            'logo_url' => MediaDisk::url($this->logo_path),
            'show_in_sidebar' => (bool) $this->show_in_sidebar,
            'show_dialog' => (bool) $this->show_dialog,
            'status' => $this->status?->value,
            'status_label' => $this->status?->label(),
            'created_by' => $this->created_by,
            'creator' => $this->whenLoaded('creator', fn () => new UserResource($this->creator)),
            'tournament' => $this->whenLoaded(
                'tournament',
                fn () => $this->tournament ? [
                    'id' => $this->tournament->id,
                    'tournament_name' => $this->tournament->tournament_name,
                    'start_date' => $this->tournament->start_date?->format('Y-m-d'),
                    'status' => $this->tournament->status?->value,
                    'status_label' => $this->tournament->status?->label(),
                ] : null,
            ),
            'submissions_count' => $this->when(
                isset($this->submissions_count),
                fn () => (int) $this->submissions_count,
            ),
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
