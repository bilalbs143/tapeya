<?php

namespace App\Http\Resources\v1\CustomerInquiry;

use App\Http\Resources\v1\User\LimitedMemberResource;
use App\Http\Resources\v1\User\Operator\OperatorResource;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CustomerInquiryReplyResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'content' => $this->content,
            'creator' => new OperatorResource($this->creator),
            'reader' => $this->when($this->read_at, new LimitedMemberResource($this->reader)),
            'read_at' => $this->when($this->read_at, $this->read_at),
            'created_at' => $this->created_at,
        ];
    }
}
