<?php

namespace App\Streaming\Contracts;

use App\Models\MatchStream;
use App\Streaming\Data\CreateStreamData;
use App\Streaming\Data\StreamIngestConfig;
use App\Streaming\Data\StreamPlayback;

interface StreamProviderContract
{
    /** Create a live broadcast on the vendor and persist IDs onto $stream. */
    public function createStream(MatchStream $stream, CreateStreamData $data): void;

    /** Poll vendor API for current status and update $stream if changed. */
    public function syncStatus(MatchStream $stream): void;

    /** Gracefully end the broadcast. */
    public function endStream(MatchStream $stream): void;

    /** Remove remote resources. */
    public function deleteStream(MatchStream $stream): void;

    /** Build the client-safe playback descriptor. No secrets. */
    public function playback(MatchStream $stream): StreamPlayback;

    /** Return RTMP ingest credentials. Admin-only. */
    public function ingestConfig(MatchStream $stream): StreamIngestConfig;

    /** Provider slug — 'youtube' */
    public function slug(): string;

    /** True when provider fires webhooks. False = will be polled by scheduler. */
    public function supportsWebhooks(): bool;
}
