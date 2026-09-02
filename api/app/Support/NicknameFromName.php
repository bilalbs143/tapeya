<?php

namespace App\Support;

use App\Models\User;
use Illuminate\Support\Facades\DB;

/**
 * Derive a users.nickname from a full name (Quick Match inline create).
 * Prefers an unused slug when possible; nicknames are not DB-unique.
 */
final class NicknameFromName
{
    public static function slug(string $name): string
    {
        $slug = strtolower(trim($name));
        $slug = preg_replace('/[^a-z0-9]+/', '_', $slug) ?? '';
        $slug = trim($slug, '_');
        if ($slug === '') {
            $slug = 'player';
        }

        return substr($slug, 0, 40);
    }

    public static function unique(string $name): string
    {
        $base = self::slug($name);
        $candidate = $base;
        $n = 2;

        while (User::query()->where('nickname', $candidate)->exists()) {
            $suffix = '_'.$n;
            $candidate = substr($base, 0, 50 - strlen($suffix)).$suffix;
            $n++;
            if ($n > 50) {
                return substr($base, 0, 40).'_'.bin2hex(random_bytes(3));
            }
        }

        return $candidate;
    }

    /**
     * Create a user with a nickname derived from $fullName.
     *
     * @param  array<string, mixed>  $attributes  Must include register-required fields except nickname.
     */
    public static function createUser(array $attributes, string $fullName): User
    {
        return DB::transaction(function () use ($attributes, $fullName) {
            return User::query()->create(array_merge($attributes, [
                'nickname' => self::unique($fullName),
            ]));
        });
    }
}
