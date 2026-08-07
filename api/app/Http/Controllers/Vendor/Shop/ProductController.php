<?php

namespace App\Http\Controllers\Vendor\Shop;

use App\Enums\Shop\InventoryReasonEnum;
use App\Http\Controllers\BaseControllerTrait;
use App\Http\Controllers\Controller;
use App\Http\Middleware\EnsureVendor;
use App\Http\Requests\Vendor\Shop\StoreProductRequest;
use App\Http\Requests\Vendor\Shop\UpdateProductRequest;
use App\Http\Resources\Vendor\Shop\ProductResource;
use App\Models\Shop\Product;
use App\Models\Shop\ProductImage;
use App\Services\Shop\InventoryService;
use App\Support\Media\MediaDisk;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\DB;
use Spatie\QueryBuilder\QueryBuilder;

class ProductController extends Controller
{
    use BaseControllerTrait;

    public function __construct(
        private readonly InventoryService $inventory,
    ) {}

    public function index(Request $request): AnonymousResourceCollection|JsonResponse
    {
        $vendor = EnsureVendor::vendor($request);

        $query = QueryBuilder::for(
            Product::query()->forVendor($vendor->id)->with(['brand', 'category', 'images'])
        )
            ->allowedFilters(Product::getFilters())
            ->defaultSort('-id')
            ->allowedSorts(Product::getSorts());

        return ProductResource::collection($this->paginateOrAll($query));
    }

    public function show(Request $request, int $product): JsonResponse
    {
        $record = $this->findOwnedProduct($request, $product);

        return $this->success(new ProductResource($record));
    }

    public function store(StoreProductRequest $request): JsonResponse
    {
        $vendor = EnsureVendor::vendor($request);
        $data = $request->validated();
        $stockQuantity = (int) ($data['stock_quantity'] ?? 0);
        unset($data['stock_quantity']);

        $record = DB::transaction(function () use ($vendor, $data, $stockQuantity, $request) {
            $data['vendor_id'] = $vendor->id;
            $data['stock_quantity'] = 0;

            $product = Product::query()->create($data);

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

            return Product::query()
                ->with(['brand', 'category', 'images'])
                ->findOrFail($product->id);
        });

        return $this->success(new ProductResource($record), 'Product created.', 'CREATED');
    }

    public function update(UpdateProductRequest $request, int $product): JsonResponse
    {
        $vendor = EnsureVendor::vendor($request);
        $data = $request->validated();
        $stockQuantity = array_key_exists('stock_quantity', $data)
            ? (int) $data['stock_quantity']
            : null;
        unset($data['stock_quantity']);

        $record = DB::transaction(function () use ($vendor, $product, $data, $stockQuantity, $request) {
            $locked = Product::query()
                ->forVendor($vendor->id)
                ->whereKey($product)
                ->lockForUpdate()
                ->firstOrFail();

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

            return Product::query()
                ->with(['brand', 'category', 'images'])
                ->findOrFail($locked->id);
        });

        return $this->success(new ProductResource($record), 'Product updated.');
    }

    public function destroy(Request $request, int $product): JsonResponse
    {
        $record = $this->findOwnedProduct($request, $product);
        $record->images->each(fn (ProductImage $img) => MediaDisk::delete($img->path));
        $record->images()->delete();
        $record->delete();

        return $this->noContent();
    }

    private function findOwnedProduct(Request $request, int $productId): Product
    {
        $vendor = EnsureVendor::vendor($request);

        return Product::query()
            ->forVendor($vendor->id)
            ->with(['brand', 'category', 'images'])
            ->findOrFail($productId);
    }
}
