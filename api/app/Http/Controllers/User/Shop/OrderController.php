<?php

namespace App\Http\Controllers\User\Shop;

use App\Enums\Shop\OrderStatusEnum;
use App\Events\OrderPlaced;
use App\Http\Controllers\BaseControllerTrait;
use App\Http\Controllers\Controller;
use App\Http\Requests\User\Shop\StoreOrderRequest;
use App\Http\Resources\User\Shop\OrderResource;
use App\Models\Shop\Cart;
use App\Models\Shop\Order;
use App\Models\Shop\OrderItem;
use App\Models\Shop\Product;
use App\Support\Media\MediaDisk;
use App\Utils\Constants\ApiConstants;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\DB;

class OrderController extends Controller
{
    use BaseControllerTrait;

    /** List authenticated user's orders. */
    public function index(): AnonymousResourceCollection
    {
        $user = request()->user();
        $orders = Order::query()
            ->where('user_id', $user->id)
            ->with('items.product.images')
            ->orderByDesc('created_at')
            ->paginate(ApiConstants::perPage());

        foreach ($orders as $record) {
            foreach ($record->items as $item) {
                $snapshot = $item->product_snapshot ?? [];
                if (empty($snapshot['image_url']) && $item->product) {
                    $firstImage = $item->product->images->first();
                    if ($firstImage && $firstImage->path) {
                        $snapshot['image_url'] = MediaDisk::url($firstImage->path);
                        $item->product_snapshot = $snapshot;
                    }
                }
            }
        }

        return OrderResource::collection($orders);
    }

    /** Show a single order (own only). */
    public function show(int $order): JsonResponse
    {
        $user = request()->user();
        $record = Order::query()
            ->where('user_id', $user->id)
            ->with('items.product.images')
            ->findOrFail($order);

        foreach ($record->items as $item) {
            $snapshot = $item->product_snapshot ?? [];
            if (empty($snapshot['image_url']) && $item->product) {
                $firstImage = $item->product->images->first();
                if ($firstImage && $firstImage->path) {
                    $snapshot['image_url'] = MediaDisk::url($firstImage->path);
                    $item->product_snapshot = $snapshot;
                }
            }
        }

        return $this->success(new OrderResource($record));
    }

    /** Create order from current cart (checkout). */
    public function store(StoreOrderRequest $request): JsonResponse
    {
        $user = $request->user();
        $cart = Cart::query()->where('user_id', $user->id)->first();
        if (! $cart) {
            return $this->failure('Cart is empty.', 'VALIDATION_ERROR');
        }

        $cart->load('items.product.images');
        if ($cart->items->isEmpty()) {
            return $this->failure('Cart is empty.', 'VALIDATION_ERROR');
        }

        $validated = $request->validated();

        // Collect item data outside the transaction for image URL resolution (read-only, no lock needed).
        $preflightItems = [];
        foreach ($cart->items as $item) {
            $product = $item->product;
            $firstImage = $product?->images->first();
            $imageUrl = $firstImage && $firstImage->path
                ? MediaDisk::url($firstImage->path)
                : null;

            $preflightItems[] = [
                'cart_item' => $item,
                'product_id' => $product?->id,
                'product_name' => $product?->name ?? 'Unknown',
                'quantity' => $item->quantity,
                'image_url' => $imageUrl,
                'sku' => $product?->sku,
                'slug' => $product?->slug,
            ];
        }

        try {
            $order = DB::transaction(function () use ($user, $validated, $preflightItems, $cart) {
                $subtotal = 0;
                $itemsData = [];

                foreach ($preflightItems as $entry) {
                    // Lock the product row to prevent concurrent overselling.
                    $product = Product::lockForUpdate()->find($entry['product_id']);

                    if (! $product || $product->stock_quantity < $entry['quantity']) {
                        throw new \RuntimeException("Insufficient stock for product: {$entry['product_name']}.");
                    }

                    $unitPrice = $product->getSalePrice() ?? (float) $product->price;
                    $totalPrice = round($unitPrice * $entry['quantity'], 2);
                    $subtotal += $totalPrice;

                    $product->decrement('stock_quantity', $entry['quantity']);

                    $itemsData[] = [
                        'product_id' => $product->id,
                        'product_snapshot' => [
                            'name' => $product->name,
                            'sku' => $product->sku,
                            'slug' => $product->slug,
                            'image_url' => $entry['image_url'],
                        ],
                        'quantity' => $entry['quantity'],
                        'unit_price' => $unitPrice,
                        'total_price' => $totalPrice,
                    ];
                }

                // Shipping is computed server-side (free shipping for now).
                $shippingAmount = 0;
                $total = round($subtotal + $shippingAmount, 2);

                $order = Order::create([
                    'user_id' => $user->id,
                    'order_number' => Order::generateOrderNumber(),
                    'status' => OrderStatusEnum::PENDING,
                    'subtotal' => $subtotal,
                    'shipping_amount' => $shippingAmount,
                    'discount_amount' => 0,
                    'total' => $total,
                    'currency' => 'PKR',
                    'address' => $validated['address'],
                    'city' => $validated['city'],
                    'country' => $validated['country'],
                    'notes' => $validated['notes'] ?? null,
                ]);

                foreach ($itemsData as $row) {
                    OrderItem::create([
                        'order_id' => $order->id,
                        'product_id' => $row['product_id'],
                        'product_snapshot' => $row['product_snapshot'],
                        'quantity' => $row['quantity'],
                        'unit_price' => $row['unit_price'],
                        'total_price' => $row['total_price'],
                    ]);
                }

                $cart->items()->delete();

                return $order->load('items');
            });
        } catch (\RuntimeException $e) {
            return $this->failure($e->getMessage(), 'VALIDATION_ERROR');
        }

        event(new OrderPlaced($order));

        return $this->success(new OrderResource($order), 'Order placed successfully.', 'CREATED');
    }
}
