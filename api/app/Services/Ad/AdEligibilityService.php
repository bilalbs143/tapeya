<?php

namespace App\Services\Ad;

use App\Enums\Ad\AdCampaignStatusEnum;
use App\Enums\Ad\AdCreativeStatusEnum;
use App\Enums\Ad\AdSurfaceEnum;
use App\Enums\Ad\BrandPartnerStatusEnum;
use App\Enums\Post\PostStatusEnum;
use App\Models\AdCampaign;
use App\Models\AdCreative;
use App\Models\Post;
use App\Models\User;
use App\Settings\AdsSettings;
use App\Support\Media\MediaDisk;
use Carbon\CarbonInterface;
use Illuminate\Support\Collection;

class AdEligibilityService
{
    public function __construct(private readonly AdsSettings $adsSettings) {}

    public function adsEnabled(): bool
    {
        return $this->adsSettings->isEnabled();
    }

    /**
     * @param  array{platform?: string|null, country?: string|null}  $viewerContext
     */
    public function pickCreativeForSurface(
        AdSurfaceEnum $surface,
        array $viewerContext = [],
        ?CarbonInterface $at = null,
    ): ?AdCreative {
        if (! $this->adsEnabled()) {
            return null;
        }

        $at = $at ?? now();

        $creatives = $this->servableCreativesForSurface($surface, $viewerContext, $at);
        if ($creatives->isEmpty()) {
            return null;
        }

        return $creatives
            ->sort(function (AdCreative $a, AdCreative $b) {
                $priorityA = (int) ($a->campaign?->priority ?? 0);
                $priorityB = (int) ($b->campaign?->priority ?? 0);
                if ($priorityA !== $priorityB) {
                    return $priorityB <=> $priorityA;
                }

                return $a->id <=> $b->id;
            })
            ->first();
    }

    /**
     * Dry-run reasons for admin eligibility preview.
     *
     * @param  array{platform?: string|null, country?: string|null}  $viewerContext
     * @return array{servable: bool, reasons: list<string>, would_select_creative_id: int|null, viewer_id: int|null}
     */
    public function previewCampaign(
        AdCampaign $campaign,
        AdSurfaceEnum $surface,
        array $viewerContext = [],
        ?CarbonInterface $at = null,
        ?User $viewer = null,
    ): array {
        $at = $at ?? now();
        $reasons = [];

        if (! $this->adsEnabled()) {
            $reasons[] = 'ads_disabled';
        }

        $campaign->loadMissing(['brandPartner', 'creatives']);

        $partner = $campaign->brandPartner;
        if (! $partner || $partner->status !== BrandPartnerStatusEnum::Active) {
            $reasons[] = match ($partner?->status) {
                BrandPartnerStatusEnum::Archived => 'partner_archived',
                BrandPartnerStatusEnum::Paused => 'partner_paused',
                BrandPartnerStatusEnum::Draft => 'partner_draft',
                default => 'partner_inactive',
            };
        }

        if ($campaign->status !== AdCampaignStatusEnum::Active) {
            $reasons[] = 'campaign_'.$campaign->status->value;
        }

        if (($campaign->starts_at && $at->lt($campaign->starts_at))
            || ($campaign->ends_at && $at->gte($campaign->ends_at))) {
            $reasons[] = 'outside_flight_window';
        }

        $surfaces = $campaign->surfaces ?? [];
        if (! in_array($surface->value, $surfaces, true)) {
            $reasons[] = 'surface_mismatch';
        }

        $reasons = array_merge($reasons, $this->targetingMismatchReasons($campaign->targeting_json, $viewerContext));

        $approved = $campaign->creatives
            ->filter(fn (AdCreative $c) => $c->status === AdCreativeStatusEnum::Approved)
            ->sortBy('id')
            ->values();

        if ($approved->isEmpty()) {
            $pending = $campaign->creatives->contains(
                fn (AdCreative $c) => $c->status === AdCreativeStatusEnum::PendingReview
            );
            $reasons[] = $pending ? 'creative_pending_review' : 'no_approved_creative';
        }

        $reasons = array_values(array_unique($reasons));
        $servable = $reasons === [];

        return [
            'servable' => $servable,
            'reasons' => $reasons,
            'would_select_creative_id' => $servable ? $approved->first()?->id : null,
            'viewer_id' => $viewer?->id,
        ];
    }

    /**
     * Accept events when occurred_at is inside the flight window, and ingest is
     * still within 72h after campaign end (late mobile sync).
     */
    public function canIngestEvent(AdCreative $creative, CarbonInterface $occurredAt): bool
    {
        $creative->loadMissing(['campaign']);
        $campaign = $creative->campaign;
        if (! $campaign) {
            return false;
        }

        if ($creative->status === AdCreativeStatusEnum::Rejected) {
            return false;
        }

        if ($campaign->starts_at && $occurredAt->lt($campaign->starts_at)) {
            return false;
        }

        if ($campaign->ends_at && $occurredAt->gte($campaign->ends_at)) {
            return false;
        }

        if ($campaign->ends_at && now()->gte($campaign->ends_at->copy()->addHours(72))) {
            return false;
        }

        return true;
    }

    /**
     * @param  array{platform?: string|null, country?: string|null}  $viewerContext
     * @return Collection<int, AdCreative>
     */
    public function servableCreativesForSurface(
        AdSurfaceEnum $surface,
        array $viewerContext = [],
        ?CarbonInterface $at = null,
    ): Collection {
        $at = $at ?? now();

        return AdCreative::query()
            ->where('status', AdCreativeStatusEnum::Approved)
            ->whereHas('campaign', function ($q) use ($surface, $at) {
                $q->where('status', AdCampaignStatusEnum::Active)
                    ->where(function ($q2) use ($at) {
                        $q2->whereNull('starts_at')->orWhere('starts_at', '<=', $at);
                    })
                    ->where(function ($q2) use ($at) {
                        $q2->whereNull('ends_at')->orWhere('ends_at', '>', $at);
                    })
                    ->whereJsonContains('surfaces', $surface->value)
                    ->whereHas('brandPartner', fn ($bp) => $bp->where('status', BrandPartnerStatusEnum::Active));
            })
            ->whereHas('post', function ($q) {
                $q->whereNotNull('published_at')
                    ->where('status', PostStatusEnum::Ready);
            })
            ->with(['campaign.brandPartner', 'post.user', 'post.video', 'post.media'])
            ->get()
            ->filter(fn (AdCreative $c) => $this->targetingMatches($c->campaign?->targeting_json, $viewerContext))
            ->values();
    }

    /**
     * @param  array<string, mixed>|null  $targeting
     * @param  array{platform?: string|null, country?: string|null}  $viewerContext
     */
    public function targetingMatches(?array $targeting, array $viewerContext): bool
    {
        return $this->targetingMismatchReasons($targeting, $viewerContext) === [];
    }

    /**
     * @param  array<string, mixed>|null  $targeting
     * @param  array{platform?: string|null, country?: string|null}  $viewerContext
     * @return list<string>
     */
    public function targetingMismatchReasons(?array $targeting, array $viewerContext): array
    {
        if ($targeting === null || $targeting === []) {
            return [];
        }

        $reasons = [];

        $platforms = $targeting['platforms'] ?? [];
        if (is_array($platforms) && $platforms !== []) {
            $platform = strtolower((string) ($viewerContext['platform'] ?? ''));
            if ($platform === '' || ! in_array($platform, $platforms, true)) {
                $reasons[] = 'targeting_platform_mismatch';
            }
        }

        $countries = $targeting['countries'] ?? [];
        if (is_array($countries) && $countries !== []) {
            $country = strtoupper((string) ($viewerContext['country'] ?? ''));
            if ($country === '' || ! in_array($country, $countries, true)) {
                $reasons[] = 'targeting_country_mismatch';
            }
        }

        return $reasons;
    }

    /**
     * @return array<string, mixed>
     */
    public function sponsorshipEnvelope(AdCreative $creative): array
    {
        $creative->loadMissing(['campaign.brandPartner']);
        $partner = $creative->campaign?->brandPartner;

        $headline = trim((string) ($creative->headline ?? ''));
        $brandName = trim((string) ($partner?->name ?? ''));
        $title = $headline !== '' ? $headline : ($brandName !== '' ? $brandName : null);

        return [
            'is_sponsored' => true,
            'campaign_id' => $creative->campaign_id,
            'creative_id' => $creative->id,
            'disclosure_label' => $creative->disclosure_label ?: 'Sponsored',
            'title' => $title,
            'cta' => [
                'label' => $creative->cta_label,
                'url' => $creative->cta_url,
                'type' => $creative->cta_type?->value ?? 'url',
            ],
            'brand' => [
                'name' => $partner?->name,
                'logo_url' => MediaDisk::url($partner?->logo_path),
                'partner_id' => $partner?->id,
            ],
        ];
    }

    public function attachSponsorship(Post $post, AdCreative $creative): Post
    {
        $post->setAttribute('sponsorship', $this->sponsorshipEnvelope($creative));

        return $post;
    }
}
