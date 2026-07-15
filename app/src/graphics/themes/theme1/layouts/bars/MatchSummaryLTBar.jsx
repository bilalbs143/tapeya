/**
 * Match Summary lower-third — MATCH_SUMMARY.
 * Standard LT footprint — ltBar.height × content width (min ltInfoBar.minWidth).
 */
import { cn } from '@/lib/utils';

import { geometry, infoBarPanelClass, infoBarPanelStyle, ltBar, ltFixtureBar } from '../../config';
import { DISPLAY_FONT, InsetLTAnimatedNumber, InsetLTBarPanel, InsetLTBarSurface, InsetLTCrest, UI_FONT } from '../../primitives';
import { textGlowClass } from '../../visualEffects';
import {
  fixtureCrestColumnClass,
  fixtureCrestColumnStyle,
  fixtureDetailClassName,
  fixtureDetailRowClass,
  fixtureDetailRowFlexStyle,
  fixtureDetailStyle,
  fixtureRowPaddingXStyle,
  fixtureTitleRowFlexStyle,
  fixtureTitleStyle,
  fixtureVsClass,
  fixtureVsRowGridClass,
  fixtureVsRowNameClass,
  fixtureVsRowSideClass,
  fixtureVsStyle,
} from './fixtureBarLayout';

const CREST_SIZE = ltBar.crestSize;
const BAR_RADIUS = geometry.barRadius;
const DEFAULT_LABEL = 'MATCH SUMMARY';

function teamName(team) {
  return team.displayName ?? team.fullName ?? team.name ?? '';
}

/**
 * @param {{ total?: number, wkts?: number, scoreSep?: string, oversText?: string, oversLabel?: string, measuring?: boolean }} innings
 */
function InningsScore({ innings, measuring = false }) {
  const separator = innings.scoreSep ?? '-';
  const oversLine = `${innings.oversText ?? ''} ${innings.oversLabel ?? 'OVER'}`.trim();

  return (
    <div className="flex shrink-0 flex-col items-center leading-[1.05]">
      <div className="flex items-baseline gap-[2px]">
        <InsetLTAnimatedNumber
          measuring={measuring}
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
        <InsetLTAnimatedNumber
          measuring={measuring}
          value={innings.wkts ?? 0}
          className={cn('leading-[0.92] font-extrabold text-[var(--text)]', DISPLAY_FONT)}
          style={{ fontSize: ltFixtureBar.matchSummaryScoreWkts }}
        />
      </div>
      <span
        className={cn('mt-[2px] font-bold tracking-[0.12em] text-white', UI_FONT)}
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
  const nameClass = cn(fixtureVsRowNameClass, 'uppercase');

  return (
    <InsetLTBarSurface edgeToEdge={edgeToEdge} barRadius={BAR_RADIUS}>
      {({ radius, atMaxWidth, measuring }) => (
        <InsetLTBarPanel
          measuring={measuring}
          hideRing
          radius={radius}
          className={infoBarPanelClass(measuring)}
          style={infoBarPanelStyle(measuring)}
        >
          <div className={fixtureCrestColumnClass} style={fixtureCrestColumnStyle}>
            <InsetLTCrest measuring={measuring} team={teamA} size={CREST_SIZE} accent={teamA.color} borderPulseOrder={1} />
          </div>

          <div className="flex h-full min-w-0 flex-1 flex-col">
            <div
              className={fixtureVsRowGridClass('gap-6')}
              style={{ ...fixtureTitleRowFlexStyle(false), ...fixtureRowPaddingXStyle }}
            >
              <div className={fixtureVsRowSideClass('start', 'gap-6')}>
                <span className={nameClass} style={fixtureTitleStyle}>
                  {teamName(teamA)}
                </span>
                <InningsScore innings={inningsA} measuring={measuring} />
              </div>
              <span className={fixtureVsClass} style={fixtureVsStyle}>
                {vsLabel}
              </span>
              <div className={fixtureVsRowSideClass('end', 'gap-6')}>
                <InningsScore innings={inningsB} measuring={measuring} />
                <span className={nameClass} style={fixtureTitleStyle}>
                  {teamName(teamB)}
                </span>
              </div>
            </div>
            <div
              className={cn(
                fixtureDetailRowClass,
                fixtureDetailClassName('semibold'),
                atMaxWidth && 'min-w-0 overflow-hidden text-ellipsis whitespace-nowrap',
              )}
              style={{ ...fixtureDetailRowFlexStyle(), ...fixtureRowPaddingXStyle, ...fixtureDetailStyle('semibold') }}
            >
              {centerLabel}
            </div>
          </div>

          <div className={fixtureCrestColumnClass} style={fixtureCrestColumnStyle}>
            <InsetLTCrest measuring={measuring} team={teamB} size={CREST_SIZE} accent={teamB.color} borderPulseOrder={2} />
          </div>
        </InsetLTBarPanel>
      )}
    </InsetLTBarSurface>
  );
}
