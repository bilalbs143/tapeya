<?php

namespace App\Streaming;

use App\Settings\StreamingSettings;
use App\Streaming\Contracts\StreamProviderContract;
use App\Streaming\Providers\YouTubeStreamProvider;
use Illuminate\Support\Manager;

class StreamProviderManager extends Manager
{
    public function getDefaultDriver(): string
    {
        return app(StreamingSettings::class)->defaultProvider;
    }

    public function createYoutubeDriver(): StreamProviderContract
    {
        return $this->container->make(YouTubeStreamProvider::class);
    }
}
