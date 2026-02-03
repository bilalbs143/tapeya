import { Injectable, OnDestroy } from '@angular/core';

import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class PerformanceMonitorService implements OnDestroy {
  private metrics: Map<string, number> = new Map();
  private observers: PerformanceObserver[] = [];

  constructor() {
    if (environment.ENABLE_PERFORMANCE_MONITORING && 'PerformanceObserver' in window) {
      this.initializePerformanceMonitoring();
    }
  }

  private initializePerformanceMonitoring(): void {
    // Monitor navigation timing
    if ('PerformanceNavigationTiming' in window) {
      const navigationObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          this.recordMetric('navigation', entry.loadEventEnd - entry.loadEventStart);
        });
      });
      navigationObserver.observe({ entryTypes: ['navigation'] });
      this.observers.push(navigationObserver);
    }

    // Monitor paint timing
    if ('PerformancePaintTiming' in window) {
      const paintObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          this.recordMetric('paint', entry.startTime);
        });
      });
      paintObserver.observe({ entryTypes: ['paint'] });
      this.observers.push(paintObserver);
    }

    // Monitor resource loading
    if ('PerformanceResourceTiming' in window) {
      const resourceObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          this.recordMetric('resource', entry.duration);
        });
      });
      resourceObserver.observe({ entryTypes: ['resource'] });
      this.observers.push(resourceObserver);
    }
  }

  private recordMetric(type: string, value: number): void {
    const key = `${type}_${Date.now()}`;
    this.metrics.set(key, value);

    // Keep only last 100 metrics to prevent memory leaks
    if (this.metrics.size > 100) {
      const firstKey = this.metrics.keys().next().value;
      if (typeof firstKey === 'string') {
        this.metrics.delete(firstKey);
      }
    }
  }

  public getPerformanceMetrics(): any {
    const metrics = Array.from(this.metrics.entries());
    const summary: any = {};

    metrics.forEach(([key, value]) => {
      const type = key.split('_')[0];
      if (!summary[type]) {
        summary[type] = [];
      }
      summary[type].push(value);
    });

    // Calculate averages
    Object.keys(summary).forEach((type) => {
      const values = summary[type];
      const avg = values.reduce((a: number, b: number) => a + b, 0) / values.length;
      summary[`${type}_average`] = Math.round(avg * 100) / 100;
    });

    return summary;
  }

  public measureOperation(operationName: string, operation: () => void): void {
    const start = performance.now();
    operation();
    const end = performance.now();
    this.recordMetric(operationName, end - start);
  }

  public async measureAsyncOperation<T>(operationName: string, operation: () => Promise<T>): Promise<T> {
    const start = performance.now();
    try {
      const result = await operation();
      const end = performance.now();
      this.recordMetric(operationName, end - start);
      return result;
    } catch (error) {
      const end = performance.now();
      this.recordMetric(`${operationName}_error`, end - start);
      throw error;
    }
  }

  public ngOnDestroy(): void {
    this.observers.forEach((observer) => observer.disconnect());
  }
}
