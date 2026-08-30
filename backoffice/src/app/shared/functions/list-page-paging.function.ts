import type { FormGroup } from '@angular/forms';
import type { PageEvent } from '@angular/material/paginator';
import type { MatSort } from '@angular/material/sort';
import type { Subscription } from 'rxjs';

/**
 * Shared list-page Clear / paginate / sort-reset helpers (UX audit §11.1).
 *
 * Intentionally tiny and opt-in: each list page still owns its FormGroup,
 * `loadHttpData`, and filter→API mapping. These helpers only centralize the
 * three copy-pasted sequences that must stay identical everywhere — so one
 * page cannot silently forget `currentPage = 0` on Clear or sort.
 *
 * Do not use for client-side-only tables (e.g. tournament-matches) or shells
 * that merely forward to a child list.
 */

/** Minimal host surface — page fields mutate in place. */
export type ListPagePagingHost = {
  searchForm: FormGroup;
  currentPage: number;
  pageSize: number;
  loadHttpData: (pageOverride?: number, perPageOverride?: number) => void;
};

/**
 * Clear filters to defaults, jump to first page, reload.
 * Always pass a full defaults object (every form control key).
 */
export function resetListSearchForm(
  host: Pick<ListPagePagingHost, 'searchForm' | 'currentPage' | 'loadHttpData'>,
  defaultFilters: object
): void {
  host.searchForm.reset({ ...defaultFilters });
  host.currentPage = 0;
  host.loadHttpData();
}

/** Sync Material paginator → host page state, then reload when either changes. */
export function onListPaginationChange(
  host: Pick<ListPagePagingHost, 'currentPage' | 'pageSize' | 'loadHttpData'>,
  event: PageEvent
): void {
  const { pageIndex, pageSize } = event;
  if (host.currentPage !== pageIndex || host.pageSize !== pageSize) {
    host.currentPage = pageIndex;
    host.pageSize = pageSize;
    host.loadHttpData();
  }
}

/**
 * On column sort change: reset to page 0 and reload.
 * Call from `ngAfterViewInit` after `@ViewChild(MatSort)` is available.
 */
export function bindListSortToReload(
  sub: Subscription,
  sort: MatSort | null | undefined,
  host: Pick<ListPagePagingHost, 'currentPage' | 'loadHttpData'>
): void {
  if (!sort) return;
  sub.add(
    sort.sortChange.subscribe(() => {
      host.currentPage = 0;
      host.loadHttpData();
    })
  );
}
