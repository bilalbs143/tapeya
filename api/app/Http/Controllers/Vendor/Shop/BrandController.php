<?php

namespace App\Http\Controllers\Vendor\Shop;

use App\Http\Controllers\BaseControllerTrait;
use App\Http\Controllers\Controller;
use App\Http\Requests\Vendor\Shop\StoreBrandRequest;
use App\Http\Requests\Vendor\Shop\UpdateBrandRequest;
use App\Http\Resources\Vendor\Shop\BrandResource;
use App\Models\Shop\Brand;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Spatie\QueryBuilder\QueryBuilder;

class BrandController extends Controller
{
    use BaseControllerTrait;

    public function index(): AnonymousResourceCollection|JsonResponse
    {
        $query = QueryBuilder::for(Brand::query()->active())
            ->allowedFilters(['id', 'name', 'slug'])
            ->defaultSort('-id')
            ->allowedSorts(['id', 'name', 'slug', 'created_at']);

        return BrandResource::collection($this->paginateOrAll($query));
    }

    public function show(Brand $brand): JsonResponse
    {
        abort_unless($brand->is_active, 404);

        return $this->success(new BrandResource($brand));
    }

    public function store(StoreBrandRequest $request): JsonResponse
    {
        $data = $request->validated();
        $this->storeImage($request, 'logo', 'shop/brands', $data);
        $record = Brand::query()->create($data);

        return $this->success(new BrandResource($record), 'Brand created.', 'CREATED');
    }

    public function update(UpdateBrandRequest $request, Brand $brand): JsonResponse
    {
        abort_unless($brand->is_active, 404);
        $data = $request->validated();
        $this->storeImage($request, 'logo', 'shop/brands', $data, $brand);
        $brand->update($data);

        return $this->success(new BrandResource($brand->fresh()), 'Brand updated.');
    }
}
