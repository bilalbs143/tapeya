<?php

namespace App\Services\Ad;

use App\Enums\Ad\AdCampaignStatusEnum;
use App\Models\AdCampaign;

class AdCampaignFlightService
{
    public function __construct(private readonly AdAuditLogger $auditLogger) {}

    /**
     * scheduled → active when starts_at <= now; active → ended when now >= ends_at.
     * Manual paused/ended are never resurrected by dates.
     *
     * @return array{activated: int, ended: int}
     */
    public function reconcile(): array
    {
        $now = now();
        $activated = 0;
        $ended = 0;

        $toActivate = AdCampaign::query()
            ->where('status', AdCampaignStatusEnum::Scheduled)
            ->whereNotNull('starts_at')
            ->where('starts_at', '<=', $now)
            ->where(function ($q) use ($now) {
                $q->whereNull('ends_at')->orWhere('ends_at', '>', $now);
            })
            ->get();

        foreach ($toActivate as $campaign) {
            $before = ['status' => $campaign->status->value];
            $campaign->update(['status' => AdCampaignStatusEnum::Active]);
            $this->auditLogger->log('campaign', (int) $campaign->id, 'flight_activated', null, $before, [
                'status' => AdCampaignStatusEnum::Active->value,
            ]);
            $activated++;
        }

        $toEnd = AdCampaign::query()
            ->where('status', AdCampaignStatusEnum::Active)
            ->whereNotNull('ends_at')
            ->where('ends_at', '<=', $now)
            ->get();

        foreach ($toEnd as $campaign) {
            $before = ['status' => $campaign->status->value];
            $campaign->update(['status' => AdCampaignStatusEnum::Ended]);
            $this->auditLogger->log('campaign', (int) $campaign->id, 'flight_ended', null, $before, [
                'status' => AdCampaignStatusEnum::Ended->value,
            ]);
            $ended++;
        }

        return ['activated' => $activated, 'ended' => $ended];
    }
}
