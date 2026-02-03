<?php

namespace App\Http\Resources\v1\Faq;

use App\Http\Resources\v1\User\Operator\OperatorResource;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class FaqResource extends JsonResource
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
            'category' => $this->category?->label(),
            'category_enum' => $this->category?->name,
            'title' => $this->title,
            'content' => $this->content,
            'is_active' => $this->is_active,
            'creator' => $this->when(auth()->user()->isAdmin(), new OperatorResource($this->creator)),
            'editor' => $this->when(auth()->user()->isAdmin(), new OperatorResource($this->editor)),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
