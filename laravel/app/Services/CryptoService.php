<?php

namespace App\Services;

use App\Enums\CryptoPayments\PaymentGatewayEnum;
use App\Enums\Currency\CurrencyTypeEnum;
use App\Enums\Transaction\ExchangeRequestStatusEnum;
use App\Enums\Transaction\ExchangeRequestViaEnum;
use App\Enums\Transaction\MoneyTypeEnum;
use App\Enums\Transaction\TransactionCategoryEnum;
use App\Enums\Transaction\TransactionSourceEnum;
use App\Enums\Transaction\TransactionTypeEnum;
use App\Http\Resources\v1\Crypto\CryptoCurrencyResource;
use App\Models\CryptoCurrency;
use App\Models\CryptoPaymentsApiLog;
use App\Models\ExchangeRequest;
use App\Models\Transaction;
use App\Models\User;
use App\Notifications\Admin\CryptoWithdrawalFailureNotification;
use App\Services\Payments\NowPayments\NowPaymentsUtils;
use App\Utils\Services\Utils;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Request;
use Illuminate\Support\Facades\Session;
use PragmaRX\Google2FA\Google2FA;

class CryptoService
{
    protected $baseUrl;

    protected $apiKey;

    protected $payoutApiKey;

    protected $jwtToken;

    protected $jwtExpiry;

    protected $mainWallet;

    public function __construct()
    {
        $this->baseUrl = NowPaymentsUtils::getBaseUrl();
        $this->apiKey = config('nowpayments.apiKey');
        $this->payoutApiKey = config('nowpayments.payoutApiKey') ?: config('nowpayments.apiKey');
        $this->mainWallet = config('nowpayments.mainWallet', 'usdt');
    }

    /**
     * Check if NOWPayments is properly configured
     */
    public function isConfigured(): bool
    {
        return ! empty($this->apiKey) && ! empty($this->baseUrl);
    }

    /**
     * Check if payout functionality is properly configured
     */
    public function isPayoutConfigured(): bool
    {
        return $this->isConfigured() && ! empty($this->payoutApiKey);
    }

    // ================================
    // BALANCE & CONVERSION MANAGEMENT
    // ================================

    /**
     * Get current balance from NOWPayments
     */
    public function getBalance(): array
    {
        try {
            $response = Http::withHeaders([
                'x-api-key' => $this->apiKey,
                'Accept' => 'application/json',
            ])->get($this->baseUrl.'/balance');

            // Log the API call
            $this->logNowpaymentsApiCall('/balance', 'GET', [], $response, 'validation');

            if ($response->successful()) {
                return [
                    'success' => true,
                    'data' => $response->json(),
                ];
            }

            $errorData = $response->json();

            return [
                'success' => false,
                'error' => $errorData['message'] ?? 'Failed to get balance',
            ];

        } catch (\Exception $e) {
            Log::error('NOWPayments balance error: '.$e->getMessage());

            return [
                'success' => false,
                'error' => 'Balance service temporarily unavailable',
            ];
        }
    }

    /**
     * Create conversion from Main Wallet to target currency
     */
    public function createConversion(float $amount, string $fromCurrency, string $toCurrency): array
    {
        try {
            $requestData = [
                'from_currency' => strtolower($fromCurrency),
                'to_currency' => strtolower($toCurrency),
                'amount' => $amount,
            ];

            $response = $this->makePayoutRequest('POST', '/conversion', $requestData);

            // Log the API call
            $this->logNowpaymentsApiCall('/conversion', 'POST', $requestData, $response, 'payout');

            if ($response->successful()) {
                $data = $response->json();

                return [
                    'success' => true,
                    'data' => $data['result'] ?? $data,
                    'conversion_id' => $data['result']['id'] ?? $data['id'] ?? null,
                    'status' => $data['result']['status'] ?? $data['status'] ?? 'WAITING',
                ];
            }

            $errorData = $response->json();

            return [
                'success' => false,
                'error' => $errorData['message'] ?? 'Failed to create conversion',
            ];

        } catch (\Exception $e) {
            Log::error('NOWPayments conversion creation error: '.$e->getMessage());

            return [
                'success' => false,
                'error' => 'Conversion service temporarily unavailable',
            ];
        }
    }

    // ================================
    // CURRENCY MANAGEMENT
    // ================================

    /**
     * Get available currencies from database (faster than API calls)
     */
    public function getCurrencies(): array
    {
        // Get all enabled currencies
        $allCurrencies = CryptoCurrency::enabled()
            ->ordered()
            ->get(['code', 'name', 'logo_url', 'category', 'is_popular', 'is_stable']);

        // Group by new categories: popular, stable, other
        $popularCurrencies = $allCurrencies->where('is_popular', true);
        $stableCurrencies = $allCurrencies->where('is_stable', true);
        $otherCurrencies = $allCurrencies->where('is_popular', false)->where('is_stable', false);

        $categorizedCurrencies = [
            // 'fiat' => CryptoCurrencyResource::collection($allCurrencies->where('category', CurrencyTypeEnum::FIAT)),
            'popular' => CryptoCurrencyResource::collection($popularCurrencies),
            'stable' => CryptoCurrencyResource::collection($stableCurrencies),
            'other' => CryptoCurrencyResource::collection($otherCurrencies),
        ];

        $allCurrencyCodes = $allCurrencies->pluck('code')->toArray();

        return [
            'success' => true,
            'currencies' => $categorizedCurrencies,
            'all_currencies' => $allCurrencyCodes,
            'total_count' => count($allCurrencyCodes),
        ];
    }

    /**
     * Format currency amounts for display
     */
    public function formatCurrency(float $amount, string $currency): string
    {
        return match (strtoupper($currency)) {
            'IDR', 'KRW' => number_format($amount, 0, '.', ','),
            'USD' => '$'.number_format($amount, 2),
            default => number_format($amount, 8).' '.strtoupper($currency)
        };
    }

    // ================================
    // NOWPAYMENTS API METHODS
    // ================================

    /**
     * Get minimum payment amount for a specific cryptocurrency (for deposits/payments only)
     */
    public function getMinimumAmount(string $currencyFrom, ?string $fiatCurrency = 'idr'): array
    {
        try {

            $params = [
                'currency_from' => strtolower($currencyFrom),
                'fiat_equivalent' => strtolower($fiatCurrency),
                'is_fee_paid_by_user' => 'true',
            ];

            $response = Http::withHeaders([
                'x-api-key' => $this->apiKey,
                'Accept' => 'application/json',
            ])->get($this->baseUrl.'/min-amount', $params);

            // Log the API call
            $this->logNowpaymentsApiCall('/min-amount', 'GET', $params, $response, 'validation');

            if ($response->successful()) {
                $data = $response->json();

                return [
                    'success' => true,
                    'currency_from' => $data['currency_from'] ?? $currencyFrom,
                    'currency_to' => $data['currency_to'] ?? $fiatCurrency,
                    'min_amount' => (float) ($data['min_amount'] ?? 0),
                    'fiat_equivalent' => (float) ($data['fiat_equivalent'] ?? 0),
                    'fiat_currency' => $fiatCurrency,
                ];
            }

            $errorData = $response->json();

            return [
                'success' => false,
                'error' => $errorData['message'] ?? 'Failed to get minimum amount',
            ];

        } catch (\Exception $e) {
            Log::error('NOWPayments minimum amount error: '.$e->getMessage());

            return [
                'success' => false,
                'error' => 'Minimum amount service temporarily unavailable',
            ];
        }
    }

    /**
     * Get minimum withdrawal amount for a specific cryptocurrency (for withdrawals/payouts only)
     * Also converts the crypto minimum to user's fiat currency
     */
    public function getMinimumWithdrawalAmount(string $currency, ?string $fiatCurrency = 'idr'): array
    {
        try {
            $response = $this->makePayoutRequest('GET', "/payout-withdrawal/min-amount/{$currency}");

            // Log the API call
            $this->logNowpaymentsApiCall("/payout-withdrawal/min-amount/{$currency}", 'GET', [
                'currency' => $currency,
            ], $response, 'validation');

            if ($response->successful()) {
                $data = $response->json();
                $cryptoMinAmount = (float) ($data['result'] ?? 0);

                // add 20% to the minimum crypto withdrawal amount to avoid rounding errors
                $cryptoMinAmount = $cryptoMinAmount * 1.20;
                $fiatMinAmount = 0;

                $exchangeRateResult = $this->getEstimatedExchangeRate($cryptoMinAmount, $currency, $fiatCurrency);

                if ($exchangeRateResult['success'] && isset($exchangeRateResult['estimated_amount'])) {
                    $fiatMinAmount = ceil($exchangeRateResult['estimated_amount']);
                    $result['fiat_min_amount'] = $fiatMinAmount;
                } else {
                    Log::warning('Failed to get exchange rate for minimum withdrawal amount', [
                        'currency' => $currency,
                        'crypto_amount' => $cryptoMinAmount,
                        'fiat_currency' => $fiatCurrency,
                        'exchange_error' => $exchangeRateResult['error'] ?? 'Unknown error',
                    ]);
                }

                return [
                    'success' => true,
                    'currency' => $currency,
                    'crypto_min_amount' => $cryptoMinAmount,
                    'fiat_currency' => $fiatCurrency,
                    'fiat_min_amount' => $fiatMinAmount,
                ];
            }

            $errorData = $response->json();

            return [
                'success' => false,
                'error' => $errorData['message'] ?? 'Failed to get minimum withdrawal amount',
            ];

        } catch (\Exception $e) {
            Log::error('NOWPayments minimum withdrawal amount error: '.$e->getMessage());

            return [
                'success' => false,
                'error' => 'Minimum withdrawal amount service temporarily unavailable',
            ];
        }
    }

    /**
     * Get withdrawal fee estimate for payout
     */
    public function getWithdrawalFeeEstimate(string $currency, float $amount): array
    {
        try {
            $response = $this->makePayoutRequest('GET', '/payout/fee?currency='.strtolower($currency).'&amount='.$amount);

            // Log the API call
            $this->logNowpaymentsApiCall('/payout/fee', 'GET', [
                'currency' => $currency,
                'amount' => $amount,
            ], $response, 'validation');

            if ($response->successful()) {
                $data = $response->json();

                return [
                    'success' => true,
                    'fee' => (float) ($data['fee'] ?? 0),
                ];
            }

            $errorData = $response->json();

            return [
                'success' => false,
                'error' => $errorData['message'] ?? 'Failed to get withdrawal fee estimate',
            ];

        } catch (\Exception $e) {
            Log::error('NOWPayments withdrawal fee estimation error: '.$e->getMessage());

            return [
                'success' => false,
                'error' => 'Withdrawal fee service temporarily unavailable',
            ];
        }
    }

    /**
     * Get estimated exchange rate for withdrawal amount (includes fee calculation for payouts)
     */
    public function getEstimatedExchangeRate(float $amount, string $currencyFrom, string $currencyTo, bool $isWithdrawal = false): array
    {
        try {
            // Use the correct API key for the estimate endpoint
            $response = Http::withHeaders([
                'x-api-key' => $this->apiKey,
                'Accept' => 'application/json',
            ])->get($this->baseUrl.'/estimate', [
                'amount' => $amount,
                'currency_from' => strtolower($currencyFrom),
                'currency_to' => strtolower($currencyTo),
            ]);

            // Log the API call
            $this->logNowpaymentsApiCall('/estimate', 'GET', [
                'amount' => $amount,
                'currency_from' => strtolower($currencyFrom),
                'currency_to' => strtolower($currencyTo),
                'is_withdrawal' => $isWithdrawal,
            ], $response, 'validation');

            if ($response->successful()) {
                $data = $response->json();
                $estimatedAmount = (float) ($data['estimated_amount'] ?? 0);
                $fee = 0;

                // For withdrawals, get fee and subtract from estimated amount
                if ($isWithdrawal && $estimatedAmount > 0) {
                    $feeResult = $this->getWithdrawalFeeEstimate($currencyTo, $estimatedAmount);

                    if ($feeResult['success']) {
                        $fee = $feeResult['fee'] ?? 0;
                    }
                }

                return [
                    'success' => true,
                    'currency_from' => $data['currency_from'] ?? $currencyFrom,
                    'amount_from' => $data['amount_from'] ?? $amount,
                    'currency_to' => $data['currency_to'] ?? $currencyTo,
                    'exchange_rate' => $estimatedAmount && $amount ? $estimatedAmount / $amount : 0,
                    'withdrawal_fee' => $fee,
                    'estimated_amount_before_fee' => $estimatedAmount,
                    'estimated_amount' => max(0, $estimatedAmount - $fee),

                ];
            }

            $errorData = $response->json();

            return [
                'success' => false,
                'error' => $errorData['message'] ?? 'Failed to get exchange rate estimate',
            ];

        } catch (\Exception $e) {
            Log::error('NOWPayments exchange rate estimation error: '.$e->getMessage());

            return [
                'success' => false,
                'error' => 'Exchange rate service temporarily unavailable',
            ];
        }
    }

    /**
     * Validate crypto address using NOWPayments API
     */
    public function validateAddress(string $address, string $currency): array
    {
        try {
            $response = $this->makePayoutRequest('POST', '/payout/validate-address', [
                'address' => $address,
                'currency' => strtolower($currency),
            ]);

            // Log the API call
            $this->logNowpaymentsApiCall('/payout/validate-address', 'POST', [
                'address' => $address,
                'currency' => strtolower($currency),
            ], $response, 'validation');

            if ($response->successful()) {
                $responseBody = trim($response->body());

                return [
                    'valid' => $responseBody === 'OK',
                    'address' => $address,
                    'currency' => $currency,
                    'api_response' => $responseBody,
                ];
            }

            $errorData = $response->json();

            return [
                'valid' => false,
                'address' => $address,
                'currency' => $currency,
                'api_response' => $errorData,
                'error_message' => $errorData['message'] ?? 'Address validation failed',
            ];

        } catch (\Exception $e) {
            Log::error('NOWPayments address validation error: '.$e->getMessage());

            return [
                'valid' => false,
                'address' => $address,
                'currency' => $currency,
                'error_message' => 'Address validation service temporarily unavailable',
            ];
        }
    }

    /**
     * Deposit via NOWPayments API
     */
    public function createDepositWallet(array $paymentData): array
    {
        try {
            $response = $this->makePaymentRequest('POST', '/payment', $paymentData);

            // Log the API call
            $this->logNowpaymentsApiCall('/payment', 'POST', $paymentData, $response, 'payment');

            if ($response->successful()) {
                return [
                    'success' => true,
                    'data' => $response->json(),
                ];
            }

            $errorData = $response->json();

            return [
                'success' => false,
                'error' => $errorData['message'] ?? 'Payment creation failed',
            ];

        } catch (\Exception $e) {
            Log::error('NOWPayments payment creation exception: '.$e->getMessage());

            // Log the exception
            $this->logNowpaymentsApiCall('/payment', 'POST', $paymentData, null, 'payment');

            return [
                'success' => false,
                'error' => 'Payment service temporarily unavailable',
            ];
        }
    }

    /**
     * Create pending exchange request for deposit
     */
    public function createDepositExchangeRequest(User $user, array $paymentData): ExchangeRequest
    {
        return ExchangeRequest::create([
            'type' => TransactionTypeEnum::DEPOSIT,
            'via' => ExchangeRequestViaEnum::CRYPTO,
            'gateway' => PaymentGatewayEnum::NOWPAYMENTS,
            'source' => TransactionSourceEnum::EXCHANGE_REQUEST,
            'requested_money' => $paymentData['price_amount'],
            'approved_money' => 0,
            'before_money' => $user->wallet->holding_money,
            'after_money' => $user->wallet->holding_money,
            'status' => ExchangeRequestStatusEnum::PENDING,
            'description' => "Now payment deposit pending - {$paymentData['pay_currency']}",
            'metadata' => $paymentData,
            'ip_address' => Utils::getClientIp(),
            'created_by' => $user->id,
        ]);
    }

    /**
     * Create a payout/withdrawal via NOWPayments API
     */
    public function createPayout(array $payoutData): array
    {
        try {
            $response = $this->makePayoutRequest('POST', '/payout', $payoutData);

            // Log the API call
            $this->logNowpaymentsApiCall('/payout', 'POST', $payoutData, $response, 'payout');

            if ($response->successful()) {
                return [
                    'success' => true,
                    'data' => $response->json(),
                ];
            }

            $errorData = $response->json();

            return [
                'success' => false,
                'error' => $errorData['message'] ?? 'Payout creation failed',
            ];

        } catch (\Exception $e) {
            Log::error('NOWPayments payout creation exception: '.$e->getMessage());

            // Log the exception
            $this->logNowpaymentsApiCall('/payout', 'POST', $payoutData, null, 'payout');

            return [
                'success' => false,
                'error' => 'Payout service temporarily unavailable',
            ];
        }
    }

    /**
     * Get payment status from database (no API calls)
     */
    public function getPaymentStatus(string $paymentId): array
    {
        try {
            // Get payment status from database instead of API call
            $transaction = Transaction::where('txn_id', $paymentId)->first();

            if (! $transaction) {
                return [
                    'success' => false,
                    'error' => 'Payment not found',
                ];
            }

            // Get the exchange request to determine status
            $exchangeRequest = $transaction->exchangeRequest;

            if (! $exchangeRequest) {
                return [
                    'success' => false,
                    'error' => 'Payment details not found',
                ];
            }

            return [
                'success' => true,
                'data' => [
                    'payment_id' => $paymentId,
                    'payment_status' => $exchangeRequest->status,
                    'amount' => $transaction->amount,
                    'currency' => 'IDR',
                    'created_at' => $transaction->created_at,
                    'updated_at' => $transaction->updated_at,
                ],
            ];

        } catch (\Exception $e) {
            Log::error('Payment status lookup error: '.$e->getMessage());

            return [
                'success' => false,
                'error' => 'Payment status lookup failed',
            ];
        }
    }

    /**
     * Get payout status
     */
    public function getPayoutStatus(string $payoutId): array
    {
        try {
            $response = $this->makePayoutRequest('GET', "/payout/{$payoutId}");

            // Log the API call
            $this->logNowpaymentsApiCall("/payout/{$payoutId}", 'GET', ['payout_id' => $payoutId], $response, 'payout');

            if ($response->successful()) {
                return [
                    'success' => true,
                    'data' => $response->json(),
                ];
            }

            return [
                'success' => false,
                'error' => 'Payout not found',
            ];

        } catch (\Exception $e) {
            Log::error('NOWPayments payout status error: '.$e->getMessage());

            // Log the exception
            $this->logNowpaymentsApiCall("/payout/{$payoutId}", 'GET', ['payout_id' => $payoutId], null, 'payout');

            return [
                'success' => false,
                'error' => 'Payout status service temporarily unavailable',
            ];
        }
    }

    /**
     * Validate webhook signature
     */
    public function validateWebhookSignature(string $payload, string $signature, bool $isPayout = false): bool
    {
        $secret = $isPayout
            ? config('nowpayments.payoutIpnSecret')
            : config('nowpayments.ipnSecret');

        if (empty($secret)) {
            Log::warning('NOWPayments webhook secret not configured');

            return false;
        }

        $expectedSignature = hash_hmac('sha512', $payload, $secret);

        return hash_equals($expectedSignature, $signature);
    }

    // ================================
    // CRYPTO WITHDRAWAL FUNCTIONALITY
    // ================================

    /**
     * Validate withdrawal request
     */
    public function validateWithdrawalRequest(User $user, float $requestedAmount, string $address, string $currency): array
    {
        $availableBalance = $user->wallet->holding_money;
        if ($requestedAmount > $availableBalance) {
            return [
                'valid' => false,
                'message' => 'Insufficient balance. Available: '.number_format($availableBalance, 0).' IDR, Requested: '.number_format($requestedAmount, 0).' IDR',
                'available_balance' => $availableBalance,
                'requested_amount' => $requestedAmount,
            ];
        }

        // need discussion on it
        //         $isRequestAlreadyPending = ExchangeRequest::pending()->where('type', TransactionTypeEnum::CRYPTO_WITHDRAW)->whereBelongsTo($user, 'creator')->exists();
        //
        //         if ($isRequestAlreadyPending) {
        //             return [
        //                 'valid' => false,
        //                 'message' => 'You have a pending crypto withdrawal request. Please wait for it to complete before submitting a new one.',
        //             ];
        //         }

        // Validate withdrawal address with NOWPayments API
        $addressValidation = $this->validateAddress($address, $currency);

        if (! $addressValidation['valid']) {
            $errorMessage = 'Invalid withdrawal address';
            if (isset($addressValidation['error_message'])) {
                $errorMessage .= ': '.$addressValidation['error_message'];
            }

            return [
                'valid' => false,
                'message' => $errorMessage,
            ];
        }

        return ['valid' => true];
    }

    /**
     * Create crypto withdrawal request
     */
    public function createWithdrawalRequest(User $user, array $withdrawalData): array
    {
        try {
            // Create withdrawal order ID
            $orderId = "crypto_withdraw_{$user->id}_".time();

            // Create exchange request for crypto withdrawal
            $exchangeRequest = ExchangeRequest::create([
                'type' => TransactionTypeEnum::WITHDRAW,
                'via' => ExchangeRequestViaEnum::CRYPTO,
                'gateway' => PaymentGatewayEnum::NOWPAYMENTS,
                'source' => TransactionSourceEnum::EXCHANGE_REQUEST,
                'requested_money' => $withdrawalData['requested_money'],
                'approved_money' => 0,
                'before_money' => $user->wallet->holding_money,
                'after_money' => $user->wallet->holding_money,
                'status' => ExchangeRequestStatusEnum::PENDING,
                'description' => "Crypto withdrawal to {$withdrawalData['withdrawal_address']}",
                'metadata' => [
                    'currency' => $withdrawalData['currency'],
                    'withdrawal_address' => $withdrawalData['withdrawal_address'],
                    'request_amount' => $withdrawalData['requested_money'],
                    'request_currency' => $user->currency,
                    'order_id' => $orderId,
                    'crypto_amount' => $withdrawalData['crypto_amount'] ?? 0,
                    'status' => ExchangeRequestStatusEnum::PENDING,
                    'created_at' => now()->toISOString(),
                ],
                'ip_address' => $withdrawalData['ip_address'] ?? null,
            ]);

            Log::info('Crypto withdrawal request created, queued for processing', [
                'user_id' => $user->id,
                'exchange_request_id' => $exchangeRequest->id,
                'amount' => $withdrawalData['requested_money'],
                'currency' => $withdrawalData['currency'],
            ]);

            return [
                'success' => true,
                'message' => 'Crypto withdrawal request created successfully and queued for processing.',
                'withdrawal' => [
                    'order_id' => $orderId,
                    'exchange_request_id' => $exchangeRequest->id,
                    'withdraw_amount' => $withdrawalData['requested_money'], // Always use fiat amount
                    'status' => ExchangeRequestStatusEnum::PENDING,
                ],
            ];

        } catch (\Exception $e) {
            Log::error('Crypto withdrawal creation error: '.$e->getMessage(), [
                'user_id' => $user->id,
                'withdrawal_data' => $withdrawalData,
                'trace' => $e->getTraceAsString(),
            ]);

            // Send notification to admin about the exception
            $this->notifyAdminOfWithdrawalFailure(
                $withdrawalData,
                $user,
                'exception_occurred',
                $e->getMessage(),
                [
                    'exception_trace' => $e->getTraceAsString(),
                    'file' => $e->getFile(),
                    'line' => $e->getLine(),
                ]
            );

            return [
                'success' => false,
                'message' => 'Failed to create crypto withdrawal. Please try again later.',
            ];
        }
    }

    /**
     * Process pending crypto withdrawals (called by cron job)
     */
    public function processPendingWithdrawals(): array
    {
        try {
            $pendingWithdrawals = ExchangeRequest::where('type', TransactionTypeEnum::WITHDRAW)
                ->nowpayments()
                ->where('via', ExchangeRequestViaEnum::CRYPTO)
                ->where('status', ExchangeRequestStatusEnum::PENDING)
                ->with('creator')
                ->orderBy('created_at', 'asc')
                ->get();

            if ($pendingWithdrawals->isEmpty()) {
                return [
                    'success' => true,
                    'message' => 'No pending crypto withdrawals found.',
                    'processed_count' => 0,
                ];
            }

            Log::info('Starting processing of pending crypto withdrawals', [
                'count' => $pendingWithdrawals->count(),
            ]);

            $processedCount = 0;
            $conversionCount = 0;
            $errors = [];

            foreach ($pendingWithdrawals as $withdrawal) {
                try {
                    $this->processSingleWithdrawal($withdrawal);
                    $processedCount++;
                } catch (\Exception $e) {
                    $errorData = [
                        'exchange_request_id' => $withdrawal->id,
                        'user_id' => $withdrawal->creator?->id,
                        'error' => $e->getMessage(),
                    ];

                    $errors[] = $errorData;

                    Log::error('Failed to process crypto withdrawal', $errorData);
                }
            }

            return [
                'success' => true,
                'message' => "Processed {$processedCount} crypto withdrawals.",
                'processed_count' => $processedCount,
                'total_count' => $pendingWithdrawals->count(),
                'errors' => $errors,
            ];

        } catch (\Exception $e) {
            Log::error('Failed to process pending crypto withdrawals: '.$e->getMessage());

            return [
                'success' => false,
                'error' => 'Failed to process pending crypto withdrawals: '.$e->getMessage(),
            ];
        }
    }

    /**
     * Process a single withdrawal
     */
    protected function processSingleWithdrawal(ExchangeRequest $withdrawal): void
    {
        $metadata = $withdrawal->metadata;
        $user = $withdrawal->creator;

        if (! $user) {
            throw new \Exception("User not found for withdrawal {$withdrawal->id}");
        }

        $currency = $metadata['currency'] ?? null; // crypto currency - usdtarb, ada, ltc
        $withdrawalAddress = $metadata['withdrawal_address'] ?? null; // user's withdrawal wallet address
        $requestAmount = $metadata['request_amount'] ?? 0; // fiat amount - idr

        if (! $currency || ! $withdrawalAddress) {
            throw new \Exception('Invalid withdrawal metadata');
        }

        $requestAmount = $requestAmount * 1.10;
        $estimatedAmount = $this->getEstimatedExchangeRate($requestAmount, $user->currency, $currency);
        $cryptoAmount = $estimatedAmount['estimated_amount'] ?? 0;

        // Check our current balance for this currency
        $balanceResult = $this->getBalance();
        $currentBalance = 0;

        if ($balanceResult['success']) {
            $balances = $balanceResult['data'];
            $currentBalance = (float) ($balances[$currency]['amount'] ?? 0);
        }

        // Check if we need to convert from main wallet
        if ($currentBalance < $cryptoAmount) {
            $exchangeResult = $this->getEstimatedExchangeRate($requestAmount, $user->currency, $this->mainWallet);

            $conversionResult = $this->createConversion($exchangeResult['estimated_amount'], $this->mainWallet, $currency);

            if (! $conversionResult['success']) {
                throw new \Exception("Failed to convert USDT to {$currency}: ".($conversionResult['error'] ?? 'Unknown error'));
            }

            // Skip this withdrawal for next run - conversion will be checked later
            return;
        }

        // Sufficient balance - create payout request
        $this->processPayoutRequest($withdrawal);
    }

    /**
     * Create the actual payout request
     */
    protected function processPayoutRequest(ExchangeRequest $request): void
    {
        $user = $request->creator;
        $metadata = $request->metadata;

        $orderId = $metadata['order_id'] ?? "crypto_withdraw_{$user->id}_".time();

        $payoutData = $this->buildPayoutData(
            $metadata['withdrawal_address'],
            $metadata['currency'],
            $metadata['crypto_amount'] ?? 0,
            route('user.payments.crypto-withdrawal-webhook'),
            $orderId,
            $metadata['request_amount'],
            $metadata['request_currency']
        );

        $withdrawal = $this->createPayout($payoutData);

        if (! $withdrawal['success']) {
            // Send comprehensive failure notification to admin
            $this->notifyAdminOfWithdrawalFailure(
                $metadata,
                $user,
                'payout_creation_failed',
                $withdrawal['error'],
                ['nowpayments_response' => $withdrawal['data'] ?? null]
            );
        }

        $withdrawalInfo = $withdrawal['data']['withdrawals'][0] ?? [];
        $batchWithdrawalId = $withdrawal['data']['id'] ?? null;

        Log::info('Attempting automatic 2FA verification for payout', ['batch_id' => $batchWithdrawalId]);
        $verificationResult = $this->verifyPayoutAutomatically($batchWithdrawalId);

        if ($verificationResult['success']) {
            $finalStatus = ExchangeRequestStatusEnum::VERIFIED;
            $request->update(['status' => $finalStatus, 'metadata' => $withdrawalInfo]);

            Log::info('Payout automatically verified successfully', ['batch_id' => $batchWithdrawalId]);
        } else {
            $finalStatus = ExchangeRequestStatusEnum::PENDING_VERIFICATION;
            $requiresVerification = true;
            Log::warning('Automatic verification failed, manual verification required', [
                'batch_id' => $batchWithdrawalId,
                'error' => $verificationResult['error'] ?? 'Unknown error',
            ]);

            // Send notification to admin about verification failure
            $this->notifyAdminOfWithdrawalFailure(
                $withdrawalInfo,
                $user,
                'verification_failed',
                $verificationResult['error'] ?? 'Unknown verification error',
                [
                    'batch_withdrawal_id' => $batchWithdrawalId,
                    'verification_result' => $verificationResult,
                ]
            );
        }
    }

    /**
     * Get withdrawal status
     */
    public function getWithdrawalStatus(User $user, string $withdrawalId): array
    {
        try {
            // Find exchange request by withdrawal ID
            $exchangeRequest = ExchangeRequest::whereBelongsTo($user, 'creator')
                ->nowpayments()
                ->where('type', TransactionTypeEnum::WITHDRAW)
                ->where('via', ExchangeRequestViaEnum::CRYPTO)
                ->whereJsonContains('metadata->withdrawal_id', $withdrawalId)
                ->first();

            if (! $exchangeRequest) {
                return [
                    'success' => false,
                    'message' => 'Withdrawal not found',
                ];
            }

            // Get status from NOWPayments if withdrawal ID is available
            $withdrawalStatus = 'pending';
            $metadata = $exchangeRequest->metadata;

            if (isset($metadata['withdrawal_id'])) {
                $statusResponse = $this->getPayoutStatus($metadata['withdrawal_id']);
                if ($statusResponse['success'] && isset($statusResponse['data']['status'])) {
                    $withdrawalStatus = $statusResponse['data']['status'];
                }
            }

            return [
                'success' => true,
                'status' => [
                    'withdrawal_status' => $withdrawalStatus,
                    'exchange_request_status' => $exchangeRequest->status,
                    'withdrawal_id' => $metadata['withdrawal_id'] ?? null,
                    'amount' => $exchangeRequest->requested_money,
                ],
            ];

        } catch (\Exception $e) {
            Log::error('Crypto withdrawal status error: '.$e->getMessage());

            return [
                'success' => false,
                'message' => 'Failed to get withdrawal status',
            ];
        }
    }

    /**
     * Process withdrawal webhook
     */
    public function processWithdrawalWebhook(array $withdrawalData): array
    {
        try {
            // Find exchange request by withdrawal ID or extra_id
            $exchangeRequest = null;

            if (isset($withdrawalData['id'])) {
                $exchangeRequest = ExchangeRequest::where('type', TransactionTypeEnum::WITHDRAW)
                    ->nowpayments()
                    ->where('via', ExchangeRequestViaEnum::CRYPTO)
                    ->whereJsonContains('metadata->id', $withdrawalData['id'])
                    ->first();
            }

            if (! $exchangeRequest) {
                Log::error('Exchange request not found for withdrawal webhook', $withdrawalData);

                return ['status' => 'ok', 'message' => 'Exchange request not found'];
            }

            // Update exchange request based on withdrawal status
            switch (strtolower($withdrawalData['status'])) {
                case 'finished':
                    $this->handleSuccessfulWithdrawal($exchangeRequest, $withdrawalData);
                    break;
                case 'failed':
                case 'expired':
                case 'cancelled':
                case 'rejected':
                    $this->handleFailedWithdrawal($exchangeRequest, $withdrawalData);
                    break;
                default:
                    // Update metadata with latest status
                    $metadata = $exchangeRequest->metadata;
                    $metadata['latest_status'] = $withdrawalData['status'];
                    $exchangeRequest->update(['metadata' => $metadata]);
                    break;
            }

            return ['status' => 'ok', 'message' => 'Webhook processed successfully'];

        } catch (\Exception $e) {
            Log::error('Crypto withdrawal webhook processing error: '.$e->getMessage());

            return ['status' => 'error', 'message' => 'Webhook processing failed'];
        }
    }

    /**
     * Handle successful withdrawal
     */
    private function handleSuccessfulWithdrawal(ExchangeRequest $exchangeRequest, array $withdrawalData): void
    {
        DB::transaction(function () use ($exchangeRequest, $withdrawalData) {
            $user = $exchangeRequest->creator;

            // Prevent duplicate processing
            if ($exchangeRequest->status === ExchangeRequestStatusEnum::APPROVED) {
                Log::info('Crypto withdrawal already processed', ['exchange_request_id' => $exchangeRequest->id]);

                return;
            }

            $transaction = Transaction::createTransaction(
                type: TransactionTypeEnum::WITHDRAW,
                amount: $exchangeRequest->requested_money,
                moneyType: MoneyTypeEnum::MONEY,
                user: $user,
                exchangeRequest: $exchangeRequest,
                source: TransactionSourceEnum::CRYPTO,
                category: TransactionCategoryEnum::MONEY_WITHDRAWAL,
                memo: "Crypto withdrawal completed - {$withdrawalData['currency']}",
                txnId: $withdrawalData['id'],
            );

            $user->wallet->refresh();

            $exchangeRequest->approve(ExchangeRequestStatusEnum::APPROVED, [
                'approved_money' => $exchangeRequest->requested_money,
                'after_money' => $user->wallet->holding_money,
                'approved_by' => $user->id,
                'updated_by' => $user->id,
                'metadata' => $withdrawalData,
            ], cb: fn (ExchangeRequest $record) => $record->afterApprove($transaction));
        });
    }

    /**
     * Handle failed withdrawal
     */
    private function handleFailedWithdrawal(ExchangeRequest $exchangeRequest, array $withdrawalData): void
    {
        $metadata = $exchangeRequest->metadata;
        $metadata['latest_status'] = $withdrawalData['status'];

        $exchangeRequest->update([
            'status' => 'rejected',
            'rejected_at' => now(),
            'rejected_by' => 1, // System user
            'description' => $exchangeRequest->description.' - Failed: '.($withdrawalData['status'] ?? 'Unknown'),
            'metadata' => $withdrawalData,
        ]);
    }

    // ================================
    // DATA BUILDERS
    // ================================

    /**
     * Build payout data structure for withdrawal
     */
    public function buildPayoutData(string $address, string $currency, float $amount, string $callbackUrl, string $orderId, ?float $fiatAmount = null, ?string $fiatCurrency = null): array
    {
        $payoutData = [
            'withdrawals' => [
                [
                    'address' => $address,
                    'amount' => $amount,
                    'currency' => strtolower($currency),
                    'ipn_callback_url' => $callbackUrl,
                    'fiat_amount' => $fiatAmount,
                    'fiat_currency' => $fiatCurrency,
                ],
            ],
        ];

        return $payoutData;
    }

    /**
     * Build payment data structure
     */
    public function buildPaymentData(
        float $priceAmount,
        string $priceCurrency,
        string $payCurrency,
        string $orderId,
        string $description,
        ?string $callbackUrl = null
    ): array {
        $paymentData = [
            'price_amount' => $priceAmount,
            'price_currency' => $priceCurrency,
            'pay_currency' => $payCurrency,
            'order_id' => $orderId,
            'order_description' => $description,
            // 'fixed_rate' => true,
            'is_fee_paid_by_user' => false,
        ];

        // Add callback URL if provided and valid
        if ($callbackUrl && filter_var($callbackUrl, FILTER_VALIDATE_URL) &&
            ! str_contains($callbackUrl, 'localhost') &&
            ! str_contains($callbackUrl, '127.0.0.1')) {
            $paymentData['ipn_callback_url'] = $callbackUrl;
        }

        return $paymentData;
    }

    // ================================
    // HTTP CLIENT METHODS
    // ================================

    /**
     * Make HTTP request for payment-related endpoints
     */
    protected function makePaymentRequest(string $method, string $endpoint, array $data = [])
    {
        $headers = [
            'x-api-key' => $this->apiKey,
            'Accept' => 'application/json',
        ];

        if (in_array($method, ['POST', 'PUT', 'PATCH'])) {
            $headers['Content-Type'] = 'application/json';
        }

        $httpClient = Http::withHeaders($headers);

        return match (strtoupper($method)) {
            'GET' => $httpClient->get($this->baseUrl.$endpoint),
            'POST' => $httpClient->post($this->baseUrl.$endpoint, $data),
            'PUT' => $httpClient->put($this->baseUrl.$endpoint, $data),
            'PATCH' => $httpClient->patch($this->baseUrl.$endpoint, $data),
            'DELETE' => $httpClient->delete($this->baseUrl.$endpoint),
            default => throw new \InvalidArgumentException("Unsupported HTTP method: {$method}")
        };
    }

    /**
     * Generate 2FA code automatically using the secret
     */
    protected function generate2FACode(): ?string
    {
        try {
            $secret = config('nowpayments.twoFactorSecret');

            if (empty($secret)) {
                Log::error('NOWPayments 2FA secret not configured');

                return null;
            }

            $google2fa = new Google2FA;

            return $google2fa->getCurrentOtp($secret);
        } catch (\Exception $e) {
            Log::error('Failed to generate 2FA code: '.$e->getMessage());

            return null;
        }
    }

    /**
     * Authenticate with NOWPayments to get JWT token
     */
    protected function authenticateForPayout(): bool
    {
        try {
            // Check if token is still valid (with 1 minute buffer)
            if ($this->jwtToken && $this->jwtExpiry && $this->jwtExpiry > now()->addMinute()) {
                return true;
            }

            $email = config('nowpayments.email') ?: config('nowpayments.payoutEmail');
            $password = config('nowpayments.password') ?: config('nowpayments.payoutPassword');

            if (empty($email) || empty($password)) {
                Log::error('NOWPayments email/password not configured for authentication');

                return false;
            }

            $response = Http::withHeaders([
                'x-api-key' => $this->payoutApiKey,
                'Content-Type' => 'application/json',
            ])->post($this->baseUrl.'/auth', [
                'email' => $email,
                'password' => $password,
            ]);

            // Log the authentication API call
            $this->logNowpaymentsApiCall('/auth', 'POST', [
                'email' => $email,
                'password' => '***hidden***',
            ], $response, 'verification');

            if ($response->successful()) {
                $data = $response->json();
                $this->jwtToken = $data['token'] ?? null;

                if ($this->jwtToken) {
                    // JWT tokens typically expire in 5 minutes
                    $this->jwtExpiry = now()->addMinutes(4); // 1 minute buffer
                    Log::info('NOWPayments JWT authentication successful');

                    return true;
                }
            }

            Log::error('NOWPayments JWT authentication failed', [
                'status' => $response->status(),
                'response' => $response->body(),
            ]);

            return false;

        } catch (\Exception $e) {
            Log::error('NOWPayments JWT authentication exception: '.$e->getMessage());

            return false;
        }
    }

    /**
     * Verify payout with 2FA code (automatic)
     */
    public function verifyPayoutAutomatically(string $batchWithdrawalId): array
    {
        $verificationCode = $this->generate2FACode();

        if (! $verificationCode) {
            return [
                'success' => false,
                'error' => '2FA code generation failed. Please configure NOWPAYMENTS_2FA_SECRET.',
            ];
        }

        return $this->verifyPayout($batchWithdrawalId, $verificationCode);
    }

    /**
     * Verify payout with 2FA code
     */
    public function verifyPayout(string $batchWithdrawalId, string $verificationCode): array
    {
        try {
            if (! $this->authenticateForPayout()) {
                return [
                    'success' => false,
                    'error' => 'Authentication failed',
                ];
            }

            $response = $this->makePayoutRequest('POST', "/payout/{$batchWithdrawalId}/verify", [
                'verification_code' => $verificationCode,
            ]);

            // Log the API call
            $this->logNowpaymentsApiCall("/payout/{$batchWithdrawalId}/verify", 'POST', [
                'batch_withdrawal_id' => $batchWithdrawalId,
                'verification_code' => $verificationCode,
            ], $response, 'verification');

            if ($response->successful()) {
                return [
                    'success' => true,
                    'data' => $response->json(),
                ];
            }

            $errorData = $response->json();

            return [
                'success' => false,
                'error' => $errorData['message'] ?? 'Verification failed',
            ];

        } catch (\Exception $e) {
            Log::error('NOWPayments payout verification error: '.$e->getMessage());

            // Log the exception
            $this->logNowpaymentsApiCall("/payout/{$batchWithdrawalId}/verify", 'POST', [
                'batch_withdrawal_id' => $batchWithdrawalId,
                'verification_code' => $verificationCode,
            ], null, 'verification');

            return [
                'success' => false,
                'error' => 'Verification service temporarily unavailable',
            ];
        }
    }

    /**
     * Make HTTP request for payout-related endpoints
     */
    protected function makePayoutRequest(string $method, string $endpoint, array $data = [])
    {
        // Authenticate and get JWT token if needed
        if (! $this->authenticateForPayout()) {
            throw new \Exception('NOWPayments authentication failed');
        }

        $headers = [
            'x-api-key' => $this->payoutApiKey,
            'Authorization' => 'Bearer '.$this->jwtToken,
            'Accept' => 'application/json',
        ];

        if (in_array($method, ['POST', 'PUT', 'PATCH'])) {
            $headers['Content-Type'] = 'application/json';
        }

        $httpClient = Http::withHeaders($headers);

        return match (strtoupper($method)) {
            'GET' => $httpClient->get($this->baseUrl.$endpoint),
            'POST' => $httpClient->post($this->baseUrl.$endpoint, $data),
            'PUT' => $httpClient->put($this->baseUrl.$endpoint, $data),
            'PATCH' => $httpClient->patch($this->baseUrl.$endpoint, $data),
            'DELETE' => $httpClient->delete($this->baseUrl.$endpoint),
            default => throw new \InvalidArgumentException("Unsupported HTTP method: {$method}")
        };
    }

    /**
     * Send comprehensive notification to admin about any withdrawal failure
     */
    protected function notifyAdminOfWithdrawalFailure(array $withdrawalData, User $user, string $failureType, string $errorMessage, ?array $additionalData = null): void
    {
        try {
            // Get admin email from config
            $adminEmail = config('nowpayments.adminEmail');

            if (empty($adminEmail)) {
                Log::warning('Admin email not configured for withdrawal failure notifications');

                return;
            }

            // Create a standardized failure data structure
            $failureData = [
                'failure_type' => $failureType,
                'error_message' => $errorMessage,
                'user_id' => $user->id,
                'user_email' => $user->email,
                'user_name' => $user->name ?? 'N/A',
                'user_phone' => $user->phone ?? 'N/A',
                'withdrawal_amount' => $withdrawalData['requested_money'],
                'withdrawal_currency' => $withdrawalData['currency'],
                'withdrawal_address' => $withdrawalData['withdrawal_address'],
                'ip_address' => $withdrawalData['ip_address'] ?? 'N/A',
                'wallet_balance' => $user->wallet->holding_money ?? 0,
                'timestamp' => now()->toISOString(),
                'additional_data' => $additionalData ?? [],
            ];

            // Send notification to admin email
            try {
                Notification::route('mail', $adminEmail)
                    ->notify(new CryptoWithdrawalFailureNotification($withdrawalData, $user, null));

                Log::info('Admin notification sent for withdrawal failure', [
                    'user_id' => $user->id,
                    'admin_email' => $adminEmail,
                    'failure_type' => $failureType,
                    'error_message' => $errorMessage,
                ]);
            } catch (\Exception $e) {
                Log::error('Failed to send admin notification', [
                    'admin_email' => $adminEmail,
                    'error' => $e->getMessage(),
                ]);
            }

        } catch (\Exception $e) {
            Log::error('Failed to send admin notifications: '.$e->getMessage());
        }
    }

    /**
     * Log NOWPayments API calls to database
     */
    public function logNowpaymentsApiCall(string $endpoint, string $method, array $requestData, $response, string $type = 'api_call'): void
    {
        try {
            $responseStatus = null;
            $responseData = null;
            $status = 'success';
            $errorMessage = null;

            if ($response) {
                if (method_exists($response, 'status')) {
                    $responseStatus = $response->status();
                    $status = $responseStatus >= 200 && $responseStatus < 300 ? 'success' : 'failed';
                }

                if (method_exists($response, 'json')) {
                    $responseData = $response->json();
                } elseif (method_exists($response, 'body')) {
                    $responseData = json_decode($response->body(), true);
                }

                if ($status === 'failed' && is_array($responseData)) {
                    $errorMessage = $responseData['message'] ?? $responseData['error'] ?? 'Unknown error';
                }
            }

            // Create log entry in database
            CryptoPaymentsApiLog::create([
                'gateway' => PaymentGatewayEnum::NOWPAYMENTS,
                'endpoint' => $endpoint,
                'method' => strtoupper($method),
                'request_data' => $requestData,
                'response_data' => $responseData,
                'response_status' => $responseStatus,
                'user_id' => Auth::id(),
                'ip_address' => Request::ip(),
                'session_id' => Session::getId(),
                'type' => $type,
                'status' => $status,
                'error_message' => $errorMessage,
                'processing_time' => 0, // We can add timing later if needed
                'metadata' => [
                    'timestamp' => now()->toISOString(),
                    'user_agent' => Request::userAgent(),
                    'referer' => Request::header('referer'),
                ],
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to log NOWPayments API call: '.$e->getMessage());
        }
    }
}
