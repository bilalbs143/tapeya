<?php

namespace App\Http\Controllers\User\Shop;

use App\Enums\Shop\OrderStatusEnum;
use App\Http\Controllers\BaseControllerTrait;
use App\Http\Controllers\Controller;
use App\Http\Requests\User\Shop\StoreOrderRequest;
use App\Http\Resources\User\Shop\OrderResource;
use App\Models\Shop\Cart;
use App\Models\Shop\Order;
use App\Models\Shop\OrderItem;
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
            ->with('items')
            ->orderByDesc('created_at')
            ->paginate((int) request('per_page', 15));

        return OrderResource::collection($orders);
    }

    /** Show a single order (own only). */
    public function show(int $order): JsonResponse
    {
        $user = request()->user();
        $record = Order::query()
            ->where('user_id', $user->id)
            ->with('items')
            ->findOrFail($order);

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

        $cart->load('items.product');
        if ($cart->items->isEmpty()) {
            return $this->failure('Cart is empty.', 'VALIDATION_ERROR');
        }

        $validated = $request->validated();
        $shippingAmount = isset($validated['shipping_amount']) ? (float) $validated['shipping_amount'] : 0;

        $subtotal = 0;
        $itemsData = [];
        foreach ($cart->items as $item) {
            $product = $item->product;
            if (! $product || $product->stock_quantity < $item->quantity) {
                $name = $product ? $product->name : 'Unknown';

                return $this->failure(
                    "Insufficient stock for product: {$name}.",
                    'VALIDATION_ERROR'
                );
            }
            $unitPrice = $product->getSalePrice() ?? (float) $product->price;
            $totalPrice = round($unitPrice * $item->quantity, 2);
            $subtotal += $totalPrice;
            $itemsData[] = [
                'product_id' => $product->id,
                'product_snapshot' => [
                    'name' => $product->name,
                    'sku' => $product->sku,
                    'slug' => $product->slug,
                ],
                'quantity' => $item->quantity,
                'unit_price' => $unitPrice,
                'total_price' => $totalPrice,
            ];
        }

        $order = DB::transaction(function () use ($user, $validated, $subtotal, $shippingAmount, $itemsData, $cart) {
            $orderNumber = Order::generateOrderNumber();
            $total = round($subtotal + $shippingAmount, 2);

            $order = Order::create([
                'user_id' => $user->id,
                'order_number' => $orderNumber,
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

        return $this->success(new OrderResource($order), 'Order placed successfully.', 'CREATED');
    }
}
