<?php

namespace Tests\Unit;

use App\Models\Ball;
use App\Support\BallDelivery\BallDeliveryPresenter;
use PHPUnit\Framework\TestCase;

class BallDeliveryPresenterTest extends TestCase
{
    public function test_fixture_cases_match_js_contract(): void
    {
        $path = dirname(__DIR__, 3).'/shared/ball-delivery/fixtures.json';
        $fixtures = json_decode((string) file_get_contents($path), true, 512, JSON_THROW_ON_ERROR);

        foreach ($fixtures['cases'] as $case) {
            $presented = BallDeliveryPresenter::present($case['input']);
            $expected = $case['expected'];

            foreach ($expected as $key => $value) {
                $this->assertSame(
                    $value,
                    $presented[$key] ?? null,
                    sprintf('Fixture "%s" failed on %s', $case['name'], $key),
                );
            }
        }
    }

    public function test_ball_model_to_delivery_shape(): void
    {
        $ball = new Ball([
            'runs' => 4,
            'runs_off_bat' => 4,
            'is_free_hit' => true,
            'over' => 4,
            'ball_in_over' => 2,
        ]);

        $delivery = BallDeliveryPresenter::toDelivery($ball);

        $this->assertSame('4', $delivery['display_token']);
        $this->assertTrue($delivery['is_free_hit']);
        $this->assertSame('boundary_four', $delivery['chip_type']);
        $this->assertSame(4, $delivery['over_number']);
        $this->assertSame(2, $delivery['ball_in_over']);
    }

    public function test_to_delivery_uses_null_over_when_unset(): void
    {
        $ball = new Ball([
            'runs' => 1,
            'runs_off_bat' => 1,
        ]);

        $delivery = BallDeliveryPresenter::toDelivery($ball);

        $this->assertNull($delivery['over_number']);
        $this->assertNull($delivery['ball_in_over']);
    }

    public function test_present_includes_full_wire_shape(): void
    {
        $presented = BallDeliveryPresenter::present([
            'runs' => 4,
            'runs_off_bat' => 4,
        ]);

        $this->assertArrayHasKey('display_token', $presented);
        $this->assertArrayHasKey('label', $presented);
        $this->assertArrayHasKey('chip_type', $presented);
        $this->assertArrayHasKey('variant', $presented);
        $this->assertArrayHasKey('is_legal', $presented);
        $this->assertSame('4', $presented['display_token']);
    }

    public function test_wide_wicket_combo_token(): void
    {
        $token = BallDeliveryPresenter::displayToken([
            'runs' => 3,
            'is_wicket' => true,
            'is_wide' => true,
            'dismissal_type' => 'stumped',
        ]);

        $this->assertSame('2WD+W', $token);
    }
}
