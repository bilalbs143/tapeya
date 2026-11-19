<?php

namespace App\Http\Controllers\Admin\Ad;

use App\Enums\Ad\AdCreativeStatusEnum;
use App\Enums\Post\PostDistributionEnum;
use App\Http\Controllers\Admin\BaseAdminController;
use App\Http\Requests\Admin\Ad\StoreAdCreativeRequest;
use App\Http\Requests\Admin\Ad\UpdateAdCreativeRequest;
use App\Http\Resources\Admin\Ad\AdCreativeResource;
use App\Models\AdCreative;
use App\Models\Post;
use App\Services\Ad\AdAuditLogger;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdCreativeController extends BaseAdminController
{
    public function __construct(private readonly AdAuditLogger $auditLogger)
    {
        parent::__construct(AdCreative::class, AdCreativeResource::class, 'ad creative');
    }

    protected function baseQuery()
    {
        return AdCreative::query()->with('campaign.brandPartner');
    }

    public function store(StoreAdCreativeRequest $request): JsonResponse
    {
        $data = $request->validated();
        $data['status'] = AdCreativeStatusEnum::PendingReview;
        $data['disclosure_label'] = $data['disclosure_label'] ?? 'Sponsored';

        $post = Post::query()->findOrFail((int) $data['post_id']);
        if ($post->distribution !== PostDistributionEnum::SponsoredOnly) {
            $post->update(['distribution' => PostDistributionEnum::SponsoredOnly]);
        }

        $record = $this->model->create($data);
        $record = $this->refresh($record);
        $this->auditLogger->log('creative', (int) $record->id, 'created', $request->user(), null, $record->toArray());

        return $this->success(new AdCreativeResource($record), 'Ad creative created.', 'CREATED');
    }

    public function show(AdCreative $ad_creative): JsonResponse
    {
        return $this->_show($ad_creative);
    }

    public function update(UpdateAdCreativeRequest $request, AdCreative $ad_creative): JsonResponse
    {
        $before = $ad_creative->toArray();
        $ad_creative = $this->refresh($ad_creative);
        $ad_creative->update($request->validated());
        $ad_creative = $this->refresh($ad_creative);
        $this->auditLogger->log('creative', (int) $ad_creative->id, 'updated', $request->user(), $before, $ad_creative->toArray());

        return $this->success(new AdCreativeResource($ad_creative), 'Ad creative updated.');
    }

    public function destroy(AdCreative $ad_creative): JsonResponse
    {
        $this->auditLogger->log('creative', (int) $ad_creative->id, 'deleted', request()->user(), $ad_creative->toArray());

        return $this->_destroy($ad_creative);
    }

    public function approve(Request $request, AdCreative $ad_creative): JsonResponse
    {
        return $this->transition($request, $ad_creative, AdCreativeStatusEnum::Approved, 'approved');
    }

    public function reject(Request $request, AdCreative $ad_creative): JsonResponse
    {
        return $this->transition($request, $ad_creative, AdCreativeStatusEnum::Rejected, 'rejected');
    }

    public function pause(Request $request, AdCreative $ad_creative): JsonResponse
    {
        return $this->transition($request, $ad_creative, AdCreativeStatusEnum::Paused, 'paused');
    }

    private function transition(Request $request, AdCreative $ad_creative, AdCreativeStatusEnum $status, string $action): JsonResponse
    {
        $before = ['status' => $ad_creative->status?->value];
        $ad_creative->update([
            'status' => $status,
            'reviewed_by_admin_id' => $request->user()?->id,
            'reviewed_at' => now(),
        ]);
        $ad_creative = $this->refresh($ad_creative);
        $this->auditLogger->log('creative', (int) $ad_creative->id, $action, $request->user(), $before, [
            'status' => $status->value,
        ]);

        return $this->success(new AdCreativeResource($ad_creative), 'Ad creative '.$action.'.');
    }
}
