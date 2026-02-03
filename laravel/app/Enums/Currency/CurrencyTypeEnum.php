<?php

namespace App\Enums\Currency;

use App\Enums\BaseEnumTrait;

enum CurrencyTypeEnum: string
{
    use BaseEnumTrait;

    case FIAT = 'fiat';
    case COINS = 'coins';
    case STABLE_COINS = 'stablecoins';
    case TOKENS = 'tokens';

    public static function findByCode(string $code)
    {
        return match ($code) {
            'usd', 'eur', 'gbp', 'jpy', 'cad', 'aud', 'chf', 'cny', 'krw' => self::FIAT,
            'btc', 'eth', 'ltc', 'bch', 'xrp', 'ada', 'dot', 'sol', 'avax', 'matic', 'atom', 'xlm', 'xtz', 'algo', 'near', 'trx', 'vet', 'one', 'ftm' => self::COINS,
            'usdt', 'usdc', 'busd', 'dai', 'tusd', 'usdp', 'usdd', 'frax' => self::STABLE_COINS,
            default => self::TOKENS,
        };
    }

    public function priority()
    {
        return match ($this) {
            self::FIAT => 10,
            self::COINS => 20,
            self::STABLE_COINS => 30,
            self::TOKENS => 40,
            default => 50,
        };
    }
}
