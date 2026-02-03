<?php

namespace App\Http\Resources\v1\Announcement;

use App\Http\Resources\v1\User\Operator\OperatorResource;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AnnouncementResource extends JsonResource
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
            'is_active' => $this->is_active,
            'content' => $this->content,
            // 'creator' => $this->when(auth()->user()->isAdmin(), new OperatorResource($this->creator)),
            // 'editor' => $this->when(auth()->user()->isAdmin(), new OperatorResource($this->editor)),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
