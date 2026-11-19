<?php

namespace App\Services\Ad;

use App\Enums\Ad\AdEventTypeEnum;
use App\Enums\Ad\AdSurfaceEnum;
use App\Models\AdCreative;
use App\Models\AdEvent;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\QueryException;

class AdEventIngestService
{
    public function __construct(private readonly AdEligibilityService $eligibility) {}

    /**
     * @param  list<array<string, mixed>>  $events
     * @return array{accepted: int, duplicates: int, rejected: int}
     */
    public function ingest(User $user, array $events): array
    {
        $accepted = 0;
        $duplicates = 0;
        $rejected = 0;

        $viewerKey = hash_hmac('sha256', 'ad-user:'.$user->id, (string) config('app.key'));

        foreach ($events as $payload) {
            $result = $this->ingestOne($user, $viewerKey, $payload);
            match ($result) {
                'accepted' => $accepted++,
                'duplicate' => $duplicates++,
                default => $rejected++,
            };
        }

        return [
            'accepted' => $accepted,
            'duplicates' => $duplicates,
            'rejected' => $rejected,
        ];
    }

    /**
     * @param  array<string, mixed>  $payload
     */
    private function ingestOne(User $user, string $viewerKey, array $payload): string
    {
        $clientEventId = (string) ($payload['client_event_id'] ?? '');
        if ($clientEventId === '') {
            return 'rejected';
        }

        if (AdEvent::query()->where('client_event_id', $clientEventId)->exists()) {
            return 'duplicate';
        }

        $creativeId = (int) ($payload['creative_id'] ?? 0);
        $campaignId = (int) ($payload['campaign_id'] ?? 0);
        /** @var AdCreative|null $creative */
        $creative = AdCreative::query()->with(['campaign.brandPartner'])->find($creativeId);
        if (! $creative || (int) $creative->campaign_id !== $campaignId) {
            return 'rejected';
        }

        try {
            $occurredAt = Carbon::parse((string) ($payload['occurred_at'] ?? now()->toIso8601String()));
        } catch (\Throwable) {
            return 'rejected';
        }

        // Clamp future timestamps.
        if ($occurredAt->isFuture()) {
            $occurredAt = now();
        }

        if (! $this->eligibility->canIngestEvent($creative, $occurredAt)) {
            return 'rejected';
        }

        $type = AdEventTypeEnum::tryFrom((string) ($payload['type'] ?? ''));
        $surface = AdSurfaceEnum::tryFrom((string) ($payload['surface'] ?? ''));
        if (! $type || ! $surface) {
            return 'rejected';
        }

        $watchedMs = isset($payload['watched_ms']) ? (int) $payload['watched_ms'] : null;
        if ($watchedMs !== null) {
            $watchedMs = max(0, min($watchedMs, 3_600_000));
        }

        $completionRate = isset($payload['completion_rate']) ? (float) $payload['completion_rate'] : null;
        if ($completionRate !== null) {
            $completionRate = max(0, min(1, $completionRate));
        }

        $takeId = isset($payload['take_id']) ? (int) $payload['take_id'] : null;
        if ($takeId === 0) {
            $takeId = null;
        }

        try {
            AdEvent::query()->create([
                'campaign_id' => $creative->campaign_id,
                'creative_id' => $creative->id,
                'post_id' => $creative->post_id,
                'brand_partner_id' => $creative->campaign?->brand_partner_id,
                'take_id' => $takeId,
                'event_type' => $type,
                'user_id' => $user->id,
                'viewer_key' => $viewerKey,
                'surface' => $surface,
                'platform' => isset($payload['platform']) ? strtolower((string) $payload['platform']) : null,
                'watched_ms' => $watchedMs,
                'completion_rate' => $completionRate,
                'client_event_id' => $clientEventId,
                'occurred_at' => $occurredAt,
                'meta' => is_array($payload['meta'] ?? null) ? $payload['meta'] : null,
                'created_at' => now(),
            ]);
        } catch (QueryException $e) {
            // Unique race on client_event_id.
            if (str_contains(strtolower($e->getMessage()), 'unique')
                || str_contains(strtolower($e->getMessage()), 'duplicate')) {
                return 'duplicate';
            }

            throw $e;
        }

        return 'accepted';
    }
}
