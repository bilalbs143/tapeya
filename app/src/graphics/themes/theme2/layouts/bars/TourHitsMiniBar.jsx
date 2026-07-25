/**
 * Tour Hits mini stat strip — tournament logo (or short code fallback), label, and count above the score bar.
 */
import { cn } from '@/lib/utils';

import { accentMix, CountUpNumber, DISPLAY_FONT, GlowPanel, UI_FONT, useContentFitBarSurface } from '../../primitives';
import { isTourCodeBadgeGlowEnabled, textGlowClass } from '../../visualEffects';

const BADGE_BASE =
  'flex shrink-0 items-center justify-center rounded-xl border bg-[linear-gradient(145deg,rgba(34,46,82,0.96),rgba(10,15,28,0.98))]';

/** @param {unknown} value */
function nonEmptyString(value) {
  return typeof value === 'string' && value.trim() !== '' ? value.trim() : '';
}

function TourShortCodeBadge({ shortCode }) {
  if (!shortCode) return null;

  return (
    <div
      className={cn(
        'bc-animate-tour-code-reveal',
        isTourCodeBadgeGlowEnabled() && 'bc-animate-tour-code-glow',
        BADGE_BASE,
        'h-16 min-w-[5rem] px-2.5',
      )}
      style={{ borderColor: accentMix('var(--accentA)', 48) }}
      aria-label={`Tournament ${shortCode}`}
    >
      <span
        className={cn(
          DISPLAY_FONT,
          'max-w-[5.5rem] text-center text-[2.125rem] leading-none font-extrabold tracking-[0.12em] text-[var(--text)] uppercase',
          textGlowClass('badge'),
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
    <div className="flex shrink-0 items-center justify-center pr-1">
      {logoUrl ? (
        <img
          src={logoUrl}
          alt={shortCode || 'Tournament'}
          className="bc-animate-tour-code-reveal h-14 w-auto max-w-[5.5rem] object-contain"
        />
      ) : (
        <TourShortCodeBadge shortCode={shortCode} />
      )}
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
    <div ref={containerRef} className="mb-4 flex w-full justify-start" style={{ height: surfaceHeight || undefined }}>
      <div
        className="max-w-full overflow-hidden"
        style={{ width: surfaceWidth || undefined, height: surfaceHeight || undefined }}
      >
        <div ref={innerRef} className="w-fit origin-top-left" style={{ transform: `scale(${scale})` }}>
          <GlowPanel hideRing radius={radius} className="flex min-h-[5.375rem] w-fit items-center">
            <div className="flex w-fit items-center gap-4 py-4 pr-6 pl-5">
              <TournamentMark logoUrl={logoUrl} shortCode={shortCode} />

              <div className="flex flex-col items-start justify-center gap-0.5 pr-2">
                <span className={cn(UI_FONT, 'text-[1.125rem] leading-[1.1] font-bold tracking-[0.12em] text-[var(--text)]')}>
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
                delay={150}
                className={cn(
                  DISPLAY_FONT,
                  'shrink-0 pr-1 text-[2.75rem] leading-[0.92] font-extrabold tracking-[0.02em] text-[var(--score-color)] tabular-nums',
                  textGlowClass('score'),
                )}
              />
            </div>
          </GlowPanel>
        </div>
      </div>
    </div>
  );
}
