/**
 * Match Summary lower-third — caption pill + split matchup shell (controller-3).
 * Keeps InsetLTBarSurface width/height architecture.
 */
import { cn } from '@/lib/utils';

import { ltFixtureBar } from '../../config';
import { DISPLAY_FONT, InsetLTAnimatedNumber, UI_FONT } from '../../primitives';
import { textGlowClass } from '../../visualEffects';
import { matchupMidSummaryStyle, matchupTeamNameClass, matchupTeamNameStyle } from './matchupLTLayout';
import { MatchupLTSurface, MatchupSplitBar, MatchupVsBox } from './matchupLTShell';

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
    <div className="flex shrink-0 flex-col items-center leading-none">
      <div className="flex items-baseline tabular-nums">
        <InsetLTAnimatedNumber
          measuring={measuring}
          value={innings.total ?? 0}
          className={cn('font-bold text-white', textGlowClass('subtle'), DISPLAY_FONT)}
          style={{ fontSize: ltFixtureBar.matchSummaryScoreTotal }}
        />
        <span className={cn('font-bold text-white', DISPLAY_FONT)} style={{ fontSize: ltFixtureBar.matchSummaryScoreSep }}>
          {separator}
        </span>
        <InsetLTAnimatedNumber
          measuring={measuring}
          value={innings.wkts ?? 0}
          className={cn('font-bold text-white', DISPLAY_FONT)}
          style={{ fontSize: ltFixtureBar.matchSummaryScoreWkts }}
        />
      </div>
      {oversLine ? (
        <span
          className={cn('mt-0.5 font-medium text-white uppercase', UI_FONT)}
          style={{ fontSize: ltFixtureBar.matchSummaryOvers }}
        >
          {oversLine}
        </span>
      ) : null}
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
  const caption = summary.label ?? DEFAULT_LABEL;

  return (
    <MatchupLTSurface caption={caption} edgeToEdge={edgeToEdge}>
      {({ radius, measuring }) => (
        <MatchupSplitBar teamA={teamA} teamB={teamB} measuring={measuring} radius={radius}>
          <div className="relative z-[1] grid min-w-0 flex-1 items-center" style={matchupMidSummaryStyle}>
            <span className={cn(matchupTeamNameClass('start'), 'flex items-center self-center')} style={matchupTeamNameStyle}>
              {teamName(teamA)}
            </span>
            <div className="flex items-center self-center">
              <InningsScore innings={inningsA} measuring={measuring} />
            </div>
            <MatchupVsBox label={vsLabel} />
            <div className="flex items-center self-center">
              <InningsScore innings={inningsB} measuring={measuring} />
            </div>
            <span
              className={cn(matchupTeamNameClass('end'), 'flex items-center justify-end self-center')}
              style={matchupTeamNameStyle}
            >
              {teamName(teamB)}
            </span>
          </div>
        </MatchupSplitBar>
      )}
    </MatchupLTSurface>
  );
}
