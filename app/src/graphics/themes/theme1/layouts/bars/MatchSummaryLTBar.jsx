/**
 * Match Summary lower-third — MATCH_SUMMARY.
 * Standard LT footprint (1920 × 126) — same as LT_DEFAULT.
 */
import { cn } from '@/lib/utils';

import { geometry, ltBar, ltFixtureBar } from '../../config';
import { AnimatedNumber, Crest, DISPLAY_FONT, GlowPanel, ScaledBarSurface, UI_FONT } from '../../primitives';
import { textGlowClass } from '../../visualEffects';
import {
  fixtureCrestColumnClass,
  fixtureCrestColumnStyle,
  fixtureDetailClassName,
  fixtureDetailRowClass,
  fixtureDetailRowFlexStyle,
  fixtureDetailStyle,
  fixtureRowPaddingXStyle,
  fixtureTitleClass,
  fixtureTitleRowClass,
  fixtureTitleRowFlexStyle,
  fixtureTitleStyle,
  fixtureVsClass,
  fixtureVsStyle,
} from './fixtureBarLayout';

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
          className={cn('leading-[0.92] font-extrabold text-[var(--text)]', textGlowClass('subtle'), DISPLAY_FONT)}
          style={{ fontSize: ltFixtureBar.matchSummaryScoreTotal }}
        />
        <span
          className={cn('leading-[0.92] font-extrabold text-[var(--text-secondary)]', DISPLAY_FONT)}
          style={{ fontSize: ltFixtureBar.matchSummaryScoreSep }}
        >
          {separator}
        </span>
        <AnimatedNumber
          value={innings.wkts ?? 0}
          className={cn('leading-[0.92] font-extrabold text-[var(--text)]', DISPLAY_FONT)}
          style={{ fontSize: ltFixtureBar.matchSummaryScoreWkts }}
        />
      </div>
      <span
        className={cn('mt-[2px] font-bold tracking-[0.12em] text-[var(--text-secondary)]', UI_FONT)}
        style={{ fontSize: ltFixtureBar.matchSummaryOvers }}
      >
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

  if (!inningsA || !inningsB || !teamA || !teamB) return null;

  const vsLabel = summary.vsLabel ?? 'VS';
  const centerLabel = summary.label ?? DEFAULT_LABEL;

  return (
    <ScaledBarSurface designWidth={DESIGN_WIDTH} edgeToEdge={edgeToEdge} barRadius={BAR_RADIUS}>
      {({ radius }) => (
        <GlowPanel
          hideRing
          radius={radius}
          className="flex w-full items-stretch overflow-hidden"
          style={{ height: ltBar.height }}
        >
          <div className={fixtureCrestColumnClass} style={fixtureCrestColumnStyle}>
            <Crest team={teamA} size={CREST_SIZE} accent={teamA.color} borderPulseOrder={1} />
          </div>

          <div className="flex h-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
            <div
              className={cn(fixtureTitleRowClass, 'gap-6')}
              style={{ ...fixtureTitleRowFlexStyle(false), ...fixtureRowPaddingXStyle }}
            >
              <span className={cn(fixtureTitleClass, 'uppercase')} style={fixtureTitleStyle}>
                {teamName(teamA)}
              </span>
              <InningsScore innings={inningsA} />
              <span className={fixtureVsClass} style={fixtureVsStyle}>
                {vsLabel}
              </span>
              <InningsScore innings={inningsB} />
              <span className={cn(fixtureTitleClass, 'uppercase')} style={fixtureTitleStyle}>
                {teamName(teamB)}
              </span>
            </div>
            <div
              className={cn(fixtureDetailRowClass, fixtureDetailClassName('semibold'))}
              style={{ ...fixtureDetailRowFlexStyle(), ...fixtureRowPaddingXStyle, ...fixtureDetailStyle('semibold') }}
            >
              {centerLabel}
            </div>
          </div>

          <div className={fixtureCrestColumnClass} style={fixtureCrestColumnStyle}>
            <Crest team={teamB} size={CREST_SIZE} accent={teamB.color} borderPulseOrder={2} />
          </div>
        </GlowPanel>
      )}
    </ScaledBarSurface>
  );
}
