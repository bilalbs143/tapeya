<?php

namespace App\Http\Controllers\User\Shop;

use App\Http\Controllers\BaseControllerTrait;
use App\Http\Controllers\Controller;
use App\Http\Resources\User\Shop\ProductResource;
use App\Models\Shop\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
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

        $records = QueryBuilder::for($query)
            ->allowedFilters(['id', 'brand_id', 'category_id', 'is_featured', 'is_popular', 'is_special_offer'])
            ->defaultSort('-id')
            ->allowedSorts(['id', 'name', 'price', 'created_at'])
            ->when(
                request()->has('all'),
                fn ($q) => $q->get(),
                fn ($q) => $q->paginate((int) request('per_page', 15))
            );

        return ProductResource::collection($records);
    }

    public function show(int $product): JsonResponse
    {
        $record = Product::query()
            ->active()
            ->with(['brand', 'category', 'images'])
            ->findOrFail($product);

        return $this->success(new ProductResource($record));
    }
}
