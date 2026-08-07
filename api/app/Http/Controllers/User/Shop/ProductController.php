<?php

namespace App\Http\Controllers\User\Shop;

use App\Enums\Shop\VendorStatusEnum;
use App\Http\Controllers\BaseControllerTrait;
use App\Http\Controllers\Controller;
use App\Http\Resources\User\Shop\ProductResource;
use App\Models\Shop\Product;
use App\Models\Shop\Vendor;
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
            ->sellable()
            ->with(['brand', 'category', 'images', 'vendor']);

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
                AllowedFilter::exact('vendor_id'),
                AllowedFilter::exact('is_featured'),
                AllowedFilter::exact('is_popular'),
                AllowedFilter::exact('is_special_offer'),
            ])
            ->defaultSort('-id')
            ->allowedSorts(['id', 'name', 'price', 'created_at']);

        return ProductResource::collection($this->paginateOrAll($query));
    }

    /**
     * Public product detail by slug.
     *
     * Slugs are unique per vendor. Pass ?vendor={vendor_slug} (or use the nested
     * vendors/{vendor}/products/{slug} route) when multiple vendors share a slug.
     */
    public function show(string $product): JsonResponse
    {
        return $this->respondWithProduct(
            $this->resolveSellableBySlug($product, request()->query('vendor'))
        );
    }

    /**
     * Unambiguous public product detail: vendors/{vendor:slug}/products/{slug}.
     */
    public function showForVendor(Vendor $vendor, string $product): JsonResponse
    {
        if ($vendor->status !== VendorStatusEnum::APPROVED) {
            return $this->failure('Product not found.', 'NOT_FOUND');
        }

        return $this->respondWithProduct(
            $this->resolveSellableBySlug($product, $vendor->slug)
        );
    }

    private function respondWithProduct(?Product $product): JsonResponse
    {
        if ($product === null) {
            return $this->failure('Product not found.', 'NOT_FOUND');
        }

        $product->load(['brand', 'category', 'images', 'vendor']);

        return $this->success(new ProductResource($product));
    }

    private function resolveSellableBySlug(string $slug, ?string $vendorSlug = null): ?Product
    {
        $query = Product::query()
            ->sellable()
            ->where('slug', $slug)
            ->with(['brand', 'category', 'images', 'vendor']);

        $vendorSlug = is_string($vendorSlug) ? trim($vendorSlug) : null;
        if ($vendorSlug !== null && $vendorSlug !== '') {
            $query->whereHas('vendor', fn ($q) => $q->where('slug', $vendorSlug));

            return $query->first();
        }

        $matches = $query->limit(2)->get();
        if ($matches->count() !== 1) {
            return null;
        }

        return $matches->first();
    }
}
