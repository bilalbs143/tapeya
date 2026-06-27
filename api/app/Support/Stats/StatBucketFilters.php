<?php

namespace App\Support\Stats;

use App\Enums\Event\CricketFormatEnum;
use App\Enums\Stats\StatCategoryEnum;
use App\Enums\Tournament\TournamentTypeEnum;
use InvalidArgumentException;

final class StatBucketFilters
{
    /**
     * @return array{
     *     tournamentType: TournamentTypeEnum|null,
     *     cricketFormat: CricketFormatEnum|null,
     *     tournamentTypeQuery: string,
     *     cricketFormatQuery: string
     * }
     */
    public static function fromProfileQuery(string $tournamentType = 'all', string $cricketFormat = 'all'): array
    {
        return [
            'tournamentType' => self::parseTournamentType($tournamentType, allowAll: true),
            'cricketFormat' => self::parseCricketFormat($cricketFormat, allowAll: true),
            'tournamentTypeQuery' => $tournamentType,
            'cricketFormatQuery' => $cricketFormat,
        ];
    }

    /**
     * @return array{
     *     tournamentType: TournamentTypeEnum,
     *     cricketFormat: CricketFormatEnum|null,
     *     tournamentTypeQuery: string,
     *     cricketFormatQuery: string
     * }
     */
    public static function fromRankingsQuery(string $tournamentType, string $cricketFormat = 'all'): array
    {
        if ($tournamentType === 'all') {
            throw new InvalidArgumentException('tournament_type must be one of: league, open_tournament, emerging.');
        }

        $type = self::parseTournamentType($tournamentType, allowAll: false);
        if ($type === null) {
            throw new InvalidArgumentException('tournament_type must be one of: league, open_tournament, emerging.');
        }

        return [
            'tournamentType' => $type,
            'cricketFormat' => self::parseCricketFormat($cricketFormat, allowAll: true),
            'tournamentTypeQuery' => $tournamentType,
            'cricketFormatQuery' => $cricketFormat,
        ];
    }

    private static function parseTournamentType(string $value, bool $allowAll): ?TournamentTypeEnum
    {
        if ($value === 'all') {
            if (! $allowAll) {
                throw new InvalidArgumentException('tournament_type must be one of: league, open_tournament, emerging.');
            }

            return null;
        }

        $enum = TournamentTypeEnum::tryFrom($value);
        if ($enum === null) {
            throw new InvalidArgumentException('Invalid tournament_type. Use: league, open_tournament, emerging, all.');
        }

        return $enum;
    }

    public static function parseCategory(string $value): StatCategoryEnum
    {
        $enum = StatCategoryEnum::tryFrom($value);
        if ($enum === null) {
            throw new InvalidArgumentException('category must be one of: '.implode(', ', StatCategoryEnum::values()).'.');
        }

        return $enum;
    }

    public static function parseCategoryOptional(?string $value, StatCategoryEnum $default): StatCategoryEnum
    {
        if ($value === null || $value === '') {
            return $default;
        }

        return self::parseCategory($value);
    }

    private static function parseCricketFormat(string $value, bool $allowAll): ?CricketFormatEnum
    {
        if ($value === 'all') {
            if (! $allowAll) {
                throw new InvalidArgumentException('Invalid cricket_format. Use a cricket format value or all.');
            }

            return null;
        }

        $enum = CricketFormatEnum::tryFrom($value);
        if ($enum === null) {
            throw new InvalidArgumentException('Invalid cricket_format. Use: hard_ball, tape_ball, tennis_ball, hard_tennis, all.');
        }

        return $enum;
    }
}
