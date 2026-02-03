<?php

namespace App\Http\Resources\v1\Auth;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class LoginHistoryResource extends JsonResource
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
            'ip_address' => $this->ip_address,
            'origin' => $this->origin,
            'user_agent' => $this->user_agent,
            'login_at' => $this->login_at,
            'logout_at' => $this->logout_at,
            'user' => $this->when($this->authenticatable, new LoginHistoryUserResource($this->authenticatable)),
        ];
    }
}
