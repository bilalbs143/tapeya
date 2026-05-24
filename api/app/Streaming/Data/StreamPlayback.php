<?php

namespace App\Streaming\Data;

final readonly class StreamPlayback
{
    /**
     * @param  array<string, mixed>  $playerOptions
     */
    public function __construct(
        public string $mode,
        public ?string $url,
        public ?string $embedId,
        public ?string $embedUrl,
        public array $playerOptions = [],
    ) {}
}
