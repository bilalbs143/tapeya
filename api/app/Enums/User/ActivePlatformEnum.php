<?php

namespace App\Enums\User;

use App\Enums\BaseEnumTrait;

enum ActivePlatformEnum: string
{
    use BaseEnumTrait;

    case WEB = 'web';
    case IOS = 'ios';
    case ANDROID = 'android';

    /** Filter-only — users with no {@see active_platform} in the database. */
    case UNTRACKED = 'untracked';

    public function label(): string
    {
        return match ($this) {
            self::WEB => 'Web',
            self::IOS => 'iOS',
            self::ANDROID => 'Android',
            self::UNTRACKED => 'Untracked',
        };
    }

    /** Values persisted on {@see \App\Models\User::$active_platform}. */
    public function isStored(): bool
    {
        return $this !== self::UNTRACKED;
    }

    /** @return list<self> */
    public static function storedCases(): array
    {
        return [self::WEB, self::IOS, self::ANDROID];
    }

    /** @return list<string> */
    public static function storedValues(): array
    {
        return array_map(fn (self $case) => $case->value, self::storedCases());
    }
}
