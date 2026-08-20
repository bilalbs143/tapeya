/**
 * @file Loader.jsx
 * @description App-wide loading spinner — the single source of truth for "is something loading" UI.
 * Replaces every hand-copied `animate-spin` ring div and bare "Loading…" text across the app.
 * Never render visible "Loading…" captions — the ring is the only indicator; `label` is
 * screen-reader-only text carried via `role="status"/aria-label`. Exception: a small number of
 * purpose-built overlays (`StreamVideoLoading`, upload's busy-check step) show a real caption
 * because they're communicating a specific wait (e.g. "Connecting to the video…", ~30-40s) rather
 * than a generic list/section load — that's a deliberate product choice, not a Loader pattern.
 *
 * Size convention: **md everywhere** (page, section, overlay). Only buttons / compact controls
 * use `size="xs"` so the ring fits the control.
 *
 * <Loader />                        — bare decorative ring (default md)
 * <Loader size="xs" tone="light" /> — inline ring inside a button/control
 * <LoaderBlock label="Loading X" /> — centered section/dialog/tab body loader (md)
 * <PageLoader label="Loading X" />  — full-page/route loads (md, py-16)
 * <FullScreenLoader label="X" />    — route/auth gates (md, min-h-screen bg-black)
 */

const SIZE = {
  xs: { ring: 'h-4 w-4', border: 'border-2' },
  sm: { ring: 'h-6 w-6', border: 'border-2' },
  md: { ring: 'h-8 w-8', border: 'border-[3px]' },
  lg: { ring: 'h-11 w-11', border: 'border-[3px]' },
};

// 'gold' — the default, for dark/surface backgrounds. 'ink' — for spinners sitting on a
// solid brand-gold fill (e.g. inside a `bg-brand text-ink` button), where the gold glow
// would disappear into its own background. 'light' — plain white, for the rare spot that
// sits inside an already-monochrome white/red control cluster where brand gold would clash.
const TONE = {
  gold: 'border-white/10 border-t-brand border-r-brand-hover/60 shadow-[0_0_14px_-2px_rgba(218,152,17,0.5)]',
  ink: 'border-ink/25 border-t-ink',
  light: 'border-white/30 border-t-white',
};

/** Decorative by default (aria-hidden) — pass `label` only when nothing else on the page
 * already announces the loading state; otherwise it's a redundant screen-reader message. */
export function Loader({ size = 'md', tone = 'gold', label = null, className = '' }) {
  const { ring, border } = SIZE[size] ?? SIZE.md;
  const a11yProps = label ? { role: 'status', 'aria-label': label } : { 'aria-hidden': true };
  return (
    <span
      {...a11yProps}
      className={`animate-loader-spin inline-block shrink-0 rounded-full ${TONE[tone] ?? TONE.gold} ${ring} ${border} ${className}`}
    />
  );
}

/** Centers a `Loader` and carries the a11y announcement on the wrapper — the standard
 * shape for a section/dialog/tab body loading state. `className` is spacing only
 * (the centering flex classes are already built in). */
export function LoaderBlock({ label = 'Loading', size = 'md', tone = 'gold', className = 'py-6' }) {
  return (
    <div className={`flex items-center justify-center ${className}`} role="status" aria-label={label}>
      <Loader size={size} tone={tone} />
    </div>
  );
}

export function PageLoader({ label = 'Loading', size = 'md', tone = 'gold', className = 'py-16' }) {
  return <LoaderBlock label={label} size={size} tone={tone} className={className} />;
}

/** `PageLoader` preset for full-viewport gates (lazy route fallback, auth/access checks) — same
 * `min-h-screen bg-black` shell every gate needs, so it isn't hand-rolled at each call site. */
export function FullScreenLoader({ label = 'Loading', className = '' }) {
  return <PageLoader label={label} className={`min-h-screen bg-black ${className}`.trim()} />;
}
