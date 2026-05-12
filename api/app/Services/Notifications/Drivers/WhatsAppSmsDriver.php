<?php

namespace App\Services\Notifications\Drivers;

use App\Contracts\Notifications\SmsDriverInterface;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use RuntimeException;

/**
 * Meta WhatsApp Business API driver.
 *
 * Implements SmsDriverInterface so it slots into the existing SmsSender /
 * SmsChannel / OtpService pipeline with zero changes to those callers.
 *
 * OTP / auth path
 * ───────────────
 * send() is called by SmsChannel with a plain-text OTP message. It extracts
 * the numeric code via regex and dispatches it using the "auth" template.
 *
 * Arbitrary templates
 * ───────────────────
 * sendTemplate() accepts any key defined in config('whatsapp.templates') and
 * a pre-built components array in Meta Graph API format. This covers order
 * confirmations, marketing broadcasts, info notifications, and any future
 * template type — all without touching this class.
 *
 * Adding a new template type
 * ──────────────────────────
 * 1. Register the template in Meta Business Manager and get it approved.
 * 2. Add a new entry under config/whatsapp.php → templates (e.g. 'shipping').
 * 3. Set the corresponding env vars in .env.
 * 4. Call  $driver->sendTemplate($to, 'shipping', $components)  from your job/notification.
 *
 * @see https://developers.facebook.com/docs/whatsapp/cloud-api/messages/send-template
 */
class WhatsAppSmsDriver implements SmsDriverInterface
{
    /**
     * Matches 4–8 consecutive digits — covers 4-digit OTPs (current) and any
     * future length change without driver edits.
     */
    private const OTP_PATTERN = '/\b(\d{4,8})\b/';

    // -------------------------------------------------------------------------
    // SmsDriverInterface — OTP / auth path
    // -------------------------------------------------------------------------

    /**
     * Called by SmsChannel / OtpService with a plain-text OTP message.
     * Extracts the numeric code and dispatches via the "auth" template.
     */
    public function send(string $to, string $message): void
    {
        $this->assertConfigured();

        $to         = $this->normalizePhone($to);
        $otp        = $this->extractOtp($message);
        $components = $this->buildOtpComponents($otp);

        $this->dispatch($to, 'auth', $components);
    }

    // -------------------------------------------------------------------------
    // General-purpose template sending
    // -------------------------------------------------------------------------

    /**
     * Send any pre-approved template by its config key.
     *
     * $templateKey must match a key in config('whatsapp.templates').
     * $components is the raw Meta Graph API components array — callers build it
     * to match their specific template structure (body params, header, buttons…).
     * Omit or pass [] for templates that have no variable parameters.
     *
     * Example — order confirmation with two body parameters:
     *
     *   $driver->sendTemplate('+923001234567', 'order', [
     *       [
     *           'type'       => 'body',
     *           'parameters' => [
     *               ['type' => 'text', 'text' => '#ORD-1234'],
     *               ['type' => 'text', 'text' => 'PKR 1,500'],
     *           ],
     *       ],
     *   ]);
     *
     * @param  array<int, array<string, mixed>>  $components
     */
    public function sendTemplate(string $to, string $templateKey, array $components = []): void
    {
        $this->assertConfigured();

        $to = $this->normalizePhone($to);

        $this->dispatch($to, $templateKey, $components);
    }

    // -------------------------------------------------------------------------
    // Internal helpers
    // -------------------------------------------------------------------------

    /**
     * Throw early if required credentials are missing so the error surfaces
     * before any HTTP call rather than as a cryptic 400/401 from Meta.
     */
    private function assertConfigured(): void
    {
        $missing = [];

        if (blank(config('whatsapp.phone_number_id'))) {
            $missing[] = 'WHATSAPP_PHONE_NUMBER_ID';
        }

        if (blank(config('whatsapp.access_token'))) {
            $missing[] = 'WHATSAPP_ACCESS_TOKEN';
        }

        if ($missing !== []) {
            throw new RuntimeException(
                'WhatsApp driver is not configured. Missing env vars: '.implode(', ', $missing)
            );
        }
    }

    /**
     * Strip leading + and any non-digit characters.
     * WhatsApp Cloud API expects E.164 without the plus sign (e.g. 923001234567).
     */
    private function normalizePhone(string $phone): string
    {
        return preg_replace('/\D/', '', ltrim($phone, '+'));
    }

    /**
     * Pull the numeric OTP out of the plain-text message built by OtpService.
     * Falls back to the full message so callers do not crash on unexpected input.
     */
    private function extractOtp(string $message): string
    {
        if (preg_match(self::OTP_PATTERN, $message, $matches)) {
            return $matches[1];
        }

        Log::warning('WhatsApp driver: could not extract OTP from message; using raw message as parameter.', [
            'message' => $message,
        ]);

        return $message;
    }

    /**
     * Build the components array for the "auth" (OTP) template (body {{1}} only).
     *
     * @return array<int, array<string, mixed>>
     */
    private function buildOtpComponents(string $otp): array
    {
        return [
            [
                'type'       => 'body',
                'parameters' => [
                    ['type' => 'text', 'text' => $otp],
                ],
            ],
        ];
    }

    /**
     * Resolve template name and language from the templates map by key.
     *
     * @return array{name: string, language: string}
     *
     * @throws RuntimeException if the key is not defined in config.
     */
    private function resolveTemplate(string $key): array
    {
        $template = config("whatsapp.templates.{$key}");

        if (blank($template)) {
            throw new RuntimeException(
                "WhatsApp template key \"{$key}\" is not defined in config/whatsapp.php → templates."
            );
        }

        return [
            'name'     => (string) ($template['name'] ?? $key),
            'language' => (string) ($template['language'] ?? 'en_US'),
        ];
    }

    /**
     * Build the payload and POST it to the Graph API messages endpoint.
     *
     * @param  array<int, array<string, mixed>>  $components
     */
    private function dispatch(string $to, string $templateKey, array $components): void
    {
        ['name' => $name, 'language' => $language] = $this->resolveTemplate($templateKey);

        $payload = [
            'messaging_product' => 'whatsapp',
            'to'                => $to,
            'type'              => 'template',
            'template'          => [
                'name'     => $name,
                'language' => ['code' => $language],
            ],
        ];

        // Only include components when the template has variable parameters.
        if ($components !== []) {
            $payload['template']['components'] = $components;
        }

        $version       = (string) config('whatsapp.api_version', 'v25.0');
        $phoneNumberId = (string) config('whatsapp.phone_number_id');
        $token         = (string) config('whatsapp.access_token');
        $baseUrl       = rtrim((string) config('whatsapp.base_url', 'https://graph.facebook.com'), '/');

        $url = "{$baseUrl}/{$version}/{$phoneNumberId}/messages";

        $response = Http::withToken($token)
            ->acceptJson()
            ->asJson()
            ->timeout(30)
            ->post($url, $payload);

        $data = $response->json() ?? [];

        if (! $response->successful()) {
            $error = $data['error'] ?? [];

            Log::error('WhatsApp API error', [
                'to'           => $to,
                'template_key' => $templateKey,
                'template'     => $name,
                'status'       => $response->status(),
                'code'         => $error['code']       ?? null,
                'type'         => $error['type']       ?? null,
                'message'      => $error['message']    ?? $response->body(),
                'fbtrace'      => $error['fbtrace_id'] ?? null,
            ]);

            throw new RuntimeException(
                'WhatsApp message delivery failed (HTTP '.$response->status().'): '
                .($error['message'] ?? $response->body())
            );
        }

        $messageId = $data['messages'][0]['id'] ?? null;

        Log::info('WhatsApp message sent', [
            'to'           => $to,
            'template_key' => $templateKey,
            'message_id'   => $messageId,
            'status'       => $data['messages'][0]['message_status'] ?? null,
        ]);
    }
}
