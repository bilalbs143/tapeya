/**
 * On-air LIVE FROM venue line — single presentation formatter for tapeya theme.
 *
 * Processors pass raw `venue` and optional `venueDisplayLine` from API context.
 * Preserves API casing; only normalises the LIVE FROM prefix when missing.
 *
 * @param {Record<string, unknown>} props
 */
export function formatLiveFromVenueLine(props) {
  const displayLine = String(props.venueDisplayLine ?? props.venue_display_line ?? '').trim();
  if (displayLine) {
    return /^live from/i.test(displayLine) ? displayLine : `LIVE FROM ${displayLine}`;
  }

  const raw = String(props.venue ?? props.venue_name ?? '').trim();
  if (!raw) return null;
  return `LIVE FROM ${raw}`;
}
