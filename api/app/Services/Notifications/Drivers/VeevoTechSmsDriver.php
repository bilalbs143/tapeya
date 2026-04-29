<?php

namespace App\Services\Notifications\Drivers;

use App\Contracts\Notifications\SmsDriverInterface;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * VeevoTech SMS API: POST JSON to /v3/sendsms.
 *
 * @see https://api.veevotech.com/v3/sendsms
 */
class VeevoTechSmsDriver implements SmsDriverInterface
{
    public function send(string $to, string $message): void
    {
        $url = filled(config('services.sms.url'))
            ? (string) config('services.sms.url')
            : 'https://api.veevotech.com/v3/sendsms';
        $hash = config('services.sms.key');
        $from = config('services.sms.from') ?? config('notifications.sms.from', 'Default');

        if (! $hash) {
            Log::warning('VeevoTech SMS failed: missing SMS_API_KEY (API hash).');

            throw new \RuntimeException('SMS provider is not configured (missing API key).');
        }

        $payload = [
            'hash' => $hash,
            'receivernum' => $to,
            'sendernum' => $from,
            'textmessage' => $message,
        ];

        $response = Http::acceptJson()
            ->asJson()
            ->timeout(30)
            ->post($url, $payload);

        if (! $response->successful()) {
            Log::error('VeevoTech SMS HTTP error', [
                'to' => $to,
                'status' => $response->status(),
                'body' => $response->body(),
            ]);

            throw new \RuntimeException('SMS HTTP error: '.$response->status());
        }

        $data = $response->json();
        if (! is_array($data)) {
            Log::error('VeevoTech SMS invalid JSON body', [
                'to' => $to,
                'body' => $response->body(),
            ]);

            throw new \RuntimeException('SMS provider returned invalid JSON.');
        }

        Log::info('VeevoTech SMS provider response', [
            'to' => $to,
            'response' => $data,
        ]);

        $status = strtoupper((string) ($data['STATUS'] ?? ''));
        if ($status === 'ERROR') {
            Log::error('VeevoTech SMS API error', [
                'to' => $to,
                'filter' => $data['ERROR_FILTER'] ?? null,
                'code' => $data['ERROR_CODE'] ?? null,
                'description' => $data['ERROR_DESCRIPTION'] ?? null,
                'response' => $data,
            ]);

            throw new \RuntimeException('SMS provider rejected the request.');
        }

        if ($status !== '' && $status !== 'SUCCESSFUL') {
            Log::error('VeevoTech SMS non-success status', [
                'to' => $to,
                'response' => $data,
            ]);

            throw new \RuntimeException(
                'SMS provider returned a non-success status: '.$status
                .(isset($data['ERROR_DESCRIPTION']) && $data['ERROR_DESCRIPTION'] !== ''
                    ? ' ('.(string) $data['ERROR_DESCRIPTION'].')'
                    : '')
            );
        }
    }
}
