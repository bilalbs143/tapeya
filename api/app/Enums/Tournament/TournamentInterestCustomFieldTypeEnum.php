<?php

namespace App\Enums\Tournament;

use App\Enums\BaseEnumTrait;

enum TournamentInterestCustomFieldTypeEnum: string
{
    use BaseEnumTrait;

    case TEXT = 'text';
    case SELECT = 'select';
    case FILE = 'file';

    public function label(): string
    {
        return match ($this) {
            self::TEXT => 'Text',
            self::SELECT => 'Dropdown',
            self::FILE => 'File',
        };
    }
}
