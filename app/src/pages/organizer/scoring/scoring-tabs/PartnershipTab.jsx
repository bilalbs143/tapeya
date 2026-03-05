/**
 * Partnership tab – team/innings header, score box, stats row, and partnership rows.
 * Uses same dynamic liveScore and partnership from ScoringMatch as Scoring tab.
 */

import teamMatchIcon from '@/assets/images/icons/team-match-icon.svg';
import ballIcon from '@/assets/images/icons/ball-icon.svg';
import { MatchStatsRow } from '../MatchStatsRow';

// ─── Constants ─────────────────────────────────────────────────────────────

const DEFAULT_TEAM = { name: '' };

const DEFAULT_LIVE_SCORE = {
  totalRuns: 0,
  totalWickets: 0,
  oversDisplay: '0',
  maxOvers: 20,
  extras: 0,
  crr: '0.0',
};

const DEFAULT_PARTNERSHIP = { runs: 0, balls: 0 };

const VERTICAL_SEPARATOR =
  'w-px shrink-0 min-h-8 self-stretch bg-gradient-to-b from-[#00000000] via-[#FFFFFF66] to-[#00000000]';

const INNINGS_LABEL = '1st Innings';

// ─── Component ─────────────────────────────────────────────────────────────

export function PartnershipTab({
  match,
  liveScore: liveScoreProp,
  partnership: partnershipProp,
  completedPartnerships = [],
  batsmenOnCrease = [],
}) {
  // ─── Props with defaults ──────────────────────────────────────────────────

  const teamA = match?.teamA ?? DEFAULT_TEAM;
  const teamName = teamA.name || 'Team A';
  const liveScore = liveScoreProp ?? DEFAULT_LIVE_SCORE;
  const partnership = partnershipProp ?? DEFAULT_PARTNERSHIP;

  // ─── Derived: partnership list (completed + current) ───────────────────────

  /** Current stand row when two batsmen on crease; individual runs/balls use partnerRunsAtStart. */
  const currentPartnershipRow =
    batsmenOnCrease.length === 2
      ? {
          id: 'current',
          isCurrent: true,
          batter1: {
            name: batsmenOnCrease[0]?.name ?? '—',
            runs: (batsmenOnCrease[0]?.runs ?? 0) - (batsmenOnCrease[0]?.partnerRunsAtStart ?? 0),
            balls: (batsmenOnCrease[0]?.balls ?? 0) - (batsmenOnCrease[0]?.partnerBallsAtStart ?? 0),
          },
          batter2: {
            name: batsmenOnCrease[1]?.name ?? '—',
            runs: (batsmenOnCrease[1]?.runs ?? 0) - (batsmenOnCrease[1]?.partnerRunsAtStart ?? 0),
            balls: (batsmenOnCrease[1]?.balls ?? 0) - (batsmenOnCrease[1]?.partnerBallsAtStart ?? 0),
          },
          runs: partnership.runs,
          balls: partnership.balls,
        }
      : null;

  const allPartnerships = currentPartnershipRow
    ? [...completedPartnerships, currentPartnershipRow]
    : completedPartnerships;

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
        <span className="text-[16px] font-bold uppercase tracking-wide text-white">
          {teamName}
        </span>
        <span className="text-[13px] text-[#DA9811]">{INNINGS_LABEL}</span>
      </div>

      {/* Score box */}
      <div className="rounded-[17px] max-w-fit mx-auto text-center bg-[#141412] px-6 py-4">
        <div className="flex items-baseline justify-center gap-1">
          <span className="text-[36px] font-bold leading-none text-white">
            {liveScore.totalRuns}-{liveScore.totalWickets}
          </span>
          <span className="text-[16px] font-bold text-white/90">
            ({liveScore.oversDisplay} / {liveScore.maxOvers})
          </span>
        </div>
      </div>

      {/* Stats row (shared with Scoring tab) */}
      <MatchStatsRow
        extras={liveScore.extras}
        oversDisplay={liveScore.oversDisplay}
        maxOvers={liveScore.maxOvers}
        crr={liveScore.crr}
        partnershipRuns={partnership.runs}
        partnershipBalls={partnership.balls}
      />

      {/* Partnerships list: completed + current stand */}
      <div className="mt-6">
        <h2 className="text-[12px] font-bold uppercase tracking-wide text-[#DA9811]">
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
                  index < allPartnerships.length - 1 ? 'border-b border-[#FFFFFF33]' : ''
                } ${p.isCurrent ? 'px-2 -mx-2' : ''}`}
              >
                <div className="flex min-w-0 flex-1 items-center gap-2">
                  <span className="text-[12px] font-semibold text-[#A2A6AB]">
                    {p.batter1.name}
                  </span>
                  <div className={VERTICAL_SEPARATOR} aria-hidden />
                  <span className="text-[12px] font-normal text-[#A2A6AB]">
                    {p.batter1.runs} ({p.batter1.balls})
                  </span>
                </div>
                <div className="flex shrink-0 flex-col items-center gap-1">
                  <img
                    src={ballIcon}
                    alt=""
                    className="h-4 w-4"
                    aria-hidden
                  />
                  <span className="whitespace-nowrap">
                    <span className="text-[12px] font-normal text-[white]">{p.runs}</span>
                    <span className="text-[12px] font-normal text-[#A2A6AB]"> on </span>
                    <span className="text-[12px] font-normal text-white">{p.balls}</span>
                    <span className="text-[12px] font-normal text-[#A2A6AB]">
                      {' '}Ball{p.balls !== 1 ? 's' : ''}
                    </span>
                  </span>
                </div>
                <div className="flex min-w-0 flex-1 items-center justify-end gap-2">
                  <span className="text-[12px] font-semibold text-[#A2A6AB]">
                    {p.batter2.name}
                  </span>
                  <div className={VERTICAL_SEPARATOR} aria-hidden />
                  <span className="text-[12px] font-normal text-[#A2A6AB]">
                    {p.batter2.runs} ({p.batter2.balls})
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
