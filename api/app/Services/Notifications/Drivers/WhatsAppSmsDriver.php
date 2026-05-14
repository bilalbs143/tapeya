<?php

namespace App\Services\Notifications\Drivers;

use App\Contracts\Notifications\SmsDriverInterface;
use App\Settings\WhatsAppSettings;
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
 * sendTemplate() accepts any WhatsApp-approved template name + language plus
 * a pre-built components array in Meta Graph API format. Use this for
 * non-OTP messages (shipping, promotion, etc.) from queue jobs or notifications.
 *
 * Adding a new template type
 * ──────────────────────────
 * 1. Register the template in Meta Business Manager and get it approved.
 * 2. Call  $driver->sendTemplate($to, 'template_name', 'en_US', $components).
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

    public function __construct(private readonly WhatsAppSettings $whatsAppSettings) {}

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

        $to = $this->normalizePhone($to);
        $otp = $this->extractOtp($message);
        $components = $this->buildOtpComponents($otp);

        $templateName = $this->whatsAppSettings->authTemplateName ?? 'otp';
        $templateLanguage = $this->whatsAppSettings->authTemplateLanguage ?? 'en_US';

        $this->dispatch($to, $templateName, $templateLanguage, $components);
    }

    // -------------------------------------------------------------------------
    // General-purpose template sending
    // -------------------------------------------------------------------------

    /**
     * Send any pre-approved template by name and language.
     *
     * $components is the raw Meta Graph API components array — callers build it
     * to match their specific template structure (body params, header, buttons…).
     * Omit or pass [] for templates that have no variable parameters.
     *
     * Example:
     *   $driver->sendTemplate('+923001234567', 'shipping_update', 'en_US', [
     *       ['type' => 'body', 'parameters' => [['type' => 'text', 'text' => '#ORD-1234']]],
     *   ]);
     *
     * @param  array<int, array<string, mixed>>  $components
     */
    public function sendTemplate(string $to, string $templateName, string $language = 'en_US', array $components = []): void
    {
        $this->assertConfigured();

        $to = $this->normalizePhone($to);

        $this->dispatch($to, $templateName, $language, $components);
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

        if (blank($this->whatsAppSettings->phoneNumberId)) {
            $missing[] = 'WhatsApp phone number id';
        }

        if (blank($this->whatsAppSettings->accessToken)) {
            $missing[] = 'WhatsApp access token';
        }

        if ($missing !== []) {
            throw new RuntimeException(
                'WhatsApp driver is not configured. Set '.implode(' and ', $missing).' in System Settings (WhatsApp).'
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
                'type' => 'body',
                'parameters' => [
                    ['type' => 'text', 'text' => $otp],
                ],
            ],
        ];
    }

    /**
     * Build the payload and POST it to the Graph API messages endpoint.
     *
     * @param  array<int, array<string, mixed>>  $components
     */
    private function dispatch(string $to, string $templateName, string $language, array $components): void
    {
        $payload = [
            'messaging_product' => 'whatsapp',
            'to' => $to,
            'type' => 'template',
            'template' => [
                'name' => $templateName,
                'language' => ['code' => $language],
            ],
        ];

        // Only include components when the template has variable parameters.
        if ($components !== []) {
            $payload['template']['components'] = $components;
        }

        $version = $this->whatsAppSettings->apiVersion ?? 'v25.0';
        $phoneNumberId = (string) $this->whatsAppSettings->phoneNumberId;
        $token = (string) $this->whatsAppSettings->accessToken;
        $baseUrl = rtrim($this->whatsAppSettings->baseUrl ?? 'https://graph.facebook.com', '/');

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
                'to' => $to,
                'template' => $templateName,
                'status' => $response->status(),
                'code' => $error['code'] ?? null,
                'type' => $error['type'] ?? null,
                'message' => $error['message'] ?? $response->body(),
                'fbtrace' => $error['fbtrace_id'] ?? null,
            ]);

            throw new RuntimeException(
                'WhatsApp message delivery failed (HTTP '.$response->status().'): '
                .($error['message'] ?? $response->body())
            );
        }

        $messageId = $data['messages'][0]['id'] ?? null;

        Log::info('WhatsApp message sent', [
            'to' => $to,
            'template' => $templateName,
            'message_id' => $messageId,
            'status' => $data['messages'][0]['message_status'] ?? null,
        ]);
    }
}
