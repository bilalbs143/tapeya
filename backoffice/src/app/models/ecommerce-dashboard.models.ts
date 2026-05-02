/** Ecommerce dashboard stats from API v1/admin/shop/dashboard-stats */

export interface EcommerceDashboardStats {
  today_sales: number;
  today_orders_count: number;
  today_sales_percent_change: number;
  overall_performance_percent: number;
  revenue_30d: number;
  orders_count_30d: number;
  revenue_7d: number;
  revenue_by_status: Record<string, number>;
  orders_by_status: Record<string, number>;
  weekly_sales_values: number[];
  weekly_sales_labels: string[];
  monthly_earnings: number[];
  user_activity_this_week: number[];
  user_activity_last_week: number[];
  customer_segmentation: {
    one_order: number;
    two_three_orders: number;
    four_plus_orders: number;
  };
  customer_segmentation_labels: string[];
  sales_by_category: SalesByCategoryItem[];
  sales_by_brand: SalesByBrandItem[];
  recent_orders: RecentOrderItem[];
  top_products: TopProductItem[];
  sales_sparkline_7d: number[];
  quarterly_stats: { revenue_trend: number[] };
  // New KPIs
  products_total: number;
  customers_total: number;
  low_stock_products: LowStockProductItem[];
}

export interface SalesByCategoryItem {
  id: number;
  name: string;
  order_count: number;
  total_revenue: number;
}

export interface SalesByBrandItem {
  id: number;
  name: string;
  order_count: number;
  total_revenue: number;
}

export interface RecentOrderItem {
  id: number;
  order_number: string;
  total: number;
  currency: string;
  status: string;
  status_label: string;
  created_at: string;
  customer_name: string;
}

export interface TopProductItem {
  id: number;
  name: string;
  slug: string;
  category: string | null;
  image_path: string | null;
  total_quantity: number;
  total_revenue: number;
  date: string | null;
  price: number;
  status: string;
}

export interface LowStockProductItem {
  id: number;
  name: string;
  slug: string;
  stock_quantity: number;
  low_stock_threshold: number;
}

export interface EcommerceDashboardResponse {
  data: EcommerceDashboardStats;
}
