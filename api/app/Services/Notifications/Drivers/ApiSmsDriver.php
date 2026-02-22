<?php

namespace App\Services\Notifications\Drivers;

use App\Contracts\Notifications\SmsDriverInterface;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * Generic SMS driver: sends via HTTP API using config('services.sms').
 * Update this class (URL, auth, request body) to match the provider you choose.
 */
class ApiSmsDriver implements SmsDriverInterface
{
    public function send(string $to, string $message): void
    {
        $url = config('services.sms.url');
        $key = config('services.sms.key');
        $from = config('services.sms.from') ?? config('notifications.sms.from');

        if (! $url || ! $key || ! $from) {
            Log::warning('SMS API skipped: missing config (SMS_API_URL, SMS_API_KEY, SMS_FROM)');

            return;
        }

        $response = Http::withToken($key)
            ->post($url, [
                'to' => $to,
                'from' => $from,
                'message' => $message,
            ]);

        if (! $response->successful()) {
            Log::error('SMS API failed', [
                'to' => $to,
                'status' => $response->status(),
                'body' => $response->body(),
            ]);
            throw new \RuntimeException('SMS delivery failed: '.$response->body());
        }
    }
}
