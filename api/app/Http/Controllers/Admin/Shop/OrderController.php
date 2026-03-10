<?php

namespace App\Http\Controllers\Admin\Shop;

use App\Events\OrderStatusUpdated;
use App\Http\Controllers\Admin\BaseAdminController;
use App\Http\Requests\Admin\Shop\UpdateOrderRequest;
use App\Http\Resources\Admin\Shop\OrderResource;
use App\Models\Shop\Order;
use Illuminate\Http\JsonResponse;

class OrderController extends BaseAdminController
{
    public function __construct()
    {
        parent::__construct(Order::class, OrderResource::class, 'order');
    }

    protected function baseQuery()
    {
        return Order::query()->with(['user', 'items']);
    }

    public function show(Order $order): JsonResponse
    {
        return $this->_show($order);
    }

    public function update(UpdateOrderRequest $request, Order $order): JsonResponse
    {
        $previousStatus = $order->status;
        $response = $this->_patch($request, $order, 'Order updated.');
        $order->refresh();
        event(new OrderStatusUpdated($order, $previousStatus));

        return $response;
    }
}
