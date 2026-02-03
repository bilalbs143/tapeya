<?php

namespace App\Http\Controllers\v1\User;

use App\Enums\CryptoPayments\PaymentGatewayEnum;
use App\Enums\Transaction\ExchangeRequestStatusEnum;
use App\Enums\Transaction\MoneyTypeEnum;
use App\Enums\Transaction\TransactionCategoryEnum;
use App\Enums\Transaction\TransactionSourceEnum;
use App\Enums\Transaction\TransactionTypeEnum;
use App\Http\Controllers\Controller;
use App\Http\Requests\v1\User\Payments\CreateCryptoPaymentRequest;
use App\Http\Requests\v1\User\Payments\CreateCryptoWithdrawalRequest;
use App\Http\Requests\v1\User\Payments\VerifyCryptoAddressRequest;
use App\Models\ExchangeRequest;
use App\Models\Transaction;
use App\Models\User;
use App\Services\CryptomentsService;
use App\Services\CryptoService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use PrevailExcel\Nowpayments\Nowpayments;

class PaymentController extends Controller
{
    protected $nowpayments;

    protected $cryptoService;

    protected $cryptomentsController;

    protected $cryptomentsService;

    public function __construct(
        CryptoService $cryptoService,
        CryptomentsService $cryptomentsService,
        CryptomentsPaymentController $cryptomentsController,
    ) {
        $this->nowpayments = new Nowpayments;
        $this->cryptoService = config('cryptoments.enabled') ? $cryptomentsService : $cryptoService;
        $this->cryptomentsService = $cryptomentsService;
        $this->cryptomentsController = $cryptomentsController;
    }

    private function sendResponse($data, $status = 200)
    {
        return response()->json(['data' => $data], $status);
    }

    public function getCurrencies()
    {
        $result = $this->cryptoService->getCurrencies();

        return $this->sendResponse($result);
    }

    /**
     * Create crypto payment
     */
    public function createDepositWallet(CreateCryptoPaymentRequest $request)
    {
        try {
            $user = Auth::user();
            if (config('cryptoments.enabled')) {
                $result = $this->cryptoService->handleCreateDepositWallet(
                    $user,
                    $request->selected_currency,
                    (float) $request->amount
                );

                return $this->sendResponse($result, $result['success'] ? 200 : 400);
            }

            // Add IPN callback URL based on environment
            $webhookUrl = config('nowpayments.callbackUrl') ?: route('user.payments.webhook');
            $amount = $request->amount;
            $formattedAmount = number_format($amount, 0, '.', ',');

            $paymentData = $this->cryptoService->buildPaymentData(
                $amount,
                $user->currency,
                $request->selected_currency,
                "crypto_{$user->id}_".time(),
                "Crypto deposit for user {$user->username} - IDR {$formattedAmount}",
                $webhookUrl
            );

            // Use CryptoService to create payment
            $paymentResult = $this->cryptoService->createDepositWallet($paymentData);

            Log::info('NOWPayments create deposit wallet response', [
                'user_id' => $user->id,
                'response' => $paymentResult,
            ]);

            if ($paymentResult['success'] && isset($paymentResult['data']['pay_address'])) {
                $payment = $paymentResult['data'];

                // Create exchange request with pending status
                $exchangeRequest = $this->cryptoService->createDepositExchangeRequest($user, $payment);

                return $this->sendResponse([
                    'success' => true,
                    'id' => $exchangeRequest->id,
                    'pay_address' => $payment['pay_address'],
                    'pay_amount' => $payment['pay_amount'],
                    'pay_currency' => $payment['pay_currency'],
                    'price_amount' => $payment['price_amount'],
                    'price_currency' => $payment['price_currency'],
                    'payment_id' => $payment['payment_id'],
                    'order_id' => $paymentData['order_id'],
                    'payment_status' => $payment['payment_status'] ?? 'waiting',
                    'expiration_estimate_date' => Carbon::parse($payment['expiration_estimate_date'])->toISOString(),
                    'valid_until' => Carbon::parse($payment['valid_until'])->toISOString(),
                ]);
            }

            return $this->sendResponse([
                'success' => false,
                'message' => $paymentResult['error'] ?? 'Failed to deposit wallet',
            ], 400);
        } catch (\Exception $e) {
            return $this->sendResponse([
                'success' => false,
                'message' => 'Deposit failed: '.$e->getMessage(),
                'debug_info' => app()->environment('local') ? [
                    'trace' => $e->getTraceAsString(),
                    'file' => $e->getFile(),
                    'line' => $e->getLine(),
                ] : null,
            ], 500);
        }
    }

    /**
     * Check payment status
     */
    public function getPaymentStatus(Request $request)
    {
        $request->validate([
            'payment_id' => 'required|string',
        ]);

        try {
            $result = $this->cryptoService->getPaymentStatus($request->payment_id);

            if ($result['success']) {
                return $this->sendResponse([
                    'success' => true,
                    'status' => $result['data'],
                ]);
            }

            return $this->sendResponse([
                'success' => false,
                'message' => $result['error'],
            ], 404);

        } catch (\Exception $e) {
            Log::error('NOWPayments getPaymentStatus controller error: '.$e->getMessage());

            return $this->sendResponse([
                'success' => false,
                'message' => 'Failed to get payment status',
            ], 500);
        }
    }

    /**
     * Handle payment webhook/IPN
     */
    public function handleWebhook(Request $request)
    {
        try {
            $paymentData = $request->all();

            // Log webhook to database
            $this->cryptoService->logNowpaymentsApiCall(
                '/webhook/payment',
                'POST',
                $paymentData,
                null,
                'webhook'
            );

            // Verify the webhook signature if IPN secret is configured
            $signature = $request->header('x-nowpayments-sig');
            if ($signature && ! $this->cryptoService->validateWebhookSignature($request->getContent(), $signature, false)) {
                Log::warning('Invalid NOWPayments payment webhook signature', [
                    'signature' => $signature,
                    'payload' => $request->getContent(),
                ]);

                return response()->json(['error' => 'Invalid signature'], 400);
            }

            // Handle different payment statuses
            switch ($paymentData['payment_status'] ?? null) {
                case 'finished':
                case 'partially_paid':
                    // Payment completed successfully
                    $this->handleSuccessfulPayment($paymentData);
                    break;
                case 'failed':
                case 'expired':
                case 'refunded':
                    // Payment failed or expired
                    $this->handleFailedPayment($paymentData);
                    break;
                case 'waiting':
                case 'confirming':
                case 'confirmed':
                case 'sending':
                    // Payment in progress
                    Log::info('Payment in progress', $paymentData);
                    break;
            }

            return response()->json(['status' => 'ok']);

        } catch (\Exception $e) {
            Log::error('NOWPayments webhook error: '.$e->getMessage());

            return response()->json(['error' => 'Webhook processing failed'], 500);
        }
    }

    private function handleSuccessfulPayment($paymentData)
    {
        // Extract user ID from order_id
        $orderId = $paymentData['order_id'] ?? '';
        if (preg_match('/crypto_(\d+)_/', $orderId, $matches)) {
            $userId = $matches[1];
            $user = User::find($userId);

            if (! $user) {
                Log::error('User not found for crypto payment', ['user_id' => $userId, 'payment_data' => $paymentData]);

                return;
            }

            // Prevent duplicate processing
            $transactionAlreadyExists = Transaction::byTxnId($paymentData['payment_id'])->exists();
            if ($transactionAlreadyExists) {
                Log::info('Crypto payment already processed', ['payment_id' => $paymentData['payment_id']]);

                return;
            }

            DB::transaction(function () use ($user, $paymentData) {
                $amount = (float) $paymentData['price_amount'];

                $fiatAmount = $paymentData['price_amount'] / $paymentData['pay_amount'] * $paymentData['actually_paid'];
                $fiatAmount = round($fiatAmount, 0);

                // Find existing pending exchange request by wallet address
                $exchangeRequest = ExchangeRequest::where('gateway', PaymentGatewayEnum::NOWPAYMENTS)
                    ->where('status', ExchangeRequestStatusEnum::PENDING)
                    ->where('type', TransactionTypeEnum::DEPOSIT)
                    ->where('created_by', $user->id)
                    ->where('metadata->pay_address', $paymentData['pay_address'])
                    ->firstOrFail();

                // Update exchange request with callback data
                $exchangeRequest->update([
                    'approved_money' => $fiatAmount,
                    'after_money' => $user->wallet->holding_money + $fiatAmount,
                    'description' => "Crypto deposit - {$paymentData['pay_currency']} payment",
                    'metadata' => $paymentData,
                ]);

                $transaction = Transaction::createTransaction(
                    type: TransactionTypeEnum::DEPOSIT,
                    amount: $fiatAmount,
                    moneyType: MoneyTypeEnum::MONEY,
                    user: $user,
                    exchangeRequest: $exchangeRequest,
                    source: TransactionSourceEnum::CRYPTO,
                    category: TransactionCategoryEnum::MONEY_DEPOSITED,
                    memo: "Now payment deposit - {$paymentData['pay_currency']} payment",
                    txnId: $paymentData['payment_id'],
                );

                $exchangeRequest->approve(ExchangeRequestStatusEnum::APPROVED, [
                    'approved_money' => $fiatAmount,
                    'after_money' => $user->wallet->holding_money,
                    'approved_by' => $user->id,
                    'updated_by' => $user->id,
                ], cb: fn (ExchangeRequest $record) => $record->afterApprove($transaction));

                Log::info('Crypto payment completed and wallet updated', [
                    'user_id' => $user->id,
                    'amount' => $fiatAmount,
                    'currency' => $paymentData['price_currency'],
                    'payment_id' => $paymentData['payment_id'],
                    'transaction_id' => $transaction->id,
                    'transaction_number' => $transaction->transaction_number,
                ]);
            });
        }
    }

    private function handleFailedPayment($paymentData)
    {
        Log::warning('Crypto payment failed', $paymentData);
        // Handle failed payment logic here
    }

    /**
     * Create crypto withdrawal/payout request
     */
    public function createCryptoWithdrawal(CreateCryptoWithdrawalRequest $request)
    {
        try {
            $user = Auth::user();
            // If Cryptoments is enabled, delegate to CryptomentsService
            if (config('cryptoments.enabled')) {
                $result = $this->cryptoService->handleCreateWithdrawal(
                    $user,
                    (float) $request->requested_money,
                    $request->currency,
                    $request->withdrawal_address,
                    $request->ip()
                );

                return $this->sendResponse($result, $result['success'] ? 200 : 400);
            }

            // Validate withdrawal request using service
            $validation = $this->cryptoService->validateWithdrawalRequest(
                $user,
                $request->requested_money,
                $request->withdrawal_address,
                $request->currency
            );

            if (! $validation['valid']) {
                return $this->sendResponse([
                    'success' => false,
                    'message' => $validation['message'],
                ] + (isset($validation['available_balance']) ? [
                    'available_balance' => $validation['available_balance'],
                    'requested_amount' => $validation['requested_amount'],
                ] : []), 400);
            }

            $exchangeRate = $this->cryptoService->getEstimatedExchangeRate($request->requested_money, $user->currency, $request->currency, true);

            // Create withdrawal request using service
            $result = $this->cryptoService->createWithdrawalRequest($user, [
                'requested_money' => $request->requested_money, // Keep original fiat amount
                'currency' => $request->currency, // Use crypto currency from request (e.g., 'usdtarb')
                'withdrawal_address' => $request->withdrawal_address,
                'fiat_amount' => $request->requested_money, // Fiat amount in IDR
                'fiat_currency' => $user->currency, // Fiat currency (IDR)
                'crypto_amount' => $exchangeRate['estimated_amount'] ?? 0, // Estimated crypto amount
                'ip_address' => $request->ip(),
            ]);

            return $this->sendResponse($result, $result['success'] ? 200 : 400);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return $this->sendResponse([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            Log::error('Crypto withdrawal controller error: '.$e->getMessage(), [
                'user_id' => auth()->id(),
                'request_data' => $request->all(),
            ]);

            return $this->sendResponse([
                'success' => false,
                'message' => 'Failed to create crypto withdrawal. Please try again later.',
            ], 500);
        }
    }

    /**
     * Get crypto withdrawal status
     */
    public function getCryptoWithdrawalStatus(Request $request)
    {
        try {
            $request->validate([
                'withdrawal_id' => 'required|string',
            ]);

            $user = Auth::user();
            $result = $this->cryptoService->getWithdrawalStatus($user, $request->withdrawal_id);

            return $this->sendResponse($result, $result['success'] ? 200 : 404);

        } catch (\Exception $e) {
            Log::error('Crypto withdrawal status controller error: '.$e->getMessage());

            return $this->sendResponse([
                'success' => false,
                'message' => 'Failed to get withdrawal status',
            ], 500);
        }
    }

    /**
     * Handle crypto withdrawal webhook from NOWPayments
     */
    public function cryptoWithdrawalWebhook(Request $request)
    {
        try {
            $withdrawalData = $request->all();

            // Log webhook to database
            $this->cryptoService->logNowpaymentsApiCall(
                '/webhook/withdrawal',
                'POST',
                $withdrawalData,
                null,
                'webhook'
            );

            // Verify the webhook signature if IPN secret is configured
            $signature = $request->header('x-nowpayments-sig');
            if ($signature && ! $this->cryptoService->validateWebhookSignature($request->getContent(), $signature, true)) {
                Log::warning('Invalid NOWPayments payout webhook signature', [
                    'signature' => $signature,
                    'payload' => $request->getContent(),
                ]);

                return response()->json(['error' => 'Invalid signature'], 400);
            }

            // Validate basic webhook data
            if (! isset($withdrawalData['id']) || ! isset($withdrawalData['status'])) {
                Log::error('Invalid withdrawal webhook data', $withdrawalData);

                return response()->json(['status' => 'error'], 400);
            }

            // Process webhook using service
            $result = $this->cryptoService->processWithdrawalWebhook($withdrawalData);

            return response()->json($result, $result['status'] === 'error' ? 500 : 200);

        } catch (\Exception $e) {
            Log::error('Crypto withdrawal webhook controller error: '.$e->getMessage());

            return response()->json(['error' => 'Webhook processing failed'], 500);
        }
    }

    /**
     * Verify crypto wallet address using NOWPayments API
     */
    public function verifyCryptoAddress(VerifyCryptoAddressRequest $request)
    {
        try {
            $currency = strtolower($request->currency);
            if (config('cryptoments.enabled')) {
                $currency = 'usdc';
            }

            $address = trim($request->address);

            // Use CryptoService for address validation
            $validationResult = $this->cryptoService->validateAddress($address, $currency);

            $isValid = $validationResult['valid'];
            $errorMessage = $validationResult['error_message'] ?? null;

            // Generate appropriate message based on validation result
            $message = $isValid
                ? "Address verified successfully with NOWPayments for {$currency}"
                : ($errorMessage ?: "Address validation failed - invalid {$currency} address");

            return $this->sendResponse([
                'success' => true,
                'valid' => $isValid,
                'message' => $message,
                'currency' => $currency,
                'address' => $address,
                'validation_method' => 'nowpayments_api',
            ]);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return $this->sendResponse([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            Log::error('Crypto address verification error: '.$e->getMessage(), [
                'address' => $request->address ?? null,
                'currency' => $request->currency ?? null,
                'trace' => $e->getTraceAsString(),
            ]);

            return $this->sendResponse([
                'success' => false,
                'message' => 'Address verification failed. Please try again.',
            ], 500);
        }
    }

    /**
     * Get minimum payment amount for a specific cryptocurrency (for deposits/payments only)
     */
    public function getMinimumDepositAmount(Request $request)
    {
        try {
            // Validate once for both flows
            $request->validate([
                'currency_from' => 'required|string',
            ]);

            // If Cryptoments is enabled, use CryptomentsService directly
            if (config('cryptoments.enabled')) {
                $result = $this->cryptoService->getMinimumDepositAmountInKrw($request->currency_from);

                return $this->sendResponse($result, $result['success'] ? 200 : 400);
            }

            $user = Auth::user();
            $currencyFrom = strtolower($request->currency_from);
            $fiatEquivalent = strtolower($user->currency); // Use user's currency from database

            // Use CryptoService for minimum amount
            $result = $this->cryptoService->getMinimumAmount($currencyFrom, $fiatEquivalent);

            return $this->sendResponse($result, $result['success'] ? 200 : 400);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return $this->sendResponse([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            Log::error('Minimum amount controller error: '.$e->getMessage(), [
                'currency_from' => $request->currency_from ?? null,
                'user_currency' => Auth::user()->currency ?? null,
            ]);

            return $this->sendResponse([
                'success' => false,
                'message' => 'Failed to get minimum amount. Please try again.',
            ], 500);
        }
    }

    /**
     * Get minimum withdrawal amount for a specific cryptocurrency (for withdrawals/payouts only)
     */
    public function getMinimumWithdrawalAmount(Request $request)
    {
        try {
            // Validate once for both flows
            $request->validate([
                'currency' => 'required|string',
            ]);

            // If Cryptoments is enabled, use CryptomentsService directly
            if (config('cryptoments.enabled')) {
                $result = $this->cryptoService->getMinimumWithdrawalAmountInKrw($request->currency);

                return $this->sendResponse($result, $result['success'] ? 200 : 400);
            }

            $user = Auth::user();
            $currency = strtolower($request->currency);
            $fiatCurrency = strtolower($user->currency); // Use user's currency from database

            // Use CryptoService for minimum withdrawal amount with fiat conversion
            $result = $this->cryptoService->getMinimumWithdrawalAmount($currency, $fiatCurrency);

            return $this->sendResponse($result, $result['success'] ? 200 : 400);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return $this->sendResponse([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            Log::error('Minimum withdrawal amount controller error: '.$e->getMessage(), [
                'currency' => $request->currency ?? null,
                'user_currency' => Auth::user()->currency ?? null,
            ]);

            return $this->sendResponse([
                'success' => false,
                'message' => 'Failed to get minimum withdrawal amount. Please try again.',
            ], 500);
        }
    }

    /**
     * Get estimated exchange rate for withdrawal amount
     */
    public function getEstimatedExchangeRate(Request $request)
    {
        try {
            // Validate once for both flows (NOWPayments and Cryptoments)
            $request->validate([
                'amount' => 'required|numeric',
                'currency_from' => 'required|string',
                'currency_to' => 'required|string',
                'is_withdrawal' => 'sometimes|boolean',
            ]);

            // If Cryptoments is enabled, use CryptomentsService directly
            if (config('cryptoments.enabled')) {
                $result = $this->cryptoService->getEstimatedExchangeRateForCryptoments(
                    (float) $request->amount,
                    $request->currency_from,
                    $request->currency_to
                );

                return $this->sendResponse($result, $result['success'] ? 200 : 400);
            }

            $amount = $request->amount;
            $currencyFrom = strtolower($request->currency_from);
            $currencyTo = strtolower($request->currency_to);
            $isWithdrawal = $request->boolean('is_withdrawal', false);

            // Use CryptoService for exchange rate estimation (with fee calculation for withdrawals)
            $result = $this->cryptoService->getEstimatedExchangeRate($amount, $currencyFrom, $currencyTo, $isWithdrawal);

            return $this->sendResponse($result, $result['success'] ? 200 : 400);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return $this->sendResponse([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            Log::error('Exchange rate estimation error: '.$e->getMessage(), [
                'amount' => $request->amount ?? null,
                'currency_from' => $request->currency_from ?? null,
                'currency_to' => $request->currency_to ?? null,
            ]);

            return $this->sendResponse([
                'success' => false,
                'message' => 'Failed to get exchange rate estimate. Please try again.',
            ], 500);
        }
    }

    /**
     * Check if user has pending deposit requests (supports Cryptoments and NOWPayments)
     */
    public function checkPendingDeposits(Request $request)
    {
        try {
            $user = Auth::user();
            $result = $this->cryptomentsService->getPendingDepositRequests($user);

            return $this->sendResponse($result);

        } catch (\Exception $e) {
            Log::error('Check pending deposits error: '.$e->getMessage(), [
                'user_id' => auth()->id(),
            ]);

            return $this->sendResponse([
                'success' => false,
                'message' => 'Failed to check pending deposits.',
            ], 500);
        }
    }

    /**
     * Cancel a pending deposit (supports Cryptoments and NOWPayments)
     */
    public function cancelDeposit(Request $request)
    {
        try {
            $request->validate([
                'id' => 'required',
            ]);

            $user = Auth::user();
            $id = $request->id;
            $result = $this->cryptomentsService->cancelDepositRequest($user, $id);

            return $this->sendResponse($result, $result['success'] ? 200 : 404);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return $this->sendResponse([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            Log::error('Cancel deposit error: '.$e->getMessage(), [
                'user_id' => auth()->id(),
                'id' => $request->id ?? null,
            ]);

            return $this->sendResponse([
                'success' => false,
                'message' => 'Failed to cancel deposit.',
            ], 500);
        }
    }
}
