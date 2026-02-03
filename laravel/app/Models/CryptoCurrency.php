<?php

namespace App\Models;

use App\Enums\CryptoPayments\PaymentGatewayEnum;
use App\Enums\Currency\CurrencyTypeEnum;
use App\Services\Payments\NowPayments\NowPaymentsUtils;
use Illuminate\Database\Eloquent\Casts\Attribute;

class CryptoCurrency extends BaseModel
{
    protected $fillable = [
        'code',
        'gateway',
        'name',
        'logo_url',
        'category',
        'enabled',
        'priority',
        'network',
        'is_maxlimit',
        'is_popular',
        'is_stable',
        'network_precision',
        'wallet_regex',
        'extra_data',
        'last_synced_at',
    ];

    protected $casts = [
        'enabled' => 'boolean',
        'is_maxlimit' => 'boolean',
        'is_popular' => 'boolean',
        'is_stable' => 'boolean',
        'network_precision' => 'integer',
        'priority' => 'integer',
        'extra_data' => 'array',
        'last_synced_at' => 'datetime',
        'category' => CurrencyTypeEnum::class,
        'gateway' => PaymentGatewayEnum::class,
    ];

    public function scopeEnabled($query)
    {
        return $query->where('enabled', true);
    }

    public function scopeByCategory($query, CurrencyTypeEnum $category)
    {
        return $query->where('category', $category);
    }

    public function scopeOrdered($query)
    {
        return $query->orderBy('priority')->orderBy('name');
    }

    public function scopePopular($query)
    {
        return $query->where('is_popular', true);
    }

    public function scopeStable($query)
    {
        return $query->where('is_stable', true);
    }

    public function scopeNowPayments($query)
    {
        return $query->where('gateway', PaymentGatewayEnum::NOWPAYMENTS);
    }

    public function scopeCryptoments($query)
    {
        return $query->where('gateway', PaymentGatewayEnum::CRYPTOMENTS);
    }

    public function logoUrl(): Attribute
    {
        return Attribute::make(
            get: function ($value) {
                if (empty($value)) {
                    return $value;
                }

                return NowPaymentsUtils::getIconUrl($value);
            }
        );
    }
}
