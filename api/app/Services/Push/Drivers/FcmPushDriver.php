<?php

namespace App\Services\Push\Drivers;

use App\Contracts\Push\PushDriverInterface;
use App\Models\DeviceToken;
use App\Settings\PushSettings;
use Google\Client as GoogleClient;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class FcmPushDriver implements PushDriverInterface
{
    private const FCM_SCOPE = 'https://www.googleapis.com/auth/firebase.messaging';

    private const CACHE_KEY = 'fcm_access_token'; // env suffix appended at runtime — see getAccessToken()

    private const POOL_CONCURRENCY = 100;

    public function __construct(private readonly PushSettings $pushSettings) {}

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
    ): array {
        if ($tokens === []) {
            return ['success_count' => 0, 'failure_count' => 0, 'invalid_tokens' => []];
        }

        $projectId = $this->pushSettings->fcmProjectId;
        $serviceAccountJson = $this->pushSettings->fcmServiceAccountJson;

        if (! $projectId || ! $serviceAccountJson) {
            throw new \RuntimeException('FCM is not configured. Set project ID and service account JSON in System Settings.');
        }

        $accessToken = $this->getAccessToken($serviceAccountJson);
        $stringData = $this->stringifyData($data);
        $endpoint = "https://fcm.googleapis.com/v1/projects/{$projectId}/messages:send";

        $successCount = 0;
        $failureCount = 0;
        $invalidTokens = [];

        foreach (array_chunk($tokens, self::POOL_CONCURRENCY) as $chunk) {
            $responses = Http::pool(function ($pool) use ($chunk, $endpoint, $accessToken, $title, $body, $stringData, $imageUrl) {
                $requests = [];

                foreach ($chunk as $index => $token) {
                    $message = [
                        'message' => [
                            'token' => $token,
                            'notification' => array_filter([
                                'title' => $title,
                                'body' => $body,
                                'image' => $imageUrl,
                            ]),
                            'data' => $stringData,
                            'android' => [
                                'priority' => 'HIGH',
                            ],
                            'apns' => [
                                'headers' => [
                                    'apns-priority' => '10',
                                ],
                                'payload' => [
                                    'aps' => [
                                        'sound' => 'default',
                                    ],
                                ],
                            ],
                        ],
                    ];

                    $requests[$index] = $pool->as((string) $index)
                        ->withToken($accessToken)
                        ->acceptJson()
                        ->post($endpoint, $message);
                }

                return $requests;
            });

            foreach ($chunk as $index => $token) {
                $response = $responses[(string) $index] ?? null;

                if ($response === null) {
                    $failureCount++;

                    continue;
                }

                if ($response->successful()) {
                    $successCount++;

                    continue;
                }

                $failureCount++;

                if ($this->isInvalidTokenError($response->json())) {
                    $invalidTokens[] = $token;
                } else {
                    Log::warning('FCM send failed', [
                        'token_prefix' => substr($token, 0, 12).'…',
                        'status' => $response->status(),
                        'body' => $response->json(),
                    ]);
                }
            }
        }

        if ($invalidTokens !== []) {
            DeviceToken::query()
                ->whereIn('token', $invalidTokens)
                ->update(['is_active' => false]);
        }

        return [
            'success_count' => $successCount,
            'failure_count' => $failureCount,
            'invalid_tokens' => $invalidTokens,
        ];
    }

    private function getAccessToken(string $serviceAccountJson): string
    {
        $cacheKey = self::CACHE_KEY.'_'.config('app.env', 'production');

        return Cache::remember($cacheKey, 3300, function () use ($serviceAccountJson): string {
            $credentials = json_decode($serviceAccountJson, true);

            if (! is_array($credentials)) {
                throw new \RuntimeException('Invalid FCM service account JSON.');
            }

            $client = new GoogleClient;
            $client->setAuthConfig($credentials);
            $client->addScope(self::FCM_SCOPE);

            $token = $client->fetchAccessTokenWithAssertion();

            if (! is_array($token) || empty($token['access_token'])) {
                throw new \RuntimeException('Failed to obtain FCM access token.');
            }

            return (string) $token['access_token'];
        });
    }

    /**
     * @param  array<string, mixed>  $data
     * @return array<string, string>
     */
    private function stringifyData(array $data): array
    {
        $normalized = [];

        foreach ($data as $key => $value) {
            if ($value === null) {
                continue;
            }

            $normalized[(string) $key] = (string) $value;
        }

        return $normalized;
    }

    /**
     * @param  array<string, mixed>|null  $body
     */
    private function isInvalidTokenError(?array $body): bool
    {
        if ($body === null) {
            return false;
        }

        // UNREGISTERED = token revoked/expired; check details first, then status.
        $errorCode = data_get($body, 'error.details.0.errorCode')
            ?? data_get($body, 'error.status');

        if ($errorCode === 'UNREGISTERED') {
            return true;
        }

        // INVALID_ARGUMENT in error.status is too broad (also fires for bad payloads).
        // Only treat it as a stale-token when the message explicitly says so.
        $message = (string) data_get($body, 'error.message', '');

        return str_contains($message, 'not a valid FCM registration token')
            || str_contains($message, 'Requested entity was not found');
    }
}
