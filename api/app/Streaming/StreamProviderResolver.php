<?php

namespace App\Streaming;

use App\Models\MatchStream;
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

    public function forStream(MatchStream $stream): StreamProviderContract
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
