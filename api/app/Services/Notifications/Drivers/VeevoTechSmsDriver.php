<?php

namespace App\Services\Notifications\Drivers;

use App\Contracts\Notifications\SmsDriverInterface;
use App\Settings\VeevoTechSmsSettings;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * VeevoTech SMS API: POST JSON to /v3/sendsms.
 *
 * @see https://api.veevotech.com/v3/sendsms
 */
class VeevoTechSmsDriver implements SmsDriverInterface
{
    public function __construct(private readonly VeevoTechSmsSettings $veevotechSmsSettings) {}

    public function send(string $to, string $message): void
    {
        $url = trim((string) ($this->veevotechSmsSettings->veevotechApiUrl ?? ''));
        $hash = $this->veevotechSmsSettings->veevotechApiKey;
        $hash = is_string($hash) ? trim($hash) : '';
        $from = $this->veevotechSmsSettings->from ?: 'Default';

        if ($url === '') {
            Log::warning('VeevoTech SMS failed: set VeevoTech API URL in System Settings.');

            throw new \RuntimeException('SMS provider is not configured (missing API URL).');
        }

        if ($hash === '') {
            Log::warning('VeevoTech SMS failed: set VeevoTech API key in System Settings.');

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
