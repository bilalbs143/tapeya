<?php

namespace App\Support\Post;

use App\Models\User;
use Illuminate\Support\Collection;

/**
 * Extracts @nickname tokens from post captions and comment bodies.
 * Token charset matches the consumer app; requires a boundary before @
 * (start of string or whitespace) so emails like user@gmail.com are ignored.
 */
final class PostMentionParser
{
    /**
     * @return list<string> Unique nicknames (first-seen casing), one per lowercase key
     */
    public static function extractNicknames(string $body): array
    {
        if ($body === '') {
            return [];
        }

        if (! preg_match_all('/(?:^|[\s])@([a-zA-Z0-9_]+)/u', $body, $matches)) {
            return [];
        }

        $unique = [];
        foreach ($matches[1] as $nickname) {
            $key = strtolower($nickname);
            if ($key === '' || isset($unique[$key])) {
                continue;
            }
            $unique[$key] = $nickname;
        }

        return array_values($unique);
    }

    /**
     * Active app users matching extracted nicknames (case-insensitive).
     *
     * @return Collection<int, User>
     */
    public static function resolveUsers(string $body): Collection
    {
        $nicknames = self::extractNicknames($body);
        if ($nicknames === []) {
            return collect();
        }

        $lower = array_map('strtolower', $nicknames);
        $placeholders = implode(',', array_fill(0, count($lower), '?'));

        return User::query()
            ->appUsers()
            ->active()
            ->whereNotNull('nickname')
            ->where('nickname', '!=', '')
            ->whereRaw('LOWER(nickname) IN ('.$placeholders.')', $lower)
            ->get(['id', 'name', 'nickname', 'avatar']);
    }
}
