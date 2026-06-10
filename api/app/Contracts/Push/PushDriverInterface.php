<?php

namespace App\Contracts\Push;

interface PushDriverInterface
{
    /**
     * @param  list<string>  $tokens
     * @param  array<string, mixed>  $data
     * @return array{ success_count: int, failure_count: int, invalid_tokens: list<string> }
     */
    public function sendToTokens(
        array $tokens,
        string $title,
        string $body,
        array $data = [],
        ?string $imageUrl = null,
    ): array;
}
