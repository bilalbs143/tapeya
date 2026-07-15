/**
 * Mini ScoreCard lower-third — compact content-width strip with team/overs and score.
 *
 * Layout: [team code · overs] [score] — content-width, left-aligned.
 */
import { cn } from '@/lib/utils';

import { AnimatedNumber, DISPLAY_FONT, GlowPanel, UI_FONT, useContentFitBarSurface } from '../../primitives';

/**
 * @param {{
 *   miniScoreCard: {
 *     teamCode?: string,
 *     teamLabel?: string,
 *     oversText?: string,
 *     total?: number,
 *     wkts?: number,
 *     scoreSep?: string,
 *   },
 *   teams: Record<string, { code?: string, name?: string }>,
 *   edgeToEdge?: boolean,
 * }} props
 */
export function MiniScoreCardLTBar({ miniScoreCard, teams, edgeToEdge = true }) {
  const team = miniScoreCard?.teamCode ? teams[miniScoreCard.teamCode] : null;
  const { containerRef, innerRef, scale, surfaceWidth, surfaceHeight, radius } = useContentFitBarSurface(edgeToEdge);

  if (!team || !miniScoreCard) return null;

  const teamLabel = miniScoreCard.teamLabel ?? team.code ?? team.name ?? '';
  const oversText = miniScoreCard.oversText ?? '';
  const scoreSep = miniScoreCard.scoreSep ?? '-';

  return (
    <div ref={containerRef} className="flex w-full justify-start" style={{ height: surfaceHeight || undefined }}>
      <div
        className="max-w-full overflow-hidden"
        style={{ width: surfaceWidth || undefined, height: surfaceHeight || undefined }}
      >
        <div ref={innerRef} className="w-fit origin-top-left" style={{ transform: `scale(${scale})` }}>
          <GlowPanel hideRing radius={radius} className="flex min-h-[5.375rem] w-fit items-center">
            <div className="flex w-fit items-center gap-4 px-10 py-5">
              <div className="flex shrink-0 flex-col items-start justify-center gap-1 pr-[1.125rem]">
                <span
                  className={cn(
                    'text-[2rem] leading-[1.1] font-bold tracking-[0.1em] whitespace-nowrap text-[var(--text)] uppercase',
                    UI_FONT,
                  )}
                >
                  {teamLabel}
                </span>
                {oversText ? (
                  <span
                    className={cn(
                      'text-[1.75rem] leading-none font-bold tracking-[0.04em] whitespace-nowrap text-[var(--text)] uppercase',
                      DISPLAY_FONT,
                    )}
                  >
                    {oversText}
                  </span>
                ) : null}
              </div>
              <div className="flex shrink-0 items-baseline gap-[2px]">
                <AnimatedNumber
                  value={miniScoreCard.total ?? 0}
                  className={cn('text-[2.75rem] leading-[0.92] font-extrabold text-[var(--score-color)]', DISPLAY_FONT)}
                />
                <span className={cn('text-[2.25rem] leading-[0.92] font-extrabold text-[var(--text-secondary)]', DISPLAY_FONT)}>
                  {scoreSep}
                </span>
                <AnimatedNumber
                  value={miniScoreCard.wkts ?? 0}
                  className={cn('text-[2.5rem] leading-[0.92] font-extrabold text-white', DISPLAY_FONT)}
                />
              </div>
            </div>
          </GlowPanel>
        </div>
      </div>
    </div>
  );
}
