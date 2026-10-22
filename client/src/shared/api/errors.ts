import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';

import { wireFailureSchema } from './envelope';

/** Normalized API errors — features branch on `type`, not raw envelope strings. §7.5 */
export type ApiError =
  | { type: 'validation'; fields: Record<string, string[]>; message: string | undefined }
  | { type: 'unauthorized'; message: string | undefined }
  | { type: 'network'; message: string }
  | { type: 'unknown'; status: number | string | undefined; message: string | undefined };

export function parseApiError(error: unknown): ApiError {
  if (!isFetchBaseQueryError(error)) {
    return { type: 'network', message: 'Could not reach the server. Check your connection.' };
  }

  if (error.status === 'FETCH_ERROR' || error.status === 'TIMEOUT_ERROR') {
    return { type: 'network', message: 'Could not reach the server. Check your connection.' };
  }

  const failure = wireFailureSchema.safeParse(error.data);

  if (failure.success && failure.data.errors) {
    return { type: 'validation', fields: failure.data.errors, message: failure.data.message };
  }

  if (error.status === 401) {
    return { type: 'unauthorized', message: failure.success ? failure.data.message : undefined };
  }

  return {
    type: 'unknown',
    status: typeof error.status === 'number' ? error.status : error.status,
    message: failure.success ? failure.data.message : undefined,
  };
}

export function getApiErrorMessage(error: unknown, fallback: string): string {
  const parsed = parseApiError(error);
  if (parsed.type === 'validation') {
    return Object.values(parsed.fields)[0]?.[0] ?? parsed.message ?? fallback;
  }
  return parsed.message ?? fallback;
}

/** True when the request never reached a usable HTTP response. */
export function isNetworkError(error: unknown): boolean {
  return parseApiError(error).type === 'network';
}

/** Graphic session (and similar) 404 / NOT_FOUND — expected when not configured yet. */
export function isNotFoundError(error: unknown): boolean {
  if (!isFetchBaseQueryError(error)) return false;
  if (error.status === 404) return true;
  const failure = wireFailureSchema.safeParse(error.data);
  return failure.success && failure.data.type === 'NOT_FOUND';
}

/** Owner broadcast show returns 410 after the stream has ended. */
export function isGoneError(error: unknown): boolean {
  return isFetchBaseQueryError(error) && error.status === 410;
}

/** Numeric HTTP status when present (for 403 ownership messaging, etc.). */
export function getHttpStatus(error: unknown): number | undefined {
  if (!isFetchBaseQueryError(error)) return undefined;
  return typeof error.status === 'number' ? error.status : undefined;
}

function isFetchBaseQueryError(error: unknown): error is FetchBaseQueryError {
  return typeof error === 'object' && error !== null && 'status' in error;
}
