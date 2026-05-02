<?php

namespace App\Http\Controllers\User\Shop;

use App\Http\Controllers\BaseControllerTrait;
use App\Http\Controllers\Controller;
use App\Http\Resources\User\Shop\ProductResource;
use App\Models\Shop\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Spatie\QueryBuilder\AllowedFilter;
use Spatie\QueryBuilder\QueryBuilder;

class ProductController extends Controller
{
    use BaseControllerTrait;

    public function index(): AnonymousResourceCollection|JsonResponse
    {
        $query = Product::query()
            ->active()
            ->with(['brand', 'category', 'images']);

        $query->when(request('search'), function ($q, $search) {
            $q->where(function ($q) use ($search) {
                $q->where('name', 'like', '%'.$search.'%')
                    ->orWhere('slug', 'like', '%'.$search.'%');
            });
        });

        $query = QueryBuilder::for($query)
            ->allowedFilters([
                AllowedFilter::exact('id'),
                AllowedFilter::exact('brand_id'),
                AllowedFilter::exact('category_id'),
                AllowedFilter::exact('is_featured'),
                AllowedFilter::exact('is_popular'),
                AllowedFilter::exact('is_special_offer'),
            ])
            ->defaultSort('-id')
            ->allowedSorts(['id', 'name', 'price', 'created_at']);

        return ProductResource::collection($this->paginateOrAll($query));
    }

    public function show(Product $product): JsonResponse
    {
        if (! $product->is_active) {
            return $this->failure('Product not found.', 'NOT_FOUND');
        }

        $product->load(['brand', 'category', 'images']);

        return $this->success(new ProductResource($product));
    }
}
