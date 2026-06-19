<?php

namespace Tests\Unit\Services\Scoring;

use App\Enums\Event\DismissalTypeEnum;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\Support\Scoring\ScoringPropertyGenerator;

/**
 * Exhaustive law-combination matrix: which dismissals are valid on wide / no-ball / free-hit.
 */
class ScoringLawCombinationMatrixTest extends ScoringUnitTestCase
{
    /**
     * @return array<string, array{0: DismissalTypeEnum, 1: string, 2: bool}>
     */
    public static function validContextMatrixProvider(): array
    {
        return ScoringPropertyGenerator::validWicketContextMatrix();
    }

    /**
     * @return array<string, array{0: DismissalTypeEnum, 1: string, 2: bool, 3: string}>
     */
    public static function invalidContextMatrixProvider(): array
    {
        return ScoringPropertyGenerator::invalidWicketContextMatrix();
    }

    #[DataProvider('validContextMatrixProvider')]
    public function test_valid_dismissal_on_extra_delivery_context(
        DismissalTypeEnum $type,
        string $context,
        bool $valid,
    ): void {
        $this->assertTrue($valid);

        $result = match ($context) {
            'wide' => $type->validOnWideDelivery(),
            'no_ball' => $type->validOnNoBallDelivery(),
            'free_hit' => $type->validOnFreeHit(),
            default => false,
        };

        $this->assertTrue($result, "{$type->value} should be valid on {$context}");
    }

    #[DataProvider('invalidContextMatrixProvider')]
    public function test_invalid_dismissal_on_extra_delivery_context(
        DismissalTypeEnum $type,
        string $context,
        bool $valid,
        string $validator,
    ): void {
        $this->assertFalse($valid);

        $result = match ($validator) {
            'validOnWideDelivery' => $type->validOnWideDelivery(),
            'validOnNoBallDelivery' => $type->validOnNoBallDelivery(),
            'validOnFreeHit' => $type->validOnFreeHit(),
            default => true,
        };

        $this->assertFalse($result, "{$type->value} should be invalid on {$context}");
    }
}
