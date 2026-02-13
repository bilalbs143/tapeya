/**
 * Helpers to build list request params (pagination, sort, filters) in a composable way.
 * Use with any list API that accepts page, per_page, sort, and filter[] query params.
 */

/** MatSort-like shape (active column + direction). Use for MatSort or similar. */
export interface SortLike {
  active: string;
  direction?: 'asc' | 'desc' | '';
}

/** Base list params: pagination + sort. API page is 1-based. */
export interface BaseListParams {
  page: number;
  per_page: number;
  sort: string;
}

/** Options for search filter (e.g. filter[search]). */
export interface SearchFilterOptions {
  search?: string;
}

/** Options for created-at range filter. */
export interface CreatedFilterOptions {
  created_after?: string; // e.g. YYYY-MM-DD
  created_before?: string;
}

/** Options for name and phone filters. */
export interface NamePhoneFilterOptions {
  name?: string;
  phone?: string;
}

/** Options for status filter. */
export interface StatusFilterOptions {
  status?: string;
}

/** Full list params with optional filters (extend as needed per feature). */
export type ListParams = BaseListParams &
  Partial<Record<'filter[search]', string>> &
  Partial<Record<'filter[name]', string>> &
  Partial<Record<'filter[phone]', string>> &
  Partial<Record<'filter[created_after]', string>> &
  Partial<Record<'filter[created_before]', string>> &
  Partial<Record<'filter[status]', string>>;

const DEFAULT_SORT = '-created_at';

/**
 * Build base list params from page index (0-based), page size, and sort.
 * Use when building request params for list endpoints.
 */
export function baseListParams(pageIndex: number, pageSize: number, sort: SortLike | null | undefined): BaseListParams {
  const dir = sort?.direction;
  const sortParam = sort?.active ? `${dir === 'asc' ? '' : '-'}${sort.active}` : DEFAULT_SORT;
  return {
    page: pageIndex + 1,
    per_page: pageSize,
    sort: sortParam,
  };
}

/**
 * Add search filter to params. Only adds filter[search] when search is non-empty.
 */
export function addSearchFilter<T extends BaseListParams>(
  params: T,
  search: string
): T & Partial<Record<'filter[search]', string>> {
  const value = typeof search === 'string' ? search.trim() : '';
  if (!value) return params as T & Partial<Record<'filter[search]', string>>;
  return { ...params, 'filter[search]': value } as T & Record<'filter[search]', string>;
}

/**
 * Add name filter. Only adds filter[name] when value is non-empty.
 */
export function addNameFilter<T extends BaseListParams>(
  params: T,
  name: string
): T & Partial<Record<'filter[name]', string>> {
  const value = typeof name === 'string' ? name.trim() : '';
  if (!value) return params as T & Partial<Record<'filter[name]', string>>;
  return { ...params, 'filter[name]': value } as T & Record<'filter[name]', string>;
}

/**
 * Add phone filter. Only adds filter[phone] when value is non-empty.
 */
export function addPhoneFilter<T extends BaseListParams>(
  params: T,
  phone: string
): T & Partial<Record<'filter[phone]', string>> {
  const value = typeof phone === 'string' ? phone.trim() : '';
  if (!value) return params as T & Partial<Record<'filter[phone]', string>>;
  return { ...params, 'filter[phone]': value } as T & Record<'filter[phone]', string>;
}

/**
 * Add status filter. Only adds filter[status] when value is non-empty.
 */
export function addStatusFilter<T extends BaseListParams>(
  params: T,
  status: string
): T & Partial<Record<'filter[status]', string>> {
  const value = typeof status === 'string' ? status.trim() : '';
  if (!value) return params as T & Partial<Record<'filter[status]', string>>;
  return { ...params, 'filter[status]': value } as T & Record<'filter[status]', string>;
}

/**
 * Add created-at range filter. Only adds keys when values are present.
 */
export function addCreatedFilter<T extends BaseListParams>(
  params: T,
  options: CreatedFilterOptions
): T & Partial<Record<'filter[created_after]' | 'filter[created_before]', string>> {
  const next = { ...params } as T & Partial<Record<'filter[created_after]' | 'filter[created_before]', string>>;
  const o = next as unknown as Record<string, string>;
  if (options.created_after?.trim()) o['filter[created_after]'] = options.created_after.trim();
  if (options.created_before?.trim()) o['filter[created_before]'] = options.created_before.trim();
  return next;
}

/** Filter options for list params: search, name, phone, status, date range. */
export type ListFilterOptions = SearchFilterOptions &
  NamePhoneFilterOptions &
  StatusFilterOptions &
  CreatedFilterOptions;

/**
 * Compose list params: base + optional search, name, phone, created. Omit filters you don't need.
 */
export function buildListParams(
  pageIndex: number,
  pageSize: number,
  sort: SortLike | null | undefined,
  filters: ListFilterOptions = {}
): ListParams {
  let params = baseListParams(pageIndex, pageSize, sort);
  if (filters.search != null) params = addSearchFilter(params, filters.search);
  if (filters.name != null) params = addNameFilter(params, filters.name);
  if (filters.phone != null) params = addPhoneFilter(params, filters.phone);
  if (filters.status != null) params = addStatusFilter(params, filters.status);
  params = addCreatedFilter(params, {
    created_after: filters.created_after,
    created_before: filters.created_before,
  });
  return params as ListParams;
}
