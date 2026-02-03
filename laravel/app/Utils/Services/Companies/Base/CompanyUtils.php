<?php

namespace App\Utils\Services\Companies\Base;

use App\Models\Game;
use Illuminate\Support\Str;

class CompanyUtils
{
    public static function cleanValue($value, $field): mixed
    {
        $value = is_string($value) ? trim($value) : $value;

        if (Str::startsWith($field, '!') && is_bool($value)) {
            return ! $value;
        }

        return $value;
    }

    public static function cleanField($field): mixed
    {
        if (Str::startsWith($field, '!')) {
            return str_replace('!', '', $field);
        }

        return $field;
    }

    public static function storeGames(array $games): void
    {
        foreach ($games as $game) {
            Game::updateOrCreate(
                ['game_id' => $game['game_id'], 'company_id' => $game['company_id'], 'provider_id' => $game['provider_id']],
                $game
            );
        }
    }
}
