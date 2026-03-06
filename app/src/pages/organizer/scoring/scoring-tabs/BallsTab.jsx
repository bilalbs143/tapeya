/**
 * BallsTab – Ball-by-ball view with innings tabs, event list, and per-over summary blocks.
 *
 * Uses: ballHistory, squad, bowlersInTable, bowlerSquad, batsmenOnCrease, liveScore from parent.
 */

import { useMemo, useState, Fragment } from 'react';

import arrowRightOrange from '@/assets/images/icons/arrow-right-orange.svg';
import { ballsToOvers } from '../scoringUtils';

// ─── Constants ─────────────────────────────────────────────────────────────

const DASH = '—';

const DEFAULT_LIVE_SCORE = {
  totalRuns: 0,
  totalWickets: 0,
  oversDisplay: '0',
  maxOvers: 20,
  extras: 0,
  crr: '0.0',
};

const INNINGS_ACTIVE_CLASS = 'text-[#DA9811] font-bold border-b-2 border-[#DA9811] pb-1';
const INNINGS_INACTIVE_CLASS = 'text-white font-bold';

// ─── Ball display & description helpers ────────────────────────────────────

function getBallDisplay(ball) {
  if (!ball) return { label: '0', isWicket: false, isDot: true, isExtra: false };
  if (ball.type === 'runs') {
    const r = ball.runs ?? 0;
    if (r === 0) return { label: '0', isWicket: false, isDot: true, isExtra: false };
    return { label: String(r), isWicket: false, isDot: false, isExtra: false };
  }
  if (ball.type === 'out') return { label: 'W', isWicket: true, isDot: false, isExtra: false };
  if (ball.type === 'wd') return { label: 'WD', isWicket: false, isDot: false, isExtra: true };
  if (ball.type === 'nb') return { label: 'NB', isWicket: false, isDot: false, isExtra: true };
  if (ball.type === 'bye') return { label: 'B', isWicket: false, isDot: false, isExtra: true };
  if (ball.type === 'lb') return { label: 'LB', isWicket: false, isDot: false, isExtra: true };
  return { label: '0', isWicket: false, isDot: true, isExtra: false };
}

function getBallDescription(ball) {
  if (!ball) return '—';
  if (ball.type === 'out') {
    const dt = ball.dismissalType;
    return dt ? `Wicket. ${dt}` : 'Wicket.';
  }
  if (ball.type === 'runs') {
    const r = ball.runs ?? 0;
    if (r === 0) return 'Dot Ball';
    if (r === 4) return 'Four';
    if (r === 6) return 'Six';
    return `${r} run${r !== 1 ? 's' : ''}`;
  }
  if (ball.type === 'wd') return 'Wide';
  if (ball.type === 'nb') return 'No ball';
  if (ball.type === 'bye') return 'Bye';
  if (ball.type === 'lb') return 'Leg bye';
  return '—';
}

function formatDescription(description) {
  if (!description || typeof description !== 'string') return description;
  const byIndex = description.lastIndexOf(' by ');
  if (byIndex === -1) return description;
  const before = description.slice(0, byIndex + 4);
  const name = description.slice(byIndex + 4);
  return (
    <>
      {before}
      <span className="font-semibold text-white">{name}</span>
    </>
  );
}

// ─── Player name resolution ────────────────────────────────────────────────

function getStrikerName(ball, squad) {
  if (ball.type === 'out' && ball.striker?.name) return ball.striker.name;
  if (ball.strikerId && squad?.length) {
    const p = squad.find((s) => s.id === ball.strikerId);
    return p?.name ?? DASH;
  }
  return DASH;
}

function getBowlerName(ball, bowlersInTable, bowlerSquad) {
  const id = ball.bowlerId;
  if (!id) return DASH;
  const inTable = bowlersInTable?.find((b) => b.id === id);
  if (inTable?.name) return inTable.name;
  const inSquad = bowlerSquad?.find((b) => b.id === id);
  return inSquad?.name ?? DASH;
}

function resolvePlayerName(id, squad, bowlersInTable, bowlerSquad) {
  if (!id) return DASH;
  const inSquad = squad?.find((p) => p.id === id);
  if (inSquad?.name) return inSquad.name;
  const inBowlerTable = bowlersInTable?.find((p) => p.id === id);
  if (inBowlerTable?.name) return inBowlerTable.name;
  const inBowlerSquad = bowlerSquad?.find((p) => p.id === id);
  return inBowlerSquad?.name ?? DASH;
}

// ─── Ball list row (single delivery) ──────────────────────────────────────

function BallListRow({
  overBallLabel,
  ball,
  squad,
  bowlersInTable,
  bowlerSquad,
  getBallDisplay,
  getBallDescription,
  getStrikerName,
  getBowlerName,
}) {
  const { label, isWicket, isDot, isExtra } = getBallDisplay(ball);
  const strikerName = getStrikerName(ball, squad);
  const bowlerName = getBowlerName(ball, bowlersInTable, bowlerSquad);
  const description = getBallDescription(ball);

  const chipClass =
    isWicket || (label !== '0' && !isDot && !isExtra)
      ? 'bg-[#DA9811]'
      : isDot || isExtra
        ? 'border-2 border-[#DA9811] bg-[#141412] text-white'
        : 'bg-[#DA9811] border border-white text-white';

  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <span className="w-5 shrink-0 text-[13px] font-medium text-[#9CA3AF]">{overBallLabel}</span>
      <span
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[12px] font-bold ${chipClass}`}
      >
        {label}
      </span>
      <span className="flex shrink-0 items-center gap-1.5 text-[12px] font-bold text-white">
        {strikerName !== DASH && <span className="shrink-0">{strikerName}</span>}
        <img src={arrowRightOrange} alt="" className="h-2 w-auto shrink-0" aria-hidden />
        <span className="shrink-0">{bowlerName}</span>
      </span>
      <span className="min-w-[8px] flex-1 self-center border-b-2 border-dotted border-[#6B7280]" />
      <span className="shrink-0 text-right text-[12px] text-[#9CA3AF]">
        {formatDescription(description)}
      </span>
    </div>
  );
}

// ─── Over summary block (stats at end of a completed over) ──────────────────

function SummaryBlock({ summary, squad, bowlersInTable, bowlerSquad }) {
  const { balls, overRuns, cumulativeRuns, cumulativeWickets, completedOvers, creaseSnapshot, bowlerSnapshot } =
    summary;

  return (
    <div className="rounded-[17px] bg-[#141412] p-4">
      {/* Ball outcome chips for this over */}
      {balls.length > 0 && (
        <div className="mb-4 flex flex-wrap justify-center gap-3">
          {balls.map((b, i) => {
            const { label } = getBallDisplay(b);
            return (
              <span
                key={i}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-[#A2A6AB] text-[12px] font-bold text-[#A2A6AB]"
              >
                {label}
              </span>
            );
          })}
        </div>
      )}

      {/* Batsmen and bowler stats at end of this over */}
      {creaseSnapshot.length > 0 && (
        <div className="mb-4 space-y-2">
          {creaseSnapshot.length >= 2 ? (
            <>
              <div className="flex items-center gap-2 text-[13px]">
                <span className="font-bold text-white">
                  {resolvePlayerName(creaseSnapshot[0].id, squad, bowlersInTable, bowlerSquad)}
                </span>
                <span className="flex-1 border-b-2 border-dashed border-[#6B7280]" />
                <span className="text-white">
                  {creaseSnapshot[0].runs} ({creaseSnapshot[0].balls})
                </span>
                <span className="font-bold text-white">
                  {resolvePlayerName(creaseSnapshot[1].id, squad, bowlersInTable, bowlerSquad)}
                </span>
              </div>
              <div className="flex items-center gap-2 text-[13px]">
                <span className="font-bold text-white">
                  {resolvePlayerName(creaseSnapshot[1].id, squad, bowlersInTable, bowlerSquad)}
                </span>
                <span className="flex-1 border-b-2 border-dashed border-[#6B7280]" />
                <span className="text-white">
                  {creaseSnapshot[1].runs} ({creaseSnapshot[1].balls})
                </span>
                {bowlerSnapshot && (
                  <span className="text-white">
                    {ballsToOvers(bowlerSnapshot.balls)} - {bowlerSnapshot.maidens} - {bowlerSnapshot.runs} -{' '}
                    {bowlerSnapshot.wickets}
                  </span>
                )}
              </div>
            </>
          ) : (
            <>
              {creaseSnapshot.map((b, i) => (
                <div key={b.id ?? i} className="flex items-center gap-2 text-[13px]">
                  <span className="font-bold text-white">
                    {resolvePlayerName(b.id, squad, bowlersInTable, bowlerSquad)}
                  </span>
                  <span className="flex-1 border-b-2 border-dashed border-[#6B7280]" />
                  <span className="text-white">
                    {b.runs} ({b.balls})
                  </span>
                </div>
              ))}
              {bowlerSnapshot && (
                <div className="flex items-center gap-2 text-[13px]">
                  <span className="font-bold text-white">
                    {resolvePlayerName(bowlerSnapshot.id, squad, bowlersInTable, bowlerSquad)}
                  </span>
                  <span className="flex-1 border-b-2 border-dashed border-[#6B7280]" />
                  <span className="text-white">
                    {ballsToOvers(bowlerSnapshot.balls)} - {bowlerSnapshot.maidens} - {bowlerSnapshot.runs} -{' '}
                    {bowlerSnapshot.wickets}
                  </span>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Over / runs / score footer */}
      <div className="flex flex-wrap items-center justify-between gap-4 px-4 py-3">
        <span className="text-[12px] font-bold text-[#DA9811]">
          Overs: <span className="font-bold text-white">{completedOvers}</span>
        </span>
        <span className="text-[12px] font-bold text-[#DA9811]">
          Runs: <span className="font-bold text-white">{overRuns}</span>
        </span>
        <span className="text-[12px] font-bold text-[#DA9811]">
          Score:{' '}
          <span className="font-bold text-white">
            {cumulativeRuns}-{cumulativeWickets}
          </span>
        </span>
      </div>
    </div>
  );
}

// ─── Ball list + over summaries (derived from ballHistory) ────────────────────
//
// Returns { ballListWithMeta, overSummaries }.
// Extras (wd/nb) do not count toward the 6 legal balls; summary appears only after 6 legal deliveries.

function buildBallListWithMetaAndOverSummaries(ballHistory) {
  const list = [];
  const summaries = new Map();

  let validCount = 0;
  let currentOverIdx = 0;
  let cumulativeRuns = 0;
  let cumulativeWickets = 0;
  let currentOverBalls = [];
  let currentOverRuns = 0;

  const batsmanStatsMap = new Map();
  const bowlerStatsMap = new Map();
  const activeBatsmen = [];
  let currentOverBowlerId = null;
  let currentOverBowlerRuns = 0;

  (ballHistory || []).forEach((ball) => {
    const isExtra = ball.type === 'wd' || ball.type === 'nb';
    const isLegal = !isExtra;
    const ballRuns = ball.runs ?? 0;
    const strikerId = ball.strikerId ?? ball.striker?.id;
    const bowlerId = ball.bowlerId;

    // Batsman: track runs/balls and who is on crease
    if (strikerId) {
      if (!activeBatsmen.find((b) => b.id === strikerId)) {
        activeBatsmen.push({ id: strikerId });
      }
      if (!batsmanStatsMap.has(strikerId)) {
        batsmanStatsMap.set(strikerId, { runs: 0, balls: 0 });
      }
      const bs = batsmanStatsMap.get(strikerId);
      if (ball.type === 'runs') bs.runs += ballRuns;
      if (isLegal) bs.balls += 1;
    }
    if (ball.type === 'out') {
      const outId = ball.striker?.id ?? strikerId;
      if (outId) {
        const idx = activeBatsmen.findIndex((b) => b.id === outId);
        if (idx !== -1) activeBatsmen.splice(idx, 1);
      }
    }

    // Bowler: track balls, runs, wickets, maidens
    if (bowlerId) {
      if (!bowlerStatsMap.has(bowlerId)) {
        bowlerStatsMap.set(bowlerId, { balls: 0, runs: 0, wickets: 0, maidens: 0 });
      }
      const bws = bowlerStatsMap.get(bowlerId);
      bws.runs += ballRuns;
      if (isLegal) bws.balls += 1;
      if (ball.type === 'out') bws.wickets += 1;
      currentOverBowlerId = bowlerId;
      currentOverBowlerRuns += ballRuns;
    }

    cumulativeRuns += ballRuns;
    if (ball.type === 'out') cumulativeWickets += 1;
    currentOverRuns += ballRuns;
    currentOverBalls.push(ball);

    if (isLegal) validCount += 1;

    const overBallLabel =
      validCount > 0 ? `${Math.floor((validCount - 1) / 6) + 1}.${((validCount - 1) % 6) + 1}` : '0.0';

    list.push({ ball, overBallLabel, validCount, overIndex: currentOverIdx });

    if (isLegal && validCount % 6 === 0) {
      if (
        currentOverBowlerId &&
        bowlerStatsMap.has(currentOverBowlerId) &&
        currentOverBowlerRuns === 0
      ) {
        bowlerStatsMap.get(currentOverBowlerId).maidens += 1;
      }

      const creaseSnapshot = activeBatsmen.slice(-2).map(({ id }) => {
        const stats = batsmanStatsMap.get(id) ?? { runs: 0, balls: 0 };
        return { id, runs: stats.runs, balls: stats.balls };
      });

      let bowlerSnapshot = null;
      if (currentOverBowlerId && bowlerStatsMap.has(currentOverBowlerId)) {
        const bws = bowlerStatsMap.get(currentOverBowlerId);
        bowlerSnapshot = {
          id: currentOverBowlerId,
          balls: bws.balls,
          runs: bws.runs,
          wickets: bws.wickets,
          maidens: bws.maidens,
        };
      }

      summaries.set(currentOverIdx, {
        balls: [...currentOverBalls],
        overRuns: currentOverRuns,
        cumulativeRuns,
        cumulativeWickets,
        completedOvers: validCount / 6,
        creaseSnapshot,
        bowlerSnapshot,
      });

      currentOverIdx += 1;
      currentOverBalls = [];
      currentOverRuns = 0;
      currentOverBowlerId = null;
      currentOverBowlerRuns = 0;
    }
  });

  return { ballListWithMeta: list, overSummaries: summaries };
}

// ─── Main component ────────────────────────────────────────────────────────

export function BallsTab({
  match,
  ballHistory = [],
  squad = [],
  bowlersInTable = [],
  bowlerSquad = [],
  batsmenOnCrease = [],
  liveScore: liveScoreProp,
}) {
  const [activeInnings, setActiveInnings] = useState('1');
  const liveScore = liveScoreProp ?? DEFAULT_LIVE_SCORE;

  const { ballListWithMeta, overSummaries } = useMemo(
    () => buildBallListWithMetaAndOverSummaries(ballHistory),
    [ballHistory],
  );

  const isEndOfOver = (validCount) => validCount > 0 && validCount % 6 === 0;

  const isEmpty =
    ballListWithMeta.length === 0 && !batsmenOnCrease.length && !bowlersInTable.length;

  return (
    <div className="mt-4 flex flex-col pb-8">
      {/* Innings tabs */}
      <div className="flex justify-center gap-6 pb-2">
        <button
          type="button"
          onClick={() => setActiveInnings('1')}
          className={`text-[14px] uppercase tracking-wide ${activeInnings === '1' ? INNINGS_ACTIVE_CLASS : INNINGS_INACTIVE_CLASS}`}
        >
          1st Innings
        </button>
        <button
          type="button"
          onClick={() => setActiveInnings('2')}
          className={`text-[14px] uppercase tracking-wide ${activeInnings === '2' ? INNINGS_ACTIVE_CLASS : INNINGS_INACTIVE_CLASS}`}
        >
          2nd Innings
        </button>
      </div>

      {activeInnings === '1' && (
        <div className="mt-4 flex flex-col gap-2">
          {isEmpty ? (
            <p className="py-6 text-center text-[13px] text-[#A2A6AB]">No balls recorded yet.</p>
          ) : (
            ballListWithMeta.map(({ ball, overBallLabel, validCount, overIndex }, idx) => (
              <Fragment key={`ball-${idx}`}>
                <BallListRow
                  overBallLabel={overBallLabel}
                  ball={ball}
                  squad={squad}
                  bowlersInTable={bowlersInTable}
                  bowlerSquad={bowlerSquad}
                  getBallDisplay={getBallDisplay}
                  getBallDescription={getBallDescription}
                  getStrikerName={getStrikerName}
                  getBowlerName={getBowlerName}
                />
                {isEndOfOver(validCount) && overSummaries.has(overIndex) && (
                  <SummaryBlock
                    summary={overSummaries.get(overIndex)}
                    squad={squad}
                    bowlersInTable={bowlersInTable}
                    bowlerSquad={bowlerSquad}
                  />
                )}
              </Fragment>
            ))
          )}
        </div>
      )}

      {activeInnings === '2' && (
        <p className="py-8 text-center text-[13px] text-[#A2A6AB]">2nd innings – coming soon.</p>
      )}
    </div>
  );
}
