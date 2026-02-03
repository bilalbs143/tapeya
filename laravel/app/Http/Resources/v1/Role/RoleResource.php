<?php

namespace App\Http\Resources\v1\Role;

use App\Http\Resources\v1\Permission\PermissionResource;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class RoleResource extends JsonResource
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
            'name' => $this->name?->label(),
            'name_enum' => $this->name?->name,
            'guard_name' => $this->guard_name,
            'permissions' => $this->whenLoaded('__permissions', PermissionResource::collection($this->__permissions)),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
