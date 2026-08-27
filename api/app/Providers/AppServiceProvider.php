<?php

namespace App\Providers;

use App\Channels\SmsChannel;
use App\Enums\Event\MatchKindEnum;
use App\Models\CricketMatch;
use App\Models\User;
use App\Services\Notifications\SmsSender;
use App\Support\Media\MediaCdn;
use App\Support\Media\MediaDisk;
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
        MediaCdn::applyToFilesystemConfig();
        MediaDisk::configureFilesystem();

        Route::bind('player', function (string $value): User {
            return User::query()
                ->user()
                ->whereKey($value)
                ->firstOrFail();
        });

        Route::bind('quickMatch', function (string $value): CricketMatch {
            return CricketMatch::query()
                ->whereKey($value)
                ->where('kind', MatchKindEnum::QUICK)
                ->firstOrFail();
        });

        Notification::resolved(function (ChannelManager $service): void {
            $service->extend('sms', function ($app) {
                return $app->make(SmsChannel::class);
            });
        });
    }
}
