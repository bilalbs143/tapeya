<?php

namespace App\Streaming\Data;

final readonly class StreamIngestConfig
{
    public function __construct(
        public string $rtmpUrl,
        public string $streamKey,
        public ?string $backupRtmpUrl = null,
    ) {}
}
