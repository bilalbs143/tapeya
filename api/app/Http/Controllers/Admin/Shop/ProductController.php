<?php

namespace App\Http\Controllers\Admin\Shop;

use App\Http\Controllers\Admin\BaseAdminController;
use App\Http\Requests\Admin\Shop\StoreProductRequest;
use App\Http\Requests\Admin\Shop\UpdateProductRequest;
use App\Http\Resources\Admin\Shop\ProductResource;
use App\Models\Shop\Product;
use App\Models\Shop\ProductImage;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;

class ProductController extends BaseAdminController
{
    public function __construct()
    {
        parent::__construct(Product::class, ProductResource::class, 'product');
    }

    protected function baseQuery()
    {
        return Product::query()->with(['brand', 'category', 'images']);
    }

    public function store(StoreProductRequest $request): JsonResponse
    {
        $data = $request->validated();
        $record = $this->model->create($data);
        $this->syncProductImages($record, $request->file('images', []));
        $record = $this->refresh($record);

        return $this->success(new ProductResource($record), 'Product created.', 'CREATED');
    }

    public function show(Product $product): JsonResponse
    {
        return $this->_show($product);
    }

    public function update(UpdateProductRequest $request, Product $product): JsonResponse
    {
        $product = $this->refresh($product);
        $hasNewImages = $request->hasFile('images') && count($request->file('images', [])) > 0;
        if ($product->images->isEmpty() && ! $hasNewImages) {
            return $this->failure('At least one image is required.', 'VALIDATION_ERROR');
        }
        if ($request->hasFile('images') && count($request->file('images', [])) === 0) {
            return $this->failure('At least one image is required.', 'VALIDATION_ERROR');
        }

        $data = $request->validated();
        $product->update($data);
        if ($request->hasFile('images')) {
            $product->images->each(fn (ProductImage $img) => Storage::disk('public')->delete($img->path));
            $product->images()->delete();
            $this->syncProductImages($product, $request->file('images'));
        }
        $product = $this->refresh($product);

        return $this->success(new ProductResource($product), 'Product updated.');
    }

    public function destroy(Product $product): JsonResponse
    {
        $product = $this->refresh($product);
        $product->images->each(fn (ProductImage $img) => Storage::disk('public')->delete($img->path));
        $product->images()->delete();

        return $this->_destroy($product, null);
    }

    private function syncProductImages(Product $product, array $files): void
    {
        $sortOrder = 0;
        foreach ($files as $file) {
            $path = $file->store('shop/products', 'public');
            $product->images()->create([
                'path' => $path,
                'sort_order' => $sortOrder++,
            ]);
        }
    }
}
