import { HttpParams } from '@angular/common/http';

/**
 * Build HttpParams from a plain object. Skips undefined and empty string values.
 * Use for GET query params (e.g. list filters, pagination, sort).
 */
function stringifyParamValue(value: unknown): string | null {
  if (value === undefined || value === '') return null;
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  return null;
}

export function toHttpParams(params: Record<string, unknown>): HttpParams {
  let httpParams = new HttpParams();
  Object.entries(params).forEach(([key, value]) => {
    const str = stringifyParamValue(value);
    if (str !== null) {
      httpParams = httpParams.set(key, str);
    }
  });
  return httpParams;
}
