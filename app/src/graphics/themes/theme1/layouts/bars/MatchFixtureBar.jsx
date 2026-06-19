/**
 * Match fixture lower-third bar — INTRO_LT, TOSS_LT, RESULT_LT, TOURNAMENT_NAME.
 * Standard LT footprint (1920 × 126) — same as LT_DEFAULT.
 *
 * Typography follows original theme-01 fixture bars (all rem, no px/rem mix).
 */
import { cn } from '@/lib/utils';

import { geometry, ltBar } from '../../config';
import { Crest, GlowPanel, useScaledBarSurface } from '../../primitives';

const DESIGN_WIDTH = ltBar.designWidth;
const CREST_SIZE = ltBar.crestSize;
const BAR_RADIUS = geometry.barRadius;
const UI = '[font-family:var(--font-ui)]';

/** Intro / tournament / result footer — original theme-01 semibold row */
export const MATCH_FIXTURE_DETAIL_SEMIBOLD = 'text-[0.9375rem] font-semibold tracking-[0.12em]';

/** Toss footer — original theme-01 bold row */
export const MATCH_FIXTURE_DETAIL_TOSS = 'text-[1rem] font-bold tracking-[0.1em]';

const centerTitleClass = cn(
  'overflow-hidden text-ellipsis whitespace-nowrap',
  UI,
  'text-[1.35rem] font-extrabold tracking-[0.08em] text-[var(--text)]',
);

const vsLabelClass = cn('shrink-0', UI, 'text-[1.1rem] font-extrabold tracking-[0.16em] text-[var(--muted)]');

const detailBaseClass = cn('text-center text-white', UI);

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
 * }} props
 */
export function MatchFixtureBar({ fixture, teams, edgeToEdge = true, detailClassName = MATCH_FIXTURE_DETAIL_SEMIBOLD }) {
  const resolved = resolveTeams(fixture, teams);
  const { containerRef, innerRef, scale, surfaceHeight, radius } = useScaledBarSurface(DESIGN_WIDTH, edgeToEdge, BAR_RADIUS);

  if (!resolved) return null;

  const { teamA, teamB, nameA, nameB } = resolved;
  const vsLabel = fixture.vsLabel ?? 'VS';
  const title = fixture.title ?? '';
  const matchDetail = fixture.matchDetail ?? '';

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
            <div className="flex flex-1 items-center justify-center gap-7 border-b border-white/[0.08] px-6 pt-[0.85rem] pb-[0.35rem]">
              {title ? (
                <span className={centerTitleClass}>{title}</span>
              ) : (
                <>
                  <span className={centerTitleClass}>{nameA}</span>
                  <span className={vsLabelClass}>{vsLabel}</span>
                  <span className={centerTitleClass}>{nameB}</span>
                </>
              )}
            </div>

            {matchDetail ? (
              <div
                className={cn('flex items-center justify-center px-6 pt-[0.35rem] pb-[0.7rem]', detailBaseClass, detailClassName)}
              >
                {matchDetail}
              </div>
            ) : null}
          </div>

          <div className="flex shrink-0 items-center justify-center border-r border-white/[0.08] px-5 py-[1.1rem] last:border-r-0 last:border-l last:border-white/[0.08]">
            <Crest team={teamB} size={CREST_SIZE} accent={teamB.color} borderPulseOrder={2} />
          </div>
        </GlowPanel>
      </div>
    </div>
  );
}
