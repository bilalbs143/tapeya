import { Fragment, useMemo, useState } from 'react';

import {
  ballsToOvers,
  buildBallListWithMetaAndOverSummaries,
} from '@/lib/utils/scoringUtils';

const CLOUDFRONT_APP_BASE = 'https://d1nmw2vhka3zp0.cloudfront.net/app';

const arrowRightOrange = `${CLOUDFRONT_APP_BASE}/images/icons/arrow-right-orange.svg`;

// ─── Constants ──────────────────────────────────────────────────────────────

const DASH = '—';

const INNINGS_ACTIVE_CLASS =
  'text-[#DA9811] font-bold border-b-2 border-[#DA9811] pb-1';
const INNINGS_INACTIVE_CLASS = 'text-white font-bold';

// ─── Module-level pure helpers ───────────────────────────────────────────────
// These never depend on component state and should not be recreated per render.

/** True when the validCount marks the end of a completed over (every 6th legal ball). */
function isEndOfOver(validCount) {
  return validCount > 0 && validCount % 6 === 0;
}

// ─── Ball display & description helpers ─────────────────────────────────────

function getBallDisplay(ball) {
  if (!ball)
    return { label: '0', isWicket: false, isDot: true, isExtra: false };
  if (ball.type === 'runs') {
    const r = ball.runs ?? 0;
    if (r === 0)
      return { label: '0', isWicket: false, isDot: true, isExtra: false };
    return { label: String(r), isWicket: false, isDot: false, isExtra: false };
  }
  if (ball.type === 'out')
    return { label: 'W', isWicket: true, isDot: false, isExtra: false };
  if (ball.type === 'wd')
    return {
      label: ball.runs > 1 ? `WD ${ball.runs}` : 'WD',
      isWicket: false,
      isDot: false,
      isExtra: true,
    };
  if (ball.type === 'nb')
    return {
      label: ball.runs > 1 ? `NB ${ball.runs}` : 'NB',
      isWicket: false,
      isDot: false,
      isExtra: true,
    };
  if (ball.type === 'bye')
    return {
      label: (ball.runs ?? 0) > 0 ? `B ${ball.runs}` : 'B',
      isWicket: false,
      isDot: false,
      isExtra: true,
    };
  if (ball.type === 'lb')
    return {
      label: (ball.runs ?? 0) > 0 ? `LB ${ball.runs}` : 'LB',
      isWicket: false,
      isDot: false,
      isExtra: true,
    };
  return { label: '0', isWicket: false, isDot: true, isExtra: false };
}

/**
 * Ball description for display. Dismissal label comes from backend (dismissal_type_label).
 */
function getBallDescription(ball) {
  if (!ball) return '—';
  if (ball.type === 'out') {
    const label = ball.dismissalLabel;
    return label ? `Wicket ${label}` : 'Wicket.';
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

// ─── Player name resolution ──────────────────────────────────────────────────

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

// ─── Ball list row (single delivery) ────────────────────────────────────────

/**
 * Fixed: removed getBallDisplay / getBallDescription / getStrikerName /
 * getBowlerName from props — they are module-level pure functions and are
 * now called directly inside the component.
 */
function BallListRow({
  overBallLabel,
  ball,
  squad,
  bowlersInTable,
  bowlerSquad,
}) {
  const { label, isWicket, isDot, isExtra } = getBallDisplay(ball);
  const strikerName = getStrikerName(ball, squad);
  const bowlerName = getBowlerName(ball, bowlersInTable, bowlerSquad);
  const description = getBallDescription(ball);

  const chipClass =
    isWicket || (label !== '0' && !isDot && !isExtra)
      ? 'bg-[#DA9811]'
      : 'border-2 border-[#DA9811] bg-[#141412] text-white';

  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <span className="w-5 shrink-0 text-[13px] font-medium text-[#9CA3AF]">
        {overBallLabel}
      </span>
      <span
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[12px] font-bold ${chipClass}`}
      >
        {label}
      </span>
      <span className="flex shrink-0 items-center gap-1.5 text-[12px] font-bold text-white">
        {strikerName !== DASH && (
          <span className="shrink-0">{strikerName}</span>
        )}
        <img
          src={arrowRightOrange}
          alt=""
          className="h-2 w-auto shrink-0"
          aria-hidden
        />
        <span className="shrink-0">{bowlerName}</span>
      </span>
      <span className="min-w-[8px] flex-1 self-center border-b-2 border-dotted border-[#6B7280]" />
      <span className="shrink-0 text-right text-[12px] text-[#9CA3AF]">
        {formatDescription(description)}
      </span>
    </div>
  );
}

// ─── Over summary block (stats at end of a completed over) ───────────────────

function SummaryBlock({ summary, squad, bowlersInTable, bowlerSquad }) {
  const {
    balls,
    overRuns,
    cumulativeRuns,
    cumulativeWickets,
    completedOvers,
    creaseSnapshot,
    bowlerSnapshot,
  } = summary;

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
      {/* Intentional: creaseSnapshot >= 2 shows two rows — first row: batsman 1 name + batsman 2 name + batsman 1 score; second row: batsman 2 name + batsman 2 score + bowler stats. */}
      {creaseSnapshot.length > 0 && (
        <div className="mb-4 space-y-2">
          {creaseSnapshot.length >= 2 ? (
            <>
              <div className="flex items-center gap-2 text-[13px]">
                <span className="font-bold text-white">
                  {resolvePlayerName(
                    creaseSnapshot[0].id,
                    squad,
                    bowlersInTable,
                    bowlerSquad,
                  )}
                </span>
                <span className="flex-1 border-b-2 border-dashed border-[#6B7280]" />
                <span className="text-white">
                  {creaseSnapshot[0].runs} ({creaseSnapshot[0].balls})
                </span>
                <span className="font-bold text-white">
                  {resolvePlayerName(
                    creaseSnapshot[1].id,
                    squad,
                    bowlersInTable,
                    bowlerSquad,
                  )}
                </span>
              </div>
              <div className="flex items-center gap-2 text-[13px]">
                <span className="font-bold text-white">
                  {resolvePlayerName(
                    creaseSnapshot[1].id,
                    squad,
                    bowlersInTable,
                    bowlerSquad,
                  )}
                </span>
                <span className="flex-1 border-b-2 border-dashed border-[#6B7280]" />
                <span className="text-white">
                  {creaseSnapshot[1].runs} ({creaseSnapshot[1].balls})
                </span>
                {bowlerSnapshot && (
                  <span className="text-white">
                    {ballsToOvers(bowlerSnapshot.balls)} -{' '}
                    {bowlerSnapshot.maidens} - {bowlerSnapshot.runs} -{' '}
                    {bowlerSnapshot.wickets}
                  </span>
                )}
              </div>
            </>
          ) : (
            <>
              {creaseSnapshot.map((b, i) => (
                <div
                  key={b.id ?? i}
                  className="flex items-center gap-2 text-[13px]"
                >
                  <span className="font-bold text-white">
                    {resolvePlayerName(
                      b.id,
                      squad,
                      bowlersInTable,
                      bowlerSquad,
                    )}
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
                    {resolvePlayerName(
                      bowlerSnapshot.id,
                      squad,
                      bowlersInTable,
                      bowlerSquad,
                    )}
                  </span>
                  <span className="flex-1 border-b-2 border-dashed border-[#6B7280]" />
                  <span className="text-white">
                    {ballsToOvers(bowlerSnapshot.balls)} -{' '}
                    {bowlerSnapshot.maidens} - {bowlerSnapshot.runs} -{' '}
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

export function BallsTab({
  ballHistory = [],
  squad = [],
  bowlersInTable = [],
  bowlerSquad = [],
  secondInningsBallHistory = [],
  secondInningsBowlersInTable = [],
  secondInningsSquad = [],
  secondInningsBowlerSquad = [],
}) {
  const [activeInnings, setActiveInnings] = useState('1');

  const { ballListWithMeta, overSummaries } = useMemo(
    () => buildBallListWithMetaAndOverSummaries(ballHistory),
    [ballHistory],
  );

  const {
    ballListWithMeta: ballListSecond,
    overSummaries: overSummariesSecond,
  } = useMemo(
    () => buildBallListWithMetaAndOverSummaries(secondInningsBallHistory ?? []),
    [secondInningsBallHistory],
  );

  const isEmpty = ballListWithMeta.length === 0;
  const isEmptySecond = (ballListSecond?.length ?? 0) === 0;

  return (
    <div className="mt-4 flex flex-col pb-8">
      {/* Innings tabs */}
      <div className="flex justify-center gap-6 pb-2">
        <button
          type="button"
          onClick={() => setActiveInnings('1')}
          className={`text-[14px] tracking-wide uppercase ${
            activeInnings === '1'
              ? INNINGS_ACTIVE_CLASS
              : INNINGS_INACTIVE_CLASS
          }`}
        >
          1st Innings
        </button>
        <button
          type="button"
          onClick={() => setActiveInnings('2')}
          className={`text-[14px] tracking-wide uppercase ${
            activeInnings === '2'
              ? INNINGS_ACTIVE_CLASS
              : INNINGS_INACTIVE_CLASS
          }`}
        >
          2nd Innings
        </button>
      </div>

      {/* 1st innings ball list */}
      {activeInnings === '1' && (
        <div className="mt-4 flex flex-col gap-2">
          {isEmpty ? (
            <p className="py-6 text-center text-[13px] text-[#A2A6AB]">
              No balls recorded yet.
            </p>
          ) : (
            ballListWithMeta.map(
              ({ ball, overBallLabel, validCount, overIndex }, idx) => (
                <Fragment key={ball.id ?? `ball-${idx}`}>
                  <BallListRow
                    overBallLabel={overBallLabel}
                    ball={ball}
                    squad={squad}
                    bowlersInTable={bowlersInTable}
                    bowlerSquad={bowlerSquad}
                  />
                  {isEndOfOver(validCount) && overSummaries[overIndex] && (
                    <SummaryBlock
                      summary={overSummaries[overIndex]}
                      squad={squad}
                      bowlersInTable={bowlersInTable}
                      bowlerSquad={bowlerSquad}
                    />
                  )}
                </Fragment>
              ),
            )
          )}
        </div>
      )}

      {/* 2nd innings ball list */}
      {activeInnings === '2' && (
        <div className="mt-4 flex flex-col gap-2">
          {isEmptySecond ? (
            <p className="py-6 text-center text-[13px] text-[#A2A6AB]">
              No balls recorded yet.
            </p>
          ) : (
            ballListSecond.map(
              ({ ball, overBallLabel, validCount, overIndex }, idx) => (
                <Fragment key={ball.id ?? `ball2-${idx}`}>
                  <BallListRow
                    overBallLabel={overBallLabel}
                    ball={ball}
                    squad={
                      secondInningsSquad?.length ? secondInningsSquad : squad
                    }
                    bowlersInTable={secondInningsBowlersInTable}
                    bowlerSquad={
                      secondInningsBowlerSquad?.length
                        ? secondInningsBowlerSquad
                        : bowlerSquad
                    }
                  />
                  {isEndOfOver(validCount) &&
                    overSummariesSecond[overIndex] && (
                      <SummaryBlock
                        summary={overSummariesSecond[overIndex]}
                        squad={
                          secondInningsSquad?.length
                            ? secondInningsSquad
                            : squad
                        }
                        bowlersInTable={secondInningsBowlersInTable}
                        bowlerSquad={
                          secondInningsBowlerSquad?.length
                            ? secondInningsBowlerSquad
                            : bowlerSquad
                        }
                      />
                    )}
                </Fragment>
              ),
            )
          )}
        </div>
      )}
    </div>
  );
}
