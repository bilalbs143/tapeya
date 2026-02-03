<?php

namespace App\Promotions;

use App\Enums\Promotion\PromotionTypeEnum;
use App\Promotions\Contracts\PromotionCalculatorInterface;
use InvalidArgumentException;

class PromotionCalculatorFactory
{
    /**
     * @var array<string, class-string<PromotionCalculatorInterface>>
     */
    protected array $calculators = [];

    public function __construct(array $calculators = [])
    {
        $this->calculators = $calculators;
    }

    public function register(PromotionTypeEnum $type, string $calculatorClass): void
    {
        $this->calculators[$type->value] = $calculatorClass;
    }

    public function forType(PromotionTypeEnum $type): PromotionCalculatorInterface
    {
        if (! array_key_exists($type->value, $this->calculators)) {
            throw new InvalidArgumentException("No promotion calculator registered for type [{$type->value}]");
        }

        return app($this->calculators[$type->value]);
    }
}

