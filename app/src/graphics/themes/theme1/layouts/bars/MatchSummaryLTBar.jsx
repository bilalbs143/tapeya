/**
 * Match Summary lower-third — MATCH_SUMMARY.
 * Standard LT footprint (1920 × 126) — same as LT_DEFAULT.
 */
import { cn } from '@/lib/utils';

import { geometry, ltBar } from '../../config';
import { AnimatedNumber, Crest, DISPLAY_FONT, GlowPanel, UI_FONT, useScaledBarSurface } from '../../primitives';

const DESIGN_WIDTH = ltBar.designWidth;
const CREST_SIZE = ltBar.crestSize;
const BAR_RADIUS = geometry.barRadius;
const DEFAULT_LABEL = 'MATCH SUMMARY';

function teamName(team) {
  return team.displayName ?? team.fullName ?? team.name ?? '';
}

/**
 * @param {{ total?: number, wkts?: number, scoreSep?: string, oversText?: string, oversLabel?: string }} innings
 */
function InningsScore({ innings }) {
  const separator = innings.scoreSep ?? '-';
  const oversLine = `${innings.oversText ?? ''} ${innings.oversLabel ?? 'OVER'}`.trim();

  return (
    <div className="flex shrink-0 flex-col items-center leading-[1.05]">
      <div className="flex items-baseline gap-[2px]">
        <AnimatedNumber
          value={innings.total ?? 0}
          className={cn(
            'text-[2.75rem] leading-[0.92] font-extrabold text-[var(--text)]',
            '[text-shadow:0_0_calc(14px*var(--glow))_rgba(255,255,255,0.2)]',
            DISPLAY_FONT,
          )}
        />
        <span className={cn('text-[1.75rem] leading-[0.92] font-extrabold text-[var(--muted)]', DISPLAY_FONT)}>{separator}</span>
        <AnimatedNumber
          value={innings.wkts ?? 0}
          className={cn('text-[2rem] leading-[0.92] font-extrabold text-[var(--text)]', DISPLAY_FONT)}
        />
      </div>
      <span className={cn('mt-[2px] text-[0.8125rem] font-semibold tracking-[0.12em] text-[var(--muted)]', UI_FONT)}>
        {oversLine}
      </span>
    </div>
  );
}

/**
 * @param {{
 *   summary: { label?: string, vsLabel?: string, innings?: Array<Record<string, unknown>> },
 *   teams: Record<string, object>,
 *   edgeToEdge?: boolean,
 * }} props
 */
export function MatchSummaryLTBar({ summary, teams, edgeToEdge = true }) {
  const [inningsA, inningsB] = summary?.innings ?? [];
  const teamA = inningsA?.teamCode ? teams[String(inningsA.teamCode)] : null;
  const teamB = inningsB?.teamCode ? teams[String(inningsB.teamCode)] : null;

  const { containerRef, innerRef, scale, surfaceHeight, radius } = useScaledBarSurface(DESIGN_WIDTH, edgeToEdge, BAR_RADIUS);

  if (!inningsA || !inningsB || !teamA || !teamB) return null;

  const vsLabel = summary.vsLabel ?? 'VS';
  const centerLabel = summary.label ?? DEFAULT_LABEL;

  return (
    <div ref={containerRef} className="w-full max-w-full overflow-hidden" style={{ height: surfaceHeight || undefined }}>
      <div ref={innerRef} className="origin-top-left" style={{ width: DESIGN_WIDTH, transform: `scale(${scale})` }}>
        <GlowPanel
          ambientPulse
          hideRing
          radius={radius}
          className="flex w-full items-stretch overflow-hidden"
          style={{ height: ltBar.height }}
        >
          <div className="flex shrink-0 items-center justify-center border-r border-white/[0.08] px-5 py-[1.1rem] last:border-r-0 last:border-l last:border-white/[0.08]">
            <Crest team={teamA} size={CREST_SIZE} accent={teamA.color} borderPulseOrder={1} />
          </div>

          <div className="flex min-h-0 min-w-0 flex-1 flex-col justify-center overflow-hidden">
            <div className="flex flex-1 items-center justify-center gap-6 border-b border-white/[0.08] px-6 pt-[0.85rem] pb-[0.35rem]">
              <span
                className={cn(
                  'overflow-hidden text-[1.35rem] font-extrabold tracking-[0.08em] text-ellipsis whitespace-nowrap text-[var(--text)] uppercase',
                  UI_FONT,
                )}
              >
                {teamName(teamA)}
              </span>
              <InningsScore innings={inningsA} />
              <span className={cn('shrink-0 text-[1.1rem] font-extrabold tracking-[0.16em] text-[var(--muted)]', UI_FONT)}>
                {vsLabel}
              </span>
              <InningsScore innings={inningsB} />
              <span
                className={cn(
                  'overflow-hidden text-[1.35rem] font-extrabold tracking-[0.08em] text-ellipsis whitespace-nowrap text-[var(--text)] uppercase',
                  UI_FONT,
                )}
              >
                {teamName(teamB)}
              </span>
            </div>
            <div
              className={cn(
                'flex items-center justify-center px-6 pt-[0.35rem] pb-[0.7rem] text-center text-[0.9375rem] font-semibold tracking-[0.12em] text-white',
                UI_FONT,
              )}
            >
              {centerLabel}
            </div>
          </div>

          <div className="flex shrink-0 items-center justify-center border-r border-white/[0.08] px-5 py-[1.1rem] last:border-r-0 last:border-l last:border-white/[0.08]">
            <Crest team={teamB} size={CREST_SIZE} accent={teamB.color} borderPulseOrder={2} />
          </div>
        </GlowPanel>
      </div>
    </div>
  );
}
