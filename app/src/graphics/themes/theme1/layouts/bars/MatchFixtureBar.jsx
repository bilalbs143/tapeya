/**
 * Match fixture lower-third bar — INTRO_LT, TOSS_LT, RESULT_LT, TOURNAMENT_NAME.
 * Standard LT footprint — ltBar.height × content width (min ltInfoBar.minWidth).
 */
import { cn } from '@/lib/utils';

import { geometry, infoBarPanelClass, infoBarPanelStyle, ltBar } from '../../config';
import { InsetLTBarPanel, InsetLTBarSurface, InsetLTCrest } from '../../primitives';
import {
  fixtureCrestColumnClass,
  fixtureCrestColumnStyle,
  fixtureDetailRowClass,
  fixtureDetailRowFlexStyle,
  fixtureDetailStyle,
  fixtureRowPaddingXStyle,
  fixtureTitleRowClass,
  fixtureTitleRowFlexStyle,
  fixtureTitleStyle,
  fixtureVsClass,
  fixtureVsStyle,
  MATCH_FIXTURE_DETAIL_SEMIBOLD,
  MATCH_FIXTURE_DETAIL_TOSS,
  pickFixtureTitleClass,
} from './fixtureBarLayout';

export { MATCH_FIXTURE_DETAIL_SEMIBOLD, MATCH_FIXTURE_DETAIL_TOSS };

const CREST_SIZE = ltBar.crestSize;
const BAR_RADIUS = geometry.barRadius;

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
  detailClassName = MATCH_FIXTURE_DETAIL_SEMIBOLD,
  detailStyle = fixtureDetailStyle('semibold'),
}) {
  const resolved = resolveTeams(fixture, teams);
  if (!resolved) return null;

  const { teamA, teamB, nameA, nameB } = resolved;
  const vsLabel = fixture.vsLabel ?? 'VS';
  const title = fixture.title ?? '';
  const matchDetail = fixture.matchDetail ?? '';
  const hasDetailRow = Boolean(matchDetail);
  const titleClass = (atMaxWidth) => pickFixtureTitleClass(atMaxWidth);

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
              className={cn(fixtureTitleRowClass, !hasDetailRow && 'border-b-0')}
              style={{ ...fixtureTitleRowFlexStyle(!hasDetailRow), ...fixtureRowPaddingXStyle }}
            >
              {title ? (
                <span className={titleClass(atMaxWidth)} style={fixtureTitleStyle}>
                  {title}
                </span>
              ) : (
                <>
                  <span className={titleClass(atMaxWidth)} style={fixtureTitleStyle}>
                    {nameA}
                  </span>
                  <span className={fixtureVsClass} style={fixtureVsStyle}>
                    {vsLabel}
                  </span>
                  <span className={titleClass(atMaxWidth)} style={fixtureTitleStyle}>
                    {nameB}
                  </span>
                </>
              )}
            </div>

            {hasDetailRow ? (
              <div
                className={cn(
                  fixtureDetailRowClass,
                  detailClassName,
                  atMaxWidth && 'min-w-0 overflow-hidden text-ellipsis whitespace-nowrap',
                )}
                style={{ ...fixtureDetailRowFlexStyle(), ...fixtureRowPaddingXStyle, ...detailStyle }}
              >
                {matchDetail}
              </div>
            ) : null}
          </div>

          <div className={fixtureCrestColumnClass} style={fixtureCrestColumnStyle}>
            <InsetLTCrest measuring={measuring} team={teamB} size={CREST_SIZE} accent={teamB.color} borderPulseOrder={2} />
          </div>
        </InsetLTBarPanel>
      )}
    </InsetLTBarSurface>
  );
}
