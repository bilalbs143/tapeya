<?php

use App\Http\Controllers\v1\Seamless\AntechipController;
use App\Http\Controllers\v1\Seamless\FourTenController;
use App\Http\Controllers\v1\Seamless\TheBigHitController;
use App\Http\Controllers\v1\Seamless\VinusController;
use Illuminate\Support\Facades\Route;

Route::prefix('antechip')->middleware('seamless.antechip')->controller(AntechipController::class)->group(function () {
    Route::post('authenticate', 'authenticate');
    Route::post('balance', 'balance');
    Route::post('debit', 'debit');
    Route::post('refund', 'refund');
    Route::post('credit', 'credit');
    Route::post('cancel', 'cancel');
    Route::post('jackpot', 'jackpot');
    Route::post('bonus', 'bonus');
    Route::post('promo_win', 'promoWin');
    Route::post('endround', 'endround');
    Route::post('report_errors', 'reportErrors');
});

Route::prefix('vinus')->middleware('seamless.vinus')->controller(VinusController::class)->group(function () {
    Route::post('/', 'index');
});

Route::prefix('thebighit')->middleware('seamless.thebighit')->controller(TheBigHitController::class)->group(function () {
    Route::post('/auth', 'auth');
    Route::post('/result', 'result');
});

Route::prefix('fourten/api')->middleware('seamless.fourten')->controller(FourTenController::class)->group(function () {
    Route::get('/balance', 'balance');            // Balance Inquiry - Returns RAW TEXT
    Route::get('/bet', 'bet');                    // Bet (Debit)
    Route::get('/result', 'result');              // Result (WIN/CANCEL/PROMO_WIN/ADJUST/CANCEL_WIN)
    Route::get('/betwin', 'betwin');              // BetWin - Process bet and win simultaneously
    Route::post('/betting_detail', 'bettingDetail'); // Betting Detail - POST (Evolution only)
});
