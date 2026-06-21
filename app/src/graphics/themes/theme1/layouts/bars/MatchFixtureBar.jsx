/**
 * Match fixture lower-third bar — INTRO_LT, TOSS_LT, RESULT_LT, TOURNAMENT_NAME.
 * Standard LT footprint (1920 × 138) — same as LT_DEFAULT.
 */
import { cn } from '@/lib/utils';

import { geometry, ltBar } from '../../config';
import { Crest, GlowPanel, ScaledBarSurface } from '../../primitives';
import {
  fixtureCrestColumnClass,
  fixtureCrestColumnStyle,
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
  MATCH_FIXTURE_DETAIL_SEMIBOLD,
  MATCH_FIXTURE_DETAIL_TOSS,
} from './fixtureBarLayout';

export { MATCH_FIXTURE_DETAIL_SEMIBOLD, MATCH_FIXTURE_DETAIL_TOSS };

const DESIGN_WIDTH = ltBar.designWidth;
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
              className={cn(fixtureTitleRowClass, !hasDetailRow && 'border-b-0')}
              style={{ ...fixtureTitleRowFlexStyle(!hasDetailRow), ...fixtureRowPaddingXStyle }}
            >
              {title ? (
                <span className={fixtureTitleClass} style={fixtureTitleStyle}>
                  {title}
                </span>
              ) : (
                <>
                  <span className={fixtureTitleClass} style={fixtureTitleStyle}>
                    {nameA}
                  </span>
                  <span className={fixtureVsClass} style={fixtureVsStyle}>
                    {vsLabel}
                  </span>
                  <span className={fixtureTitleClass} style={fixtureTitleStyle}>
                    {nameB}
                  </span>
                </>
              )}
            </div>

            {hasDetailRow ? (
              <div
                className={cn(fixtureDetailRowClass, detailClassName)}
                style={{ ...fixtureDetailRowFlexStyle(), ...fixtureRowPaddingXStyle, ...detailStyle }}
              >
                {matchDetail}
              </div>
            ) : null}
          </div>

          <div className={fixtureCrestColumnClass} style={fixtureCrestColumnStyle}>
            <Crest team={teamB} size={CREST_SIZE} accent={teamB.color} borderPulseOrder={2} />
          </div>
        </GlowPanel>
      )}
    </ScaledBarSurface>
  );
}
