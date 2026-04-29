import { InjectionToken } from '@angular/core';

/**
 * Shared pagination: {@link PAGINATOR_CONFIG} / {@link defaultPaginatorConfig} for tables,
 * {@link maxPaginatorPageSize} for bulk fetches, and named `*_PER_PAGE` exports for layout/dashboard.
 */

export interface PaginatorConfig {
  pageSize: number;
  pageSizeOptions: number[];
  showFirstLastButtons: boolean;
}

export const defaultPaginatorConfig: PaginatorConfig = {
  pageSize: 50,
  pageSizeOptions: [50, 100, 500, 1000],
  showFirstLastButtons: true,
};

/** Largest `per_page` from the given config (bulk dropdowns, “load all” fetches). */
export function maxPaginatorPageSize(config: Pick<PaginatorConfig, 'pageSizeOptions'>): number {
  return Math.max(...config.pageSizeOptions);
}

/** Layout header: recent notifications in the popover (not the notifications table). */
export const HEADER_NOTIFICATION_PREVIEW_PER_PAGE = 5;

/** Broadcaster dashboard: `per_page` when only `meta.total` is needed per schedule phase. */
export const BROADCASTER_DASHBOARD_PHASE_COUNT_PER_PAGE = 1;

/** Broadcaster dashboard: tournament rows fetched for the match-status mix sample. */
export const BROADCASTER_DASHBOARD_MATCH_MIX_TOURNAMENTS_PER_PAGE = 12;

/** Broadcaster dashboard: tournament rows for live/upcoming strips. */
export const BROADCASTER_DASHBOARD_SCHEDULE_LIST_PER_PAGE = 8;

export const PAGINATOR_CONFIG = new InjectionToken<PaginatorConfig>('PAGINATOR_CONFIG', {
  providedIn: 'root',
  factory: () => defaultPaginatorConfig,
});
