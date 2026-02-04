<?php

use App\Http\Controllers\Auth\AdminAuthController;
use App\Http\Controllers\Auth\UserAuthController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {
    Route::prefix('auth')->group(function () {
        Route::post('/login', [UserAuthController::class, 'login']);
        Route::post('/logout', [UserAuthController::class, 'logout'])
            ->middleware('auth:api');
    });

    Route::prefix('admin')->group(function () {
        Route::post('/login', [AdminAuthController::class, 'login']);
        Route::post('/logout', [AdminAuthController::class, 'logout'])
            ->middleware('auth:api');
    });

    Route::middleware('auth:api')->group(function () {
        Route::get('/me', function (Request $request) {
            return $request->user();
        });
    });
});
