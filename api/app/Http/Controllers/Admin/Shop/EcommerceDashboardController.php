<?php

namespace App\Http\Controllers\Admin\Shop;

use App\Http\Controllers\BaseControllerTrait;
use App\Http\Controllers\Controller;
use App\Models\Shop\Order;
use App\Models\Shop\OrderItem;
use App\Models\Shop\Product;
use App\Services\Shop\AdminEcommerceDashboardService;
use App\Support\Media\MediaDisk;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class EcommerceDashboardController extends Controller
{
    use BaseControllerTrait;

    public function __construct(
        private readonly AdminEcommerceDashboardService $marketplaceDashboard,
    ) {}

    /**
     * Return aggregated stats for the ecommerce dashboard.
     */
    public function __invoke(): JsonResponse
    {
        return $this->success($this->buildDashboardPayload());
    }

    /**
     * @return array<string, mixed>
     */
    private function buildDashboardPayload(): array
    {
        $now = Carbon::now();
        $todayStart = $now->copy()->startOfDay();
        $yesterdayStart = $now->copy()->subDay()->startOfDay();
        $sevenDaysAgo = $now->copy()->subDays(6)->startOfDay();
        $thirtyDaysAgo = $now->copy()->subDays(29)->startOfDay();

        // Exclude cancelled from revenue/order counts where meaningful (enum-driven)
        $completedStatuses = $this->marketplaceDashboard->activeOrderStatusValues();

        // Today's sales (revenue) and count
        $todayRevenue = (float) Order::query()
            ->where('created_at', '>=', $todayStart)
            ->whereIn('status', $completedStatuses)
            ->sum('total');
        $todayOrdersCount = Order::query()
            ->where('created_at', '>=', $todayStart)
            ->whereIn('status', $completedStatuses)
            ->count();

        // Yesterday for percent change
        $yesterdayRevenue = (float) Order::query()
            ->whereBetween('created_at', [$yesterdayStart, $todayStart])
            ->whereIn('status', $completedStatuses)
            ->sum('total');
        $todaySalesPercentChange = $yesterdayRevenue > 0
            ? round((($todayRevenue - $yesterdayRevenue) / $yesterdayRevenue) * 100, 1)
            : ($todayRevenue > 0 ? 100 : 0);

        // Last 30 days revenue and count
        $revenue30d = (float) Order::query()
            ->where('created_at', '>=', $thirtyDaysAgo)
            ->whereIn('status', $completedStatuses)
            ->sum('total');
        $ordersCount30d = Order::query()
            ->where('created_at', '>=', $thirtyDaysAgo)
            ->whereIn('status', $completedStatuses)
            ->count();

        // Previous 30 days for overall performance %
        $previous30dStart = $now->copy()->subDays(59)->startOfDay();
        $revenuePrevious30d = (float) Order::query()
            ->whereBetween('created_at', [$previous30dStart, $thirtyDaysAgo])
            ->whereIn('status', $completedStatuses)
            ->sum('total');
        $overallPerformancePercent = $revenuePrevious30d > 0
            ? round((($revenue30d - $revenuePrevious30d) / $revenuePrevious30d) * 100, 1)
            : ($revenue30d > 0 ? 100 : 0);

        // Revenue by status (for donut) - only non-cancelled
        $revenueByStatus = Order::query()
            ->whereIn('status', $completedStatuses)
            ->where('created_at', '>=', $thirtyDaysAgo)
            ->selectRaw('status, COALESCE(SUM(total), 0) as total')
            ->groupBy('status')
            ->pluck('total', 'status')
            ->map(fn ($v) => round((float) $v, 2))
            ->all();

        // Orders count by status (for "payment gateways" style breakdown)
        $ordersByStatus = Order::query()
            ->where('created_at', '>=', $thirtyDaysAgo)
            ->selectRaw('status, COUNT(*) as count')
            ->groupBy('status')
            ->pluck('count', 'status')
            ->all();

        // Last 7 days daily revenue (for sparklines / weekly bar)
        $dailyRevenue7d = Order::query()
            ->where('created_at', '>=', $sevenDaysAgo)
            ->whereIn('status', $completedStatuses)
            ->selectRaw('DATE(created_at) as date, COALESCE(SUM(total), 0) as total')
            ->groupBy('date')
            ->orderBy('date')
            ->get()
            ->keyBy('date');

        $weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        $last7Dates = [];
        for ($i = 6; $i >= 0; $i--) {
            $last7Dates[] = $now->copy()->subDays($i)->format('Y-m-d');
        }
        $weeklySalesValues = [];
        $weeklySalesLabels = [];
        foreach ($last7Dates as $d) {
            $weeklySalesValues[] = (float) ($dailyRevenue7d->get($d)?->total ?? 0);
            $weeklySalesLabels[] = $weekDays[Carbon::parse($d)->dayOfWeekIso - 1];
        }

        // Last 7 days revenue total
        $revenue7d = array_sum($weeklySalesValues);

        // Monthly earnings (last 6 months)
        $sixMonthsStart = $now->copy()->subMonths(5)->startOfMonth();
        $monthlyTotalsByKey = Order::query()
            ->where('created_at', '>=', $sixMonthsStart)
            ->whereIn('status', $completedStatuses)
            ->selectRaw("TO_CHAR(created_at, 'YYYY-MM') as month, COALESCE(SUM(total), 0) as total")
            ->groupBy('month')
            ->pluck('total', 'month')
            ->all();

        $monthlyEarnings = [];
        for ($i = 5; $i >= 0; $i--) {
            $key = $now->copy()->subMonths($i)->format('Y-m');
            $monthlyEarnings[] = (float) ($monthlyTotalsByKey[$key] ?? 0);
        }

        // Orders by day of week (Mon–Sun). Postgres EXTRACT(DOW): 0=Sun, 1=Mon, ..., 6=Sat.
        $thisWeekStart = $now->copy()->startOfWeek(); // Monday
        $lastWeekStart = $now->copy()->subWeek()->startOfWeek();
        $ordersThisWeekByDay = Order::query()
            ->where('created_at', '>=', $thisWeekStart)
            ->whereIn('status', $completedStatuses)
            ->selectRaw('EXTRACT(DOW FROM created_at) as dow, COUNT(*) as count')
            ->groupBy('dow')
            ->pluck('count', 'dow')
            ->all();
        $ordersLastWeekByDay = Order::query()
            ->whereBetween('created_at', [$lastWeekStart, $thisWeekStart])
            ->whereIn('status', $completedStatuses)
            ->selectRaw('EXTRACT(DOW FROM created_at) as dow, COUNT(*) as count')
            ->groupBy('dow')
            ->pluck('count', 'dow')
            ->all();
        // Map Postgres DOW (0=Sun..6=Sat) to Mon(0)..Sun(6)
        $dowToIndex = [1 => 0, 2 => 1, 3 => 2, 4 => 3, 5 => 4, 6 => 5, 0 => 6];
        $userActivityThisWeek = array_fill(0, 7, 0);
        $userActivityLastWeek = array_fill(0, 7, 0);
        foreach ($dowToIndex as $dow => $idx) {
            $userActivityThisWeek[$idx] = (int) ($ordersThisWeekByDay[$dow] ?? 0);
            $userActivityLastWeek[$idx] = (int) ($ordersLastWeekByDay[$dow] ?? 0);
        }

        // Customer segmentation: by order count (1 order, 2-3, 4+)
        $segmentCounts = Order::query()
            ->where('created_at', '>=', $thirtyDaysAgo)
            ->whereIn('status', $completedStatuses)
            ->selectRaw('user_id, COUNT(*) as cnt, SUM(total) as rev')
            ->groupBy('user_id')
            ->get();
        $oneOrder = $segmentCounts->where('cnt', 1)->sum('rev');
        $twoThree = $segmentCounts->whereBetween('cnt', [2, 3])->sum('rev');
        $fourPlus = $segmentCounts->where('cnt', '>=', 4)->sum('rev');
        $customerSegmentation = [
            'one_order' => round((float) $oneOrder, 2),
            'two_three_orders' => round((float) $twoThree, 2),
            'four_plus_orders' => round((float) $fourPlus, 2),
        ];
        $customerSegmentationLabels = [
            (string) (int) $oneOrder,
            (string) (int) $twoThree,
            (string) (int) $fourPlus,
        ];

        // Sales by category (last 30d): order_count (integer-like), total_revenue (2 decimals)
        $salesByCategory = OrderItem::query()
            ->join('shop_orders', 'shop_order_items.order_id', '=', 'shop_orders.id')
            ->join('shop_products', 'shop_order_items.product_id', '=', 'shop_products.id')
            ->leftJoin('shop_categories', 'shop_products.category_id', '=', 'shop_categories.id')
            ->where('shop_orders.created_at', '>=', $thirtyDaysAgo)
            ->whereIn('shop_orders.status', $completedStatuses)
            ->selectRaw('
                COALESCE(shop_categories.id, 0) as id,
                COALESCE(shop_categories.name, \'Uncategorized\') as name,
                COUNT(DISTINCT shop_orders.id) as order_count,
                ROUND(COALESCE(SUM(shop_order_items.total_price), 0)::numeric, 2) as total_revenue
            ')
            ->groupBy('shop_categories.id', 'shop_categories.name')
            ->orderByDesc('total_revenue')
            ->get()
            ->map(fn ($row) => [
                'id' => $row->id,
                'name' => $row->name,
                'order_count' => $row->order_count,
                'total_revenue' => (float) $row->total_revenue,
            ])
            ->all();

        // Sales by brand (last 30d): order_count (integer-like), total_revenue (2 decimals)
        $salesByBrand = OrderItem::query()
            ->join('shop_orders', 'shop_order_items.order_id', '=', 'shop_orders.id')
            ->join('shop_products', 'shop_order_items.product_id', '=', 'shop_products.id')
            ->leftJoin('shop_brands', 'shop_products.brand_id', '=', 'shop_brands.id')
            ->where('shop_orders.created_at', '>=', $thirtyDaysAgo)
            ->whereIn('shop_orders.status', $completedStatuses)
            ->selectRaw('
                COALESCE(shop_brands.id, 0) as id,
                COALESCE(shop_brands.name, \'No brand\') as name,
                COUNT(DISTINCT shop_orders.id) as order_count,
                ROUND(COALESCE(SUM(shop_order_items.total_price), 0)::numeric, 2) as total_revenue
            ')
            ->groupBy('shop_brands.id', 'shop_brands.name')
            ->orderByDesc('total_revenue')
            ->get()
            ->map(fn ($row) => [
                'id' => $row->id,
                'name' => $row->name,
                'order_count' => $row->order_count,
                'total_revenue' => (float) $row->total_revenue,
            ])
            ->all();

        // Recent transactions (last 10 orders)
        $recentOrders = Order::query()
            ->with('user:id,name,email')
            ->whereIn('status', $completedStatuses)
            ->orderByDesc('created_at')
            ->limit(10)
            ->get()
            ->map(fn ($o) => [
                'id' => $o->id,
                'order_number' => $o->order_number,
                'total' => (float) $o->total,
                'currency' => $o->currency,
                'status' => $o->status?->value,
                'status_label' => $o->status?->label(),
                'created_at' => $o->created_at?->toIso8601String(),
                'customer_name' => $o->user?->name ?? 'Guest',
            ])
            ->all();

        // Top products by quantity sold (last 30 days)
        $topProducts = OrderItem::query()
            ->join('shop_orders', 'shop_order_items.order_id', '=', 'shop_orders.id')
            ->join('shop_products', 'shop_order_items.product_id', '=', 'shop_products.id')
            ->leftJoin('shop_categories', 'shop_products.category_id', '=', 'shop_categories.id')
            ->where('shop_orders.created_at', '>=', $thirtyDaysAgo)
            ->whereIn('shop_orders.status', $completedStatuses)
            ->select([
                'shop_products.id',
                'shop_products.name',
                'shop_products.slug',
                'shop_categories.name as category_name',
                DB::raw('SUM(shop_order_items.quantity) as total_quantity'),
                DB::raw('SUM(shop_order_items.total_price) as total_revenue'),
            ])
            ->groupBy('shop_products.id', 'shop_products.name', 'shop_products.slug', 'shop_categories.name')
            ->orderByDesc('total_quantity')
            ->limit(8)
            ->get()
            ->map(fn ($p) => [
                'id' => $p->id,
                'name' => $p->name,
                'slug' => $p->slug,
                'category_name' => $p->category_name,
                'total_quantity' => (int) $p->total_quantity,
                'total_revenue' => round((float) $p->total_revenue, 2),
            ])
            ->all();

        // Top products with first image for table
        $topProductIds = array_column($topProducts, 'id');
        $productImages = $topProductIds ? DB::table('shop_product_images')
            ->whereIn('product_id', $topProductIds)
            ->orderBy('sort_order')
            ->get()
            ->groupBy('product_id')
            ->map(fn ($imgs) => $imgs->first())
            ->all() : [];
        $topProductsWithImage = array_map(function ($p) use ($productImages) {
            $img = $productImages[$p['id']] ?? null;
            $path = $img && $img->path ? MediaDisk::url($img->path) : null;

            return [
                'id' => $p['id'],
                'name' => $p['name'],
                'slug' => $p['slug'],
                'category' => $p['category_name'] ?? '—',
                'image_path' => $path,
                'total_quantity' => $p['total_quantity'],
                'total_revenue' => $p['total_revenue'],
                'date' => null,
                'price' => $p['total_quantity'] > 0 ? round($p['total_revenue'] / $p['total_quantity'], 2) : 0,
                'status' => 'In Stock',
            ];
        }, $topProducts);

        // ── New KPIs ───────────────────────────────────────────────────────────
        $productsTotal = Product::query()->where('is_active', true)->count();

        $customersTotal = Order::query()
            ->whereNotNull('user_id')
            ->distinct()
            ->count('user_id');

        // Low-stock: active products where stock_quantity <= low_stock_threshold (default threshold=5 if null)
        $lowStockProducts = Product::query()
            ->where('is_active', true)
            ->whereNotNull('stock_quantity')
            ->whereColumn('stock_quantity', '<=', DB::raw('COALESCE(low_stock_threshold, 5)'))
            ->select(['id', 'name', 'slug', 'stock_quantity', 'low_stock_threshold'])
            ->orderBy('stock_quantity')
            ->limit(10)
            ->get()
            ->map(fn ($p) => [
                'id' => $p->id,
                'name' => $p->name,
                'slug' => $p->slug,
                'stock_quantity' => (int) $p->stock_quantity,
                'low_stock_threshold' => (int) ($p->low_stock_threshold ?? 5),
            ])
            ->all();

        return [
            'today_sales' => round($todayRevenue, 2),
            'today_orders_count' => $todayOrdersCount,
            'today_sales_percent_change' => round($todaySalesPercentChange, 1),
            'overall_performance_percent' => round($overallPerformancePercent, 1),
            'revenue_30d' => round($revenue30d, 2),
            'orders_count_30d' => $ordersCount30d,
            'revenue_7d' => round($revenue7d, 2),
            'revenue_by_status' => $revenueByStatus,
            'orders_by_status' => $ordersByStatus,
            'weekly_sales_values' => $weeklySalesValues,
            'weekly_sales_labels' => $weeklySalesLabels,
            'monthly_earnings' => $monthlyEarnings,
            'user_activity_this_week' => $userActivityThisWeek,
            'user_activity_last_week' => $userActivityLastWeek,
            'customer_segmentation' => $customerSegmentation,
            'customer_segmentation_labels' => $customerSegmentationLabels,
            'sales_by_category' => $salesByCategory,
            'sales_by_brand' => $salesByBrand,
            'recent_orders' => $recentOrders,
            'top_products' => $topProductsWithImage,
            'sales_sparkline_7d' => $weeklySalesValues,
            'quarterly_stats' => [
                'revenue_trend' => $monthlyEarnings,
            ],
            // New KPIs
            'products_total' => $productsTotal,
            'customers_total' => $customersTotal,
            'low_stock_products' => $lowStockProducts,
            // Marketplace Phase 3
            'marketplace' => $this->marketplaceDashboard->marketplaceMetrics(),
        ];
    }
}
