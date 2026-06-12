<?php

namespace Tests\Unit\Services\Broadcast;

use App\Enums\Broadcast\GraphicCommandKeyEnum;
use App\Enums\Event\DismissalTypeEnum;
use App\Models\Ball;
use App\Services\Broadcast\ScoringFlashResolver;
use PHPUnit\Framework\Attributes\DataProvider;
use PHPUnit\Framework\TestCase;

class ScoringFlashResolverTest extends TestCase
{
    /**
     * @return array<string, array{0: array<string, mixed>, 1: list<string>}>
     */
    public static function resolveQueueProvider(): array
    {
        return [
            'dot' => [
                ['runs' => 0, 'runs_off_bat' => 0],
                [],
            ],
            'four off bat' => [
                ['runs' => 4, 'runs_off_bat' => 4],
                ['LT_FOUR'],
            ],
            'six off bat' => [
                ['runs' => 6, 'runs_off_bat' => 6],
                ['LT_SIX'],
            ],
            'wide' => [
                ['is_wide' => true, 'runs' => 1],
                ['LT_WIDE'],
            ],
            'wide + wicket' => [
                [
                    'is_wide' => true,
                    'is_wicket' => true,
                    'runs' => 1,
                    'dismissal_type' => DismissalTypeEnum::STUMPED,
                ],
                ['LT_WIDE', 'LT_OUT'],
            ],
            'no-ball only' => [
                ['is_no_ball' => true, 'runs' => 1],
                ['LT_NO_BALL'],
            ],
            'no-ball + 4' => [
                ['is_no_ball' => true, 'runs' => 5, 'runs_off_bat' => 4],
                ['LT_NO_BALL', 'LT_FOUR'],
            ],
            'no-ball + 6' => [
                ['is_no_ball' => true, 'runs' => 7, 'runs_off_bat' => 6],
                ['LT_NO_BALL', 'LT_SIX'],
            ],
            'no-ball + wicket' => [
                [
                    'is_no_ball' => true,
                    'is_wicket' => true,
                    'runs' => 1,
                    'dismissal_type' => DismissalTypeEnum::RUN_OUT,
                ],
                ['LT_NO_BALL', 'LT_OUT'],
            ],
            'clean wicket' => [
                [
                    'is_wicket' => true,
                    'runs' => 0,
                    'dismissal_type' => DismissalTypeEnum::CAUGHT,
                ],
                ['LT_OUT'],
            ],
            'run-out on four' => [
                [
                    'is_wicket' => true,
                    'runs' => 4,
                    'runs_off_bat' => 4,
                    'dismissal_type' => DismissalTypeEnum::RUN_OUT,
                ],
                ['LT_OUT'],
            ],
            'bye four' => [
                ['is_bye' => true, 'runs' => 4],
                [],
            ],
            'no-ball bye' => [
                ['is_no_ball' => true, 'is_bye' => true, 'runs' => 5],
                ['LT_NO_BALL'],
            ],
            'retired hurt' => [
                [
                    'is_wicket' => true,
                    'dismissal_type' => DismissalTypeEnum::RETIRED_HURT,
                ],
                [],
            ],
        ];
    }

    /**
     * @param  array<string, mixed>  $attrs
     * @param  list<string>  $expectedValues
     */
    #[DataProvider('resolveQueueProvider')]
    public function test_resolve_returns_expected_queue(array $attrs, array $expectedValues): void
    {
        $ball = new Ball($attrs);

        $queue = ScoringFlashResolver::resolve($ball);

        $this->assertSame(
            $expectedValues,
            array_map(fn (GraphicCommandKeyEnum $k) => $k->value, $queue),
        );
    }
}
