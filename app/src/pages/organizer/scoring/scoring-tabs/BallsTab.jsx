/**
 * BallsTab
 *
 * Ball-by-ball timeline for both innings.
 *
 * Displays each delivery with:
 *   • Ball chip (coloured label: W / 4 / 6 / NB / WD / B / LB / RH)
 *   • FREE HIT badge on free-hit deliveries (Law 21.18)
 *   • Penalty run indicator (Law 41.17)
 *   • Retired hurt indicator
 *   • Striker → Bowler label
 *   • Textual description (e.g. "Wide", "No ball", "Bowled by X")
 * Inserts an over-summary card after every 6 legal deliveries.
 */

import { Fragment, useMemo, useState } from 'react';

import { CLOUDFRONT_APP_BASE } from '@/lib/constants/assets';
import {
  ballsToOvers,
  buildBallListWithMetaAndOverSummaries,
  extraBallLabel,
} from '@/lib/utils/scoringUtils';

const ARROW_RIGHT_ORANGE = `${CLOUDFRONT_APP_BASE}/images/icons/arrow-right-orange.svg`;

const DASH = '—';

const INNINGS_ACTIVE_CLASS =
  'text-[#DA9811] font-bold border-b-2 border-[#DA9811] pb-1';
const INNINGS_INACTIVE_CLASS = 'text-white font-bold';

// ─── Ball display helpers ─────────────────────────────────────────────────────

function getBallDisplay(ball) {
  if (!ball) return { label: '0', variant: 'dot' };
  switch (ball.type) {
    case 'runs': {
      const r = ball.runs ?? 0;
      if (r === 0) return { label: '0', variant: 'dot' };
      if (r === 4) return { label: '4', variant: 'four' };
      if (r === 6) return { label: '6', variant: 'six' };
      return { label: String(r), variant: 'runs' };
    }
    case 'out':
      return { label: 'W', variant: 'wicket' };
    case 'retired_hurt':
      return { label: 'RH', variant: 'retired' };
    case 'wd':
      return { label: extraBallLabel('wd', ball.runs), variant: 'extra' };
    case 'nb':
      return { label: extraBallLabel('nb', ball.runs), variant: 'extra' };
    case 'bye':
      return { label: extraBallLabel('bye', ball.runs), variant: 'extra' };
    case 'lb':
      return { label: extraBallLabel('lb', ball.runs), variant: 'extra' };
    case 'penalty': {
      const pr = ball.penaltyRuns ?? 0;
      return { label: pr > 0 ? `P${pr}` : 'P', variant: 'extra' };
    }
    default:
      return { label: '0', variant: 'dot' };
  }
}

function getBallDescription(ball) {
  if (!ball) return DASH;
  switch (ball.type) {
    case 'out': {
      const label = ball.dismissalLabel;
      return label ? `Wicket — ${label}` : 'Wicket';
    }
    case 'retired_hurt':
      return 'Retired hurt';
    case 'runs': {
      const r = ball.runs ?? 0;
      const penalty = ball.penaltyRuns ? ` (+${ball.penaltyRuns} penalty)` : '';
      if (r === 0) return `Dot ball${penalty}`;
      if (r === 4) return `Four${penalty}`;
      if (r === 6) return `Six${penalty}`;
      return `${r} run${r !== 1 ? 's' : ''}${penalty}`;
    }
    case 'wd': {
      const penalty = ball.penaltyRuns ? ` (+${ball.penaltyRuns} penalty)` : '';
      return ball.runs > 1
        ? `Wide — ${ball.runs} runs${penalty}`
        : `Wide${penalty}`;
    }
    case 'nb': {
      const penalty = ball.penaltyRuns ? ` (+${ball.penaltyRuns} penalty)` : '';
      return ball.runs > 1
        ? `No ball — ${ball.runs} runs${penalty}`
        : `No ball${penalty}`;
    }
    case 'bye':
      return (ball.runs ?? 0) > 0 ? `Bye — ${ball.runs} runs` : 'Bye';
    case 'lb':
      return (ball.runs ?? 0) > 0 ? `Leg bye — ${ball.runs} runs` : 'Leg bye';
    case 'penalty': {
      const pr = ball.penaltyRuns ?? 0;
      return pr > 0 ? `Penalty — ${pr} runs` : 'Penalty';
    }
    default:
      return DASH;
  }
}

function chipBgClass(variant, isFreeHit) {
  const ring = isFreeHit ? ' ring-2 ring-[#DA9811]' : '';
  switch (variant) {
    case 'wicket':
      return `bg-red-600 text-white${ring}`;
    case 'retired':
      return `bg-[#6B7280] text-white${ring}`;
    case 'four':
      return `bg-[#22C55E] text-white${ring}`;
    case 'six':
      return `bg-[#A855F7] text-white${ring}`;
    case 'extra':
      return `bg-[#1E1E1C] border border-[#DA9811] text-white${ring}`;
    case 'dot':
      return `border-2 border-[#3B3B35] bg-[#141412] text-white/60${ring}`;
    default:
      return `bg-[#DA9811] text-[#080807]${ring}`;
  }
}

function formatDescription(desc) {
  if (!desc || typeof desc !== 'string') return desc;
  const byIndex = desc.lastIndexOf(' by ');
  if (byIndex === -1) return desc;
  return (
    <>
      {desc.slice(0, byIndex + 4)}
      <span className="font-semibold text-white">
        {desc.slice(byIndex + 4)}
      </span>
    </>
  );
}

// ─── Player name helpers ──────────────────────────────────────────────────────

function getStrikerName(ball, squad) {
  if (
    (ball.type === 'out' || ball.type === 'retired_hurt') &&
    ball.striker?.name
  ) {
    return ball.striker.name;
  }
  if (ball.strikerId && squad?.length) {
    const p = squad.find((s) => String(s.id) === String(ball.strikerId));
    return p?.name ?? DASH;
  }
  return DASH;
}

function getBowlerName(ball, bowlersInTable, bowlerSquad) {
  const id = ball.bowlerId;
  if (!id) return DASH;
  const inTable = bowlersInTable?.find((b) => String(b.id) === String(id));
  if (inTable?.name) return inTable.name;
  const inSquad = bowlerSquad?.find((b) => String(b.id) === String(id));
  return inSquad?.name ?? DASH;
}

function resolvePlayerName(id, squad, bowlersInTable, bowlerSquad) {
  if (!id) return DASH;
  const src = [squad, bowlersInTable, bowlerSquad];
  for (const list of src) {
    const found = list?.find((p) => String(p.id) === String(id));
    if (found?.name) return found.name;
  }
  return DASH;
}

// ─── Ball row ─────────────────────────────────────────────────────────────────

function BallListRow({
  overBallLabel,
  ball,
  squad,
  bowlersInTable,
  bowlerSquad,
}) {
  const { label, variant } = getBallDisplay(ball);
  const isFreeHit = Boolean(ball?.isFreeHit);
  const penaltyRuns = ball?.penaltyRuns ?? 0;
  const strikerName = getStrikerName(ball, squad);
  const bowlerName = getBowlerName(ball, bowlersInTable, bowlerSquad);
  const description = getBallDescription(ball);

  return (
    <div className="flex items-center gap-3 px-4 py-3">
      {/* Over.ball label */}
      <span className="w-5 shrink-0 text-[13px] font-medium text-[#9CA3AF]">
        {overBallLabel}
      </span>

      {/* Ball chip */}
      <div className="relative shrink-0">
        <span
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${chipBgClass(variant, isFreeHit)}`}
        >
          {label}
        </span>
        {/* Free Hit micro badge */}
        {isFreeHit && (
          <span
            className="absolute -top-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[#DA9811] text-[7px] font-black text-[#080807]"
            title="Free Hit"
            aria-label="Free Hit delivery"
          >
            ⚡
          </span>
        )}
        {/* Penalty runs micro badge */}
        {penaltyRuns > 0 && (
          <span
            className="absolute -right-1 -bottom-1 flex h-3.5 min-w-[14px] items-center justify-center rounded-full bg-[#EF4444] px-0.5 text-[7px] font-black text-white"
            title={`${penaltyRuns} penalty runs`}
            aria-label={`${penaltyRuns} penalty runs`}
          >
            P{penaltyRuns}
          </span>
        )}
      </div>

      {/* Striker → Bowler */}
      <span className="flex shrink-0 items-center gap-1.5 text-[12px] font-bold text-white">
        {strikerName !== DASH && (
          <span className="shrink-0">{strikerName}</span>
        )}
        <img
          src={ARROW_RIGHT_ORANGE}
          alt=""
          className="h-2 w-auto shrink-0"
          aria-hidden
        />
        <span className="shrink-0">{bowlerName}</span>
      </span>

      {/* Spacer */}
      <span className="min-w-[8px] flex-1 self-center border-b-2 border-dotted border-[#6B7280]" />

      {/* Description */}
      <span className="shrink-0 text-right text-[12px] text-[#9CA3AF]">
        {formatDescription(description)}
      </span>
    </div>
  );
}

// ─── Over summary block ───────────────────────────────────────────────────────

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
      {/* Ball chips */}
      {balls.length > 0 && (
        <div className="mb-4 flex flex-wrap justify-center gap-3">
          {balls.map((b, i) => {
            const { label } = getBallDisplay(b);
            return (
              <span
                key={i}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#A2A6AB] text-[11px] font-bold text-[#A2A6AB]"
              >
                {label}
              </span>
            );
          })}
        </div>
      )}

      {/* Batsmen / bowler stats at end of over */}
      {creaseSnapshot.length > 0 && (
        <div className="mb-4 space-y-2">
          {creaseSnapshot.length >= 2 ? (
            <>
              <SnapRow
                name={resolvePlayerName(
                  creaseSnapshot[0].id,
                  squad,
                  bowlersInTable,
                  bowlerSquad,
                )}
                value={`${creaseSnapshot[0].runs} (${creaseSnapshot[0].balls})`}
                rightName={resolvePlayerName(
                  creaseSnapshot[1].id,
                  squad,
                  bowlersInTable,
                  bowlerSquad,
                )}
              />
              <SnapRow
                name={resolvePlayerName(
                  creaseSnapshot[1].id,
                  squad,
                  bowlersInTable,
                  bowlerSquad,
                )}
                value={`${creaseSnapshot[1].runs} (${creaseSnapshot[1].balls})`}
                rightContent={
                  bowlerSnapshot
                    ? `${ballsToOvers(bowlerSnapshot.balls)} – ${bowlerSnapshot.maidens} – ${bowlerSnapshot.runs} – ${bowlerSnapshot.wickets}`
                    : null
                }
              />
            </>
          ) : (
            <>
              {creaseSnapshot.map((b, i) => (
                <SnapRow
                  key={b.id ?? i}
                  name={resolvePlayerName(
                    b.id,
                    squad,
                    bowlersInTable,
                    bowlerSquad,
                  )}
                  value={`${b.runs} (${b.balls})`}
                />
              ))}
              {bowlerSnapshot && (
                <SnapRow
                  name={resolvePlayerName(
                    bowlerSnapshot.id,
                    squad,
                    bowlersInTable,
                    bowlerSquad,
                  )}
                  value={`${ballsToOvers(bowlerSnapshot.balls)} – ${bowlerSnapshot.maidens} – ${bowlerSnapshot.runs} – ${bowlerSnapshot.wickets}`}
                />
              )}
            </>
          )}
        </div>
      )}

      {/* Over footer */}
      <div className="flex flex-wrap items-center justify-between gap-4 px-4 py-3">
        <StatChip label="Overs" value={completedOvers} />
        <StatChip label="Runs" value={overRuns} />
        <StatChip
          label="Score"
          value={`${cumulativeRuns}-${cumulativeWickets}`}
        />
      </div>
    </div>
  );
}

function SnapRow({ name, value, rightName, rightContent }) {
  return (
    <div className="flex items-center gap-2 text-[13px]">
      <span className="font-bold text-white">{name}</span>
      <span className="flex-1 border-b-2 border-dashed border-[#6B7280]" />
      <span className="text-white">{value}</span>
      {rightName && <span className="font-bold text-white">{rightName}</span>}
      {rightContent && <span className="text-white">{rightContent}</span>}
    </div>
  );
}

function StatChip({ label, value }) {
  return (
    <span className="text-[12px] font-bold text-[#DA9811]">
      {label}: <span className="font-bold text-white">{value}</span>
    </span>
  );
}

function isEndOfOver(validCount) {
  return validCount > 0 && validCount % 6 === 0;
}

// ─── Main component ───────────────────────────────────────────────────────────

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

  const renderInnings = (list, summaries, sq, bowlerTbl, bowlerSq) => {
    if (list.length === 0) {
      return (
        <p className="py-6 text-center text-[13px] text-[#A2A6AB]">
          No balls recorded yet.
        </p>
      );
    }

    return list.map(({ ball, overBallLabel, validCount, overIndex }, idx) => (
      <Fragment key={ball.id ?? `ball-${idx}`}>
        <BallListRow
          overBallLabel={overBallLabel}
          ball={ball}
          squad={sq}
          bowlersInTable={bowlerTbl}
          bowlerSquad={bowlerSq}
        />
        {isEndOfOver(validCount) && summaries[overIndex] && (
          <SummaryBlock
            summary={summaries[overIndex]}
            squad={sq}
            bowlersInTable={bowlerTbl}
            bowlerSquad={bowlerSq}
          />
        )}
      </Fragment>
    ));
  };

  return (
    <div className="mt-4 flex flex-col pb-8">
      {/* Innings tabs */}
      <div className="flex justify-center gap-6 pb-2">
        {['1', '2'].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => setActiveInnings(n)}
            className={`text-[14px] tracking-wide uppercase ${activeInnings === n ? INNINGS_ACTIVE_CLASS : INNINGS_INACTIVE_CLASS}`}
          >
            {n === '1' ? '1st' : '2nd'} Innings
          </button>
        ))}
      </div>

      {/* Ball list */}
      <div className="mt-4 flex flex-col gap-2">
        {activeInnings === '1'
          ? renderInnings(
              ballListWithMeta,
              overSummaries,
              squad,
              bowlersInTable,
              bowlerSquad,
            )
          : renderInnings(
              ballListSecond,
              overSummariesSecond,
              secondInningsSquad.length ? secondInningsSquad : squad,
              secondInningsBowlersInTable,
              secondInningsBowlerSquad.length
                ? secondInningsBowlerSquad
                : bowlerSquad,
            )}
      </div>
    </div>
  );
}
