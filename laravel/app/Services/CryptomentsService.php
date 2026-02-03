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
use App\Utils\Services\Utils;
use Carbon\Carbon;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Request;
use Illuminate\Support\Facades\Session;

class CryptomentsService
{
    protected $baseUrl;

    protected $apiKey;

    protected $apiSecret;

    protected $callbackSecretKey;

    protected $partnerId;

    protected $cryptoService;

    public function __construct(CryptoService $cryptoService)
    {

        $this->baseUrl = config('cryptoments.apiUrl');
        $this->apiKey = config('cryptoments.apiKey');
        $this->apiSecret = config('cryptoments.apiSecret');
        $this->callbackSecretKey = config('cryptoments.callbackSecretKey');
        $this->partnerId = config('cryptoments.partnerId', 1);
        $this->cryptoService = $cryptoService;
    }

    /**
     * Check if Cryptoments is properly configured
     */
    public function isConfigured(): bool
    {
        return ! empty($this->apiKey) && ! empty($this->apiSecret) && ! empty($this->baseUrl);
    }

    /**
     * Get available Cryptoments currencies from database
     */
    public function getCurrencies(): array
    {
        try {
            // Get all enabled Cryptoments currencies
            $allCurrencies = CryptoCurrency::enabled()
                ->cryptoments()
                ->ordered()
                ->get(['code', 'name', 'logo_url', 'category', 'is_popular', 'is_stable']);

            // Group by categories: popular, stable, other (same as NOWPayments)
            $popularCurrencies = $allCurrencies->where('is_popular', true);
            $stableCurrencies = $allCurrencies->where('is_stable', true);
            $otherCurrencies = $allCurrencies->where('is_popular', false)->where('is_stable', false);

            $categorizedCurrencies = [
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

        } catch (\Exception $e) {
            Log::error('Cryptoments getCurrencies error: '.$e->getMessage());

            return [
                'success' => false,
                'error' => 'Failed to get currencies',
            ];
        }
    }

    /**
     * Get KRW price for a specific currency
     */
    public function getCurrencyKrwPrice(string $currencyType): array
    {
        try {
            $response = Http::withHeaders($this->buildAuthHeaders())
                ->get($this->baseUrl."/api/v1/currency-prices/{$currencyType}/krw");

            // Log the API call
            $this->logCryptomentsApiCall("/api/v1/currency-prices/{$currencyType}/krw", 'GET', ['currency_type' => $currencyType], $response, 'price_check');

            if ($response->successful()) {
                $data = $response->json();

                return [
                    'success' => true,
                    'currency_type' => $currencyType,
                    'krw_price' => $data['currentPrice'] ?? 0,
                    'data' => $data,
                ];
            }

            $errorData = $response->json();

            return [
                'success' => false,
                'error' => $errorData['message'] ?? 'Failed to get currency price',
            ];

        } catch (\Exception $e) {
            Log::error('Cryptoments currency KRW price error: '.$e->getMessage());

            return [
                'success' => false,
                'error' => 'Currency price service temporarily unavailable',
            ];
        }
    }

    /**
     * Convert token amount to KRW
     */
    public function convertTokenToKrw(string $currencyType, float $amount): array
    {
        try {
            $response = Http::withHeaders($this->buildAuthHeaders())
                ->get($this->baseUrl."/api/v1/currency-prices/convert/{$currencyType}/to-krw", [
                    'amount' => $amount,
                ]);

            // Log the API call
            $this->logCryptomentsApiCall("/api/v1/currency-prices/convert/{$currencyType}/to-krw", 'GET', [
                'currency_type' => $currencyType,
                'amount' => $amount,
            ], $response, 'conversion');

            if ($response->successful()) {
                $data = $response->json();

                return [
                    'success' => true,
                    'currency_type' => $data['fromCurrency'] ?? $currencyType,
                    'token_amount' => $data['fromAmount'] ?? $amount,
                    'krw_amount' => $data['toAmount'] ?? 0,
                    'exchange_rate' => $data['toAmount'] && $data['fromAmount']
                        ? $data['toAmount'] / $data['fromAmount']
                        : 0,
                    'data' => $data,
                ];
            }

            $errorData = $response->json();

            return [
                'success' => false,
                'error' => $errorData['message'] ?? 'Failed to convert currency',
            ];

        } catch (\Exception $e) {
            Log::error('Cryptoments token to KRW conversion error: '.$e->getMessage());

            return [
                'success' => false,
                'error' => 'Conversion service temporarily unavailable',
            ];
        }
    }

    /**
     * Convert KRW amount to token amount
     */
    public function convertKrwToToken(string $currencyType, float $krwAmount): array
    {
        try {
            // Get current KRW price for the currency
            $priceResult = $this->getCurrencyKrwPrice($currencyType);

            if (! $priceResult['success']) {
                return $priceResult;
            }

            $krwPrice = (float) $priceResult['krw_price'];

            if ($krwPrice <= 0) {
                return [
                    'success' => false,
                    'error' => 'Invalid currency price',
                ];
            }

            // Calculate token amount
            $tokenAmount = $krwAmount / $krwPrice;

            return [
                'success' => true,
                'currency_type' => $currencyType,
                'krw_amount' => $krwAmount,
                'token_amount' => $tokenAmount,
                'exchange_rate' => $krwPrice,
                'price_data' => $priceResult['data'] ?? null,
            ];

        } catch (\Exception $e) {
            Log::error('Cryptoments KRW to token conversion error: '.$e->getMessage());

            return [
                'success' => false,
                'error' => 'Conversion service temporarily unavailable',
            ];
        }
    }

    /**
     * Find Cryptoments currency by code
     */
    public function findCurrency(string $currencyCode): ?CryptoCurrency
    {
        return CryptoCurrency::where('code', strtolower($currencyCode))
            ->enabled()
            ->where('gateway', PaymentGatewayEnum::CRYPTOMENTS)
            ->first();
    }

    /**
     * Validate crypto address using NOWPayments API
     */
    public function validateAddress(string $address, string $currency)
    {
        return $this->cryptoService->validateAddress($address, $currency);
    }

    /**
     * Shared helper to compute minimum token and fiat amounts for a currency.
     */
    protected function getMinimumTokenAndFiat(string $currencyCode, string $minExtraKey): array
    {
        try {
            $currency = $this->findCurrency($currencyCode);

            if (! $currency) {
                return [
                    'success' => false,
                    'error' => "Currency '{$currencyCode}' not found or not enabled",
                ];
            }

            $minToken = (float) ($currency->extra_data[$minExtraKey] ?? 0);
            $currencyType = strtoupper($currency->extra_data['currency_type'] ?? $currency->extra_data['symbol'] ?? 'USDT');

            if ($minToken <= 0) {
                return [
                    'success' => false,
                    'error' => 'Minimum amount not configured for this currency',
                ];
            }

            $conversionResult = $this->convertTokenToKrw($currencyType, $minToken);
            if (! $conversionResult['success']) {
                return $conversionResult; // propagate error shape
            }

            $user = Auth::user();
            $fiatCurrency = strtolower($user->currency);

            return [
                'success' => true,
                'currency_type_lower' => strtolower($currencyType),
                'min_token' => $minToken,
                'krw_amount' => $conversionResult['krw_amount'],
                'fiat_currency' => $fiatCurrency,
            ];

        } catch (\Exception $e) {
            Log::error('Cryptoments minimum amount computation error: '.$e->getMessage());

            return [
                'success' => false,
                'error' => 'Minimum amount service temporarily unavailable',
            ];
        }
    }

    /**
     * Compute estimated exchange rate and amounts for Cryptoments flow.
     */
    public function getEstimatedExchangeRateForCryptoments(float $amount, string $currencyFrom, string $currencyTo): array
    {
        try {
            $currency = $this->findCurrency($currencyTo);

            if (! $currency) {
                return [
                    'success' => false,
                    'message' => "Currency '{$currencyTo}' not found or not enabled",
                ];
            }

            $withdrawalFee = (float) ($currency->extra_data['withdrawal_fee'] ?? 0);

            [$currencyType, $chainType] = $this->parseCurrencyCode($currencyTo);

            $conversion = $this->convertKrwToToken(strtoupper($currencyType), (float) $amount);
            if (! $conversion['success']) {
                return $conversion;
            }

            return [
                'success' => true,
                'currency_from' => $currencyFrom,
                'amount_from' => $amount,
                'currency_to' => $currencyTo,
                'exchange_rate' => $conversion['exchange_rate'],
                'withdrawal_fee' => $withdrawalFee,
                'estimated_amount_before_fee' => $conversion['token_amount'],
                'estimated_amount' => max(0, $conversion['token_amount'] - $withdrawalFee),
            ];
        } catch (\Exception $e) {
            Log::error('Cryptoments estimated exchange rate error: '.$e->getMessage());

            return [
                'success' => false,
                'message' => 'Failed to get exchange rate estimate',
            ];
        }
    }

    /**
     * Get minimum deposit amount in KRW for a currency
     */
    public function getMinimumDepositAmountInKrw(string $currencyCode): array
    {
        $base = $this->getMinimumTokenAndFiat($currencyCode, 'min_deposit_amount');
        if (! $base['success']) {
            return $base;
        }

        return [
            'success' => true,
            'currency_from' => $base['currency_type_lower'],
            'min_deposit_token' => $base['min_token'],
            'min_amount' => $base['min_token'],
            'fiat_equivalent' => $base['krw_amount'],
            'fiat_currency' => $base['fiat_currency'],
        ];
    }

    /**
     * Get minimum withdrawal amount in KRW for a currency
     */
    public function getMinimumWithdrawalAmountInKrw(string $currencyCode): array
    {
        // Note: Using 'min_deposit_amount' as per existing data; adjust key if a separate
        // 'min_withdrawal_amount' is introduced in extra_data.
        $base = $this->getMinimumTokenAndFiat($currencyCode, 'min_deposit_amount');
        if (! $base['success']) {
            return $base;
        }

        return [
            'success' => true,
            'currency' => $base['currency_type_lower'],
            'fiat_min_amount' => $base['krw_amount'],
            'fiat_currency' => $base['fiat_currency'],
        ];
    }

    // ================================
    // WEBHOOK SIGNATURE & VALIDATION
    // ================================

    /**
     * Verify Cryptoments webhook signature using HMAC-SHA256
     * Signature format: partnerId|transactionHash|amount|timestamp
     */
    public function verifyWebhookSignature(array $callbackData, string $receivedSignature, ?string $rawBody = null): bool
    {
        try {
            if (empty($this->callbackSecretKey)) {
                return false;
            }

            $partnerId = $callbackData['partnerId'] ?? '';
            $transactionHash = $callbackData['transactionHash'] ?? '';
            $timestamp = $callbackData['timestamp'] ?? '';

            // Extract amount from raw JSON (preserves precision) or fallback to callbackData
            $amount = ($rawBody && preg_match('/"amount"\s*:\s*(\d+(?:\.\d+)?)/', $rawBody, $m))
                ? $m[1]
                : (string) ($callbackData['amount'] ?? '');

            if (str_contains($amount, '.')) {
                $amount = rtrim(rtrim($amount, '0'), '.');
            }

            $signatureData = "{$partnerId}|{$transactionHash}|{$amount}|{$timestamp}";
            $expectedSignature = hash_hmac('sha256', $signatureData, $this->callbackSecretKey);

            return hash_equals($expectedSignature, $receivedSignature);

        } catch (\Exception $e) {
            Log::error('Cryptoments signature verification error: '.$e->getMessage());

            return false;
        }
    }

    // ================================
    // DEPOSIT WEBHOOK PROCESSING
    // ================================

    /**
     * Process deposit callback webhook
     * Expected data: partnerId, userId, transactionId, transactionHash, fromAddress, toAddress,
     *                amount, currencyType, chainType, status, confirmedAt, timestamp,
     *                tokenKrwPrice, krwAmount
     */
    public function processDepositCallback(array $callbackData): array
    {
        try {
            // Validate required fields based on actual Cryptoments webhook
            $requiredFields = ['partnerId', 'userId', 'transactionHash', 'amount', 'currencyType', 'chainType', 'status'];
            foreach ($requiredFields as $field) {
                if (! isset($callbackData[$field])) {
                    throw new \InvalidArgumentException("Missing required field: {$field}");
                }
            }

            // Extract data
            $userId = (int) $callbackData['userId'];
            $transactionHash = $callbackData['transactionHash'];
            $status = $callbackData['status'];

            // Prevent duplicate processing by transaction hash
            $existingTransaction = Transaction::byTxnId($transactionHash)->exists();
            if ($existingTransaction) {
                Log::info('Cryptoments deposit already processed', [
                    'transaction_hash' => $transactionHash,
                    'user_id' => $userId,
                ]);

                return [
                    'success' => true,
                    'message' => 'Deposit already processed',
                ];
            }

            // Find user
            $user = User::find($userId);
            if (! $user) {
                Log::error('User not found for Cryptoments deposit', [
                    'user_id' => $userId,
                    'callback_data' => $callbackData,
                ]);
                throw new \Exception("User not found: {$userId}");
            }

            // Handle different statuses
            switch (strtoupper($status)) {
                case 'CONFIRMED':
                case 'SETTLED':
                    return $this->handleSuccessfulDeposit($user, $callbackData);

                case 'FAILED':
                    return $this->handleFailedDeposit($user, $callbackData);

                default:
                    Log::info('Cryptoments deposit in progress', [
                        'status' => $status,
                        'transaction_hash' => $transactionHash,
                        'user_id' => $userId,
                    ]);

                    return [
                        'success' => true,
                        'message' => 'Deposit status received',
                    ];
            }

        } catch (\Exception $e) {
            Log::error('Cryptoments deposit callback processing error: '.$e->getMessage(), [
                'callback_data' => $callbackData,
                'trace' => $e->getTraceAsString(),
            ]);

            return [
                'success' => false,
                'message' => 'Callback processing failed: '.$e->getMessage(),
            ];
        }
    }

    /**
     * Handle successful deposit
     */
    private function handleSuccessfulDeposit(User $user, array $callbackData): array
    {
        try {
            DB::transaction(function () use ($user, $callbackData) {
                $amount = (float) $callbackData['amount'];
                $currencyType = $callbackData['currencyType'];
                $chainType = $callbackData['chainType'];
                $transactionHash = $callbackData['transactionHash'];
                $toAddress = $callbackData['toAddress'] ?? null;

                // Convert to fiat amount (use krwAmount or usdAmount if provided)
                $fiatAmount = isset($callbackData['krwAmount'])
                    ? (float) $callbackData['krwAmount']
                    : (isset($callbackData['usdAmount']) ? (float) $callbackData['usdAmount'] : $amount);

                // Find existing pending exchange request by wallet address
                $exchangeRequest = ExchangeRequest::where('gateway', PaymentGatewayEnum::CRYPTOMENTS)
                    ->where('status', ExchangeRequestStatusEnum::PENDING)
                    ->where('type', TransactionTypeEnum::DEPOSIT)
                    ->where('created_by', $user->id)
                    ->where('metadata->address', $toAddress)
                    ->firstOrFail();

                // Update exchange request with callback data
                $exchangeRequest->update([
                    'approved_money' => $fiatAmount,
                    'after_money' => $user->wallet->holding_money + $fiatAmount,
                    'description' => "Cryptoments deposit - {$currencyType} on {$chainType}",
                    'metadata' => $callbackData,
                ]);

                // Create transaction
                $transaction = Transaction::createTransaction(
                    type: TransactionTypeEnum::DEPOSIT,
                    amount: $fiatAmount,
                    moneyType: MoneyTypeEnum::MONEY,
                    user: $user,
                    exchangeRequest: $exchangeRequest,
                    source: TransactionSourceEnum::CRYPTO,
                    category: TransactionCategoryEnum::MONEY_DEPOSITED,
                    memo: "Cryptoments deposit - {$currencyType} on {$chainType}",
                    txnId: $transactionHash,
                );

                // Approve exchange request
                $exchangeRequest->approve(ExchangeRequestStatusEnum::APPROVED, [
                    'approved_money' => $fiatAmount,
                    'after_money' => $user->wallet->holding_money,
                    'approved_by' => $user->id,
                    'updated_by' => $user->id,
                ], cb: fn (ExchangeRequest $record) => $record->afterApprove($transaction));

                Log::info('Cryptoments deposit completed and wallet updated', [
                    'user_id' => $user->id,
                    'amount' => $fiatAmount,
                    'currency' => $currencyType,
                    'chain' => $chainType,
                    'transaction_hash' => $transactionHash,
                    'transaction_id' => $transaction->id,
                    'exchange_request_id' => $exchangeRequest->id,
                ]);
            });

            return [
                'success' => true,
                'message' => 'Deposit processed successfully',
            ];

        } catch (\Exception $e) {
            Log::error('Cryptoments deposit processing error: '.$e->getMessage());
            throw $e;
        }
    }

    /**
     * Handle failed deposit
     */
    private function handleFailedDeposit(User $user, array $callbackData): array
    {
        Log::warning('Cryptoments deposit failed', [
            'user_id' => $user->id,
            'callback_data' => $callbackData,
        ]);

        return [
            'success' => true,
            'message' => 'Failed deposit logged',
        ];
    }

    // ================================
    // WITHDRAWAL WEBHOOK PROCESSING
    // ================================

    /**
     * Process withdrawal callback webhook
     */
    public function processWithdrawalCallback(array $callbackData): array
    {
        try {
            // Validate required fields
            $requiredFields = ['partnerId', 'userId', 'transactionHash', 'amount', 'currencyType', 'chainType', 'status'];
            foreach ($requiredFields as $field) {
                if (! isset($callbackData[$field])) {
                    throw new \InvalidArgumentException("Missing required field: {$field}");
                }
            }

            $userId = $callbackData['userId'];
            $transactionHash = $callbackData['transactionHash'];
            $status = $callbackData['status'];

            // Find user
            $user = User::find($userId);
            if (! $user) {
                throw new \Exception("User not found: {$userId}");
            }

            // Find pending exchange request for this withdrawal
            $exchangeRequest = ExchangeRequest::where('type', TransactionTypeEnum::WITHDRAW)
                ->cryptoments()
                ->where('via', ExchangeRequestViaEnum::CRYPTO)
                ->whereBelongsTo($user, 'creator')
                ->where('status', ExchangeRequestStatusEnum::PENDING)
                ->orWhere(function ($query) use ($userId) {
                    $query->where('created_by', $userId)
                        ->where('status', ExchangeRequestStatusEnum::PENDING);
                })
                ->latest()
                ->first();

            if (! $exchangeRequest) {
                Log::warning('Exchange request not found for withdrawal callback', $callbackData);

                return [
                    'success' => true,
                    'message' => 'Exchange request not found',
                ];
            }

            // Handle different statuses
            switch (strtoupper($status)) {
                case 'CONFIRMED':
                case 'SETTLED':
                    return $this->handleSuccessfulWithdrawal($exchangeRequest, $callbackData);

                case 'FAILED':
                    return $this->handleFailedWithdrawal($exchangeRequest, $callbackData);

                default:
                    Log::info('Cryptoments withdrawal in progress', $callbackData);

                    return [
                        'success' => true,
                        'message' => 'Withdrawal status received',
                    ];
            }

        } catch (\Exception $e) {
            Log::error('Cryptoments withdrawal callback processing error: '.$e->getMessage(), [
                'callback_data' => $callbackData,
                'trace' => $e->getTraceAsString(),
            ]);

            return [
                'success' => false,
                'message' => 'Callback processing failed: '.$e->getMessage(),
            ];
        }
    }

    /**
     * Handle successful withdrawal
     */
    private function handleSuccessfulWithdrawal(ExchangeRequest $exchangeRequest, array $callbackData): array
    {
        try {
            DB::transaction(function () use ($exchangeRequest, $callbackData) {
                $user = $exchangeRequest->creator;
                $transactionHash = $callbackData['transactionHash'];
                $currencyType = $callbackData['currencyType'];
                $chainType = $callbackData['chainType'];
                // dd($exchangeRequest);
                // Prevent duplicate processing
                if ($exchangeRequest->status === ExchangeRequestStatusEnum::APPROVED) {
                    Log::info('Cryptoments withdrawal already processed', ['exchange_request_id' => $exchangeRequest->id]);

                    return;
                }

                // Create transaction
                $transaction = Transaction::createTransaction(
                    type: TransactionTypeEnum::WITHDRAW,
                    amount: $exchangeRequest->requested_money,
                    moneyType: MoneyTypeEnum::MONEY,
                    user: $user,
                    exchangeRequest: $exchangeRequest,
                    source: TransactionSourceEnum::CRYPTO,
                    category: TransactionCategoryEnum::MONEY_WITHDRAWAL,
                    memo: "Cryptoments withdrawal - {$currencyType} on {$chainType}",
                    txnId: $transactionHash,
                );

                $user->wallet->refresh();

                // Approve exchange request
                $exchangeRequest->approve(ExchangeRequestStatusEnum::APPROVED, [
                    'approved_money' => $exchangeRequest->requested_money,
                    'after_money' => $user->wallet->holding_money,
                    'approved_by' => $user->id,
                    'updated_by' => $user->id,
                    'metadata' => $callbackData,
                ], cb: fn (ExchangeRequest $record) => $record->afterApprove($transaction));

                Log::info('Cryptoments withdrawal completed', [
                    'user_id' => $user->id,
                    'amount' => $exchangeRequest->requested_money,
                    'currency' => $currencyType,
                    'chain' => $chainType,
                    'transaction_hash' => $transactionHash,
                    'transaction_id' => $transaction->id,
                ]);
            });

            return [
                'success' => true,
                'message' => 'Withdrawal processed successfully',
            ];

        } catch (\Exception $e) {
            Log::error('Cryptoments withdrawal processing error: '.$e->getMessage());
            throw $e;
        }
    }

    /**
     * Handle failed withdrawal
     */
    private function handleFailedWithdrawal(ExchangeRequest $exchangeRequest, array $callbackData): array
    {
        try {
            $metadata = $exchangeRequest->metadata;
            $metadata['latest_status'] = $callbackData['status'];
            $metadata['callback_data'] = $callbackData;

            $exchangeRequest->update([
                'status' => 'rejected',
                'rejected_at' => now(),
                'rejected_by' => 1, // System user
                'description' => $exchangeRequest->description.' - Failed: '.($callbackData['status'] ?? 'Unknown'),
                'metadata' => $metadata,
            ]);

            Log::warning('Cryptoments withdrawal failed', [
                'exchange_request_id' => $exchangeRequest->id,
                'callback_data' => $callbackData,
            ]);

            return [
                'success' => true,
                'message' => 'Failed withdrawal logged',
            ];

        } catch (\Exception $e) {
            Log::error('Cryptoments failed withdrawal handling error: '.$e->getMessage());
            throw $e;
        }
    }

    /**
     * Validate withdrawal request
     */
    public function validateWithdrawalRequest(User $user, float $requestedAmount, string $address, string $currency): array
    {
        $availableBalance = $user->wallet->holding_money;
        if ($requestedAmount > $availableBalance) {
            return [
                'valid' => false,
                'message' => 'Insufficient balance. Available: '.number_format($availableBalance, 0).' KRW, Requested: '.number_format($requestedAmount, 0).' KRW',
                'available_balance' => $availableBalance,
                'requested_amount' => $requestedAmount,
            ];
        }

        // Validate withdrawal address with NOWPayments API
        $addressValidation = $this->validateAddress($address, 'usdc');

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
     * Generate access token for API authentication
     * According to Cryptoments documentation:
     * 1. Create message: timestamp + "." + apiKey
     * 2. HMAC-SHA256 signature: HMAC-SHA256(apiSecret, message)
     * 3. Base64 encoding: Base64.encode(signature)
     */
    public function generateAccessToken(?int $timestamp = null): string
    {
        $timestamp = $timestamp ?: time();
        $message = $timestamp.'.'.$this->apiKey;
        $signature = hash_hmac('sha256', $message, $this->apiSecret, true);

        return base64_encode($signature);
    }

    /**
     * Build standard Cryptoments auth headers, allowing overrides/additions
     */
    protected function buildAuthHeaders(array $additionalHeaders = []): array
    {
        $timestamp = time();

        $defaultHeaders = [
            'X-API-KEY' => $this->apiKey,
            'X-TIMESTAMP' => $timestamp,
            'X-ACCESS-TOKEN' => $this->generateAccessToken($timestamp),
            'Accept' => 'application/json',
        ];

        return $additionalHeaders ? array_merge($defaultHeaders, $additionalHeaders) : $defaultHeaders;
    }

    /**
     * Parse a combined currency code like "usdt-eth" into [currencyType, chainType]
     */
    protected function parseCurrencyCode(string $currencyCode): array
    {
        return explode('-', strtolower($currencyCode));
    }

    /**
     * Create user withdrawal request
     */
    public function createWithdrawal(array $withdrawalData): array
    {
        try {
            $response = Http::withHeaders($this->buildAuthHeaders([
                'Content-Type' => 'application/json',
            ]))->post($this->baseUrl.'/api/v1/users/withdrawal', $withdrawalData);

            // Log the API call
            $this->logCryptomentsApiCall('/api/v1/users/withdrawal', 'POST', $withdrawalData, $response, 'withdrawal');

            if ($response->successful()) {
                return [
                    'success' => true,
                    'data' => $response->json(),
                ];
            }

            $errorData = $response->json();

            return [
                'success' => false,
                'error' => $errorData['message'] ?? 'Withdrawal request failed',
                'status_code' => $response->status(),
            ];

        } catch (\Exception $e) {
            Log::error('Cryptoments user withdrawal error: '.$e->getMessage());

            return [
                'success' => false,
                'error' => 'Withdrawal service temporarily unavailable',
            ];
        }
    }

    /**
     * Create user deposit wallet request
     */
    public function createDepositWallet(array $walletData): array
    {
        try {
            $response = Http::withHeaders($this->buildAuthHeaders([
                'Content-Type' => 'application/json',
            ]))->post($this->baseUrl.'/api/v1/users/deposit-wallet', $walletData);

            // Log the API call
            $this->logCryptomentsApiCall('/api/v1/users/deposit-wallet', 'POST', $walletData, $response, 'deposit_wallet');

            if ($response->successful()) {
                return [
                    'success' => true,
                    'data' => $response->json(),
                ];
            }

            $errorData = $response->json();

            return [
                'success' => false,
                'error' => $errorData['message'] ?? 'Deposit wallet creation failed',
                'status_code' => $response->status(),
            ];

        } catch (\Exception $e) {
            Log::error('Cryptoments user deposit wallet error: '.$e->getMessage());

            return [
                'success' => false,
                'error' => 'Deposit wallet service temporarily unavailable',
            ];
        }
    }

    /**
     * Create pending exchange request for deposit
     */
    public function createDepositExchangeRequest(User $user, float $requestedMoney, string $currencyType, string $chainType, array $paymentData): ExchangeRequest
    {
        return ExchangeRequest::create([
            'type' => TransactionTypeEnum::DEPOSIT,
            'via' => ExchangeRequestViaEnum::CRYPTO,
            'gateway' => PaymentGatewayEnum::CRYPTOMENTS,
            'source' => TransactionSourceEnum::EXCHANGE_REQUEST,
            'requested_money' => $requestedMoney,
            'approved_money' => 0,
            'before_money' => $user->wallet->holding_money,
            'after_money' => $user->wallet->holding_money,
            'status' => ExchangeRequestStatusEnum::PENDING,
            'description' => "Cryptoments deposit pending - {$currencyType} on {$chainType}",
            'metadata' => $paymentData,
            'ip_address' => Utils::getClientIp(),
            'created_by' => $user->id,
        ]);
    }

    /**
     * Create crypto withdrawal request
     */
    public function createWithdrawalExchangeRequest(User $user, array $withdrawalData): array
    {
        try {
            // Create withdrawal order ID
            $orderId = "crypto_withdraw_{$user->id}_".time();

            // Create exchange request for crypto withdrawal
            $exchangeRequest = ExchangeRequest::create([
                'type' => TransactionTypeEnum::WITHDRAW,
                'via' => ExchangeRequestViaEnum::CRYPTO,
                'gateway' => PaymentGatewayEnum::CRYPTOMENTS,
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

            Log::info('Crypto withdrawal request created', [
                'user_id' => $user->id,
                'exchange_request_id' => $exchangeRequest->id,
                'amount' => $withdrawalData['requested_money'],
                'currency' => $withdrawalData['currency'],
            ]);

            return [
                'success' => true,
                'message' => 'Crypto withdrawal request created successfully.',
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
     * Get user's first pending deposit request
     */
    public function getPendingDepositRequests(User $user): array
    {
        $pendingDeposit = ExchangeRequest::where('type', TransactionTypeEnum::DEPOSIT)
            ->where('status', ExchangeRequestStatusEnum::PENDING)
            ->where('via', ExchangeRequestViaEnum::CRYPTO)
            ->where('created_by', $user->id)
            ->orderBy('created_at', 'desc')
            ->first();

        if (! $pendingDeposit) {
            return ['success' => true, 'has_pending' => false, 'pending_deposit' => null];
        }

        // Check if expired and auto-cancel
        $expirationDate = $pendingDeposit->metadata['expiration_estimate_date'] ?? null;
        if ($this->isDepositExpired($expirationDate)) {
            $this->cancelDepositRequest($user, $pendingDeposit->id);

            return ['success' => true, 'has_pending' => false, 'pending_deposit' => null];
        }

        return [
            'success' => true,
            'has_pending' => true,
            'pending_deposit' => $this->formatPendingDepositData($pendingDeposit, $expirationDate),
        ];
    }

    /**
     * Check if deposit has expired
     */
    protected function isDepositExpired(?string $expirationDate): bool
    {
        if (! $expirationDate) {
            return false;
        }

        try {
            return Carbon::now()->greaterThan(Carbon::parse($expirationDate));
        } catch (\Exception $e) {
            Log::warning('Failed to parse expiration date', ['error' => $e->getMessage()]);

            return false;
        }
    }

    /**
     * Format pending deposit data for response
     */
    protected function formatPendingDepositData(ExchangeRequest $deposit, ?string $expirationDate): array
    {
        $metadata = $deposit->metadata;

        return [
            'id' => $deposit->id,
            'payment_id' => $metadata['payment_id'] ?? $deposit->id,
            'requested_money' => $deposit->requested_money,
            'currency' => $metadata['pay_currency'] ?? null,
            'chain' => $metadata['chainType'] ?? $metadata['network'] ?? null,
            'wallet_address' => $metadata['address'] ?? $metadata['pay_address'] ?? null,
            'pay_amount' => $metadata['pay_amount'] ?? null,
            'created_at' => $deposit->created_at->toISOString(),
            'expiration_estimate_date' => $expirationDate,
            'gateway' => $deposit->gateway ?? null,
            'metadata' => $metadata,
        ];
    }

    /**
     * Cancel a pending deposit request
     */
    public function cancelDepositRequest(User $user, string $id): array
    {
        $pendingDeposit = ExchangeRequest::where('type', TransactionTypeEnum::DEPOSIT)
            ->where('status', ExchangeRequestStatusEnum::PENDING)
            ->where('via', ExchangeRequestViaEnum::CRYPTO)
            ->where('created_by', $user->id)
            ->where('id', $id)
            ->first();

        if (! $pendingDeposit) {
            return [
                'success' => false,
                'message' => 'Pending deposit not found or already processed.',
            ];
        }

        // Update the status to cancelled
        $pendingDeposit->status = ExchangeRequestStatusEnum::CANCELLED;
        $pendingDeposit->save();

        return [
            'success' => true,
            'message' => 'Deposit request cancelled successfully.',
        ];
    }

    /**
     * Fetch chains and tokens from Cryptoments API
     */
    public function fetchChainsAndTokens(): array
    {
        try {
            $response = Http::withHeaders($this->buildAuthHeaders())
                ->get($this->baseUrl.'/api/v1/chains');

            // Log the API call
            $this->logCryptomentsApiCall('/api/v1/chains', 'GET', [], $response, 'sync');

            if ($response->successful()) {
                $data = $response->json();

                return [
                    'success' => true,
                    'data' => $data,
                ];
            }

            $errorData = $response->json();

            return [
                'success' => false,
                'error' => $errorData['message'] ?? 'Failed to fetch chains and tokens',
            ];

        } catch (\Exception $e) {
            Log::error('Cryptoments fetch chains error: '.$e->getMessage());

            return [
                'success' => false,
                'error' => 'Chains fetch service temporarily unavailable',
            ];
        }
    }

    /**
     * Sync Cryptoments currencies to database
     */
    public function syncCurrenciesToDatabase(): array
    {
        try {
            $result = $this->fetchChainsAndTokens();

            if (! $result['success']) {
                return $result;
            }

            $chains = $result['data'] ?? [];
            $syncedCount = 0;
            $errors = [];

            DB::beginTransaction();

            try {
                foreach ($chains as $chain) {
                    $chainType = $chain['chainType'] ?? null;
                    $chainName = $chain['chainName'] ?? null;
                    $chainSymbol = $chain['chainSymbol'] ?? null;
                    $supportedTokens = $chain['supportedTokens'] ?? [];
                    $chainActive = $chain['active'] ?? false;

                    if (! $chainType || ! $chainActive) {
                        continue;
                    }

                    foreach ($supportedTokens as $token) {
                        try {
                            $currencyType = $token['currencyType'] ?? null;
                            $symbol = strtolower($token['symbol'] ?? '');
                            $description = $token['description'] ?? '';
                            $contractAddress = $token['contractAddress'] ?? null;
                            $decimals = $token['decimals'] ?? null;
                            $tokenActive = $token['active'] ?? false;

                            if (! $symbol || ! $tokenActive) {
                                continue;
                            }

                            // Create unique code combining symbol and network (e.g., "usdt-eth", "usdt-bsc")
                            $uniqueCode = $symbol.'-'.strtolower($chainType);

                            // Determine category based on token type
                            $category = CurrencyTypeEnum::findByCode($symbol);

                            // Create or update currency
                            CryptoCurrency::updateOrCreate(
                                [
                                    'code' => $uniqueCode,
                                    'gateway' => PaymentGatewayEnum::CRYPTOMENTS,
                                ],
                                [
                                    'name' => $description ?: $currencyType,
                                    'logo_url' => null, // Cryptoments doesn't provide logo URL in this response
                                    'category' => $category,
                                    'enabled' => $tokenActive,
                                    'priority' => $category->priority(),
                                    'network' => strtolower($chainType),
                                    'network_precision' => $decimals,
                                    'extra_data' => [
                                        'chain_type' => $chainType,
                                        'chain_name' => $chainName,
                                        'chain_symbol' => $chainSymbol,
                                        'currency_type' => $currencyType,
                                        'symbol' => $symbol, // Store original symbol here
                                        'contract_address' => $contractAddress,
                                        'decimals' => $decimals,
                                        'min_deposit_amount' => $token['minDepositAmount'] ?? null,
                                        'max_deposit_amount' => $token['maxDepositAmount'] ?? null,
                                        'withdrawal_fee' => $token['withdrawalFee'] ?? null,
                                        'gas_limit' => $token['gasLimit'] ?? null,
                                        'explorer_url' => $chain['explorerUrl'] ?? null,
                                        'explorer_address_url_format' => $chain['explorerAddressUrlFormat'] ?? null,
                                        'explorer_tx_url_format' => $chain['explorerTxUrlFormat'] ?? null,
                                        'block_time' => $chain['blockTime'] ?? null,
                                        'required_confirmations' => $chain['requiredConfirmations'] ?? null,
                                    ],
                                    'last_synced_at' => now(),
                                ]
                            );

                            $syncedCount++;

                        } catch (\Exception $e) {
                            $errors[] = [
                                'token' => $symbol ?? 'unknown',
                                'chain' => $chainType ?? 'unknown',
                                'error' => $e->getMessage(),
                            ];
                            Log::error('Error syncing Cryptoments token: '.$e->getMessage(), [
                                'token' => $token,
                                'chain' => $chainType,
                            ]);
                        }
                    }
                }

                DB::commit();

                return [
                    'success' => true,
                    'message' => "Successfully synced {$syncedCount} Cryptoments currencies",
                    'synced_count' => $syncedCount,
                    'errors' => $errors,
                ];

            } catch (\Exception $e) {
                DB::rollBack();
                throw $e;
            }

        } catch (\Exception $e) {
            Log::error('Cryptoments currency sync error: '.$e->getMessage());

            return [
                'success' => false,
                'error' => 'Currency synchronization failed: '.$e->getMessage(),
            ];
        }
    }

    // ================================
    // DATA BUILDERS
    // ================================

    /**
     * Build user withdrawal data structure according to Cryptoments API
     */
    public function buildWithdrawalData(float $amount, string $chainType, string $currencyType, int $partnerId, string $toAddress, ?string $partnerUserId = null, string $amountUnit = 'KRW', ?float $krwAmount = null): array
    {
        $withdrawalData = [
            'amount' => $amount,
            'chainType' => $chainType,
            'currencyType' => $currencyType,
            'partnerId' => $partnerId,
            'toAddress' => $toAddress,
            'amountUnit' => $amountUnit,
        ];

        if ($partnerUserId) {
            $withdrawalData['partnerUserId'] = $partnerUserId;
        }

        if ($amountUnit === 'KRW' && $krwAmount) {
            $withdrawalData['krwAmount'] = $krwAmount;
        }

        return $withdrawalData;
    }

    /**
     * Handle full flow to create a user withdrawal and record pending request
     */
    public function handleCreateWithdrawal(User $user, float $requestedMoney, string $currencyCode, string $withdrawalAddress, ?string $ipAddress = null): array
    {
        try {
            // Parse currency code (e.g., "usdt-eth" -> ["usdt", "eth"]) and normalize
            [$currencyType, $chainType] = $this->parseCurrencyCode($currencyCode);
            $currencyType = strtoupper($currencyType);
            $chainType = strtoupper($chainType);

            // Validate withdrawal request
            $validation = $this->validateWithdrawalRequest($user, $requestedMoney, $withdrawalAddress, $currencyType);

            if (! $validation['valid']) {
                return [
                    'success' => false,
                    'message' => $validation['message'] ?? 'Invalid withdrawal request',
                ] + (isset($validation['available_balance']) ? [
                    'available_balance' => $validation['available_balance'],
                    'requested_amount' => $validation['requested_amount'],
                ] : []);
            }

            // Estimate crypto amount from fiat (KRW) amount
            $exchange = $this->convertKrwToToken(strtoupper($currencyType), (float) $requestedMoney);
            $estimatedTokenAmount = $exchange['token_amount'] ?? 0;

            // Create pending withdrawal exchange request (internal record)
            $createResult = $this->createWithdrawalExchangeRequest($user, [
                'requested_money' => $requestedMoney,
                'currency' => $currencyType,
                'withdrawal_address' => $withdrawalAddress,
                'fiat_amount' => $requestedMoney,
                'fiat_currency' => $user->currency,
                'crypto_amount' => $estimatedTokenAmount,
                'ip_address' => $ipAddress,
            ]);

            // Build payload for Cryptoments API (amount in TOKEN units)
            $partnerId = config('cryptoments.partnerId', 1);
            $withdrawalData = $this->buildWithdrawalData(
                amount: $estimatedTokenAmount,
                chainType: $chainType,
                currencyType: $currencyType,
                partnerId: $partnerId,
                toAddress: $withdrawalAddress,
                partnerUserId: (string) $user->id,
                amountUnit: 'TOKEN'
            );

            // Submit withdrawal to Cryptoments
            $paymentResult = $this->createWithdrawal($withdrawalData);

            if ($paymentResult['success']) {
                return $createResult;
            }

            return [
                'success' => false,
                'message' => $paymentResult['error'] ?? 'Withdrawal request failed',
            ];

        } catch (\Exception $e) {
            Log::error('Cryptoments handleCreateWithdrawal error: '.$e->getMessage(), [
                'user_id' => $user->id ?? null,
                'currency' => $currencyCode,
                'requested_money' => $requestedMoney,
            ]);

            return [
                'success' => false,
                'message' => 'Failed to create crypto withdrawal. Please try again later.',
            ];
        }
    }

    /**
     * Build user deposit wallet data structure according to Cryptoments API
     */
    public function buildDepositWalletData(string $chainType, string $currencyType, int $partnerId, ?string $partnerUserId = null, string $walletType = 'USER_DEPOSIT'): array
    {
        $walletData = [
            'chainType' => $chainType,
            'currencyType' => $currencyType,
            'partnerId' => $partnerId,
            'walletType' => $walletType,
        ];

        if ($partnerUserId) {
            $walletData['partnerUserId'] = $partnerUserId;
        }

        return $walletData;
    }

    /**
     * Handle full flow to create a user deposit wallet and record pending request
     */
    public function handleCreateDepositWallet(User $user, string $selectedCurrency, float $requestedMoney): array
    {
        try {
            // Parse currency code (e.g., "usdt-eth" -> ["usdt", "eth"]) and normalize
            [$currencyType, $chainType] = $this->parseCurrencyCode($selectedCurrency);
            $currencyType = strtoupper($currencyType);
            $chainType = strtoupper($chainType);

            // Get partner ID from config
            $partnerId = config('cryptoments.partnerId', 1);

            // Build wallet data according to Cryptoments API
            $walletData = $this->buildDepositWalletData(
                chainType: $chainType,
                currencyType: $currencyType,
                partnerId: $partnerId,
                partnerUserId: (string) $user->id
            );

            // Create deposit wallet using Cryptoments API
            $paymentResult = $this->createDepositWallet($walletData);

            if (! $paymentResult['success'] || ! isset($paymentResult['data']['address'])) {
                return [
                    'success' => false,
                    'message' => $paymentResult['error'] ?? 'Failed to create deposit wallet',
                ];
            }

            $payment = $paymentResult['data'];

            // Convert KRW to token amount for display/pay amount
            $conversion = $this->convertKrwToToken($currencyType, $requestedMoney);
            $tokenAmount = $conversion['token_amount'] ?? 0;

            // Create exchange request with pending status
            $exchangeRequest = $this->createDepositExchangeRequest(
                $user,
                $requestedMoney,
                $currencyType,
                $chainType,
                array_merge($payment, [
                    'pay_amount' => $tokenAmount,
                    'pay_currency' => $selectedCurrency,
                ])
            );

            return [
                'success' => true,
                'id' => $exchangeRequest->id,
                'pay_address' => $payment['address'],
                'pay_amount' => $tokenAmount,
                'pay_currency' => $currencyType,
                'price_amount' => $requestedMoney,
                'price_currency' => $user->currency,
                'payment_id' => $payment['id'] ?? null,
                'payment_status' => 'waiting',
            ];

        } catch (\Exception $e) {
            Log::error('Cryptoments handleCreateDepositWallet error: '.$e->getMessage(), [
                'user_id' => $user->id ?? null,
                'selected_currency' => $selectedCurrency,
                'requested_money' => $requestedMoney,
            ]);

            return [
                'success' => false,
                'message' => 'Failed to create deposit wallet. Please try again later.',
            ];
        }
    }

    /**
     * Log Cryptoments API calls to database
     */
    public function logCryptomentsApiCall(string $endpoint, string $method, array $requestData, $response, string $type = 'api_call'): void
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
                'gateway' => PaymentGatewayEnum::CRYPTOMENTS,
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
            Log::error('Failed to log Cryptoments API call: '.$e->getMessage());
        }
    }

    /**
     * Send comprehensive notification to admin about any withdrawal failure
     */
    protected function notifyAdminOfWithdrawalFailure(array $withdrawalData, User $user, string $failureType, string $errorMessage, ?array $additionalData = null): void
    {
        try {
            // Get admin email from config
            $adminEmail = config('cryptoments.adminEmail');

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
}
