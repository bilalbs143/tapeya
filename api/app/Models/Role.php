<?php

namespace App\Models;

use App\Contracts\RoleEnumInterface;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Role extends Model
{
    protected $fillable = ['name', 'slug', 'guard'];

    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'role_user')->withTimestamps();
    }

    public function permissions(): BelongsToMany
    {
        return $this->belongsToMany(Permission::class, 'role_permission')->withTimestamps();
    }

    public function givePermissionTo(Permission|string $permission): void
    {
        if ($permission instanceof Permission) {
            $this->permissions()->syncWithoutDetaching([$permission->id]);
        } else {
            $p = Permission::where('slug', $permission)->where('guard', $this->guard)->first();
            if ($p) {
                $this->permissions()->syncWithoutDetaching([$p->id]);
            }
        }
    }

    public function revokePermissionTo(Permission|string $permission): void
    {
        if ($permission instanceof Permission) {
            $this->permissions()->detach($permission->id);
        } else {
            $p = Permission::where('slug', $permission)->where('guard', $this->guard)->first();
            if ($p) {
                $this->permissions()->detach($p->id);
            }
        }
    }

    public function hasPermission(string $slug): bool
    {
        return $this->permissions()->where('slug', $slug)->exists();
    }

    public function scopeForGuard(Builder $query, string $guard): Builder
    {
        return $query->where('guard', $guard);
    }

    public function isRole(RoleEnumInterface $role): bool
    {
        return $this->slug === $role->value && $this->guard === $role->guard();
    }

    public static function findBySlug(string $slug, ?string $guard = null): ?self
    {
        $query = static::where('slug', $slug);
        if ($guard !== null) {
            $query->where('guard', $guard);
        }

        return $query->first();
    }
}
