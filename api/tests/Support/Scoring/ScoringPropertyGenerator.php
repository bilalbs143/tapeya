<?php

namespace Tests\Support\Scoring;

use App\Enums\Event\DismissalTypeEnum;
use App\Enums\Event\NoBallRunsTypeEnum;
use App\Enums\Event\NoBallTypeEnum;
use App\Models\Ball;
use Tests\Support\Scoring\PlayerIds;

/**
 * Deterministic random innings builder for property-style scoring tests.
 *
 * Each seed produces a reproducible sequence of deliveries so failures are debuggable.
 */
final class ScoringPropertyGenerator
{
    /** @var list<string> */
    private const DELIVERY_KINDS = [
        'dot',
        'single',
        'four',
        'wide',
        'no_ball',
        'bye',
        'leg_bye',
    ];

    /**
     * @return array<string, array{0: int}>
     */
    public static function seedProvider(int $count = 250): array
    {
        $cases = [];
        for ($i = 0; $i < $count; $i++) {
            $cases["seed_{$i}"] = [$i + 1];
        }

        return $cases;
    }

    /**
     * @return list<Ball>
     */
    public static function buildInnings(int $seed, int $maxDeliveries = 24): array
    {
        mt_srand($seed);

        $balls = [];
        $striker = PlayerIds::STRIKER;
        $nonStriker = PlayerIds::NON_STRIKER;
        $incoming = PlayerIds::INCOMING;
        $wicketCount = 0;
        $maxWickets = 2;

        $n = mt_rand(4, $maxDeliveries);
        for ($i = 0; $i < $n; $i++) {
            $kind = self::DELIVERY_KINDS[mt_rand(0, count(self::DELIVERY_KINDS) - 1)];

            if ($kind === 'wide') {
                $balls[] = BallFactory::wide(mt_rand(1, 4), $striker);
                continue;
            }

            if ($kind === 'no_ball') {
                $balls[] = BallFactory::noBall(mt_rand(0, 2), $striker);
                continue;
            }

            if ($kind === 'bye') {
                $balls[] = BallFactory::bye(mt_rand(1, 3));
                continue;
            }

            if ($kind === 'leg_bye') {
                $balls[] = BallFactory::legBye(mt_rand(1, 2));
                continue;
            }

            if ($wicketCount < $maxWickets && mt_rand(0, 7) === 0) {
                $balls[] = BallFactory::wicket(DismissalTypeEnum::BOWLED, $striker);
                $balls[] = BallFactory::legal(0, $incoming, $nonStriker);
                $striker = $incoming;
                $incoming = PlayerIds::FOURTH;
                $wicketCount++;
                continue;
            }

            $runs = match ($kind) {
                'single' => 1,
                'four' => 4,
                default => 0,
            };

            $balls[] = BallFactory::legal($runs, $striker, $nonStriker);
        }

        return BallFactory::withPositions($balls);
    }

    /**
     * Invalid dismissal × delivery context matrix for HTTP / enum tests.
     *
     * @return array<string, array{
     *   0: DismissalTypeEnum,
     *   1: string,
     *   2: bool,
     *   3: string
     * }>
     */
    public static function invalidWicketContextMatrix(): array
    {
        $cases = [];
        $contexts = [
            'wide' => ['is_wide' => true, 'validator' => 'validOnWideDelivery'],
            'no_ball' => ['is_no_ball' => true, 'validator' => 'validOnNoBallDelivery'],
            'free_hit' => ['after_no_ball' => true, 'validator' => 'validOnFreeHit'],
        ];

        foreach (DismissalTypeEnum::cases() as $type) {
            foreach ($contexts as $contextName => $meta) {
                $valid = match ($meta['validator']) {
                    'validOnWideDelivery' => $type->validOnWideDelivery(),
                    'validOnNoBallDelivery' => $type->validOnNoBallDelivery(),
                    'validOnFreeHit' => $type->validOnFreeHit(),
                };

                if ($valid || $type === DismissalTypeEnum::RETIRED_HURT) {
                    continue;
                }

                $cases["{$type->value}_on_{$contextName}"] = [$type, $contextName, false, $meta['validator']];
            }
        }

        return $cases;
    }

    /**
     * Valid dismissal × delivery context matrix.
     *
     * @return array<string, array{0: DismissalTypeEnum, 1: string, 2: bool}>
     */
    public static function validWicketContextMatrix(): array
    {
        $cases = [];

        $map = [
            'wide' => fn (DismissalTypeEnum $t) => $t->validOnWideDelivery(),
            'no_ball' => fn (DismissalTypeEnum $t) => $t->validOnNoBallDelivery(),
            'free_hit' => fn (DismissalTypeEnum $t) => $t->validOnFreeHit(),
        ];

        foreach ($map as $context => $fn) {
            foreach (DismissalTypeEnum::cases() as $type) {
                if ($type === DismissalTypeEnum::RETIRED_HURT) {
                    continue;
                }
                if ($fn($type)) {
                    $cases["{$type->value}_valid_on_{$context}"] = [$type, $context, true];
                }
            }
        }

        return $cases;
    }

    public static function noBallPayloadExtras(): array
    {
        return [
            'is_no_ball' => true,
            'no_ball_type' => NoBallTypeEnum::OVER_FOOTED->value,
            'no_ball_runs_type' => NoBallRunsTypeEnum::FROM_BAT->value,
        ];
    }
}
