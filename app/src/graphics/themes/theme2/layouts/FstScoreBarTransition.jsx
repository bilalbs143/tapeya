/**
 * Theme2 full-screen transition — flash only (no default scorebar / LT).
 *
 * Taking FST replaces whatever graphic is on air. The action overlay is the
 * entire graphic; there is no LowerThirdBar / Default LT connection.
 *
 * @param {{
 *   Flash: import('react').ComponentType<{ compact?: boolean, fixed?: boolean }>,
 *   event?: { kind?: string } | null,
 * }} props
 */
export function FstScoreBarTransition({ Flash, event = null }) {
  if (!event) return null;

  return <Flash compact={false} fixed />;
}
