<?php

namespace App\Http\Controllers\User\Shop;

use App\Enums\Shop\VendorStatusEnum;
use App\Http\Controllers\BaseControllerTrait;
use App\Http\Controllers\Controller;
use App\Http\Resources\User\Shop\VendorResource;
use App\Models\Shop\Vendor;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Spatie\QueryBuilder\AllowedFilter;
use Spatie\QueryBuilder\QueryBuilder;

class VendorController extends Controller
{
    use BaseControllerTrait;

    public function index(): AnonymousResourceCollection|JsonResponse
    {
        $query = QueryBuilder::for(
            Vendor::query()->where('status', VendorStatusEnum::APPROVED)
        )
            ->allowedFilters([
                AllowedFilter::exact('id'),
                'store_name',
                'slug',
                'city',
                'country',
            ])
            ->defaultSort('store_name')
            ->allowedSorts(['id', 'store_name', 'slug', 'created_at']);

        return VendorResource::collection($this->paginateOrAll($query));
    }

    public function show(Vendor $vendor): JsonResponse
    {
        if ($vendor->status !== VendorStatusEnum::APPROVED) {
            return $this->failure('Vendor not found.', 'NOT_FOUND');
        }

        $vendor->load([
            'products' => fn ($q) => $q->sellable()->with(['brand', 'category', 'images']),
        ]);

        return $this->success(new VendorResource($vendor));
    }
}
