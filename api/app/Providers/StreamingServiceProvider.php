<?php

namespace App\Providers;

use App\Streaming\Providers\YouTubeStreamProvider;
use App\Streaming\StreamProviderManager;
use App\Streaming\StreamProviderResolver;
use Illuminate\Support\ServiceProvider;

class StreamingServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->singleton(StreamProviderManager::class);
        $this->app->singleton(StreamProviderResolver::class);
        $this->app->singleton(YouTubeStreamProvider::class);
    }
}
