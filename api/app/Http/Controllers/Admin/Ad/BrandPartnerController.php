<?php

namespace App\Http\Controllers\Admin\Ad;

use App\Enums\Post\PostDistributionEnum;
use App\Enums\Post\PostStatusEnum;
use App\Enums\Post\PostTypeEnum;
use App\Http\Controllers\Admin\BaseAdminController;
use App\Http\Requests\Admin\Ad\ComposeBrandPostRequest;
use App\Http\Requests\Admin\Ad\StoreBrandPartnerRequest;
use App\Http\Requests\Admin\Ad\UpdateBrandPartnerRequest;
use App\Http\Resources\Admin\Ad\BrandPartnerResource;
use App\Http\Resources\User\PostResource;
use App\Models\BrandPartner;
use App\Models\Post;
use App\Models\User;
use App\Services\Ad\AdAuditLogger;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class BrandPartnerController extends BaseAdminController
{
    public function __construct(private readonly AdAuditLogger $auditLogger)
    {
        parent::__construct(BrandPartner::class, BrandPartnerResource::class, 'brand partner');
    }

    protected function baseQuery()
    {
        return BrandPartner::query()->with('user');
    }

    public function store(StoreBrandPartnerRequest $request): JsonResponse
    {
        $record = $this->model->create($request->validated());
        $record = $this->refresh($record);
        $this->auditLogger->log('brand_partner', (int) $record->id, 'created', $request->user(), null, $record->toArray());

        return $this->success(new BrandPartnerResource($record), 'Brand partner created.', 'CREATED');
    }

    public function show(BrandPartner $brand_partner): JsonResponse
    {
        return $this->_show($brand_partner);
    }

    public function update(UpdateBrandPartnerRequest $request, BrandPartner $brand_partner): JsonResponse
    {
        $before = $brand_partner->toArray();
        $brand_partner = $this->refresh($brand_partner);
        $brand_partner->update($request->validated());
        $brand_partner = $this->refresh($brand_partner);
        $this->auditLogger->log('brand_partner', (int) $brand_partner->id, 'updated', $request->user(), $before, $brand_partner->toArray());

        return $this->success(new BrandPartnerResource($brand_partner), 'Brand partner updated.');
    }

    public function destroy(BrandPartner $brand_partner): JsonResponse
    {
        $this->auditLogger->log('brand_partner', (int) $brand_partner->id, 'deleted', request()->user(), $brand_partner->toArray());

        return $this->_destroy($brand_partner);
    }

    /**
     * Create a sponsored_only post as the brand partner user (text/image shell).
     * Video creatives: compose via normal reel upload as that user, then attach post_id.
     */
    public function composePost(ComposeBrandPostRequest $request, BrandPartner $brand_partner): JsonResponse
    {
        $data = $request->validated();
        /** @var User $partnerUser */
        $partnerUser = User::query()->findOrFail($brand_partner->user_id);

        $post = DB::transaction(function () use ($partnerUser, $data) {
            $post = Post::query()->create([
                'user_id' => $partnerUser->id,
                'type' => PostTypeEnum::from($data['type']),
                'title' => $data['title'] ?? null,
                'body' => $data['body'] ?? null,
                'background_id' => $data['background_id'] ?? null,
                'status' => PostStatusEnum::Ready,
                'distribution' => PostDistributionEnum::SponsoredOnly,
                'published_at' => now(),
            ]);

            User::query()->whereKey($partnerUser->id)->update([
                'posts_count' => DB::raw('COALESCE(posts_count, 0) + 1'),
            ]);

            return $post;
        });

        $post->loadMissing([User::socialSummaryWith(), 'video', 'media', 'hashtags']);
        $this->auditLogger->log('brand_partner', (int) $brand_partner->id, 'compose_post', $request->user(), null, [
            'post_id' => $post->id,
        ]);

        return $this->success(new PostResource($post), 'Sponsored post created.', 'CREATED');
    }
}
