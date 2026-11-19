<?php

namespace App\Services\Ad;

use App\Enums\Ad\AdEventTypeEnum;
use App\Models\AdEvent;
use App\Models\AdStatsDaily;
use Carbon\CarbonInterface;
use Illuminate\Support\Facades\DB;

class AdStatsRollupService
{
    /**
     * Recompute daily stats for dates touched in the lookback window (default 3 days).
     */
    public function rollup(?CarbonInterface $from = null, ?CarbonInterface $to = null): int
    {
        $to = $to ?? now();
        $from = $from ?? now()->subDays(3)->startOfDay();

        $rows = AdEvent::query()
            ->select([
                DB::raw('DATE(occurred_at) as day'),
                'campaign_id',
                'creative_id',
                'event_type',
                DB::raw('COUNT(*) as raw_count'),
                DB::raw('COUNT(DISTINCT user_id) as unique_count'),
                DB::raw('COALESCE(SUM(watched_ms), 0) as sum_watched_ms'),
            ])
            ->whereBetween('occurred_at', [$from, $to])
            ->groupBy(DB::raw('DATE(occurred_at)'), 'campaign_id', 'creative_id', 'event_type')
            ->get();

        /** @var array<string, array<string, mixed>> $buckets */
        $buckets = [];

        foreach ($rows as $row) {
            $key = $row->day.'|'.$row->campaign_id.'|'.$row->creative_id;
            if (! isset($buckets[$key])) {
                $buckets[$key] = [
                    'date' => $row->day,
                    'campaign_id' => (int) $row->campaign_id,
                    'creative_id' => (int) $row->creative_id,
                    'impressions_raw' => 0,
                    'impressions_unique' => 0,
                    'views_raw' => 0,
                    'views_unique' => 0,
                    'clicks_raw' => 0,
                    'clicks_unique' => 0,
                    'sum_watched_ms' => 0,
                ];
            }

            $type = $row->event_type instanceof AdEventTypeEnum
                ? $row->event_type
                : AdEventTypeEnum::tryFrom((string) $row->event_type);

            if ($type === AdEventTypeEnum::Impression) {
                $buckets[$key]['impressions_raw'] = (int) $row->raw_count;
                $buckets[$key]['impressions_unique'] = (int) $row->unique_count;
            } elseif ($type === AdEventTypeEnum::View) {
                $buckets[$key]['views_raw'] = (int) $row->raw_count;
                $buckets[$key]['views_unique'] = (int) $row->unique_count;
                $buckets[$key]['sum_watched_ms'] = (int) $row->sum_watched_ms;
            } elseif ($type === AdEventTypeEnum::Click) {
                $buckets[$key]['clicks_raw'] = (int) $row->raw_count;
                $buckets[$key]['clicks_unique'] = (int) $row->unique_count;
            }
        }

        $upserted = 0;
        foreach ($buckets as $bucket) {
            AdStatsDaily::query()->updateOrCreate(
                [
                    'date' => $bucket['date'],
                    'campaign_id' => $bucket['campaign_id'],
                    'creative_id' => $bucket['creative_id'],
                ],
                [
                    'impressions_raw' => $bucket['impressions_raw'],
                    'impressions_unique' => $bucket['impressions_unique'],
                    'views_raw' => $bucket['views_raw'],
                    'views_unique' => $bucket['views_unique'],
                    'clicks_raw' => $bucket['clicks_raw'],
                    'clicks_unique' => $bucket['clicks_unique'],
                    'sum_watched_ms' => $bucket['sum_watched_ms'],
                ],
            );
            $upserted++;
        }

        return $upserted;
    }
}
