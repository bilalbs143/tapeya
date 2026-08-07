<?php

namespace App\Services\Shop;

use App\Enums\Shop\OrderStatusEnum;
use App\Enums\Shop\ProductStatusEnum;
use App\Models\Shop\Product;
use App\Models\Shop\Vendor;
use App\Models\Shop\VendorOrder;
use Carbon\Carbon;
use Carbon\CarbonInterface;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class VendorDashboardService
{
    /**
     * @return array<string, mixed>
     */
    public function build(Vendor $vendor, ?CarbonInterface $from = null, ?CarbonInterface $to = null): array
    {
        $from = ($from ?? Carbon::now()->subDays(29))->copy()->startOfDay();
        $to = ($to ?? Carbon::now())->copy()->endOfDay();
        $cacheKey = sprintf(
            'shop.vendor.dash.%d.%s.%s',
            $vendor->id,
            $from->toDateString(),
            $to->toDateString()
        );

        return Cache::remember($cacheKey, 60, function () use ($vendor, $from, $to) {
            $ordersBase = VendorOrder::query()
                ->where('vendor_id', $vendor->id)
                ->whereBetween('created_at', [$from, $to])
                ->where('status', '!=', OrderStatusEnum::CANCELLED);

            $totalOrders = (clone $ordersBase)->count();
            $pendingOrders = VendorOrder::query()
                ->where('vendor_id', $vendor->id)
                ->where('status', OrderStatusEnum::PENDING)
                ->count();
            $grossRevenue = (float) (clone $ordersBase)->sum('total');
            $netEarnings = (float) (clone $ordersBase)->sum('vendor_earnings');

            $recentOrders = VendorOrder::query()
                ->where('vendor_id', $vendor->id)
                ->with(['order:id,order_number'])
                ->orderByDesc('id')
                ->limit(8)
                ->get()
                ->map(fn (VendorOrder $vo) => [
                    'id' => $vo->id,
                    'vendor_order_number' => $vo->vendor_order_number,
                    'status' => $vo->status?->value,
                    'status_label' => $vo->status?->label(),
                    'total' => (float) $vo->total,
                    'vendor_earnings' => (float) $vo->vendor_earnings,
                    'created_at' => $vo->created_at?->toIso8601String(),
                ])
                ->all();

            $totalsByDay = VendorOrder::query()
                ->where('vendor_id', $vendor->id)
                ->whereBetween('created_at', [$from, $to])
                ->where('status', '!=', OrderStatusEnum::CANCELLED)
                ->select(
                    DB::raw('DATE(created_at) as day'),
                    DB::raw('SUM(total) as day_total')
                )
                ->groupBy(DB::raw('DATE(created_at)'))
                ->pluck('day_total', 'day');

            $revenueSeries = [];
            $cursor = $from->copy()->startOfDay();
            while ($cursor->lte($to)) {
                $day = $cursor->toDateString();
                $revenueSeries[] = [
                    'date' => $day,
                    'total' => (float) ($totalsByDay[$day] ?? 0),
                ];
                $cursor->addDay();
                if (count($revenueSeries) > 62) {
                    break;
                }
            }

            $totalProducts = Product::query()->forVendor($vendor->id)->count();
            $activeProducts = Product::query()
                ->forVendor($vendor->id)
                ->where('status', ProductStatusEnum::PUBLISHED)
                ->count();

            return [
                'from' => $from->toIso8601String(),
                'to' => $to->toIso8601String(),
                'total_products' => $totalProducts,
                'active_products' => $activeProducts,
                'products_count' => $totalProducts,
                'published_count' => $activeProducts,
                'total_orders' => $totalOrders,
                'pending_orders' => $pendingOrders,
                'pending_orders_count' => $pendingOrders,
                'gross_revenue' => $grossRevenue,
                'net_earnings' => $netEarnings,
                'low_stock_count' => Product::query()
                    ->forVendor($vendor->id)
                    ->whereColumn('stock_quantity', '<=', 'low_stock_threshold')
                    ->count(),
                'recent_orders' => $recentOrders,
                'revenue_series' => $revenueSeries,
            ];
        });
    }
}
