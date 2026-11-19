<?php

namespace App\Services\Ad;

use App\Enums\Ad\AdCampaignStatusEnum;
use App\Enums\Ad\AdCreativeStatusEnum;
use App\Enums\Ad\BrandPartnerStatusEnum;
use App\Enums\Ad\LiveAdTakeModeEnum;
use App\Enums\Ad\LiveAdTakeStatusEnum;
use App\Enums\Post\PostStatusEnum;
use App\Events\Broadcast\LiveAdTakeEnded;
use App\Events\Broadcast\LiveAdTakeStarted;
use App\Models\AdCreative;
use App\Models\LiveAdTake;
use App\Models\LiveStream;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class LiveAdTakeService
{
    public function __construct(
        private readonly AdEligibilityService $eligibility,
        private readonly AdAuditLogger $auditLogger,
    ) {}

    /**
     * @param  list<int>  $streamIds
     * @param  array<string, mixed>|null  $presentation
     */
    public function start(
        AdCreative $creative,
        LiveAdTakeModeEnum $mode,
        array $streamIds,
        ?User $admin = null,
        bool $replace = false,
        ?string $note = null,
        ?array $presentation = null,
    ): LiveAdTake {
        if (! $this->eligibility->adsEnabled()) {
            throw ValidationException::withMessages([
                'ads' => ['Ads are disabled.'],
            ]);
        }

        $creative->loadMissing(['campaign.brandPartner', 'post']);
        if ($creative->status !== AdCreativeStatusEnum::Approved) {
            throw ValidationException::withMessages([
                'creative_id' => ['Creative Must Be Approved.'],
            ]);
        }

        $campaign = $creative->campaign;
        if (! $campaign || $campaign->status !== AdCampaignStatusEnum::Active) {
            throw ValidationException::withMessages([
                'creative_id' => ['Campaign Must Be Active.'],
            ]);
        }

        $partner = $campaign->brandPartner;
        if (! $partner || $partner->status !== BrandPartnerStatusEnum::Active) {
            throw ValidationException::withMessages([
                'creative_id' => ['Brand Partner Must Be Active.'],
            ]);
        }

        $now = now();
        if (($campaign->starts_at && $now->lt($campaign->starts_at))
            || ($campaign->ends_at && $now->gte($campaign->ends_at))) {
            throw ValidationException::withMessages([
                'creative_id' => ['Campaign Is Outside Its Flight Window.'],
            ]);
        }

        $post = $creative->post;
        if (! $post || $post->status !== PostStatusEnum::Ready || $post->published_at === null) {
            throw ValidationException::withMessages([
                'creative_id' => ['Creative Post Must Be Published And Ready.'],
            ]);
        }

        $requiredSurface = $mode->toSurface()->value;
        $surfaces = $campaign->surfaces ?? [];
        // Feed-only campaigns may still air on live if ops picks them; require live surface when set.
        $liveSurfaces = ['live_overlay', 'live_break'];
        $campaignLiveSurfaces = array_values(array_intersect($surfaces, $liveSurfaces));
        if ($campaignLiveSurfaces !== [] && ! in_array($requiredSurface, $campaignLiveSurfaces, true)) {
            throw ValidationException::withMessages([
                'mode' => ['Mode Does Not Match Campaign Live Surfaces.'],
            ]);
        }

        $streamIds = array_values(array_unique(array_map('intval', $streamIds)));
        if ($streamIds === []) {
            throw ValidationException::withMessages([
                'stream_ids' => ['At least one stream is required.'],
            ]);
        }

        $streams = LiveStream::query()->whereIn('id', $streamIds)->get();
        if ($streams->count() !== count($streamIds)) {
            throw ValidationException::withMessages([
                'stream_ids' => ['One or more streams were not found.'],
            ]);
        }

        foreach ($streams as $stream) {
            if ($stream->ads_allowed === false) {
                throw ValidationException::withMessages([
                    'stream_ids' => ["Ads are not allowed on stream {$stream->id}."],
                ]);
            }
            if (! in_array($stream->status, ['live', 'starting'], true)) {
                throw ValidationException::withMessages([
                    'stream_ids' => ["Stream {$stream->id} is not live/starting."],
                ]);
            }
        }

        foreach ($streamIds as $streamId) {
            $existing = $this->activeTakeForStream($streamId);
            if ($existing && ! $replace) {
                throw ValidationException::withMessages([
                    'stream_ids' => ["Stream {$streamId} already has a live take. Pass replace=true to replace it."],
                ]);
            }
        }

        $take = DB::transaction(function () use ($creative, $mode, $streamIds, $admin, $replace, $note, $presentation) {
            if ($replace) {
                foreach ($streamIds as $streamId) {
                    $existing = $this->activeTakeForStream($streamId);
                    if ($existing) {
                        $this->end($existing, $admin, broadcast: false);
                    }
                }
            }

            /** @var LiveAdTake $take */
            $take = LiveAdTake::query()->create([
                'creative_id' => $creative->id,
                'campaign_id' => $creative->campaign_id,
                'mode' => $mode,
                'status' => LiveAdTakeStatusEnum::Live,
                'presentation_json' => $presentation,
                'note' => $note,
                'started_by_admin_id' => $admin?->id,
                'started_at' => now(),
            ]);

            $take->streams()->sync($streamIds);

            return $take->fresh(['creative.campaign.brandPartner', 'creative.post', 'streams']) ?? $take;
        });

        $this->auditLogger->log('live_ad_take', (int) $take->id, 'started', $admin, null, [
            'mode' => $mode->value,
            'stream_ids' => $streamIds,
            'creative_id' => $creative->id,
        ]);

        foreach ($streamIds as $streamId) {
            event(LiveAdTakeStarted::fromTake($take, $streamId));
        }

        return $take;
    }

    public function end(LiveAdTake $take, ?User $admin = null, bool $broadcast = true): LiveAdTake
    {
        if (in_array($take->status, [LiveAdTakeStatusEnum::Ended, LiveAdTakeStatusEnum::Cancelled], true)) {
            return $take;
        }

        $take->loadMissing(['streams', 'creative.campaign.brandPartner', 'creative.post']);

        $take->update([
            'status' => LiveAdTakeStatusEnum::Ended,
            'ended_by_admin_id' => $admin?->id,
            'ended_at' => now(),
        ]);
        $take->refresh();

        $this->auditLogger->log('live_ad_take', (int) $take->id, 'ended', $admin);

        if ($broadcast) {
            foreach ($take->streams as $stream) {
                event(LiveAdTakeEnded::fromTake($take, (int) $stream->id));
            }
        }

        return $take;
    }

    public function endAllForStream(int $streamId, ?User $admin = null): int
    {
        $take = $this->activeTakeForStream($streamId);
        if (! $take) {
            return 0;
        }

        $this->end($take, $admin);

        return 1;
    }

    /** End every currently live take (ops panic / End all). */
    public function endAllLive(?User $admin = null): int
    {
        $takes = LiveAdTake::query()
            ->where('status', LiveAdTakeStatusEnum::Live)
            ->with(['streams', 'creative.campaign.brandPartner', 'creative.post'])
            ->get();

        $ended = 0;
        foreach ($takes as $take) {
            $this->end($take, $admin);
            $ended++;
        }

        return $ended;
    }

    public function activeTakeForStream(int $streamId): ?LiveAdTake
    {
        return LiveAdTake::query()
            ->where('status', LiveAdTakeStatusEnum::Live)
            ->whereHas('streams', fn ($q) => $q->where('live_streams.id', $streamId))
            ->with(['creative.campaign.brandPartner', 'creative.post', 'streams'])
            ->orderByDesc('started_at')
            ->orderByDesc('id')
            ->first();
    }
}
