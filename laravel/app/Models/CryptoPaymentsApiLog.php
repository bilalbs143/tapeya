<?php

namespace App\Models;

use App\Enums\CryptoPayments\PaymentGatewayEnum;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CryptoPaymentsApiLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'gateway',
        'endpoint',
        'method',
        'request_data',
        'response_data',
        'response_status',
        'user_id',
        'ip_address',
        'session_id',
        'type',
        'status',
        'error_message',
        'processing_time',
        'metadata',
    ];

    protected $casts = [
        'request_data' => 'json',
        'response_data' => 'json',
        'metadata' => 'json',
        'gateway' => PaymentGatewayEnum::class,
    ];

    public function scopeNowPayments($query)
    {
        return $query->where('gateway', PaymentGatewayEnum::NOWPAYMENTS);
    }

    public function scopeCryptoments($query)
    {
        return $query->where('gateway', PaymentGatewayEnum::CRYPTOMENTS);
    }

    public function scopeByGateway($query, PaymentGatewayEnum $gateway)
    {
        return $query->where('gateway', $gateway);
    }
}
