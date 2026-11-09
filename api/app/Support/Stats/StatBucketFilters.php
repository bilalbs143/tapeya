<?php

namespace App\Support\Stats;

use App\Enums\Stats\StatCategoryEnum;
use App\Enums\Stats\StatsBucketEnum;
use App\Enums\Tournament\TournamentTypeEnum;
use InvalidArgumentException;

final class StatBucketFilters
{
    /**
     * Profile career filters. Accepts open_tournament | private_tournament | quick | all.
     *
     * @return array{
     *     statsBucket: StatsBucketEnum|null,
     *     tournamentTypeQuery: string
     * }
     */
    public static function fromProfileQuery(string $tournamentType = 'all'): array
    {
        return [
            'statsBucket' => self::parseStatsBucket($tournamentType, allowAll: true),
            'tournamentTypeQuery' => $tournamentType,
        ];
    }

    /**
     * Rankings filters — tournament types only (never quick).
     *
     * @return array{
     *     tournamentType: TournamentTypeEnum,
     *     tournamentTypeQuery: string
     * }
     */
    public static function fromRankingsQuery(string $tournamentType): array
    {
        if ($tournamentType === 'all' || $tournamentType === StatsBucketEnum::QUICK->value) {
            throw new InvalidArgumentException('tournament_type must be one of: open_tournament, private_tournament.');
        }

        $type = self::parseTournamentType($tournamentType, allowAll: false);
        if ($type === null) {
            throw new InvalidArgumentException('tournament_type must be one of: open_tournament, private_tournament.');
        }

        return [
            'tournamentType' => $type,
            'tournamentTypeQuery' => $tournamentType,
        ];
    }

    private static function parseStatsBucket(string $value, bool $allowAll): ?StatsBucketEnum
    {
        if ($value === 'all') {
            if (! $allowAll) {
                throw new InvalidArgumentException('tournament_type must be one of: open_tournament, private_tournament, quick.');
            }

            return null;
        }

        $enum = StatsBucketEnum::tryFrom($value);
        if ($enum === null) {
            throw new InvalidArgumentException('Invalid tournament_type. Use: open_tournament, private_tournament, quick, all.');
        }

        return $enum;
    }

    private static function parseTournamentType(string $value, bool $allowAll): ?TournamentTypeEnum
    {
        if ($value === 'all') {
            if (! $allowAll) {
                throw new InvalidArgumentException('tournament_type must be one of: open_tournament, private_tournament.');
            }

            return null;
        }

        $enum = TournamentTypeEnum::tryFrom($value);
        if ($enum === null) {
            throw new InvalidArgumentException('Invalid tournament_type. Use: open_tournament, private_tournament, all.');
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
}
