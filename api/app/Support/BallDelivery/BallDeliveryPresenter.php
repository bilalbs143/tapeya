<?php

namespace App\Support\BallDelivery;

use App\Models\Ball;

/**
 * Canonical ball chip / delivery presentation for organizer scoring, broadcast
 * graphics, and backoffice. JS mirror: shared/ball-delivery/core.js.
 */
final class BallDeliveryPresenter
{
    /**
     * @return array{
     *     display_token: string,
     *     label: string,
     *     chip_type: string,
     *     variant: string,
     *     is_free_hit: bool,
     *     show_free_hit_badge: bool,
     *     runs_total: int,
     *     is_legal: bool,
     *     over_number: int|null,
     *     ball_in_over: int|null
     * }
     */
    public static function present(Ball|array $raw, string $dotStyle = 'zero'): array
    {
        $ball = self::normalize($raw);
        $displayToken = self::buildDisplayToken($ball);
        $chipType = self::resolveChipType($ball, $displayToken);
        $variant = self::chipTypeToVariant($chipType);
        $label = $displayToken === '0' && $dotStyle === 'bullet' ? '•' : $displayToken;
        $isFreeHit = (bool) ($ball['is_free_hit'] ?? false);

        return [
            'display_token' => $displayToken,
            'label' => $label,
            'chip_type' => $chipType,
            'variant' => $variant,
            'is_free_hit' => $isFreeHit,
            'show_free_hit_badge' => $isFreeHit,
            'runs_total' => (int) ($ball['runs'] ?? 0)
                + (int) ($ball['penalty_runs'] ?? 0)
                + (int) ($ball['additional_runs'] ?? 0),
            'is_legal' => self::isLegalDelivery($ball),
            'over_number' => isset($ball['over_number']) ? (int) $ball['over_number'] : null,
            'ball_in_over' => isset($ball['ball_in_over']) ? (int) $ball['ball_in_over'] : null,
        ];
    }

    public static function displayToken(Ball|array $raw): string
    {
        return self::buildDisplayToken(self::normalize($raw));
    }

    /**
     * @return array{
     *     display_token: string,
     *     chip_type: string,
     *     is_free_hit: bool,
     *     runs_total: int,
     *     over_number: int,
     *     ball_in_over: int,
     *     is_legal: bool
     * }
     */
    public static function toDelivery(Ball $ball): array
    {
        $presented = self::present($ball);

        return [
            'display_token' => $presented['display_token'],
            'chip_type' => $presented['chip_type'],
            'is_free_hit' => $presented['is_free_hit'],
            'runs_total' => $presented['runs_total'],
            'over_number' => $presented['over_number'],
            'ball_in_over' => $presented['ball_in_over'],
            'is_legal' => $presented['is_legal'],
        ];
    }

    /**
     * @param  array<string, mixed>  $ball
     */
    public static function isPenaltyOnlyAward(array $ball): bool
    {
        $pr = (int) ($ball['penalty_runs'] ?? 0);
        if ($pr === 0 || ($ball['is_wicket'] ?? false)) {
            return false;
        }
        if (($ball['is_wide'] ?? false) || ($ball['is_no_ball'] ?? false)
            || ($ball['is_bye'] ?? false) || ($ball['is_leg_bye'] ?? false)) {
            return false;
        }
        if ((int) ($ball['additional_runs'] ?? 0) > 0) {
            return false;
        }

        return (int) ($ball['runs'] ?? 0) === 0;
    }

    /**
     * @param  array<string, mixed>  $ball
     */
    public static function isAdditionalRunsOnlyAward(array $ball): bool
    {
        $additional = (int) ($ball['additional_runs'] ?? 0);
        if ($additional <= 0 || ($ball['is_wicket'] ?? false)) {
            return false;
        }
        if (($ball['is_wide'] ?? false) || ($ball['is_no_ball'] ?? false)
            || ($ball['is_bye'] ?? false) || ($ball['is_leg_bye'] ?? false)) {
            return false;
        }
        if ((int) ($ball['penalty_runs'] ?? 0) > 0) {
            return false;
        }

        return (int) ($ball['runs'] ?? 0) === 0;
    }

    /**
     * @param  array<string, mixed>  $ball
     */
    public static function isLegalDelivery(array $ball): bool
    {
        if (self::isPenaltyOnlyAward($ball) || self::isAdditionalRunsOnlyAward($ball)) {
            return false;
        }
        if ($ball['dont_count_ball'] ?? false) {
            return false;
        }

        return ! ($ball['is_wide'] ?? false) && ! ($ball['is_no_ball'] ?? false);
    }

    public static function extraBallLabel(string $type, int $runs): string
    {
        return match ($type) {
            'wd' => ($extra = max(1, $runs) - 1) > 0 ? $extra.'WD' : 'WD',
            'nb' => ($extra = max(1, $runs) - 1) > 0 ? $extra.'NB' : 'NB',
            'bye' => $runs > 0 ? $runs.'B' : 'B',
            'lb' => $runs > 0 ? $runs.'LB' : 'LB',
            default => strtoupper($type),
        };
    }

    /**
     * @return array<string, mixed>
     */
    private static function normalize(Ball|array $raw): array
    {
        if ($raw instanceof Ball) {
            $dismissal = $raw->dismissal_type;

            return [
                'runs' => (int) ($raw->runs ?? 0),
                'runs_off_bat' => (int) ($raw->runs_off_bat ?? $raw->runs ?? 0),
                'is_wicket' => (bool) $raw->is_wicket,
                'is_wide' => (bool) $raw->is_wide,
                'is_no_ball' => (bool) $raw->is_no_ball,
                'is_bye' => (bool) $raw->is_bye,
                'is_leg_bye' => (bool) $raw->is_leg_bye,
                'is_free_hit' => (bool) $raw->is_free_hit,
                'penalty_runs' => (int) ($raw->penalty_runs ?? 0),
                'additional_runs' => (int) ($raw->additional_runs ?? 0),
                'dismissal_type' => $dismissal instanceof \BackedEnum ? $dismissal->value : $dismissal,
                'dont_count_ball' => (bool) $raw->dont_count_ball,
                'over_number' => $raw->over !== null ? (int) $raw->over : null,
                'ball_in_over' => $raw->ball_in_over !== null ? (int) $raw->ball_in_over : null,
            ];
        }

        $dismissal = $raw['dismissal_type'] ?? null;

        return [
            'runs' => (int) ($raw['runs'] ?? 0),
            'runs_off_bat' => (int) ($raw['runs_off_bat'] ?? $raw['runs'] ?? 0),
            'is_wicket' => (bool) ($raw['is_wicket'] ?? false),
            'is_wide' => (bool) ($raw['is_wide'] ?? false),
            'is_no_ball' => (bool) ($raw['is_no_ball'] ?? false),
            'is_bye' => (bool) ($raw['is_bye'] ?? false),
            'is_leg_bye' => (bool) ($raw['is_leg_bye'] ?? false),
            'is_free_hit' => (bool) ($raw['is_free_hit'] ?? false),
            'penalty_runs' => (int) ($raw['penalty_runs'] ?? 0),
            'additional_runs' => (int) ($raw['additional_runs'] ?? 0),
            'dismissal_type' => $dismissal instanceof \BackedEnum ? $dismissal->value : $dismissal,
            'dont_count_ball' => (bool) ($raw['dont_count_ball'] ?? false),
            'over_number' => isset($raw['over_number']) ? (int) $raw['over_number'] : null,
            'ball_in_over' => isset($raw['ball_in_over']) ? (int) $raw['ball_in_over'] : null,
        ];
    }

    /**
     * @param  array<string, mixed>  $ball
     */
    private static function buildDisplayToken(array $ball): string
    {
        $runs = (int) ($ball['runs'] ?? 0);
        $dismissal = $ball['dismissal_type'] ?? null;

        if ($ball['is_wicket'] ?? false) {
            return match ($dismissal) {
                'retired_hurt' => 'RH',
                'retired' => 'RO',
                'mankad' => 'M',
                'timed_out' => 'TO',
                default => ($ball['is_wide'] ?? false)
                    ? self::extraBallLabel('wd', $runs).'+W'
                    : (($ball['is_no_ball'] ?? false)
                        ? self::extraBallLabel('nb', $runs).'+W'
                        : 'W'),
            };
        }

        if (self::isPenaltyOnlyAward($ball)) {
            return 'P'.(int) ($ball['penalty_runs'] ?? 0);
        }

        if (self::isAdditionalRunsOnlyAward($ball)) {
            return '+'.(int) ($ball['additional_runs'] ?? 0);
        }

        if ($ball['is_wide'] ?? false) {
            return self::extraBallLabel('wd', $runs);
        }
        if ($ball['is_no_ball'] ?? false) {
            return self::extraBallLabel('nb', $runs);
        }
        if ($ball['is_bye'] ?? false) {
            return self::extraBallLabel('bye', $runs);
        }
        if ($ball['is_leg_bye'] ?? false) {
            return self::extraBallLabel('lb', $runs);
        }

        $rob = (int) ($ball['runs_off_bat'] ?? $runs);

        return match (true) {
            $rob === 4 => '4',
            $rob === 6 => '6',
            $rob > 0 => (string) $rob,
            default => '0',
        };
    }

    /**
     * @param  array<string, mixed>  $ball
     */
    private static function resolveChipType(array $ball, string $displayToken): string
    {
        if ($displayToken === 'W' || $displayToken === 'M' || str_ends_with($displayToken, '+W')) {
            return 'wicket';
        }
        if (in_array($displayToken, ['RH', 'RO', 'TO'], true)) {
            return 'retired';
        }
        if ($ball['is_wide'] ?? false) {
            return 'wide';
        }
        if ($ball['is_no_ball'] ?? false) {
            return 'no_ball';
        }
        if (self::isPenaltyOnlyAward($ball)) {
            return 'penalty';
        }
        if (($ball['is_bye'] ?? false) || ($ball['is_leg_bye'] ?? false) || self::isAdditionalRunsOnlyAward($ball)) {
            return 'other_extra';
        }

        $rob = (int) ($ball['runs_off_bat'] ?? $ball['runs'] ?? 0);

        return match (true) {
            $rob === 0 => 'dot',
            $rob === 4 => 'boundary_four',
            $rob === 6 => 'boundary_six',
            default => 'single',
        };
    }

    private static function chipTypeToVariant(string $chipType): string
    {
        return match ($chipType) {
            'dot' => 'dot',
            'boundary_four' => 'four',
            'boundary_six' => 'six',
            'wicket' => 'wicket',
            'retired' => 'retired',
            'wide', 'no_ball', 'other_extra', 'penalty' => 'extra',
            default => 'runs',
        };
    }
}
