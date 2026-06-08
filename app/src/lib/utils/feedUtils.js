/**
 * Feed-specific date formatting helpers.
 */

/**
 * Format ISO date string to "Feb 11, 2026 • 12:15 AM"
 *
 * @param {string|null|undefined} isoString
 * @returns {string}
 */
export function formatPostTimestamp(isoString) {
  if (!isoString) return '';
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return '';
  const datePart = date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  const timePart = date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
  return `${datePart} • ${timePart}`;
}
