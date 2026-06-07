import { HttpParams } from '@angular/common/http';

/**
 * Optional handling for plain `search` query keys (typeahead / `GET …/search` style).
 * When `search` is present on this object, the value is trimmed; non-empty values are sent, blank values omit `search` (including removing a whitespace-only `search` from `params`).
 */
export type ToHttpParamsOptions = {
  search?: string | null;
};

/**
 * Build HttpParams from a plain object. Skips undefined and empty string values.
 * Use for GET query params (e.g. list filters, pagination, sort).
 *
 * For endpoints that use a top-level `search` param (not `filter[search]`), pass
 * `{ search }` as the second argument so trimming and omission match list-filter helpers.
 */
function stringifyParamValue(value: unknown): string | null {
  if (value === undefined || value === '') return null;
  if (typeof value === 'string') return value;
  // Laravel `boolean` rule accepts 1/0 but not string "true"/"false" in query strings.
  if (typeof value === 'boolean') return value ? '1' : '0';
  if (typeof value === 'number') return String(value);
  return null;
}

export function toHttpParams(params: Record<string, unknown>, options?: ToHttpParamsOptions): HttpParams {
  let record: Record<string, unknown> = { ...params };
  if (options !== undefined && 'search' in options) {
    const trimmed = typeof options.search === 'string' ? options.search.trim() : '';
    if (trimmed) {
      record = { ...record, search: trimmed };
    } else {
      const rest = { ...record };
      delete rest['search'];
      record = rest;
    }
  }

  let httpParams = new HttpParams();
  Object.entries(record).forEach(([key, value]) => {
    const str = stringifyParamValue(value);
    if (str !== null) {
      httpParams = httpParams.set(key, str);
    }
  });
  return httpParams;
}
