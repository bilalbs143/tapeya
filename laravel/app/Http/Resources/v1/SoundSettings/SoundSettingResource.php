<?php

namespace App\Http\Resources\v1\SoundSettings;

use App\Http\Resources\v1\User\Operator\OperatorResource;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SoundSettingResource extends JsonResource
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
            'sound_file' => $this->sound?->file,
            'creator' => $this->when(auth()->check() && auth()->user()->isAdmin(), new OperatorResource($this->creator)),
            'editor' => $this->when(auth()->check() && auth()->user()->isAdmin(), new OperatorResource($this->editor)),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
