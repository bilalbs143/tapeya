import { CLOUDFRONT_APP_BASE } from '@/lib/constants/assets';

import { MatchStatsRow } from '../MatchStatsRow';

const ballIcon = `${CLOUDFRONT_APP_BASE}/images/icons/ball-icon.svg`;
const teamMatchIcon = `${CLOUDFRONT_APP_BASE}/images/icons/team-match-icon.svg`;

// ─── Constants ─────────────────────────────────────────────────────────────

const VERTICAL_SEPARATOR =
  'w-px shrink-0 min-h-8 self-stretch bg-gradient-to-b from-[#00000000] via-[#FFFFFF66] to-[#00000000]';

const INNINGS_LABEL = '1st Innings';

/** Runs/balls in the current stand from each batsman’s contribution (matches side columns). */
function standTotalsFromCrease(batsmenOnCrease) {
  if (!batsmenOnCrease || batsmenOnCrease.length !== 2) return null;
  const r1 =
    (batsmenOnCrease[0]?.runs ?? 0) -
    (batsmenOnCrease[0]?.partnerRunsAtStart ?? 0);
  const b1 =
    (batsmenOnCrease[0]?.balls ?? 0) -
    (batsmenOnCrease[0]?.partnerBallsAtStart ?? 0);
  const r2 =
    (batsmenOnCrease[1]?.runs ?? 0) -
    (batsmenOnCrease[1]?.partnerRunsAtStart ?? 0);
  const b2 =
    (batsmenOnCrease[1]?.balls ?? 0) -
    (batsmenOnCrease[1]?.partnerBallsAtStart ?? 0);
  return { runs: r1 + r2, balls: b1 + b2 };
}

// ─── Component ─────────────────────────────────────────────────────────────

export function PartnershipTab({
  match,
  liveScore: liveScoreProp,
  partnership: partnershipProp,
  completedPartnerships = [],
  batsmenOnCrease = [],
  /** When set (from ScoringMatch sharedProps), use live scoring innings — avoids empty partnership on non-Scoring tabs. */
  partnershipTabLiveScore,
  partnershipTabBatsmenOnCrease,
  partnershipTabCompletedPartnerships,
  partnershipTabPartnership,
}) {
  const teamA = match?.teamA;
  const teamName = teamA?.name ?? '';
  const maxOvers =
    match?.overs != null && match?.overs !== ''
      ? Number(match.overs)
      : undefined;
  const liveScore = partnershipTabLiveScore ?? liveScoreProp;
  const crease = partnershipTabBatsmenOnCrease ?? batsmenOnCrease;
  const completedList =
    partnershipTabCompletedPartnerships ?? completedPartnerships;
  const partnershipState = partnershipTabPartnership ?? partnershipProp;

  const fromCrease = standTotalsFromCrease(crease);
  const partnershipRuns = fromCrease?.runs ?? partnershipState?.runs ?? 0;
  const partnershipBalls = fromCrease?.balls ?? partnershipState?.balls ?? 0;

  // ─── Derived: partnership list (completed + current) ───────────────────────

  /** Current stand row when two batsmen on crease; individual runs/balls use partnerRunsAtStart. */
  const currentPartnershipRow =
    crease.length === 2
      ? (() => {
          const batter1 = {
            name: crease[0]?.name ?? '—',
            runs: (crease[0]?.runs ?? 0) - (crease[0]?.partnerRunsAtStart ?? 0),
            balls:
              (crease[0]?.balls ?? 0) - (crease[0]?.partnerBallsAtStart ?? 0),
          };
          const batter2 = {
            name: crease[1]?.name ?? '—',
            runs: (crease[1]?.runs ?? 0) - (crease[1]?.partnerRunsAtStart ?? 0),
            balls:
              (crease[1]?.balls ?? 0) - (crease[1]?.partnerBallsAtStart ?? 0),
          };
          const totals = standTotalsFromCrease(crease);
          return {
            id: 'current',
            isCurrent: true,
            batter1,
            batter2,
            runs: totals?.runs ?? 0,
            balls: totals?.balls ?? 0,
          };
        })()
      : null;

  const allPartnerships = currentPartnershipRow
    ? [...completedList, currentPartnershipRow]
    : completedList;

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="mt-4 space-y-4 pb-8">
      {/* Header: team + innings */}
      <div className="flex items-center justify-center gap-2">
        <img
          src={teamMatchIcon}
          alt=""
          className="h-8 w-8 shrink-0"
          aria-hidden
        />
        <span className="text-[16px] font-bold tracking-wide text-white uppercase">
          {teamName || '—'}
        </span>
        <span className="text-[13px] text-[#DA9811]">{INNINGS_LABEL}</span>
      </div>

      {/* Score box */}
      <div className="mx-auto max-w-fit rounded-[17px] bg-[#141412] px-6 py-4 text-center">
        <div className="flex items-baseline justify-center gap-1">
          <span className="text-[36px] leading-none font-bold text-white">
            {liveScore?.totalRuns ?? 0}-{liveScore?.totalWickets ?? 0}
          </span>
          <span className="text-[16px] font-bold text-white/90">
            ({liveScore?.oversDisplay ?? '0'} /{' '}
            {liveScore?.maxOvers ?? maxOvers ?? ''})
          </span>
        </div>
      </div>

      {/* Stats row (shared with Scoring tab) */}
      <MatchStatsRow
        extras={liveScore?.extras ?? 0}
        oversDisplay={liveScore?.oversDisplay ?? '0'}
        maxOvers={liveScore?.maxOvers ?? maxOvers}
        crr={liveScore?.crr ?? '0.0'}
        partnershipRuns={partnershipRuns}
        partnershipBalls={partnershipBalls}
      />

      {/* Partnerships list: completed + current stand */}
      <div className="mt-6">
        <h2 className="text-[12px] font-bold tracking-wide text-[#DA9811] uppercase">
          Partnerships
        </h2>
        <div className="mt-4">
          {allPartnerships.length === 0 ? (
            <p className="py-4 text-center text-[12px] text-[#A2A6AB]">
              No partnerships yet. Add batsmen and start scoring.
            </p>
          ) : (
            allPartnerships.map((p, index) => (
              <div
                key={p.id}
                className={`flex items-center justify-between gap-4 py-2 ${
                  index < allPartnerships.length - 1
                    ? 'border-b border-[#FFFFFF33]'
                    : ''
                } ${p.isCurrent ? '-mx-2 px-2' : ''}`}
              >
                <div className="flex min-w-0 flex-1 items-center gap-2">
                  <span className="text-[12px] font-semibold text-[#A2A6AB]">
                    {p.batter1.name}
                  </span>
                  <div className={VERTICAL_SEPARATOR} aria-hidden />
                  <span className="text-[12px] font-normal text-[#A2A6AB]">
                    {p.batter1.runs != null && p.batter1.balls != null
                      ? `${p.batter1.runs} (${p.batter1.balls})`
                      : '—'}
                  </span>
                </div>
                <div className="flex shrink-0 flex-col items-center gap-1">
                  <img src={ballIcon} alt="" className="h-4 w-4" aria-hidden />
                  <span className="whitespace-nowrap">
                    <span className="text-[12px] font-normal text-[white]">
                      {p.runs}
                    </span>
                    <span className="text-[12px] font-normal text-[#A2A6AB]">
                      {' '}
                      on{' '}
                    </span>
                    <span className="text-[12px] font-normal text-white">
                      {p.balls}
                    </span>
                    <span className="text-[12px] font-normal text-[#A2A6AB]">
                      {' '}
                      Ball{p.balls !== 1 ? 's' : ''}
                    </span>
                  </span>
                </div>
                <div className="flex min-w-0 flex-1 items-center justify-end gap-2">
                  <span className="text-[12px] font-semibold text-[#A2A6AB]">
                    {p.batter2.name}
                  </span>
                  <div className={VERTICAL_SEPARATOR} aria-hidden />
                  <span className="text-[12px] font-normal text-[#A2A6AB]">
                    {p.batter2.runs != null && p.batter2.balls != null
                      ? `${p.batter2.runs} (${p.batter2.balls})`
                      : '—'}
                  </span>
                  {p.isCurrent && (
                    <span
                      className="partnership-blink-dot inline-block h-2.5 w-2.5 flex-shrink-0 rounded-full bg-red-500"
                      aria-label="Current partnership"
                    />
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
