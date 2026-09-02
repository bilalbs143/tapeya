<?php

namespace App\Support\Post;

use App\Models\User;
use Illuminate\Support\Collection;

/**
 * Extracts @nickname tokens from post captions and comment bodies.
 * Nicknames allow letters and spaces (see register/profile validation).
 * Requires a boundary before @ (start of string or whitespace) so emails are ignored.
 * Quoted form @"First Last" is supported for multi-word nicknames.
 */
final class PostMentionParser
{
    private const NICKNAME_BODY = '[A-Za-z]+(?:\s+[A-Za-z]+)*';

    /**
     * @return list<string> Unique nicknames (first-seen casing), one per lowercase key
     */
    public static function extractNicknames(string $body): array
    {
        if ($body === '') {
            return [];
        }

        $unique = [];

        if (preg_match_all('/(?:^|[\s])@"('.self::NICKNAME_BODY.')"/u', $body, $quoted)) {
            foreach ($quoted[1] as $nickname) {
                self::rememberNickname($unique, $nickname);
            }
        }

        if (preg_match_all(
            '/(?:^|[\s])@([A-Za-z]+)(?=[\s.,!?;:—–\-]|$)/u',
            $body,
            $matches,
        )) {
            foreach ($matches[1] as $nickname) {
                self::rememberNickname($unique, $nickname);
            }
        }

        return array_values($unique);
    }

    /**
     * Active app users matching extracted nicknames (case-insensitive).
     * Ambiguous nicknames (multiple users share the same nickname) are skipped.
     *
     * @return Collection<int, User>
     */
    public static function resolveUsers(string $body): Collection
    {
        $nicknames = self::extractNicknames($body);
        if ($nicknames === []) {
            return collect();
        }

        $resolved = collect();

        foreach ($nicknames as $nickname) {
            $users = User::query()
                ->appUsers()
                ->active()
                ->whereNotNull('nickname')
                ->where('nickname', '!=', '')
                ->whereRaw('LOWER(TRIM(nickname)) = ?', [strtolower(trim($nickname))])
                ->get(['id', 'name', 'nickname', 'avatar']);

            if ($users->count() === 1) {
                $resolved->push($users->first());
            }
        }

        return $resolved->unique('id')->values();
    }

    /**
     * @param  array<string, string>  $unique
     */
    private static function rememberNickname(array &$unique, string $nickname): void
    {
        $trimmed = trim($nickname);
        $key = strtolower($trimmed);
        if ($key === '' || isset($unique[$key])) {
            return;
        }

        $unique[$key] = $trimmed;
    }
}
