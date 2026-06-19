/** Shared formatters and Tailwind font-family token utilities. */

export const DISPLAY_FONT = '[font-family:var(--font-display)]';
export const UI_FONT = '[font-family:var(--font-ui)]';
export const MONO_FONT = '[font-family:var(--font-mono)]';

/** Row stagger animation — defined in theme-01/styles/controller.scss */
export const ROW_ANIMATE_IN = 'bc-animate-row-in';

function formatStrikeRate(runs, balls) {
  return balls ? ((runs / balls) * 100).toFixed(1) : '0.0';
}

export const fmt = {
  sr: formatStrikeRate,
  /** Strike rate for display — shows em dash when no balls faced. */
  strikeRate(runs, balls, provided) {
    if (provided != null && provided !== '') return String(provided);
    return balls > 0 ? formatStrikeRate(runs, balls) : '—';
  },
  econ: (r, o) => (o ? (r / o).toFixed(2) : '0.00'),
  bowlFig: (b) => `${b.o}-${b.m}-${b.r}-${b.w}`,
};
