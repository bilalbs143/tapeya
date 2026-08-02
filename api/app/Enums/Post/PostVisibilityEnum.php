<?php

namespace App\Enums\Post;

use App\Enums\BaseEnumTrait;

enum PostVisibilityEnum: string
{
    use BaseEnumTrait;

    case Public = 'public';
    case Followers = 'followers';
    case Private = 'private';

    public function label(): string
    {
        return match ($this) {
            self::Public => 'Public',
            self::Followers => 'Followers',
            self::Private => 'Private',
        };
    }

    /**
     * Higher = more open. Used to cap repost visibility ≤ original.
     */
    public function opennessRank(): int
    {
        return match ($this) {
            self::Public => 2,
            self::Followers => 1,
            self::Private => 0,
        };
    }

    /**
     * Return the more restrictive of this visibility and $max.
     */
    public function capTo(self $max): self
    {
        return $this->opennessRank() <= $max->opennessRank() ? $this : $max;
    }
}
