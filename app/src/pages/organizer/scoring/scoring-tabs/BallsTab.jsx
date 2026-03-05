/**
 * Balls tab – ball-by-ball view with 1st/2nd innings tabs, event list, and current over summary.
 * Uses ballHistory, squad, bowlersInTable, bowlerSquad, batsmenOnCrease, liveScore from ScoringMatch.
 */

import { useMemo, useState, Fragment } from 'react';

import arrowRightOrange from '@/assets/images/icons/arrow-right-orange.svg';
import { ballsToOvers } from '../scoringUtils';

// ─── Constants ─────────────────────────────────────────────────────────────

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

const DASH = '—';

/** Ball display: label and chip style per design (solid orange for W/runs, outlined for dot/extras). */
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

/** Short event description for list row. */
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

/** Resolve striker name from ball (out has striker obj, runs has strikerId). */
function getStrikerName(ball, squad) {
  if (ball.type === 'out' && ball.striker?.name) return ball.striker.name;
  if (ball.strikerId && squad?.length) {
    const p = squad.find((s) => s.id === ball.strikerId);
    return p?.name ?? DASH;
  }
  return DASH;
}

/** Resolve bowler name from bowlerId (bowlersInTable then bowlerSquad). */
function getBowlerName(ball, bowlersInTable, bowlerSquad) {
  const id = ball.bowlerId;
  if (!id) return DASH;
  const inTable = bowlersInTable?.find((b) => b.id === id);
  if (inTable?.name) return inTable.name;
  const inSquad = bowlerSquad?.find((b) => b.id === id);
  return inSquad?.name ?? DASH;
}

/** Split description so "Caught by Ted" renders with "Ted" in bold (per design). */
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

  // Per design: Wicket and runs = solid orange circle, thin white border, white text. Dot = outlined orange, white interior, white 0.
  const chipClass = isWicket || (label !== '0' && !isDot && !isExtra)
    ? 'bg-[#DA9811] border border-white text-white'
    : isDot || isExtra
      ? 'border-2 border-[#DA9811] bg-[#141412] text-white'
      : 'bg-[#DA9811] border border-white text-white';

  return (
    <div className="flex items-center gap-3 rounded-lg bg-[#141412] px-4 py-3">
      <span className="w-10 shrink-0 text-[13px] font-medium text-[#9CA3AF]">{overBallLabel}</span>
      <span
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[12px] font-bold ${chipClass}`}
      >
        {label}
      </span>
      <span className="flex shrink-0 items-center gap-1.5 text-[13px] text-[#9CA3AF]">
        {strikerName}
        <img src={arrowRightOrange} alt="" className="h-2 w-auto shrink-0" aria-hidden />
        {bowlerName}
      </span>
      <span className="min-w-[8px] flex-1 self-center border-b-2 border-dotted border-[#6B7280]" />
      <span className="shrink-0 text-right text-[12px] text-[#9CA3AF]">
        {formatDescription(description)}
      </span>
    </div>
  );
}

// ─── Component ─────────────────────────────────────────────────────────────

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

  // ─── Derived: ball list in chronological order with over.ball index ─────────

  const ballListWithMeta = useMemo(() => {
    const list = [];
    let validCount = 0;
    (ballHistory || []).forEach((ball) => {
      const isValid = ball.type !== 'wd' && ball.type !== 'nb';
      if (isValid) validCount += 1;
      const overNum = Math.floor((validCount - 1) / 6) + 1;
      const ballInOver = ((validCount - 1) % 6) + 1;
      const overBallLabel = validCount > 0 ? `${overNum}.${ballInOver}` : '0.0';
      list.push({
        ball,
        overBallLabel,
        validCount,
      });
    });
    return list;
  }, [ballHistory]);

  /** Total valid deliveries (for "one complete over" check). */
  const totalValidDeliveries = useMemo(() => {
    return (ballListWithMeta.length && ballListWithMeta[ballListWithMeta.length - 1]?.validCount) ?? 0;
  }, [ballListWithMeta]);

  const hasOneCompleteOver = totalValidDeliveries >= 6;

  /** Last 6 balls (for summary chips) – when we have at least one complete over. */
  const recentBalls = useMemo(() => {
    if (!hasOneCompleteOver) return [];
    const len = ballHistory?.length ?? 0;
    if (len === 0) return [];
    const start = Math.max(0, len - 6);
    return (ballHistory || []).slice(start);
  }, [ballHistory, hasOneCompleteOver]);

  /** Whether this ball is the last delivery of an over (validCount 6, 12, 18, …). */
  const isEndOfOver = (validCount) => validCount > 0 && validCount % 6 === 0;

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="mt-4 flex flex-col pb-8">
      {/* Innings tabs */}
      <div className="flex gap-6 justify-center pb-2">
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
        <>
          {/* Ball-by-ball list in chronological order; summary block after every complete over */}
          <div className="mt-4 flex flex-col gap-2">
            {ballListWithMeta.length === 0 && !batsmenOnCrease.length && !bowlersInTable.length ? (
              <p className="py-6 text-center text-[13px] text-[#A2A6AB]">No balls recorded yet.</p>
            ) : (
              <>
                {ballListWithMeta.map(({ ball, overBallLabel, validCount }, idx) => (
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
                    {/* Summary block after each complete over (after 1.6, 2.6, 3.6, …) */}
                    {isEndOfOver(validCount) && hasOneCompleteOver && (
                      <div key={`summary-after-${idx}`} className="rounded-xl bg-[#1C1C1A] p-4">
                        {recentBalls.length > 0 && (
                          <div className="mb-4 flex flex-wrap gap-2">
                            {recentBalls.map((b, i) => {
                              const { label, isWicket, isDot, isExtra } = getBallDisplay(b);
                              const chipClass = isWicket || (label !== '0' && !isDot && !isExtra)
                                ? 'bg-[#DA9811] border border-white text-white'
                                : 'border-2 border-[#DA9811] bg-[#1C1C1A] text-white';
                              return (
                                <span
                                  key={i}
                                  className={`flex h-8 w-8 items-center justify-center rounded-full text-[12px] font-bold ${chipClass}`}
                                >
                                  {label}
                                </span>
                              );
                            })}
                          </div>
                        )}
                        {batsmenOnCrease.length > 0 && (
                          <div className="mb-3 space-y-1">
                            {batsmenOnCrease.map((b, i) => (
                              <div key={b.id ?? i} className="text-[13px]">
                                <span className="text-white">{b.name ?? DASH}</span>
                                <span className="ml-2 text-[#9CA3AF]">
                                  {b.runs ?? 0} ({(b.balls ?? 0)})
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                        {bowlersInTable.length > 0 && (
                          <div className="mb-4 text-[13px]">
                            {bowlersInTable.map((b, i) => (
                              <div key={b.id ?? i}>
                                <span className="text-white">{b.name ?? DASH}</span>
                                <span className="ml-2 text-[#9CA3AF]">
                                  {ballsToOvers(b.balls ?? 0)} - {b.maidens ?? 0} - {b.runs ?? 0} - {b.wickets ?? 0}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                        <div className="flex flex-wrap items-center gap-4 rounded-lg bg-[#141412] px-4 py-3">
                          <span className="text-[12px] text-white">
                            Overs: <span className="font-bold text-[#DA9811]">{liveScore.oversDisplay}</span>
                          </span>
                          <span className="text-[12px] text-white">
                            Runs: <span className="font-bold text-[#DA9811]">{liveScore.totalRuns}</span>
                          </span>
                          <span className="text-[12px] text-white">
                            Score:{' '}
                            <span className="font-bold text-[#DA9811]">
                              {liveScore.totalRuns}-{liveScore.totalWickets}
                            </span>
                          </span>
                        </div>
                      </div>
                    )}
                  </Fragment>
                ))}
              </>
            )}
          </div>
        </>
      )}

      {activeInnings === '2' && (
        <p className="py-8 text-center text-[13px] text-[#A2A6AB]">2nd innings – coming soon.</p>
      )}
    </div>
  );
}
