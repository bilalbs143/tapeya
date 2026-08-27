<?php

namespace App\Support\Stats;

use App\Enums\Event\CricketFormatEnum;
use App\Enums\Stats\StatCategoryEnum;
use App\Enums\Stats\StatsBucketEnum;
use App\Enums\Tournament\TournamentTypeEnum;
use InvalidArgumentException;

final class StatBucketFilters
{
    /**
     * Profile career filters. Accepts league | open_tournament | emerging | quick | all.
     * null statsBucket means "all tournament buckets" (excludes quick).
     *
     * @return array{
     *     statsBucket: StatsBucketEnum|null,
     *     cricketFormat: CricketFormatEnum|null,
     *     tournamentTypeQuery: string,
     *     cricketFormatQuery: string
     * }
     */
    public static function fromProfileQuery(string $tournamentType = 'all', string $cricketFormat = 'all'): array
    {
        return [
            'statsBucket' => self::parseStatsBucket($tournamentType, allowAll: true),
            'cricketFormat' => self::parseCricketFormat($cricketFormat, allowAll: true),
            'tournamentTypeQuery' => $tournamentType,
            'cricketFormatQuery' => $cricketFormat,
        ];
    }

    /**
     * Rankings filters — tournament types only (never quick).
     *
     * @return array{
     *     tournamentType: TournamentTypeEnum,
     *     cricketFormat: CricketFormatEnum|null,
     *     tournamentTypeQuery: string,
     *     cricketFormatQuery: string
     * }
     */
    public static function fromRankingsQuery(string $tournamentType, string $cricketFormat = 'all'): array
    {
        if ($tournamentType === 'all' || $tournamentType === StatsBucketEnum::QUICK->value) {
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

    private static function parseStatsBucket(string $value, bool $allowAll): ?StatsBucketEnum
    {
        if ($value === 'all') {
            if (! $allowAll) {
                throw new InvalidArgumentException('tournament_type must be one of: league, open_tournament, emerging, quick.');
            }

            return null;
        }

        $enum = StatsBucketEnum::tryFrom($value);
        if ($enum === null) {
            throw new InvalidArgumentException('Invalid tournament_type. Use: league, open_tournament, emerging, quick, all.');
        }

        return $enum;
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
