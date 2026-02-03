<?php

namespace App\Http\Resources\v1\Template;

use App\Http\Resources\v1\User\Operator\OperatorResource;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TemplateResource extends JsonResource
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
            'type' => $this->type?->label(),
            'type_enum' => $this->type?->name,
            'title' => $this->title,
            'content' => $this->content,
            'is_active' => $this->is_active,
            'creator' => new OperatorResource($this->creator),
            'editor' => new OperatorResource($this->editor),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
