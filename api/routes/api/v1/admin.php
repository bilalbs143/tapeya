<?php

use App\Http\Controllers\Admin\Auth\AdminAuthController;
use App\Http\Controllers\Admin\CountryController;
use App\Http\Controllers\Admin\EnumController;
use App\Http\Controllers\Admin\HeroSliderController;
use App\Http\Controllers\Admin\NotificationController;
use App\Http\Controllers\Admin\Shop\BrandController as AdminBrandController;
use App\Http\Controllers\Admin\Shop\CategoryController as AdminCategoryController;
use App\Http\Controllers\Admin\Shop\EcommerceDashboardController;
use App\Http\Controllers\Admin\Shop\OrderController as AdminOrderController;
use App\Http\Controllers\Admin\Shop\ProductController as AdminProductController;
use App\Http\Controllers\Admin\TournamentController;
use App\Http\Controllers\Admin\TournamentRequestController;
use App\Http\Controllers\Admin\UserController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Admin API (backoffice)
|--------------------------------------------------------------------------
*/

Route::prefix('admin')->group(function () {
    Route::post('/login', [AdminAuthController::class, 'login']);
    Route::post('/logout', [AdminAuthController::class, 'logout'])->middleware('auth:api');

    Route::middleware(['auth:api', 'admin.only'])->group(function () {
        Route::get('enums', [EnumController::class, 'index']);
        Route::get('notifications', [NotificationController::class, 'index']);
        Route::patch('notifications/read-all', [NotificationController::class, 'markAllAsRead']);
        Route::delete('notifications', [NotificationController::class, 'flush']);
        Route::patch('notifications/{id}/read', [NotificationController::class, 'markAsRead']);
        Route::get('countries', [CountryController::class, 'index']);
        Route::get('countries/cities', [CountryController::class, 'cities']);
        Route::apiResource('users', UserController::class);
        Route::apiResource('hero-sliders', HeroSliderController::class);
        Route::apiResource('tournaments', TournamentController::class);

        Route::get('tournament-requests', [TournamentRequestController::class, 'index']);
        Route::get('tournament-requests/{tournament_request}', [TournamentRequestController::class, 'show']);
        Route::match(['put', 'patch'], 'tournament-requests/{tournament_request}', [TournamentRequestController::class, 'update']);

        Route::prefix('shop')->group(function () {
            Route::get('dashboard-stats', EcommerceDashboardController::class);
            Route::apiResource('brands', AdminBrandController::class);
            Route::apiResource('categories', AdminCategoryController::class);
            Route::apiResource('products', AdminProductController::class);
            Route::get('orders', [AdminOrderController::class, 'index']);
            Route::get('orders/{order}', [AdminOrderController::class, 'show']);
            Route::match(['put', 'patch'], 'orders/{order}', [AdminOrderController::class, 'update']);
        });
    });
});
