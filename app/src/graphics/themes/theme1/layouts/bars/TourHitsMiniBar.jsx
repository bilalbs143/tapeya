/**
 * Tour Hits mini stat strip — tournament logo (or short code fallback), label, and count above the score bar.
 */
import { cn } from '@/lib/utils';

import { CountUpNumber, DISPLAY_FONT, GlowPanel, UI_FONT, useContentFitBarSurface } from '../../primitives';

const BADGE_BASE =
  'flex shrink-0 items-center justify-center rounded-xl border border-[color-mix(in_srgb,var(--accentA)_48%,transparent)] bg-[linear-gradient(145deg,rgba(34,46,82,0.96),rgba(10,15,28,0.98))]';

const BADGE_TEXT_SHADOW = '[text-shadow:0_0_calc(16px*var(--glow))_rgba(120,140,255,0.65)]';

/** @param {unknown} value */
function nonEmptyString(value) {
  return typeof value === 'string' && value.trim() !== '' ? value.trim() : '';
}

function TourShortCodeBadge({ shortCode, compact = false }) {
  if (!shortCode) return null;

  return (
    <div
      className={cn(
        'bc-animate-tour-code-reveal',
        !compact && 'bc-animate-tour-code-glow',
        BADGE_BASE,
        compact ? 'h-9 min-w-[3.25rem] px-2' : 'h-16 min-w-[5rem] px-2.5',
      )}
      aria-label={`Tournament ${shortCode}`}
    >
      <span
        className={cn(
          DISPLAY_FONT,
          'text-center leading-none font-extrabold tracking-[0.12em] text-white uppercase',
          compact ? 'max-w-[4rem] text-[1.125rem]' : 'max-w-[5.5rem] text-[2.125rem]',
          BADGE_TEXT_SHADOW,
        )}
      >
        {shortCode}
      </span>
    </div>
  );
}

function TournamentMark({ logoUrl, shortCode }) {
  if (!logoUrl && !shortCode) return null;

  return (
    <div className="flex shrink-0 flex-col items-center justify-center gap-1.5 pr-1">
      {logoUrl ? (
        <img
          src={logoUrl}
          alt={shortCode || 'Tournament'}
          className="bc-animate-tour-code-reveal h-14 w-auto max-w-[5.5rem] object-contain"
        />
      ) : null}
      {shortCode ? <TourShortCodeBadge shortCode={shortCode} compact={Boolean(logoUrl)} /> : null}
    </div>
  );
}

/**
 * @param {{
 *   mini?: { label?: string, title?: string, logoUrl?: string|null, shortCode?: string, count?: number },
 *   defaultTitle?: string,
 *   edgeToEdge?: boolean,
 * }} props
 */
export function TourHitsMiniBar({ mini, defaultTitle = 'RUNS', edgeToEdge = true }) {
  const { containerRef, innerRef, scale, surfaceWidth, surfaceHeight, radius } = useContentFitBarSurface(edgeToEdge);

  if (!mini) return null;

  const label = mini.label ?? 'TOURNAMENT';
  const title = mini.title ?? defaultTitle;
  const logoUrl = nonEmptyString(mini.logoUrl) || null;
  const shortCode = nonEmptyString(mini.shortCode);

  return (
    <div ref={containerRef} className="mb-4 ml-4 flex w-full justify-start" style={{ height: surfaceHeight || undefined }}>
      <div
        className="max-w-full overflow-hidden"
        style={{ width: surfaceWidth || undefined, height: surfaceHeight || undefined }}
      >
        <div ref={innerRef} className="w-fit origin-top-left" style={{ transform: `scale(${scale})` }}>
          <GlowPanel ambientPulse hideRing radius={radius} className="flex min-h-[5.375rem] w-fit items-center">
            <div className="flex w-fit items-center gap-4 py-4 pr-6 pl-5">
              <TournamentMark logoUrl={logoUrl} shortCode={shortCode} />

              <div className="flex flex-col items-start justify-center gap-0.5 pr-2">
                <span className={cn(UI_FONT, 'text-[1.125rem] leading-[1.1] font-bold tracking-[0.12em] text-[var(--muted)]')}>
                  {label}
                </span>
                <span className={cn(UI_FONT, 'text-[1.875rem] leading-[1.1] font-bold tracking-[0.1em] text-[var(--text)]')}>
                  {title}
                </span>
              </div>

              <div
                className="my-3 w-px shrink-0 self-stretch bg-[linear-gradient(180deg,transparent,rgba(255,255,255,0.22),transparent)]"
                aria-hidden="true"
              />

              <CountUpNumber
                value={mini.count}
                className="shrink-0 pr-1 [font-family:var(--font-display)] text-[2.75rem] leading-[0.92] font-extrabold tracking-[0.02em] text-[var(--score-color)] [text-shadow:0_0_calc(18px*var(--glow))_var(--score-shadow)]"
              />
            </div>
          </GlowPanel>
        </div>
      </div>
    </div>
  );
}
