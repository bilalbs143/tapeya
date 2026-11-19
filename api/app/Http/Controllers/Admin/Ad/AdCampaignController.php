<?php

namespace App\Http\Controllers\Admin\Ad;

use App\Enums\Ad\AdCampaignObjectiveEnum;
use App\Enums\Ad\AdCampaignStatusEnum;
use App\Enums\Ad\AdSurfaceEnum;
use App\Http\Controllers\Admin\BaseAdminController;
use App\Http\Requests\Admin\Ad\StoreAdCampaignRequest;
use App\Http\Requests\Admin\Ad\UpdateAdCampaignRequest;
use App\Http\Resources\Admin\Ad\AdCampaignResource;
use App\Models\AdCampaign;
use App\Models\AdStatsDaily;
use App\Models\User;
use App\Services\Ad\AdAuditLogger;
use App\Services\Ad\AdEligibilityService;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdCampaignController extends BaseAdminController
{
    public function __construct(
        private readonly AdAuditLogger $auditLogger,
        private readonly AdEligibilityService $eligibility,
    ) {
        parent::__construct(AdCampaign::class, AdCampaignResource::class, 'ad campaign');
    }

    protected function baseQuery()
    {
        return AdCampaign::query()->with('brandPartner')->withCount('creatives');
    }

    public function store(StoreAdCampaignRequest $request): JsonResponse
    {
        $data = $request->validated();
        $data['created_by_admin_id'] = $request->user()?->id;
        $data['objective'] = $data['objective'] ?? AdCampaignObjectiveEnum::Awareness->value;
        $data['status'] = $this->resolveInitialStatus($data);

        $record = $this->model->create($data);
        $record = $this->refresh($record);
        $this->auditLogger->log('campaign', (int) $record->id, 'created', $request->user(), null, $record->toArray());

        return $this->success(new AdCampaignResource($record), 'Ad campaign created.', 'CREATED');
    }

    public function show(AdCampaign $ad_campaign): JsonResponse
    {
        return $this->_show($ad_campaign);
    }

    public function update(UpdateAdCampaignRequest $request, AdCampaign $ad_campaign): JsonResponse
    {
        $before = $ad_campaign->toArray();
        $data = $request->validated();
        $ad_campaign = $this->refresh($ad_campaign);
        $ad_campaign->update($data);
        $ad_campaign = $this->refresh($ad_campaign);
        $this->auditLogger->log('campaign', (int) $ad_campaign->id, 'updated', $request->user(), $before, $ad_campaign->toArray());

        return $this->success(new AdCampaignResource($ad_campaign), 'Ad campaign updated.');
    }

    public function destroy(AdCampaign $ad_campaign): JsonResponse
    {
        $this->auditLogger->log('campaign', (int) $ad_campaign->id, 'deleted', request()->user(), $ad_campaign->toArray());

        return $this->_destroy($ad_campaign);
    }

    public function eligibilityPreview(Request $request, AdCampaign $ad_campaign): JsonResponse
    {
        $request->validate([
            'user_id' => ['required', 'integer', 'exists:users,id'],
            'surface' => ['required', 'string'],
            'platform' => ['nullable', 'string'],
            'country' => ['nullable', 'string', 'size:2'],
            'language' => ['nullable', 'string', 'max:8'],
            'at' => ['nullable', 'date'],
        ]);

        $surface = AdSurfaceEnum::tryFrom((string) $request->query('surface'));
        if (! $surface) {
            return $this->failure('Invalid surface.', 'VALIDATION_ERROR');
        }

        $viewer = User::query()->findOrFail((int) $request->query('user_id'));
        $at = $request->query('at') ? Carbon::parse((string) $request->query('at')) : now();

        $preview = $this->eligibility->previewCampaign(
            $ad_campaign,
            $surface,
            [
                'platform' => $request->query('platform'),
                'country' => $request->query('country'),
                'language' => $request->query('language'),
            ],
            $at,
            $viewer,
        );

        return $this->success($preview);
    }

    public function stats(Request $request, AdCampaign $ad_campaign): JsonResponse
    {
        $request->validate([
            'from' => ['nullable', 'date'],
            'to' => ['nullable', 'date', 'after_or_equal:from'],
        ]);

        $from = $request->query('from') ? Carbon::parse((string) $request->query('from'))->startOfDay() : now()->subDays(30)->startOfDay();
        $to = $request->query('to') ? Carbon::parse((string) $request->query('to'))->endOfDay() : now()->endOfDay();

        $rows = AdStatsDaily::query()
            ->where('campaign_id', $ad_campaign->id)
            ->whereBetween('date', [$from->toDateString(), $to->toDateString()])
            ->orderBy('date')
            ->get();

        $totals = [
            'impressions_raw' => (int) $rows->sum('impressions_raw'),
            'impressions_unique' => (int) $rows->sum('impressions_unique'),
            'views_raw' => (int) $rows->sum('views_raw'),
            'views_unique' => (int) $rows->sum('views_unique'),
            'clicks_raw' => (int) $rows->sum('clicks_raw'),
            'clicks_unique' => (int) $rows->sum('clicks_unique'),
            'sum_watched_ms' => (int) $rows->sum('sum_watched_ms'),
        ];
        $totals['ctr'] = $totals['impressions_raw'] > 0
            ? round($totals['clicks_raw'] / $totals['impressions_raw'], 4)
            : 0;
        $totals['vtr'] = $totals['impressions_raw'] > 0
            ? round($totals['views_raw'] / $totals['impressions_raw'], 4)
            : 0;

        return $this->success([
            'from' => $from->toDateString(),
            'to' => $to->toDateString(),
            'totals' => $totals,
            'daily' => $rows,
        ]);
    }

    /**
     * @param  array<string, mixed>  $data
     */
    private function resolveInitialStatus(array $data): AdCampaignStatusEnum
    {
        $raw = $data['status'] ?? AdCampaignStatusEnum::Draft;
        $status = $raw instanceof AdCampaignStatusEnum
            ? $raw
            : AdCampaignStatusEnum::from((string) $raw);

        if ($status === AdCampaignStatusEnum::Draft
            || $status === AdCampaignStatusEnum::Paused
            || $status === AdCampaignStatusEnum::Ended) {
            return $status;
        }

        $startsAt = isset($data['starts_at']) ? Carbon::parse($data['starts_at']) : null;
        if ($startsAt && $startsAt->isFuture()) {
            return AdCampaignStatusEnum::Scheduled;
        }

        return $status === AdCampaignStatusEnum::Scheduled
            ? AdCampaignStatusEnum::Scheduled
            : AdCampaignStatusEnum::Active;
    }
}
