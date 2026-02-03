<?php

namespace App\Http\Controllers\v1\User;

use App\Http\Controllers\Controller;
use App\Services\CryptomentsService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class CryptomentsPaymentController extends Controller
{
    protected $cryptomentsService;

    public function __construct(CryptomentsService $cryptomentsService)
    {
        $this->cryptomentsService = $cryptomentsService;
    }

    private function sendResponse($data, $status = 200)
    {
        return response()->json(['data' => $data], $status);
    }

    /**
     * Handle deposit callback webhook from Cryptoments
     */
    public function handleDepositCallback(Request $request)
    {
        try {
            $callbackData = $request->all();
            $rawBody = $request->getContent();

            // Log webhook to database
            $this->cryptomentsService->logCryptomentsApiCall(
                '/callback/deposit',
                'POST',
                $callbackData,
                null,
                'webhook'
            );

            $signature = $callbackData['signature'] ?? null;

            if (! $this->cryptomentsService->verifyWebhookSignature($callbackData, $signature, $rawBody)) {
                Log::warning('Invalid Cryptoments deposit callback signature', [
                    'signature' => $signature,
                    'callback_data' => $callbackData,
                ]);

                return response()->json([
                    'success' => false,
                    'error' => 'Invalid signature',
                ], 400);
            }

            // Process deposit callback
            $result = $this->cryptomentsService->processDepositCallback($callbackData);

            return response()->json($result, $result['success'] ? 200 : 500);

        } catch (\Exception $e) {
            Log::error('Cryptoments deposit callback controller error: '.$e->getMessage());

            return response()->json([
                'success' => false,
                'error' => 'Callback processing failed',
            ], 500);
        }
    }

    /**
     * Handle withdrawal callback webhook from Cryptoments
     */
    public function handleWithdrawalCallback(Request $request)
    {
        try {
            $callbackData = $request->all();
            $rawBody = $request->getContent();

            // Log webhook to database
            $this->cryptomentsService->logCryptomentsApiCall(
                '/callback/withdrawal',
                'POST',
                $callbackData,
                null,
                'webhook'
            );

            $signature = $callbackData['signature'] ?? null;

            if (! $signature) {
                Log::warning('Cryptoments withdrawal callback signature missing', [
                    'callback_data' => $callbackData,
                ]);

                return response()->json([
                    'success' => false,
                    'error' => 'Missing signature',
                ], 400);
            }

            if (! $this->cryptomentsService->verifyWebhookSignature($callbackData, $signature, $rawBody)) {
                Log::warning('Invalid Cryptoments withdrawal callback signature', [
                    'signature' => $signature,
                    'callback_data' => $callbackData,
                ]);

                return response()->json([
                    'success' => false,
                    'error' => 'Invalid signature',
                ], 400);
            }

            // Process withdrawal callback
            $result = $this->cryptomentsService->processWithdrawalCallback($callbackData);

            return response()->json($result, $result['success'] ? 200 : 500);

        } catch (\Exception $e) {
            Log::error('Cryptoments withdrawal callback controller error: '.$e->getMessage());

            return response()->json([
                'success' => false,
                'error' => 'Callback processing failed',
            ], 500);
        }
    }
}
