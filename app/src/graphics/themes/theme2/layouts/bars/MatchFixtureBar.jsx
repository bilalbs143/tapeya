/**
 * Match fixture lower-third — INTRO_LT, TOSS_LT, RESULT_LT, TOURNAMENT_NAME.
 * Caption pill + split shell (controller-3); tournament uses two-row mid, no pill.
 */
import { cn } from '@/lib/utils';

import { ltFixtureBar } from '../../config';
import { UI_FONT } from '../../primitives';
import { matchupMidIntroClass, matchupMidIntroStyle, matchupTeamNameClass, matchupTeamNameStyle } from './matchupLTLayout';
import { MatchupLTSurface, MatchupSplitBar, MatchupVsBox } from './matchupLTShell';

const DIVIDER = 'rgba(205, 205, 205, 0.33)';

function resolveTeams(data, teams) {
  const [entryA, entryB] = data?.teams ?? [];
  if (!entryA?.teamCode || !entryB?.teamCode) return null;

  const teamA = teams[entryA.teamCode];
  const teamB = teams[entryB.teamCode];
  if (!teamA || !teamB) return null;

  const name = (team, override) => override ?? team.introName ?? team.displayName ?? team.fullName ?? team.name;

  return { teamA, teamB, nameA: name(teamA, entryA.name), nameB: name(teamB, entryB.name) };
}

/**
 * @param {{
 *   fixture: object,
 *   teams: Record<string, object>,
 *   edgeToEdge?: boolean,
 *   detailClassName?: string,
 *   detailStyle?: import('react').CSSProperties,
 * }} props
 */
export function MatchFixtureBar({
  fixture,
  teams,
  edgeToEdge = true,
  // Accepted for command-level back-compat; caption pill owns typography now.
  detailClassName: _detailClassName,
  detailStyle: _detailStyle,
}) {
  const resolved = resolveTeams(fixture, teams);
  if (!resolved) return null;

  const { teamA, teamB, nameA, nameB } = resolved;
  const vsLabel = fixture.vsLabel ?? 'VS';
  const title = fixture.title ?? '';
  const matchDetail = fixture.matchDetail ?? '';
  const isTournamentLayout = Boolean(title && matchDetail);
  const caption = isTournamentLayout ? null : title || matchDetail || null;

  return (
    <MatchupLTSurface caption={caption} edgeToEdge={edgeToEdge}>
      {({ radius, atMaxWidth, measuring }) => (
        <MatchupSplitBar teamA={teamA} teamB={teamB} measuring={measuring} radius={radius}>
          {isTournamentLayout ? (
            <TournamentMid title={title} venue={matchDetail} atMaxWidth={atMaxWidth} />
          ) : (
            <div className={matchupMidIntroClass} style={matchupMidIntroStyle}>
              <span
                className={cn(matchupTeamNameClass('end'), 'flex items-center justify-end self-center')}
                style={matchupTeamNameStyle}
              >
                {nameA}
              </span>
              <MatchupVsBox label={vsLabel} />
              <span
                className={cn(matchupTeamNameClass('start'), 'flex items-center justify-start self-center')}
                style={matchupTeamNameStyle}
              >
                {nameB}
              </span>
            </div>
          )}
        </MatchupSplitBar>
      )}
    </MatchupLTSurface>
  );
}

function TournamentMid({ title, venue, atMaxWidth }) {
  return (
    <div className="relative z-[1] flex min-w-0 flex-1 flex-col bg-transparent">
      <div
        className="flex min-h-0 flex-1 items-center justify-center bg-transparent"
        style={{ paddingLeft: ltFixtureBar.midPaddingX, paddingRight: ltFixtureBar.midPaddingX }}
      >
        <span
          className={cn(
            'font-bold text-white uppercase',
            UI_FONT,
            atMaxWidth && 'min-w-0 overflow-hidden text-ellipsis whitespace-nowrap',
          )}
          style={{
            fontSize: ltFixtureBar.tournamentTitleFontSize,
            letterSpacing: ltFixtureBar.tournamentTitleLetterSpacing,
          }}
        >
          {title}
        </span>
      </div>
      {venue ? (
        <div
          className="flex shrink-0 items-center justify-center bg-transparent"
          style={{
            height: ltFixtureBar.tournamentVenueRowHeight,
            borderTop: `1px solid ${DIVIDER}`,
            paddingLeft: ltFixtureBar.midPaddingX,
            paddingRight: ltFixtureBar.midPaddingX,
          }}
        >
          <span
            className={cn(
              'font-bold text-white uppercase',
              UI_FONT,
              atMaxWidth && 'min-w-0 overflow-hidden text-ellipsis whitespace-nowrap',
            )}
            style={{
              fontSize: ltFixtureBar.captionFontSize,
              letterSpacing: ltFixtureBar.captionLetterSpacing,
              lineHeight: 1.1,
            }}
          >
            {venue}
          </span>
        </div>
      ) : null}
    </div>
  );
}
