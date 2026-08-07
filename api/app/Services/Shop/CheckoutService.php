<?php

namespace App\Services\Shop;

use App\Enums\Shop\InventoryReasonEnum;
use App\Enums\Shop\OrderStatusEnum;
use App\Enums\Shop\PaymentMethodEnum;
use App\Enums\Shop\PaymentStatusEnum;
use App\Enums\Shop\ProductStatusEnum;
use App\Enums\Shop\VendorStatusEnum;
use App\Models\Shop\Cart;
use App\Models\Shop\Order;
use App\Models\Shop\OrderItem;
use App\Models\Shop\Product;
use App\Models\Shop\Vendor;
use App\Models\Shop\VendorOrder;
use App\Models\User;
use App\Support\Media\MediaDisk;
use Illuminate\Support\Facades\DB;
use RuntimeException;

class CheckoutService
{
    public function __construct(
        private readonly InventoryService $inventory,
        private readonly CommissionService $commission,
        private readonly ShippingService $shipping,
    ) {}

    /**
     * @param  array{address: string, city: string, country: string, notes?: string|null}  $shipping
     */
    public function checkout(User $user, Cart $cart, array $shipping): Order
    {
        $cart->load(['items.product.images', 'items.product.vendor']);

        if ($cart->items->isEmpty()) {
            throw new RuntimeException('Cart is empty.');
        }

        return DB::transaction(function () use ($user, $cart, $shipping) {
            $productIds = $cart->items->pluck('product_id')->filter()->unique()->sort()->values()->all();
            $products = Product::query()
                ->whereIn('id', $productIds)
                ->orderBy('id')
                ->lockForUpdate()
                ->get()
                ->keyBy('id');

            $vendorIds = $products->pluck('vendor_id')->unique()->sort()->values()->all();
            $vendors = Vendor::query()
                ->whereIn('id', $vendorIds)
                ->orderBy('id')
                ->lockForUpdate()
                ->get()
                ->keyBy('id');

            $unavailableProductIds = [];
            $grouped = [];

            foreach ($cart->items as $cartItem) {
                $product = $products->get($cartItem->product_id);
                if (! $product) {
                    $unavailableProductIds[] = $cartItem->product_id;

                    continue;
                }

                $vendor = $vendors->get($product->vendor_id);
                $sellable = $vendor
                    && $vendor->status === VendorStatusEnum::APPROVED
                    && $product->status === ProductStatusEnum::PUBLISHED
                    && $product->is_active
                    && $product->stock_quantity >= $cartItem->quantity;

                if (! $sellable) {
                    $unavailableProductIds[] = $product->id;

                    continue;
                }

                $unitPrice = $product->getSalePrice() ?? (float) $product->price;
                $totalPrice = round($unitPrice * $cartItem->quantity, 2);
                $firstImage = $product->images->first();
                $imageUrl = $firstImage && $firstImage->path ? MediaDisk::url($firstImage->path) : null;

                $grouped[$product->vendor_id][] = [
                    'product' => $product,
                    'quantity' => $cartItem->quantity,
                    'unit_price' => $unitPrice,
                    'total_price' => $totalPrice,
                    'snapshot' => [
                        'name' => $product->name,
                        'sku' => $product->sku,
                        'slug' => $product->slug,
                        'image_url' => $imageUrl,
                        'vendor_id' => $product->vendor_id,
                        'store_name' => $vendor->store_name,
                    ],
                ];
            }

            if ($unavailableProductIds !== []) {
                throw new RuntimeException(
                    'STOCK_UNAVAILABLE:'.implode(',', array_unique($unavailableProductIds))
                );
            }

            ksort($grouped);

            $orderSubtotal = 0.0;
            foreach ($grouped as $lines) {
                foreach ($lines as $line) {
                    $orderSubtotal += $line['total_price'];
                }
            }
            $shippingAmount = $this->shipping->quote($vendors);
            $orderTotal = round($orderSubtotal + $shippingAmount, 2);

            $order = Order::create([
                'user_id' => $user->id,
                'order_number' => Order::generateOrderNumber(),
                'status' => OrderStatusEnum::PENDING,
                'payment_status' => PaymentStatusEnum::UNPAID,
                'payment_method' => PaymentMethodEnum::COD,
                'subtotal' => $orderSubtotal,
                'shipping_amount' => $shippingAmount,
                'discount_amount' => 0,
                'total' => $orderTotal,
                'currency' => 'PKR',
                'address' => $shipping['address'],
                'city' => $shipping['city'],
                'country' => $shipping['country'],
                'notes' => $shipping['notes'] ?? null,
                'placed_at' => now(),
            ]);

            $vendorIndex = 1;
            foreach ($grouped as $vendorId => $lines) {
                $vendor = $vendors->get($vendorId);
                $subtotal = 0.0;
                foreach ($lines as $line) {
                    $subtotal += $line['total_price'];
                }
                $subtotal = round($subtotal, 2);
                $vendorShipping = round((float) $vendor->default_shipping_amount, 2);
                $vendorDiscount = 0.0;
                $amounts = $this->commission->calculate($vendor, $subtotal, $vendorShipping, $vendorDiscount);
                $vendorTotal = round($subtotal + $vendorShipping - $vendorDiscount, 2);

                $vendorOrder = VendorOrder::create([
                    'order_id' => $order->id,
                    'vendor_id' => $vendorId,
                    'vendor_order_number' => $order->order_number.'-V'.$vendorIndex,
                    'status' => OrderStatusEnum::PENDING,
                    'subtotal' => $subtotal,
                    'shipping_amount' => $vendorShipping,
                    'discount_amount' => $vendorDiscount,
                    'commission_rate_snapshot' => $amounts['rate'],
                    'commission_amount' => $amounts['commission_amount'],
                    'vendor_earnings' => $amounts['vendor_earnings'],
                    'total' => $vendorTotal,
                ]);
                $vendorIndex++;

                foreach ($lines as $line) {
                    /** @var Product $product */
                    $product = $line['product'];
                    $orderItem = OrderItem::create([
                        'order_id' => $order->id,
                        'vendor_id' => $vendorId,
                        'vendor_order_id' => $vendorOrder->id,
                        'product_id' => $product->id,
                        'product_snapshot' => $line['snapshot'],
                        'quantity' => $line['quantity'],
                        'unit_price' => $line['unit_price'],
                        'total_price' => $line['total_price'],
                    ]);

                    $this->inventory->decrement(
                        $product,
                        $line['quantity'],
                        InventoryReasonEnum::SALE,
                        $orderItem,
                        $user,
                    );
                }
            }

            $cart->items()->delete();

            return $order->load(['items', 'vendorOrders']);
        });
    }
}
