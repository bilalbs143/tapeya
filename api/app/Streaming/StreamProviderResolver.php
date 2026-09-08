<?php

namespace App\Streaming;

use App\Models\LiveStream;
use App\Models\TournamentMatch;
use App\Settings\StreamingSettings;
use App\Streaming\Contracts\StreamProviderContract;

class StreamProviderResolver
{
    public function __construct(private StreamProviderManager $manager) {}

    public function forMatch(TournamentMatch $match): StreamProviderContract
    {
        return $this->manager->driver($this->slugForMatch($match));
    }

    /**
     * Provider slug for a match without constructing the driver.
     */
    public function slugForMatch(TournamentMatch $match): string
    {
        if ($match->stream?->provider) {
            return $match->stream->provider;
        }

        return $match->stream_provider_override
            ?? $match->tournament?->stream_provider
            ?? app(StreamingSettings::class)->defaultProvider;
    }

    public function forStream(LiveStream $stream): StreamProviderContract
    {
        if ($stream->provider === 'external') {
            throw new \LogicException('External streams have no provider driver.');
        }

        if ($stream->provider) {
            return $this->manager->driver($stream->provider);
        }

        if ($stream->match_id) {
            return $this->forMatch($stream->match);
        }

        return $this->manager->driver(app(StreamingSettings::class)->defaultProvider);
    }
}
