<?php

namespace App\Enums\CryptoPayments;

use App\Enums\BaseEnumTrait;

enum PaymentGatewayEnum: string
{
    use BaseEnumTrait;

    case NOWPAYMENTS = 'nowpayments';
    case CRYPTOMENTS = 'cryptoments';

    public function label(): string
    {
        return match ($this) {
            self::NOWPAYMENTS => 'NOWPayments',
            self::CRYPTOMENTS => 'Cryptoments',
        };
    }

    public function isActive(): bool
    {
        return match ($this) {
            self::NOWPAYMENTS => config('nowpayments.enabled', true),
            self::CRYPTOMENTS => config('cryptoments.enabled', true),
        };
    }
}
