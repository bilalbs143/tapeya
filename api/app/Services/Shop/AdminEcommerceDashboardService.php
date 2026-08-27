<?php

namespace App\Services\Shop;

use App\Enums\Shop\OrderStatusEnum;
use App\Enums\Shop\PaymentStatusEnum;
use App\Enums\Shop\VendorStatusEnum;
use App\Models\Shop\Order;
use App\Models\Shop\Vendor;
use App\Models\Shop\VendorOrder;
use Carbon\Carbon;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

/**
 * Marketplace KPI extensions for the admin ecommerce dashboard.
 */
class AdminEcommerceDashboardService
{
    /**
     * @return array<string, mixed>
     */
    public function marketplaceMetrics(): array
    {
        $vendorsByStatus = $this->countsByEnum(
            Vendor::query()->select('status', DB::raw('COUNT(*) as aggregate'))->groupBy('status')->pluck('aggregate', 'status'),
            VendorStatusEnum::cases(),
        );

        $ordersByStatus = $this->countsByEnum(
            Order::query()->select('status', DB::raw('COUNT(*) as aggregate'))->groupBy('status')->pluck('aggregate', 'status'),
            OrderStatusEnum::cases(),
        );

        $gmvByVendor = VendorOrder::query()
            ->select(
                'shop_vendor_orders.vendor_id',
                'shop_vendors.store_name',
                'shop_vendors.slug',
                DB::raw('SUM(shop_vendor_orders.total) as gmv'),
                DB::raw('SUM(shop_vendor_orders.commission_amount) as commission')
            )
            ->join('shop_vendors', 'shop_vendors.id', '=', 'shop_vendor_orders.vendor_id')
            ->where('shop_vendor_orders.status', '!=', OrderStatusEnum::CANCELLED)
            ->groupBy('shop_vendor_orders.vendor_id', 'shop_vendors.store_name', 'shop_vendors.slug')
            ->orderByDesc('gmv')
            ->limit(10)
            ->get()
            ->map(fn ($row) => [
                'vendor_id' => (int) $row->vendor_id,
                'store_name' => $row->store_name,
                'slug' => $row->slug,
                'gmv' => (float) $row->gmv,
                'commission' => (float) $row->commission,
            ])
            ->all();

        $commissionAccrued = (float) VendorOrder::query()
            ->where('status', '!=', OrderStatusEnum::CANCELLED)
            ->sum('commission_amount');

        $outstandingPaymentsBase = Order::query()
            ->whereIn('payment_status', [
                PaymentStatusEnum::UNPAID,
                PaymentStatusEnum::ADVANCE,
            ]);

        $outstandingPaymentsQueue = (clone $outstandingPaymentsBase)
            ->orderByDesc('id')
            ->limit(15)
            ->get(['id', 'order_number', 'payment_status', 'total', 'amount_received', 'created_at'])
            ->map(fn (Order $o) => [
                'id' => $o->id,
                'order_number' => $o->order_number,
                'payment_status' => $o->payment_status?->value,
                'total' => (float) $o->total,
                'amount_received' => $o->amount_received !== null ? (float) $o->amount_received : null,
                'created_at' => $o->created_at?->toIso8601String(),
            ])
            ->all();

        return [
            'vendors_by_status' => $vendorsByStatus,
            'orders_by_status_enum' => $ordersByStatus,
            'gmv_by_vendor' => $gmvByVendor,
            'commission_accrued' => $commissionAccrued,
            'outstanding_payments_queue' => $outstandingPaymentsQueue,
            'outstanding_payments_queue_count' => (clone $outstandingPaymentsBase)->count(),
            'as_of' => Carbon::now()->toIso8601String(),
        ];
    }

    /**
     * Non-cancelled order statuses for legacy revenue aggregates (enum-driven).
     *
     * @return list<string>
     */
    public function activeOrderStatusValues(): array
    {
        return collect(OrderStatusEnum::cases())
            ->reject(fn (OrderStatusEnum $s) => $s === OrderStatusEnum::CANCELLED)
            ->map(fn (OrderStatusEnum $s) => $s->value)
            ->values()
            ->all();
    }

    /**
     * @param  Collection<string|int, int|string>  $counts
     * @param  list<\BackedEnum>  $cases
     * @return array<string, int>
     */
    private function countsByEnum($counts, array $cases): array
    {
        $out = [];
        foreach ($cases as $case) {
            $out[$case->value] = (int) ($counts[$case->value] ?? 0);
        }

        return $out;
    }
}
