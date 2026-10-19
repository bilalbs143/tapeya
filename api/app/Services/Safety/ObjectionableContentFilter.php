<?php

namespace App\Services\Safety;

use Illuminate\Validation\ValidationException;

/**
 * Lightweight keyword filter for UGC (App Store 1.2).
 * Rejects clear-banned phrases before content is published.
 */
class ObjectionableContentFilter
{
    /** @var list<string> */
    private const BLOCKED = [
        'child porn',
        'childporn',
        'csam',
        'kill yourself',
        'kys ',
        'nazi',
        'rape you',
        'rape her',
        'rape him',
    ];

    public function assertAllowed(?string $text, string $field = 'body'): void
    {
        $normalized = mb_strtolower(trim((string) $text));
        if ($normalized === '') {
            return;
        }

        foreach (self::BLOCKED as $phrase) {
            if (str_contains($normalized, $phrase)) {
                throw ValidationException::withMessages([
                    $field => ['This content violates Tapeya community guidelines.'],
                ]);
            }
        }
    }
}
