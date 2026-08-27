<?php

namespace App\Http\Controllers\Admin\Shop;

use App\Enums\Shop\OrderStatusEnum;
use App\Http\Controllers\Admin\BaseAdminController;
use App\Http\Requests\Admin\Shop\RefundOrderRequest;
use App\Http\Requests\Admin\Shop\UpdateOrderPaymentRequest;
use App\Http\Requests\Admin\Shop\UpdateOrderRequest;
use App\Http\Resources\Admin\Shop\OrderResource;
use App\Models\Shop\Order;
use App\Services\Shop\OrderPaymentService;
use App\Services\Shop\VendorOrderStatusService;
use Illuminate\Http\JsonResponse;
use InvalidArgumentException;
use RuntimeException;

class OrderController extends BaseAdminController
{
    public function __construct(
        private readonly VendorOrderStatusService $vendorOrderStatus,
        private readonly OrderPaymentService $payments,
    ) {
        parent::__construct(Order::class, OrderResource::class, 'order');
    }

    protected function baseQuery()
    {
        return Order::query()->with(['user', 'items', 'vendorOrders']);
    }

    public function show(Order $order): JsonResponse
    {
        return $this->_show($order);
    }

    public function update(UpdateOrderRequest $request, Order $order): JsonResponse
    {
        $to = OrderStatusEnum::from($request->validated('status'));

        try {
            $result = $this->vendorOrderStatus->transitionParent($order, $to, $request->user());
        } catch (InvalidArgumentException|RuntimeException $e) {
            return $this->failure($e->getMessage(), 'VALIDATION_ERROR');
        }

        $updated = $result['parent'];

        return $this->success(new OrderResource($updated->load(['user', 'items', 'vendorOrders'])), 'Order updated.');
    }

    public function updatePayment(UpdateOrderPaymentRequest $request, Order $order): JsonResponse
    {
        try {
            $updated = $this->payments->verify($order, $request->validated(), $request->user());
        } catch (InvalidArgumentException $e) {
            return $this->failure($e->getMessage(), 'VALIDATION_ERROR');
        }

        return $this->success(
            new OrderResource($updated->load(['user', 'items', 'vendorOrders'])),
            'Payment updated.'
        );
    }

    public function refund(RefundOrderRequest $request, Order $order): JsonResponse
    {
        try {
            $updated = $this->payments->refund($order, $request->validated(), $request->user());
        } catch (InvalidArgumentException $e) {
            return $this->failure($e->getMessage(), 'VALIDATION_ERROR');
        }

        return $this->success(
            new OrderResource($updated->load(['user', 'items', 'vendorOrders'])),
            'Refund recorded.'
        );
    }
}
