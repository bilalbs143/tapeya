<?php

use App\Http\Controllers\v1\Auth\AuthController;
use App\Http\Controllers\v1\Auth\ProfileController;
use Illuminate\Support\Facades\Route;

Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);

Route::middleware('auth:api')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);

    Route::prefix('profile')->group(function () {
        Route::get('/me', [ProfileController::class, 'me']);
        Route::patch('/', [ProfileController::class, 'updateProfile']);
        Route::patch('/password', [ProfileController::class, 'updatePassword']);
    });
});
