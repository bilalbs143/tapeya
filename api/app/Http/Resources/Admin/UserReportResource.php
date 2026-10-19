<?php

namespace App\Http\Resources\Admin;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserReportResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'reason' => $this->reason,
            'details' => $this->details,
            'source' => $this->source,
            'status' => $this->status,
            'reporter' => $this->whenLoaded('reporter', fn () => $this->reporter ? [
                'id' => $this->reporter->id,
                'name' => $this->reporter->name,
                'nickname' => $this->reporter->nickname,
                'phone' => $this->reporter->phone,
            ] : null),
            'reported_user' => $this->whenLoaded('reportedUser', fn () => $this->reportedUser ? [
                'id' => $this->reportedUser->id,
                'name' => $this->reportedUser->name,
                'nickname' => $this->reportedUser->nickname,
                'phone' => $this->reportedUser->phone,
                'status' => $this->reportedUser->status?->value ?? $this->reportedUser->status,
            ] : null),
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
