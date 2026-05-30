import { HIGHLIGHTS } from '@/pages/highlights/highlightsData';

/**
 * @param {string|number|null|undefined} id
 * @returns {boolean}
 */
export function isValidHighlightId(id) {
  const numericId = Number(id);
  return Number.isInteger(numericId) && numericId > 0;
}

/**
 * @param {string|number|null|undefined} id
 * @returns {(typeof HIGHLIGHTS)[number]|null}
 */
export function getHighlightById(id) {
  if (!isValidHighlightId(id)) return null;
  return HIGHLIGHTS.find((highlight) => highlight.id === Number(id)) ?? null;
}

/**
 * @param {number|null|undefined} currentId
 * @param {number} [limit=5]
 * @returns {typeof HIGHLIGHTS}
 */
export function getMoreHighlights(currentId, limit = 5) {
  return HIGHLIGHTS.filter((highlight) => highlight.id !== currentId).slice(0, limit);
}

/**
 * @param {number|null|undefined} minutes
 * @returns {string}
 */
export function formatHighlightDuration(minutes) {
  const value = Number(minutes);
  if (!Number.isFinite(value) || value < 1) return '';
  return `${value} min`;
}

/**
 * Display title for cards and detail views.
 * @param {{ title?: string, detailTitle?: string }|null|undefined} highlight
 * @returns {string}
 */
export function getHighlightTitle(highlight) {
  return highlight?.detailTitle ?? highlight?.title ?? 'Highlight';
}

/**
 * Format highlight date for list cards: "October 18, 2026".
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
 * @param {Array<{ viewsCount?: number }>} highlights
 * @returns {typeof highlights}
 */
export function sortHighlightsByViews(highlights) {
  return [...highlights].sort((a, b) => (b.viewsCount ?? 0) - (a.viewsCount ?? 0));
}
