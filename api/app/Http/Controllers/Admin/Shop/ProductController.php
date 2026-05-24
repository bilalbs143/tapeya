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
        $record = $this->refresh($record);

        return $this->success(new ProductResource($record), 'Product created.', 'CREATED');
    }

    public function show(Product $product): JsonResponse
    {
        return $this->_show($product);
    }

    public function update(UpdateProductRequest $request, Product $product): JsonResponse
    {
        $data = $request->validated();
        $product = $this->refresh($product);
        $product->update($data);
        $product = $this->refresh($product);

        return $this->success(new ProductResource($product), 'Product updated.');
    }

    public function destroy(Product $product): JsonResponse
    {
        $product = $this->refresh($product);
        $product->images->each(fn (ProductImage $img) => Storage::disk(config('filesystems.media_disk'))->delete($img->path));
        $product->images()->delete();

        return $this->_destroy($product, null);
    }
}
