<?php

namespace App\Http\Resources\Admin;

use App\Http\Resources\Admin\User\UserResource;
use App\Support\Media\MediaDisk;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TournamentInterestSubmissionResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
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
            'profile_picture_url' => MediaDisk::url($this->profile_picture_path),
            'id_document_url' => MediaDisk::url($this->id_document_path),
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
