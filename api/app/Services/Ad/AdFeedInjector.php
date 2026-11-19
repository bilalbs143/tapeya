<?php

namespace App\Services\Ad;

use App\Enums\Ad\AdSurfaceEnum;
use App\Models\Post;
use App\Models\User;
use App\Settings\AdsSettings;
use Illuminate\Support\Collection;

class AdFeedInjector
{
    public function __construct(
        private readonly AdEligibilityService $eligibility,
        private readonly AdsSettings $adsSettings,
    ) {}

    /**
     * Merge at most one (or max_ads_per_response) sponsored post into organic items.
     * Cursor must remain derived from the organic paginator — never from this list.
     *
     * @param  array<int, Post>|Collection<int, Post>  $organicItems
     * @return list<Post>
     */
    public function inject(
        array|Collection $organicItems,
        ?User $viewer,
        AdSurfaceEnum $surface,
        string $platform = 'android',
        ?string $country = null,
    ): array {
        $items = array_values($organicItems instanceof Collection ? $organicItems->all() : $organicItems);

        if (! $viewer || ! $this->eligibility->adsEnabled()) {
            return $items;
        }

        if (! $surface->isFeedSurface()) {
            return $items;
        }

        $organicCount = count($items);
        $minOrganic = max(1, (int) $this->adsSettings->minOrganicBeforeAd);
        if ($organicCount < $minOrganic) {
            return $items;
        }

        $viewerCountry = $country
            ? strtoupper($country)
            : (isset($viewer->country) ? strtoupper((string) $viewer->country) : null);

        $creative = $this->eligibility->pickCreativeForSurface($surface, [
            'platform' => strtolower($platform),
            'country' => $viewerCountry ?: null,
        ]);

        if (! $creative || ! $creative->post) {
            return $items;
        }

        $campaign = $creative->campaign;
        $slotEveryN = max(3, (int) ($campaign?->slot_every_n ?: $this->adsSettings->slotEveryN));
        $maxAds = max(1, min(5, (int) ($campaign?->max_ads_per_response ?: $this->adsSettings->maxAdsPerResponse)));

        $adsToInsert = $maxAds;

        $insertAfterIndex = min($slotEveryN, $organicCount) - 1;
        $sponsored = $this->eligibility->attachSponsorship($creative->post, $creative);

        $merged = [];
        foreach ($items as $i => $item) {
            $merged[] = $item;
            if ($adsToInsert > 0 && $i === $insertAfterIndex) {
                $merged[] = $sponsored;
                $adsToInsert--;
            }
        }

        return $merged;
    }
}
