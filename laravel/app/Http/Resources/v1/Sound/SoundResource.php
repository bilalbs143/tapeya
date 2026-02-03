<?php

namespace App\Http\Resources\v1\Sound;

use App\Http\Resources\v1\User\Operator\OperatorResource;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SoundResource extends JsonResource
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
            'title' => $this->title,
            'file' => $this->file,
            'creator' => $this->when(auth()->check() && auth()->user()->isAdmin(), new OperatorResource($this->creator)),
            'editor' => $this->when(auth()->check() && auth()->user()->isAdmin(), new OperatorResource($this->editor)),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
