<?php

namespace App\Http\Resources\Admin\Auth;

use App\Enums\User\AdminRoleEnum;
use App\Http\Resources\Auth\LoginResource as BaseLoginResource;
use Illuminate\Http\Request;

class LoginResource extends BaseLoginResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return array_merge(parent::toArray($request), [
            'is_broadcast_staff' => $this->hasRole(AdminRoleEnum::BROADCASTER),
        ]);
    }
}
