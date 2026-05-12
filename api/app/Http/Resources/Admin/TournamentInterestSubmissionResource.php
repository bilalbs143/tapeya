<?php

namespace App\Http\Resources\Admin;

use App\Http\Resources\Admin\User\UserResource;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

class TournamentInterestSubmissionResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $disk = Storage::disk(config('filesystems.media_disk'));

        return [
            'id' => $this->id,
            'campaign_id' => $this->campaign_id,
            'user_id' => $this->user_id,
            'name' => $this->name,
            'nickname' => $this->nickname,
            'email' => $this->email,
            'phone' => $this->phone,
            'country' => $this->country,
            'city' => $this->city,
            'date_of_birth' => $this->date_of_birth?->format('Y-m-d'),
            'profile_picture_url' => $this->profile_picture_path
                ? $disk->url($this->profile_picture_path)
                : null,
            'id_document_url' => $this->id_document_path
                ? $disk->url($this->id_document_path)
                : null,
            'status' => $this->status?->value,
            'status_label' => $this->status?->label(),
            'withdrawn_at' => $this->withdrawn_at?->toIso8601String(),
            'user' => $this->whenLoaded('user', fn () => new UserResource($this->user)),
            'campaign' => $this->whenLoaded(
                'campaign',
                fn () => new TournamentInterestCampaignResource($this->campaign),
            ),
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
