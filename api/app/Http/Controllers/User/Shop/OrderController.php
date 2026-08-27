<?php

namespace App\Http\Controllers\User\Shop;

use App\Events\OrderPlaced;
use App\Http\Controllers\BaseControllerTrait;
use App\Http\Controllers\Controller;
use App\Http\Requests\User\Shop\StoreOrderRequest;
use App\Http\Resources\User\Shop\OrderResource;
use App\Models\Shop\Cart;
use App\Models\Shop\Order;
use App\Services\Shop\CheckoutService;
use App\Services\Shop\VendorOrderStatusService;
use App\Support\Media\MediaDisk;
use App\Utils\Constants\ApiConstants;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use InvalidArgumentException;
use RuntimeException;

class OrderController extends Controller
{
    use BaseControllerTrait;

    public function __construct(
        private readonly CheckoutService $checkout,
        private readonly VendorOrderStatusService $vendorOrderStatus,
    ) {}

    /** List authenticated user's orders. */
    public function index(): AnonymousResourceCollection
    {
        $user = request()->user();
        $orders = Order::query()
            ->where('user_id', $user->id)
            ->with(['items.product.images', 'vendorOrders.vendor'])
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
            ->with(['items.product.images', 'vendorOrders.vendor'])
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
        if (! $cart || $cart->items()->doesntExist()) {
            return $this->failure('Cart is empty.', 'VALIDATION_ERROR');
        }

        try {
            $order = $this->checkout->checkout($user, $cart, $request->validated());
        } catch (RuntimeException $e) {
            if (str_starts_with($e->getMessage(), 'STOCK_UNAVAILABLE:')) {
                $ids = array_values(array_filter(explode(',', substr($e->getMessage(), strlen('STOCK_UNAVAILABLE:')))));

                return $this->failure(
                    'Some products are unavailable.',
                    'STOCK_UNAVAILABLE',
                    ['product_ids' => array_map('intval', $ids)]
                );
            }

            return $this->failure($e->getMessage(), 'VALIDATION_ERROR');
        }

        event(new OrderPlaced($order));

        return $this->success(new OrderResource($order), 'Order placed successfully.', 'CREATED');
    }

    /** Buyer cancel — only while all vendor-orders are pending and payment is not recorded. */
    public function cancel(int $order): JsonResponse
    {
        $user = request()->user();
        $record = Order::query()
            ->where('user_id', $user->id)
            ->findOrFail($order);

        try {
            $result = $this->vendorOrderStatus->cancelByBuyer($record, $user);
        } catch (InvalidArgumentException|RuntimeException $e) {
            return $this->failure($e->getMessage(), 'VALIDATION_ERROR');
        }

        $updated = $result['parent'];

        return $this->success(
            new OrderResource($updated->load(['items.product.images', 'vendorOrders.vendor'])),
            'Order cancelled.'
        );
    }
}
