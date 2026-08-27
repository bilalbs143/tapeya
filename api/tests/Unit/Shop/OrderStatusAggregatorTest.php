<?php

namespace Tests\Unit\Shop;

use App\Enums\Shop\OrderStatusEnum;
use App\Services\Shop\OrderStatusAggregator;
use InvalidArgumentException;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\TestCase;

class OrderStatusAggregatorTest extends TestCase
{
    private OrderStatusAggregator $aggregator;

    protected function setUp(): void
    {
        parent::setUp();
        $this->aggregator = new OrderStatusAggregator;
    }

    public function test_empty_list_throws(): void
    {
        $this->expectException(InvalidArgumentException::class);
        $this->aggregator->fromVendorStatuses([]);
    }

    #[DataProvider('matrixProvider')]
    public function test_aggregator_matrix(array $inputs, OrderStatusEnum $expected): void
    {
        $this->assertSame(
            $expected,
            $this->aggregator->fromVendorStatuses($inputs)
        );
    }

    public static function matrixProvider(): array
    {
        return [
            'single cancelled' => [[OrderStatusEnum::CANCELLED], OrderStatusEnum::CANCELLED],
            'all cancelled' => [[OrderStatusEnum::CANCELLED, OrderStatusEnum::CANCELLED], OrderStatusEnum::CANCELLED],
            'single pending' => [[OrderStatusEnum::PENDING], OrderStatusEnum::PENDING],
            'all pending' => [[OrderStatusEnum::PENDING, OrderStatusEnum::PENDING], OrderStatusEnum::PENDING],
            'pending processing' => [[OrderStatusEnum::PENDING, OrderStatusEnum::PROCESSING], OrderStatusEnum::PROCESSING],
            'pending dispatched' => [[OrderStatusEnum::PENDING, OrderStatusEnum::DISPATCHED], OrderStatusEnum::PROCESSING],
            'pending delivered' => [[OrderStatusEnum::PENDING, OrderStatusEnum::DELIVERED], OrderStatusEnum::PROCESSING],
            'pending dispatched delivered' => [
                [OrderStatusEnum::PENDING, OrderStatusEnum::DISPATCHED, OrderStatusEnum::DELIVERED],
                OrderStatusEnum::PROCESSING,
            ],
            'processing' => [[OrderStatusEnum::PROCESSING], OrderStatusEnum::PROCESSING],
            'processing delivered' => [[OrderStatusEnum::PROCESSING, OrderStatusEnum::DELIVERED], OrderStatusEnum::PROCESSING],
            'dispatched' => [[OrderStatusEnum::DISPATCHED], OrderStatusEnum::DISPATCHED],
            'dispatched delivered' => [[OrderStatusEnum::DISPATCHED, OrderStatusEnum::DELIVERED], OrderStatusEnum::DISPATCHED],
            'delivered' => [[OrderStatusEnum::DELIVERED], OrderStatusEnum::DELIVERED],
            'delivered cancelled' => [[OrderStatusEnum::DELIVERED, OrderStatusEnum::CANCELLED], OrderStatusEnum::DELIVERED],
        ];
    }
}
