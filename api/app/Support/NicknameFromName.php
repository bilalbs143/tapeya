<?php

namespace App\Support;

use App\Models\User;
use Illuminate\Database\QueryException;
use Illuminate\Database\UniqueConstraintViolationException;
use Illuminate\Support\Facades\DB;
use RuntimeException;

/**
 * Derive a unique users.nickname from a full name (Quick Match inline create).
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
        }

        return $candidate;
    }

    /**
     * Create a user with a nickname derived from $fullName, retrying on unique conflicts.
     *
     * Uses a nested transaction (savepoint) per attempt so a PostgreSQL unique
     * violation does not abort an outer Quick Match create transaction.
     *
     * @param  array<string, mixed>  $attributes  Must include register-required fields except nickname.
     */
    public static function createUser(array $attributes, string $fullName): User
    {
        $base = self::slug($fullName);
        $maxAttempts = 50;

        for ($i = 0; $i < $maxAttempts; $i++) {
            $nickname = $i === 0
                ? $base
                : substr($base, 0, 50 - strlen('_'.($i + 1))).'_'.($i + 1);

            try {
                return DB::transaction(function () use ($attributes, $nickname) {
                    return User::query()->create(array_merge($attributes, [
                        'nickname' => $nickname,
                    ]));
                });
            } catch (UniqueConstraintViolationException $e) {
                if (! self::isNicknameUniqueViolation($e)) {
                    throw $e;
                }
            } catch (QueryException $e) {
                if (! self::isNicknameUniqueViolation($e)) {
                    throw $e;
                }
            }
        }

        throw new RuntimeException('Could not allocate a unique nickname.');
    }

    private static function isNicknameUniqueViolation(QueryException $e): bool
    {
        $sqlState = (string) ($e->errorInfo[0] ?? $e->getCode());
        if ($sqlState !== '23505' && $sqlState !== '23000') {
            return false;
        }

        $message = strtolower($e->getMessage());

        return str_contains($message, 'nickname')
            || str_contains($message, 'users_nickname');
    }
}
