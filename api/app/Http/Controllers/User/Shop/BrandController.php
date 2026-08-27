<?php

namespace App\Http\Controllers\User\Shop;

use App\Http\Controllers\BaseControllerTrait;
use App\Http\Controllers\Controller;
use App\Http\Resources\User\Shop\BrandResource;
use App\Models\Shop\Brand;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Spatie\QueryBuilder\QueryBuilder;

class BrandController extends Controller
{
    use BaseControllerTrait;

    public function index(): AnonymousResourceCollection|JsonResponse
    {
        $query = Brand::query()->active();

        if (request()->boolean('has_products')) {
            $query->whereHas('products', fn ($q) => $q->sellable());
        }

        $query = QueryBuilder::for($query)
            ->defaultSort('sort_order')
            ->allowedSorts(['id', 'name', 'slug', 'sort_order']);

        return BrandResource::collection($this->paginateOrAll($query));
    }

    public function show(int $brand): JsonResponse
    {
        $record = Brand::query()->active()->findOrFail($brand);

        return $this->success(new BrandResource($record));
    }
}
