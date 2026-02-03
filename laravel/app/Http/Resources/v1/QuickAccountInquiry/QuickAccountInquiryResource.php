<?php

namespace App\Http\Resources\v1\QuickAccountInquiry;

use App\Http\Resources\v1\User\LimitedMemberResource;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class QuickAccountInquiryResource extends JsonResource
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
            'name' => $this->name,
            'phone' => $this->phone,
            'message' => $this->message,
            'creator' => new LimitedMemberResource($this->creator),
            'created_at' => $this->created_at,
        ];
    }
}
