<?php

namespace App\Streaming;

use App\Models\TournamentMatch;
use App\Settings\StreamingSettings;
use App\Streaming\Contracts\StreamProviderContract;

class StreamProviderResolver
{
    public function __construct(private StreamProviderManager $manager) {}

    public function forMatch(TournamentMatch $match): StreamProviderContract
    {
        if ($match->stream?->provider) {
            return $this->manager->driver($match->stream->provider);
        }

        $slug = $match->stream_provider_override
            ?? $match->tournament?->stream_provider
            ?? app(StreamingSettings::class)->defaultProvider;

        return $this->manager->driver($slug);
    }
}
