<?php

namespace App\Http\Resources\v1\User;

use App\Http\Resources\v1\Auth\LoginHistoryResource;
use App\Utils\Services\Utils;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AdminResource extends JsonResource
{
    public $preserveKeys = true;

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
            'username' => Utils::resolveProperty($this->username, 'VIEW_PROPERTY_USERNAME', Utils::isMyResource($this->id)),
            'nickname' => Utils::resolveProperty($this->nickname, 'VIEW_PROPERTY_NICKNAME', Utils::isMyResource($this->id)),
            'name' => Utils::resolveProperty($this->name, 'VIEW_PROPERTY_NAME', Utils::isMyResource($this->id)),
            'phone' => Utils::resolveProperty($this->phone, 'VIEW_PROPERTY_PHONE', Utils::isMyResource($this->id)),
            'dob' => Utils::resolveProperty($this->dob, 'VIEW_PROPERTY_DOB', Utils::isMyResource($this->id)),
            'locale' => $this->locale,
            'status' => $this->status?->label(),
            'status_enum' => $this->status?->name,
            'last_login' => new LoginHistoryResource($this->last_login()),
            'created_at_ip' => $this->created_at_ip,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
