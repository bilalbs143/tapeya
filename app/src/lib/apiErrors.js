/**
 * Normalize API error message from RTK Query / fetchBaseQuery error shape.
 * Backend returns { message?, type?, errors? } on 4xx/5xx.
 *
 * @param {unknown} error - RTK Query mutation/query error
 * @param {string} [fallback] - Fallback message when nothing can be extracted
 * @returns {string}
 */
export function getApiErrorMessage(error, fallback = 'Something went wrong. Please try again.') {
  if (error == null) return fallback;
  const data = error?.data;
  if (data?.message && typeof data.message === 'string') return data.message;
  if (error?.error && typeof error.error === 'string') return error.error;
  if (typeof error?.message === 'string') return error.message;
  return fallback;
}
