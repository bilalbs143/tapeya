<?php

use App\Http\Controllers\Admin\CountryController;
use App\Http\Controllers\User\Auth\UserAuthController;
use App\Http\Controllers\User\EnumController;
use App\Http\Controllers\User\EventRequestController;
use App\Http\Controllers\User\ProfileController;
use App\Http\Controllers\User\Shop\BrandController;
use App\Http\Controllers\User\Shop\CartController;
use App\Http\Controllers\User\Shop\CategoryController;
use App\Http\Controllers\User\Shop\OrderController;
use App\Http\Controllers\User\Shop\ProductController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| User API (app / customer-facing)
|--------------------------------------------------------------------------
*/

Route::get('enums', [EnumController::class, 'index']);

Route::prefix('auth')->group(function () {
    Route::post('/register', [UserAuthController::class, 'register']);
    Route::post('/request-otp', [UserAuthController::class, 'requestOtp']);
    Route::post('/verify-otp', [UserAuthController::class, 'verifyOtp']);
    Route::post('/logout', [UserAuthController::class, 'logout'])->middleware('auth:api');
});

// User shop: all routes require auth
Route::middleware('auth:api')->prefix('shop')->group(function () {
    Route::get('products', [ProductController::class, 'index']);
    Route::get('products/{product:slug}', [ProductController::class, 'show']);
    Route::get('brands', [BrandController::class, 'index']);
    Route::get('brands/{brand}', [BrandController::class, 'show']);
    Route::get('categories', [CategoryController::class, 'index']);
    Route::get('categories/{category}', [CategoryController::class, 'show']);
    Route::get('cart', [CartController::class, 'show']);
    Route::post('cart/items', [CartController::class, 'addItem']);
    Route::patch('cart/items/{cartItem}', [CartController::class, 'updateItem']);
    Route::delete('cart/items/{cartItem}', [CartController::class, 'removeItem']);
    Route::post('orders', [OrderController::class, 'store']);
    Route::get('orders', [OrderController::class, 'index']);
    Route::get('orders/{order}', [OrderController::class, 'show']);
});

// Authenticated user: me, profile, countries, event requests
Route::middleware('auth:api')->group(function () {
    Route::get('/me', [UserAuthController::class, 'me']);
    Route::patch('profile', [ProfileController::class, 'update']);
    Route::get('countries', [CountryController::class, 'index']);
    Route::get('countries/cities', [CountryController::class, 'cities']);
    Route::post('event-requests', [EventRequestController::class, 'store']);
});
