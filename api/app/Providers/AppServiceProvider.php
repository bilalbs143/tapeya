<?php

namespace App\Providers;

use App\Channels\SmsChannel;
use App\Enums\User\AppRoleEnum;
use App\Models\User;
use App\Services\Notifications\SmsSender;
use Illuminate\Notifications\ChannelManager;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->singleton(SmsSender::class);
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Route::bind('player', function (string $value): User {
            return User::query()
                ->user()
                ->withRole(AppRoleEnum::PLAYER)
                ->whereKey($value)
                ->firstOrFail();
        });

        Notification::resolved(function (ChannelManager $service): void {
            $service->extend('sms', function ($app) {
                return $app->make(SmsChannel::class);
            });
        });
    }
}
