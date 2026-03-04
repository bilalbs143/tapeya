import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TablerIconsModule } from 'angular-tabler-icons';
import { NgApexchartsModule } from 'ng-apexcharts';

import { MaterialModule } from 'src/app/material.module';
import type { EcommerceDashboardStats } from 'src/app/models/ecommerce-dashboard.models';
import { EcommerceDashboardService } from 'src/app/services/shop/ecommerce-dashboard.service';

@Component({
  selector: 'app-ecommerce-dashboard',
  standalone: true,
  imports: [CommonModule, MaterialModule, TablerIconsModule, NgApexchartsModule, RouterLink],
  templateUrl: './ecommerce-dashboard.component.html',
})
export class EcommerceDashboardComponent implements OnInit {
  private readonly dashboardService = inject(EcommerceDashboardService);

  public readonly loading = signal(true);
  public readonly error = signal<string | null>(null);
  public readonly stats = signal<EcommerceDashboardStats | null>(null);

  public readonly todaySales = computed(() => this.stats()?.today_sales ?? 0);
  public readonly todayOrdersCount = computed(() => this.stats()?.today_orders_count ?? 0);
  public readonly todayPercentChange = computed(() => this.stats()?.today_sales_percent_change ?? 0);
  public readonly overallPerformancePercent = computed(() => this.stats()?.overall_performance_percent ?? 0);
  public readonly revenue7d = computed(() => this.stats()?.revenue_7d ?? 0);
  public readonly revenue30d = computed(() => this.stats()?.revenue_30d ?? 0);
  public readonly ordersCount30d = computed(() => this.stats()?.orders_count_30d ?? 0);
  public readonly recentOrders = computed(() => this.stats()?.recent_orders ?? []);
  public readonly topProducts = computed(() => this.stats()?.top_products ?? []);
  public readonly salesByCategory = computed(() => this.stats()?.sales_by_category ?? []);
  public readonly salesByBrand = computed(() => this.stats()?.sales_by_brand ?? []);
  public readonly ordersByStatus = computed(() => this.stats()?.orders_by_status ?? {});
  public readonly weeklySalesValues = computed(() => this.stats()?.weekly_sales_values ?? []);
  public readonly weeklySalesLabels = computed(() => this.stats()?.weekly_sales_labels ?? []);
  public readonly monthlyEarnings = computed(() => this.stats()?.monthly_earnings ?? []);
  public readonly userActivityThisWeek = computed(() => this.stats()?.user_activity_this_week ?? []);
  public readonly userActivityLastWeek = computed(() => this.stats()?.user_activity_last_week ?? []);
  public readonly revenueByStatus = computed(() => this.stats()?.revenue_by_status ?? {});
  public readonly customerSegmentation = computed(() => this.stats()?.customer_segmentation ?? null);
  public readonly customerSegmentationLabels = computed(() => this.stats()?.customer_segmentation_labels ?? []);
  public readonly salesSparkline7d = computed(() => this.stats()?.sales_sparkline_7d ?? []);
  public readonly quarterlyTrend = computed(() => this.stats()?.quarterly_stats?.revenue_trend ?? []);

  public readonly expenseDonutSeries = computed(() => {
    const byStatus = this.revenueByStatus();
    const keys = Object.keys(byStatus);
    if (keys.length === 0) return { series: [100], labels: ['No data'] };
    const series = keys.map((k) => Math.round(byStatus[k]));
    const labels = keys.map((k) => this.statusLabels[k] ?? k);
    return { series, labels };
  });

  public readonly customerDonutSeries = computed(() => {
    const seg = this.customerSegmentation();
    if (!seg) return { series: [1, 1, 1], labels: ['1 order', '2-3 orders', '4+ orders'] };
    return {
      series: [Math.round(seg.one_order), Math.round(seg.two_three_orders), Math.round(seg.four_plus_orders)],
      labels: this.customerSegmentationLabels().length ? this.customerSegmentationLabels() : ['1 order', '2-3', '4+'],
    };
  });

  public readonly statusLabels: Record<string, string> = {
    pending: 'Pending',
    processing: 'Processing',
    dispatched: 'Dispatched',
    delivered: 'Delivered',
    cancelled: 'Cancelled',
  };

  public ngOnInit(): void {
    this.dashboardService.getStats().subscribe({
      next: (res) => {
        this.stats.set(res.data);
        this.loading.set(false);
        this.error.set(null);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err?.message ?? 'Failed to load dashboard stats.');
      },
    });
  }

  public formatCurrency(value: number, currency = 'PKR'): string {
    return `${currency} ${Number(value).toLocaleString('en-PK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  /** Integer count for orders/items (no decimals). */
  public formatCount(value: number): string {
    return Number(value).toLocaleString('en-PK', { maximumFractionDigits: 0 });
  }

  /** Theme payment-gateways style: rotate primary, secondary, success, warning. */
  public getStatColor(index: number): 'primary' | 'secondary' | 'success' | 'warning' {
    const colors: ('primary' | 'secondary' | 'success' | 'warning')[] = ['primary', 'secondary', 'success', 'warning'];
    return colors[index % colors.length];
  }

  public formatDate(iso: string): string {
    try {
      const d = new Date(iso);
      return d.toLocaleTimeString('en-PK', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return iso;
    }
  }

  public getStatusLabel(key: string): string {
    return this.statusLabels[key] ?? key;
  }

  /** Use in template instead of .some((v) => v > 0) — Angular templates don't support arrow functions. */
  public hasPositiveSeries(series: number[]): boolean {
    return series?.some((v) => v > 0) ?? false;
  }

  /** Last value in monthly earnings array, or 0. */
  public lastMonthlyEarning(): number {
    const arr = this.monthlyEarnings();
    return arr.length > 0 ? arr[arr.length - 1] : 0;
  }

  /** Tooltip config for charts (formatter must live in component, not template). */
  public readonly chartTooltipPkr = {
    theme: 'dark' as const,
    y: {
      formatter: (value: number) => 'PKR ' + (value != null ? Number(value).toLocaleString() : ''),
    },
  };
}
