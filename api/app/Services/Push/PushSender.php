<?php

namespace App\Services\Push;

use App\Contracts\Push\PushDriverInterface;
use App\Services\Push\Drivers\FcmPushDriver;
use App\Settings\PushSettings;
use Illuminate\Support\Facades\App;

class PushSender
{
    private ?PushDriverInterface $driver = null;

    public function __construct(private readonly PushSettings $pushSettings) {}

    public function driver(): PushDriverInterface
    {
        if ($this->driver === null) {
            $this->driver = $this->resolveDriver((string) ($this->pushSettings->provider ?? 'fcm'));
        }

        return $this->driver;
    }

    /**
     * @param  list<string>  $tokens
     * @param  array<string, mixed>  $data
     * @return array{ success_count: int, failure_count: int, invalid_tokens: list<string> }
     */
    public function sendToTokens(
        array $tokens,
        string $title,
        string $body,
        array $data,
        ?string $imageUrl = null,
    ): array {
        // Re-resolve on each batch so admin config changes apply without restart.
        $this->driver = null;

        return $this->driver()->sendToTokens($tokens, $title, $body, $data, $imageUrl);
    }

    private function resolveDriver(string $name): PushDriverInterface
    {
        return match ($name) {
            'fcm' => App::make(FcmPushDriver::class),
            default => throw new \InvalidArgumentException("Unknown push provider: {$name}"),
        };
    }
}
