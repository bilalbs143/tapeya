<?php

namespace App\Http\Controllers\Admin\Shop;

use App\Enums\Shop\InventoryReasonEnum;
use App\Enums\Shop\ProductStatusEnum;
use App\Http\Controllers\Admin\BaseAdminController;
use App\Http\Requests\Admin\Shop\StoreProductRequest;
use App\Http\Requests\Admin\Shop\UpdateProductRequest;
use App\Http\Resources\Admin\Shop\ProductResource;
use App\Models\Shop\Product;
use App\Models\Shop\ProductImage;
use App\Models\Shop\Vendor;
use App\Services\Shop\InventoryService;
use App\Support\Media\MediaDisk;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class ProductController extends BaseAdminController
{
    public function __construct(
        private readonly InventoryService $inventory,
    ) {
        parent::__construct(Product::class, ProductResource::class, 'product');
    }

    protected function baseQuery()
    {
        return Product::query()->with(['brand', 'category', 'images', 'vendor']);
    }

    public function store(StoreProductRequest $request): JsonResponse
    {
        $data = $request->validated();
        $data['vendor_id'] = $data['vendor_id'] ?? Vendor::ensureHouse()->id;
        $data['status'] = $data['status'] ?? ProductStatusEnum::PUBLISHED->value;
        $stockQuantity = (int) ($data['stock_quantity'] ?? 0);
        unset($data['stock_quantity']);

        $record = DB::transaction(function () use ($data, $stockQuantity, $request) {
            $data['stock_quantity'] = 0;
            $product = $this->model->create($data);

            if ($stockQuantity > 0) {
                $locked = Product::query()->whereKey($product->id)->lockForUpdate()->firstOrFail();
                $this->inventory->setQuantity(
                    $locked,
                    $stockQuantity,
                    InventoryReasonEnum::MANUAL,
                    null,
                    $request->user(),
                );
            }

            return $this->refresh($product);
        });

        return $this->success(new ProductResource($record), 'Product created.', 'CREATED');
    }

    public function show(Product $product): JsonResponse
    {
        return $this->_show($product);
    }

    public function update(UpdateProductRequest $request, Product $product): JsonResponse
    {
        $data = $request->validated();
        $stockQuantity = array_key_exists('stock_quantity', $data)
            ? (int) $data['stock_quantity']
            : null;
        unset($data['stock_quantity']);

        $record = DB::transaction(function () use ($product, $data, $stockQuantity, $request) {
            $locked = Product::query()->whereKey($product->id)->lockForUpdate()->firstOrFail();

            if ($data !== []) {
                $locked->update($data);
            }

            if ($stockQuantity !== null) {
                $this->inventory->setQuantity(
                    $locked->fresh(),
                    $stockQuantity,
                    InventoryReasonEnum::MANUAL,
                    null,
                    $request->user(),
                );
            }

            return $this->refresh($locked);
        });

        return $this->success(new ProductResource($record), 'Product updated.');
    }

    public function destroy(Product $product): JsonResponse
    {
        $product = $this->refresh($product);
        $product->images->each(fn (ProductImage $img) => MediaDisk::delete($img->path));
        $product->images()->delete();

        return $this->_destroy($product, null);
    }
}
