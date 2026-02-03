<?php

namespace App\Http\Resources\v1\CustomerInquiry;

use App\Http\Resources\v1\User\MemberResource;
use App\Http\Resources\v1\User\Operator\OperatorResource;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CustomerInquiryResource extends JsonResource
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
            'status' => $this->status?->label(),
            'status_enum' => $this->status?->name,
            'category' => $this->category?->label(),
            'category_enum' => $this->category?->name,
            'title' => $this->title,
            'content' => $this->content,
            'reply' => $this->when($this->reply, new CustomerInquiryReplyResource($this->reply)),
            'creator' => new MemberResource($this->creator),
            'reader' => $this->when($this->read_at, new OperatorResource($this->reader)),
            'read_at' => $this->when($this->read_at, $this->read_at),
            'created_at' => $this->created_at,
        ];
    }
}
