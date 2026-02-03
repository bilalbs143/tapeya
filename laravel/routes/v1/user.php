<?php

use App\Http\Controllers\v1\User\AnnouncementController;
use App\Http\Controllers\v1\User\BankAccountController;
use App\Http\Controllers\v1\User\BankController;
use App\Http\Controllers\v1\User\CryptomentsPaymentController;
use App\Http\Controllers\v1\User\CustomerInquiryController;
use App\Http\Controllers\v1\User\ExchangeRequestController;
use App\Http\Controllers\v1\User\FaqController;
use App\Http\Controllers\v1\User\GameController;
use App\Http\Controllers\v1\User\NoteUserController;
use App\Http\Controllers\v1\User\PaymentController;
use App\Http\Controllers\v1\User\PopupController;
use App\Http\Controllers\v1\User\PromotionController;
use App\Http\Controllers\v1\User\PromotionProgressController;
use App\Http\Controllers\v1\User\ProviderController;
use App\Http\Controllers\v1\User\QuickAccountInquiryController;
use App\Http\Controllers\v1\User\ReferralController;
use App\Http\Controllers\v1\User\SystemController;
use App\Http\Controllers\v1\User\SystemSettingController;
use App\Http\Controllers\v1\User\TransactionController;
use App\Http\Controllers\v1\User\TransactionResultController;
use Illuminate\Support\Facades\Route;

Route::prefix('transactions')->group(function () {
    Route::get('/', [TransactionController::class, 'index']);

    Route::prefix('requests')->group(function () {
        Route::get('/', [ExchangeRequestController::class, 'index']);
        Route::get('/{exchangeRequest}', [ExchangeRequestController::class, 'show']);
        Route::post('/', [ExchangeRequestController::class, 'store']);
    });

    Route::prefix('real-time')->withoutMiddleware('auth:api')->group(function () {
        Route::get('/deposits', [TransactionController::class, 'realTimeDeposits']);
        Route::get('/withdrawals', [TransactionController::class, 'realTimeWithdrawals']);
        Route::get('/winners', [TransactionResultController::class, 'realTimeWinners']);
    });

    Route::prefix('bets')->group(function () {
        Route::get('/history', [TransactionResultController::class, 'index']);
    });
});

Route::prefix('faqs')->group(function () {
    Route::get('/', [FaqController::class, 'index']);
});

Route::prefix('announcements')->group(function () {
    Route::get('/', [AnnouncementController::class, 'index'])->withoutMiddleware('auth:api');
    Route::get('/important', [AnnouncementController::class, 'getImportant'])->withoutMiddleware('auth:api');
});

Route::prefix('quick-account-inquiries')->group(function () {
    Route::get('/', [QuickAccountInquiryController::class, 'index']);
    Route::post('/', [QuickAccountInquiryController::class, 'store']);
});

Route::prefix('customer-inquiries')->group(function () {
    Route::get('/', [CustomerInquiryController::class, 'index']);
    Route::get('/categories', [CustomerInquiryController::class, 'getCategories']);
    Route::get('/{customerInquiry}', [CustomerInquiryController::class, 'show']);
    Route::post('/', [CustomerInquiryController::class, 'store']);
    Route::delete('/{customerInquiry}', [CustomerInquiryController::class, 'destroy']);
});

Route::prefix('popups')->group(function () {
    Route::get('/', [PopupController::class, 'index'])->withoutMiddleware('auth:api');
});

Route::prefix('note/users')->group(function () {
    Route::get('/', [NoteUserController::class, 'index']);
    Route::get('/{noteUser}', [NoteUserController::class, 'show']);
});

Route::prefix('system-settings')->group(function () {
    Route::get('/{key}', [SystemSettingController::class, 'show'])->withoutMiddleware('auth:api');
});

Route::prefix('games')->group(function () {
    Route::withoutMiddleware('auth:api')->group(function () {
        Route::get('/', [GameController::class, 'index']);
        Route::get('/lobby', [GameController::class, 'getLobbyGames']);
        Route::get('/{game}', [GameController::class, 'show']);
    });
    Route::get('/{game}/launch', [GameController::class, 'launch']);
});

Route::prefix('banks')->withoutMiddleware('auth:api')->group(function () {
    Route::get('/', [BankController::class, 'index']);
});

Route::prefix('promotions')->group(function () {
    Route::withoutMiddleware('auth:api')->group(function () {
        Route::get('/', [PromotionController::class, 'index']);
        Route::get('/{promotion}', [PromotionController::class, 'show']);
    });

    Route::post('/{promotion}/activate', [PromotionController::class, 'activate']);
    Route::post('/{promotion}/redeem', [PromotionController::class, 'redeem']);
});

Route::prefix('promotion-progress')->group(function () {
    Route::get('/', [PromotionProgressController::class, 'index']);
});

Route::prefix('payments')->group(function () {
    Route::withoutMiddleware('auth:api')->group(function () {
        Route::get('/currencies', [PaymentController::class, 'getCurrencies']);
        Route::post('/crypto-withdrawal-webhook', [PaymentController::class, 'cryptoWithdrawalWebhook'])->middleware(['throttle:30,1'])->name('user.payments.crypto-withdrawal-webhook');
        Route::post('/webhook', [PaymentController::class, 'handleWebhook'])->middleware(['throttle:30,1'])->name('user.payments.webhook');
    });

    // Deposit route
    Route::post('/deposit', [PaymentController::class, 'createDepositWallet']);

    // Crypto withdrawal routes
    Route::post('/crypto-withdrawal', [PaymentController::class, 'createCryptoWithdrawal']);
    Route::get('/crypto-withdrawal-status', [PaymentController::class, 'getCryptoWithdrawalStatus']);

    // Address verification and balance routes
    Route::post('/verify-crypto-address', [PaymentController::class, 'verifyCryptoAddress']);
    Route::get('/estimated-exchange-rate', [PaymentController::class, 'getEstimatedExchangeRate']);
    Route::get('/minimum-deposit-amount', [PaymentController::class, 'getMinimumDepositAmount']);
    Route::get('/minimum-withdrawal-amount', [PaymentController::class, 'getMinimumWithdrawalAmount']);

    // Other payment methods (to be implemented)
    Route::post('/bank', [PaymentController::class, 'createBankPayment']);
    Route::post('/card', [PaymentController::class, 'createCardPayment']);

    // Payment status and webhook
    Route::get('/status', [PaymentController::class, 'getPaymentStatus']);

    // Check pending deposits
    Route::get('/pending-deposits', [PaymentController::class, 'checkPendingDeposits']);

    // Cancel deposit
    Route::post('/cancel-deposit', [PaymentController::class, 'cancelDeposit']);
});

// Cryptoments payment routes
Route::prefix('cryptoments-payments')->group(function () {
    Route::withoutMiddleware('auth:api')->group(function () {
        // Webhook callbacks (no authentication required)
        Route::post('/callback/deposit', [CryptomentsPaymentController::class, 'handleDepositCallback'])
            ->middleware(['throttle:60,1'])
            ->name('user.cryptoments.callback.deposit');
        Route::post('/callback/withdrawal', [CryptomentsPaymentController::class, 'handleWithdrawalCallback'])
            ->middleware(['throttle:60,1'])
            ->name('user.cryptoments.callback.withdrawal');
    });

});

Route::prefix('bank-accounts')->group(function () {
    Route::get('/', [BankAccountController::class, 'index']);
});

Route::prefix('providers')->withoutMiddleware('auth:api')->group(function () {
    Route::get('/', [ProviderController::class, 'index']);
});

Route::prefix('system')->group(function () {
    Route::withoutMiddleware('auth:api')->group(function () {
        Route::get('/info', [SystemController::class, 'info']);
    });
});

Route::prefix('referrals')->group(function () {
    Route::get('/', [ReferralController::class, 'index']);
});
