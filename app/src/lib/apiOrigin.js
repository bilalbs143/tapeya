/** Shared API base URL helpers for consumer app and graphics build. */

export const baseUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api/v1';

/** Origin of the Laravel app (no `/api/v1`), for Reverb and `/broadcasting/auth`. */
export function getApiOrigin() {
  try {
    return new URL(baseUrl).origin;
  } catch {
    return '';
  }
}
