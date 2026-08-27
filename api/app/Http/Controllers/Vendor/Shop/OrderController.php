<?php

namespace App\Http\Controllers\Vendor\Shop;

use App\Enums\Shop\OrderStatusEnum;
use App\Http\Controllers\BaseControllerTrait;
use App\Http\Controllers\Controller;
use App\Http\Middleware\EnsureVendor;
use App\Http\Requests\Vendor\Shop\UpdateVendorOrderPaymentRequest;
use App\Http\Requests\Vendor\Shop\UpdateVendorOrderStatusRequest;
use App\Http\Resources\Vendor\Shop\VendorOrderResource;
use App\Models\Shop\VendorOrder;
use App\Services\Shop\OrderPaymentService;
use App\Services\Shop\VendorOrderStatusService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use InvalidArgumentException;
use RuntimeException;
use Spatie\QueryBuilder\AllowedFilter;
use Spatie\QueryBuilder\QueryBuilder;

class OrderController extends Controller
{
    use BaseControllerTrait;

    public function __construct(
        private readonly VendorOrderStatusService $vendorOrderStatus,
        private readonly OrderPaymentService $payments,
    ) {}

    public function index(Request $request): AnonymousResourceCollection|JsonResponse
    {
        $vendor = EnsureVendor::vendor($request);

        $query = QueryBuilder::for(
            VendorOrder::query()
                ->where('vendor_id', $vendor->id)
                ->with(['items', 'order.user'])
        )
            ->allowedFilters([
                AllowedFilter::exact('id'),
                AllowedFilter::exact('status'),
                AllowedFilter::exact('order_id'),
            ])
            ->defaultSort('-id')
            ->allowedSorts(['id', 'status', 'total', 'created_at', 'updated_at']);

        return VendorOrderResource::collection($this->paginateOrAll($query));
    }

    public function show(Request $request, int $vendorOrder): JsonResponse
    {
        $record = $this->findOwnedOrder($request, $vendorOrder);

        return $this->success(new VendorOrderResource($record));
    }

    public function updateStatus(UpdateVendorOrderStatusRequest $request, int $vendorOrder): JsonResponse
    {
        $record = $this->findOwnedOrder($request, $vendorOrder);
        $to = OrderStatusEnum::from($request->validated('status'));

        try {
            $result = $this->vendorOrderStatus->transition(
                $record,
                $to,
                $request->user(),
                asAdmin: false,
            );
        } catch (InvalidArgumentException|RuntimeException $e) {
            return $this->failure($e->getMessage(), 'VALIDATION_ERROR');
        }

        $updated = $result['vendor_order'];
        $tracking = collect($request->validated())->only(['tracking_number', 'carrier'])->all();
        if ($tracking !== []) {
            $updated->fill($tracking)->save();
            $updated->refresh();
        }

        return $this->success(
            new VendorOrderResource($updated->load(['items', 'order.user'])),
            'Order status updated.'
        );
    }

    public function updatePayment(UpdateVendorOrderPaymentRequest $request, int $vendorOrder): JsonResponse
    {
        $record = $this->findOwnedOrder($request, $vendorOrder);
        $order = $record->order;
        if ($order === null) {
            return $this->failure('Parent order not found.', 'NOT_FOUND');
        }

        try {
            $this->payments->verify($order, $request->validated(), $request->user());
        } catch (InvalidArgumentException $e) {
            return $this->failure($e->getMessage(), 'VALIDATION_ERROR');
        }

        $record = $this->findOwnedOrder($request, $vendorOrder);

        return $this->success(new VendorOrderResource($record), 'Payment updated.');
    }

    private function findOwnedOrder(Request $request, int $vendorOrderId): VendorOrder
    {
        $vendor = EnsureVendor::vendor($request);

        return VendorOrder::query()
            ->where('vendor_id', $vendor->id)
            ->with(['items', 'order.user'])
            ->findOrFail($vendorOrderId);
    }
}
