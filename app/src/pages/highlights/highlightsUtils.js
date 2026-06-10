/**
 * Pure utility helpers for the Highlights module.
 * No static data imports — all data comes from the API.
 */

/**
 * @param {string|number|null|undefined} id
 * @returns {boolean}
 */
export function isValidHighlightId(id) {
  const numericId = Number(id);
  return Number.isInteger(numericId) && numericId > 0;
}

/**
 * Return up to `limit` highlights from the list, excluding the one currently shown.
 *
 * @param {Array<{ id: number }>} highlights
 * @param {number|null|undefined} currentId
 * @param {number} [limit=5]
 * @returns {typeof highlights}
 */
export function getMoreHighlights(highlights, currentId, limit = 5) {
  return highlights.filter((h) => h.id !== Number(currentId)).slice(0, limit);
}

/**
 * Format a duration value into a display label, e.g. "20 min".
 * Accepts a string ("20", "20 min") or a number (20).
 * Appends " min" when the value is purely numeric.
 * Returns an empty string for null/undefined/empty input.
 *
 * @param {string|number|null|undefined} raw
 * @returns {string}
 */
export function formatHighlightDuration(raw) {
  if (raw == null || raw === '') return '';
  const str = String(raw).trim();
  if (!str) return '';
  return /^\d+$/.test(str) ? `${str} min` : str;
}

/**
 * Display title for cards and detail views.
 *
 * @param {{ title?: string, detailTitle?: string }|null|undefined} highlight
 * @returns {string}
 */
export function getHighlightTitle(highlight) {
  return highlight?.detailTitle ?? highlight?.title ?? 'Highlight';
}

/**
 * Format a highlight date for display: "October 18, 2026".
 *
 * @param {string|Date|null|undefined} value
 * @returns {string}
 */
export function formatHighlightDate(value) {
  if (value == null || value === '') return '';
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

/**
 * Client-side title search filter.
 *
 * @param {Array<{ title?: string }>} highlights
 * @param {string} query
 * @returns {typeof highlights}
 */
export function filterHighlights(highlights, query) {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return highlights;
  return highlights.filter(({ title }) => (title ?? '').toLowerCase().includes(normalized));
}

/**
 * Sort a copy of the array by created_at descending (newest first).
 *
 * @param {Array<{ publishedAt?: string }>} highlights
 * @returns {typeof highlights}
 */
export function sortHighlightsByRecent(highlights) {
  return [...highlights].sort((a, b) => {
    const aTime = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
    const bTime = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
    return bTime - aTime;
  });
}

/**
 * Sort a copy of the array by views_count descending (most viewed first).
 *
 * @param {Array<{ viewsCount?: number }>} highlights
 * @returns {typeof highlights}
 */
export function sortHighlightsByViews(highlights) {
  return [...highlights].sort((a, b) => (b.viewsCount ?? 0) - (a.viewsCount ?? 0));
}
