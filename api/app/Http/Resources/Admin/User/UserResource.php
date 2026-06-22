<?php

namespace App\Http\Resources\Admin\User;

use App\Enums\User\RoleGuardEnum;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

class UserResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $user = $this->resource;
        $appRoles = $user->relationLoaded('roles')
            ? $user->roles->where('guard', RoleGuardEnum::APP->value)->values()
            : $user->getAppRoles();
        $adminRoles = $user->relationLoaded('roles')
            ? $user->roles->where('guard', RoleGuardEnum::ADMIN->value)->values()
            : $user->getAdminRoles();

        $avatarUrl = $this->avatar
            ? Storage::disk(config('filesystems.media_disk'))->url($this->avatar)
            : null;

        return [
            'id' => $this->id,
            'name' => $this->name,
            'nickname' => $this->nickname,
            'email' => $this->email,
            'phone' => $this->phone,
            'avatar_url' => $avatarUrl,
            'date_of_birth' => $this->date_of_birth?->format('Y-m-d'),
            'type' => $this->type?->label(),
            'type_enum' => $this->type?->name,
            'status' => $this->status?->label(),
            'status_enum' => $this->status?->name,
            'playing_role' => $this->playing_role?->label(),
            'playing_role_enum' => $this->playing_role?->name,
            'bowling_style' => $this->bowling_style?->label(),
            'bowling_style_enum' => $this->bowling_style?->name,
            'batting_style' => $this->batting_style?->label(),
            'batting_style_enum' => $this->batting_style?->name,
            'country' => $this->country,
            'city' => $this->city,
            'roles' => $appRoles->map(fn ($r) => [
                'id' => $r->id,
                'name' => $r->name,
                'slug' => $r->slug,
            ])->values()->all(),
            'role_ids' => $appRoles->pluck('id')->values()->all(),
            'admin_roles' => $adminRoles->map(fn ($r) => [
                'id' => $r->id,
                'name' => $r->name,
                'slug' => $r->slug,
            ])->values()->all(),
            'admin_role_ids' => $adminRoles->pluck('id')->values()->all(),
            'created_by' => $this->created_by,
            'creator' => $this->whenLoaded('creator', fn () => $this->creator ? [
                'id' => $this->creator->id,
                'name' => $this->creator->name,
                'nickname' => $this->creator->nickname,
            ] : null),
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
