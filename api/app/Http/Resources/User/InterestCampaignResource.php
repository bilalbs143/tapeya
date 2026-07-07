<?php

namespace App\Http\Resources\User;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

class InterestCampaignResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $disk = Storage::disk(config('filesystems.media_disk'));

        return [
            'id' => $this->id,
            'tournament_id' => $this->tournament_id,
            'is_linked' => $this->tournament_id !== null,
            'tournament_name' => $this->tournament_name,
            'slug' => $this->slug,
            'description' => $this->description,
            'form_fields' => $this->resolvedFormFields(),
            'logo_url' => $this->logo_path ? $disk->url($this->logo_path) : null,
            'show_in_sidebar' => (bool) $this->show_in_sidebar,
            'show_dialog' => (bool) $this->show_dialog,
            'status' => $this->status?->value,
            'status_label' => $this->status?->label(),
            'tournament' => $this->whenLoaded(
                'tournament',
                fn () => $this->tournament ? new TournamentResource($this->tournament) : null,
            ),
        ];
    }
}
