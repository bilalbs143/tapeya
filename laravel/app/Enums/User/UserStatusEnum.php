<?php

namespace App\Enums\User;

use App\Enums\BaseEnumTrait;

enum UserStatusEnum: string
{
    use BaseEnumTrait;

    case ACTIVE = 'active';
    case APPROVED = 'approved';
    case REJECTED = 'rejected';
    case INACTIVE = 'inactive';
    case PENDING = 'pending';
    case BLOCK = 'block';

    public static function values(): array
    {
        $values = array_column(self::cases(), 'value');

        $values = array_filter($values, fn ($value) => $value !== self::PENDING->value);

        return array_values($values);
    }
}
