<?php

namespace App\Http\Resources\v1\Note;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class LimitedNoteResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'category' => $this->category?->label(),
            'category_enum' => $this->category?->name,
            'title' => $this->title,
            'content' => $this->content,
        ];
    }
}
