import type { FormGroup } from '@angular/forms';
import type { PageEvent } from '@angular/material/paginator';
import type { MatSort } from '@angular/material/sort';
import type { Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

/**
 * Shared list-page Clear / paginate / sort-reset helpers (UX audit §11.1).
 *
 * Intentionally tiny and opt-in: each list page still owns its FormGroup,
 * `loadHttpData`, and filter→API mapping. These helpers only centralize the
 * three copy-pasted sequences that must stay identical everywhere — so one
 * page cannot silently forget `currentPage = 0` on Clear or sort.
 *
 * Do not use for shells that merely forward to a child list.
 */

/** Minimal host surface — page fields mutate in place. */
export type ListPagePagingHost = {
  searchForm: FormGroup;
  currentPage: number;
  pageSize: number;
  loadHttpData: (pageOverride?: number, perPageOverride?: number) => void;
};

/** Default debounce for live list search/filter reloads. */
export const LIST_SEARCH_LIVE_DEBOUNCE_MS = 300;

/**
 * Clear filters to defaults, jump to first page, reload.
 * Always pass a full defaults object (every form control key).
 * Uses `emitEvent: false` so a live `valueChanges` binder does not double-fetch.
 */
export function resetListSearchForm(
  host: Pick<ListPagePagingHost, 'searchForm' | 'currentPage' | 'loadHttpData'>,
  defaultFilters: object
): void {
  host.searchForm.reset({ ...defaultFilters }, { emitEvent: false });
  host.currentPage = 0;
  host.loadHttpData();
}

/**
 * Live-reload the list when any search/filter control changes (debounced).
 * Opt-in per page — add once in `ngOnInit` and keep the Subscription on the page:
 *
 *   this.sub.add(bindListSearchFormLiveReload(this));
 *
 * Pair with a single Clear Search action (no manual Search button). Initial load
 * still belongs in `ngOnInit` via `loadHttpData()`; this binder skips the first
 * emission by not using `startWith`.
 */
export function bindListSearchFormLiveReload(
  host: Pick<ListPagePagingHost, 'searchForm' | 'currentPage' | 'loadHttpData'>,
  options?: { debounceMs?: number }
): Subscription {
  const debounceMs = options?.debounceMs ?? LIST_SEARCH_LIVE_DEBOUNCE_MS;
  return host.searchForm.valueChanges
    .pipe(
      debounceTime(debounceMs),
      distinctUntilChanged((prev, next) => stableFormValueKey(prev) === stableFormValueKey(next))
    )
    .subscribe(() => {
      host.currentPage = 0;
      host.loadHttpData();
    });
}

/** Stable compare key for form values (Dates → ISO date so identical picks don't re-fetch). */
function stableFormValueKey(value: unknown): string {
  return JSON.stringify(value, (_key, v) => {
    if (v instanceof Date && !Number.isNaN(v.getTime())) {
      return v.toISOString();
    }
    return v;
  });
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
 * On column sort change: reset to page 0 and reload — re-subscribing every time the
 * `@ViewChild(MatSort)` re-resolves, not just once.
 *
 * The sortable table on every list page sits behind a loading/empty-state conditional
 * (`@if (isLoading) {...} @else {...}`) and doesn't exist in the DOM on the very first
 * view-init check, so a plain `@ViewChild(MatSort) sort!: MatSort` read once from
 * `ngAfterViewInit` sees `undefined` and never re-checks — sort-header clicks then
 * silently do nothing once the table actually appears. Wire this from a ViewChild
 * SETTER instead, which Angular calls again every time the resolved element changes:
 *
 *   private readonly sortBinder = new SortReloadBinder(this);
 *
 *   @ViewChild(MatSort)
 *   public set sort(value: MatSort | undefined) {
 *     this.sortBinder.bind(value);
 *   }
 *   public get sort(): MatSort | undefined {
 *     return this.sortBinder.current;
 *   }
 *
 *   public ngOnDestroy(): void {
 *     this.sub.unsubscribe();
 *     this.sortBinder.destroy();
 *   }
 */
export class SortReloadBinder {
  private sortSub: Subscription | undefined;
  public current: MatSort | undefined;

  constructor(private readonly host: Pick<ListPagePagingHost, 'currentPage' | 'loadHttpData'>) {}

  public bind(sort: MatSort | null | undefined): void {
    this.current = sort ?? undefined;
    this.sortSub?.unsubscribe();
    this.sortSub = undefined;
    if (!sort) return;
    this.sortSub = sort.sortChange.subscribe(() => {
      this.host.currentPage = 0;
      this.host.loadHttpData();
    });
  }

  /** Call from `ngOnDestroy`. */
  public destroy(): void {
    this.sortSub?.unsubscribe();
  }
}
