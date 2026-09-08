<?php

namespace App\Streaming\Data;

use Illuminate\Support\Carbon;

final readonly class CreateStreamData
{
    public string $description;

    public function __construct(
        public string $title,
        ?string $description = null,
        public ?Carbon $scheduledAt = null,
        public string $privacy = 'public',
        public ?string $streamingUrl = null,
        /** Required for YouTube unless $mintOwnKey. */
        public ?int $youtubeStreamKeyId = null,
        /** Self-serve only: mint a one-off key instead of using the admin pool. */
        public bool $mintOwnKey = false,
    ) {
        $this->description = $description ?? '';
    }
}
