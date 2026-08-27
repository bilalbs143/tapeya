import { Fragment, useCallback, useMemo, useState } from 'react';

import { FreeHitMicroBadge } from '@/components/scoring/FreeHitIndicator';
import { useDialog } from '@/context/DialogContext';
import { useScoringMatch } from '@/context/ScoringMatchContext';
import { useMatchSquads } from '@/hooks/useMatchSquads';
import { useToast } from '@/hooks/useToast';
import { getApiErrorMessage } from '@/lib/apiErrors';
import { resolveBallChip } from '@/lib/utils/ballDisplay';
import { isBallDeletable, isBallRunsEditable } from '@/lib/utils/editBallUtils';
import { scorecardInningsToBallHistory } from '@/lib/utils/scoringMappers';
import { ballsToOvers, buildBallListWithMetaAndOverSummaries } from '@/lib/utils/scoringUtils';
import { useDeleteBallMutation, useGetScorecardQuery, useUpdateBallMutation } from '@/store/api/matchApi';

const DASH = '—';

const INNINGS_ACTIVE_CLASS = 'text-brand font-bold border-b-2 border-brand pb-1';
const INNINGS_INACTIVE_CLASS = 'text-white font-bold';

// ─── Ball description helpers ─────────────────────────────────────────────────

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
      return ball.runs > 1 ? `Wide — ${ball.runs} runs${penalty}` : `Wide${penalty}`;
    }
    case 'nb': {
      const penalty = ball.penaltyRuns ? ` (+${ball.penaltyRuns} penalty)` : '';
      return ball.runs > 1 ? `No ball — ${ball.runs} runs${penalty}` : `No ball${penalty}`;
    }
    case 'bye':
      return (ball.runs ?? 0) > 0 ? `Bye — ${ball.runs} runs` : 'Bye';
    case 'lb':
      return (ball.runs ?? 0) > 0 ? `Leg bye — ${ball.runs} runs` : 'Leg bye';
    case 'penalty': {
      const pr = ball.penaltyRuns ?? 0;
      return pr > 0 ? `Penalty — ${pr} runs` : 'Penalty';
    }
    case 'additional_runs': {
      const ar = ball.additionalRuns ?? 0;
      return ar > 0 ? `Additional runs — ${ar}` : 'Additional runs';
    }
    default: {
      return DASH;
    }
  }
}

function chipBgClass(variant) {
  switch (variant) {
    case 'wicket':
      return 'bg-red-600 text-white';
    case 'retired':
      return 'bg-[#6B7280] text-white';
    case 'four':
      return 'bg-brand text-ink';
    case 'six':
      return 'bg-[#A855F7] text-white';
    case 'extra':
      return 'bg-[#1E1E1C] border border-brand text-white';
    case 'dot':
      return 'border-2 border-[#3B3B35] bg-surface text-white/60';
    default:
      return 'bg-brand text-ink';
  }
}

function formatDescription(desc) {
  if (!desc || typeof desc !== 'string') return desc;
  const byIndex = desc.lastIndexOf(' by ');
  if (byIndex === -1) return desc;
  return (
    <>
      {desc.slice(0, byIndex + 4)}
      <span className="font-semibold text-white">{desc.slice(byIndex + 4)}</span>
    </>
  );
}

// ─── Player name helpers ──────────────────────────────────────────────────────

function getStrikerName(ball, squad) {
  if ((ball.type === 'out' || ball.type === 'retired_hurt') && ball.striker?.name) {
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

function BallListRow({ overBallLabel, ball, squad, bowlersInTable, bowlerSquad, canManage, onEdit, onDelete }) {
  const { label, variant } = resolveBallChip(ball, { dotStyle: 'zero' });
  const isFreeHit = Boolean(ball?.isFreeHit);
  const penaltyRuns = ball?.penaltyRuns ?? 0;
  const strikerName = getStrikerName(ball, squad);
  const bowlerName = getBowlerName(ball, bowlersInTable, bowlerSquad);
  const description = getBallDescription(ball);
  const showEdit = canManage && isBallRunsEditable(ball);
  const showDelete = canManage && isBallDeletable(ball);

  return (
    <div className="flex items-center gap-2 px-3 py-2.5">
      {/* Over.ball label */}
      <span className="w-4 shrink-0 text-[11px] font-medium text-[#9CA3AF]">{overBallLabel}</span>

      {/* Ball chip */}
      <div className="relative shrink-0">
        <span
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${chipBgClass(variant)}`}
        >
          {label}
        </span>
        {isFreeHit ? <FreeHitMicroBadge /> : null}
        {penaltyRuns > 0 && (
          <span
            className="absolute -right-1 -bottom-1 flex h-3 min-w-[12px] items-center justify-center rounded-full bg-[#EF4444] px-0.5 text-[6px] font-black text-white"
            title={`${penaltyRuns} penalty runs`}
            aria-label={`${penaltyRuns} penalty runs`}
          >
            P{penaltyRuns}
          </span>
        )}
      </div>

      {/* Striker → Bowler — truncates to prevent horizontal overflow */}
      <span className="min-w-0 flex-1 truncate text-[11px] font-semibold text-white">
        {strikerName !== DASH ? `${strikerName} → ${bowlerName}` : `→ ${bowlerName}`}
      </span>

      {(showEdit || showDelete) && (
        <div className="flex shrink-0 items-center gap-1">
          {showEdit && (
            <button
              type="button"
              onClick={() => onEdit?.(ball, overBallLabel)}
              aria-label="Edit ball"
              className="text-brand flex h-7 w-7 items-center justify-center rounded-full transition-colors active:bg-white/10"
            >
              <svg
                className="h-3.5 w-3.5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
            </button>
          )}
          {showDelete && (
            <button
              type="button"
              onClick={() => onDelete?.(ball, overBallLabel)}
              aria-label="Delete ball"
              className="flex h-7 w-7 items-center justify-center rounded-full text-[#EF4444] transition-colors active:bg-white/10"
            >
              <svg
                className="h-3.5 w-3.5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                <path d="M10 11v6M14 11v6" />
                <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
              </svg>
            </button>
          )}
        </div>
      )}

      {/* Description */}
      <span className="shrink-0 text-right text-[11px] text-[#9CA3AF]">{formatDescription(description)}</span>
    </div>
  );
}

// ─── Over summary block ───────────────────────────────────────────────────────

function SummaryBlock({ summary, squad, bowlersInTable, bowlerSquad }) {
  const { balls, overRuns, cumulativeRuns, cumulativeWickets, completedOvers, creaseSnapshot, bowlerSnapshot } = summary;

  return (
    <div className="bg-surface rounded-[17px] p-4">
      {/* Ball chips */}
      {balls.length > 0 && (
        <div className="mb-4 flex flex-wrap justify-center gap-3">
          {balls.map((b, i) => {
            const { label } = resolveBallChip(b, { dotStyle: 'zero' });
            return (
              <span
                key={i}
                className="text-muted flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#A2A6AB] text-[11px] font-bold"
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
                name={resolvePlayerName(creaseSnapshot[0].id, squad, bowlersInTable, bowlerSquad)}
                value={`${creaseSnapshot[0].runs} (${creaseSnapshot[0].balls})`}
                rightName={resolvePlayerName(creaseSnapshot[1].id, squad, bowlersInTable, bowlerSquad)}
              />
              <SnapRow
                name={resolvePlayerName(creaseSnapshot[1].id, squad, bowlersInTable, bowlerSquad)}
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
                  name={resolvePlayerName(b.id, squad, bowlersInTable, bowlerSquad)}
                  value={`${b.runs} (${b.balls})`}
                />
              ))}
              {bowlerSnapshot && (
                <SnapRow
                  name={resolvePlayerName(bowlerSnapshot.id, squad, bowlersInTable, bowlerSquad)}
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
        <StatChip label="Score" value={`${cumulativeRuns}-${cumulativeWickets}`} />
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
    <span className="text-brand text-[12px] font-bold">
      {label}: <span className="font-bold text-white">{value}</span>
    </span>
  );
}

function isEndOfOver(validCount) {
  return validCount > 0 && validCount % 6 === 0;
}

// ─── Main component ───────────────────────────────────────────────────────────

export function BallsTab() {
  const { matchId, innings1Id, innings2Id, matchComplete, canOperate } = useScoringMatch();
  const { data: scorecard } = useGetScorecardQuery(matchId, { skip: !matchId });
  const { innings1Squads, innings2Squads } = useMatchSquads();

  const innings1BallHistory = useMemo(
    () => (scorecard?.innings?.[0] ? scorecardInningsToBallHistory(scorecard.innings[0], innings1Squads.nameMap) : []),
    [scorecard?.innings, innings1Squads.nameMap],
  );
  const innings2BallHistory = useMemo(
    () => (scorecard?.innings?.[1] ? scorecardInningsToBallHistory(scorecard.innings[1], innings2Squads.nameMap) : []),
    [scorecard?.innings, innings2Squads.nameMap],
  );

  const innings1Squad = innings1Squads.battingSquad;
  const innings1BowlerSquad = innings1Squads.bowlingSquad;
  const innings1BowlersInTable = [];
  const innings2Squad = innings2Squads.battingSquad;
  const innings2BowlerSquad = innings2Squads.bowlingSquad;
  const innings2BowlersInTable = [];

  const innings1Editable = scorecard?.innings?.[0]?.status === 'completed';
  const innings2Editable = scorecard?.innings?.[1]?.status === 'completed' || matchComplete;
  const { openDialog } = useDialog();
  const toast = useToast();
  const [updateBall] = useUpdateBallMutation();
  const [deleteBall] = useDeleteBallMutation();
  const [activeInnings, setActiveInnings] = useState('1');

  const activeInningsId = activeInnings === '2' ? innings2Id : innings1Id;
  const canManageBalls = canOperate && (activeInnings === '2' ? innings2Editable : innings1Editable);

  const handleEditBall = useCallback(
    (ball, ballLabel) => {
      if (!matchId || activeInningsId == null || !ball?.id) return;
      openDialog('scoringEditBall', {
        ball,
        ballLabel,
        onSave: async (payload) => {
          try {
            await updateBall({
              matchId,
              inningsId: activeInningsId,
              ballId: ball.id,
              payload,
            }).unwrap();
            toast.success('Ball updated.');
          } catch (err) {
            toast.error(getApiErrorMessage(err, 'Ball not updated — try again.'));
          }
        },
      });
    },
    [openDialog, matchId, activeInningsId, updateBall, toast],
  );

  const handleDeleteBall = useCallback(
    (ball, ballLabel) => {
      if (!matchId || activeInningsId == null || !ball?.id) return;
      const label = ballLabel ? `Ball ${ballLabel}` : 'This ball';
      openDialog('confirm', {
        title: 'Delete Ball?',
        message: `${label} will be removed and the innings score recalculated. This cannot be undone.`,
        confirmLabel: 'Delete',
        onConfirm: async () => {
          try {
            await deleteBall({
              matchId,
              inningsId: activeInningsId,
              ballId: ball.id,
            }).unwrap();
            toast.success('Ball deleted.');
          } catch (err) {
            toast.error(getApiErrorMessage(err, 'Ball not deleted — try again.'));
            throw err;
          }
        },
      });
    },
    [openDialog, matchId, activeInningsId, deleteBall, toast],
  );

  const { ballListWithMeta, overSummaries } = useMemo(
    () => buildBallListWithMetaAndOverSummaries(innings1BallHistory),
    [innings1BallHistory],
  );

  const { ballListWithMeta: ballListSecond, overSummaries: overSummariesSecond } = useMemo(
    () => buildBallListWithMetaAndOverSummaries(innings2BallHistory ?? []),
    [innings2BallHistory],
  );

  const renderInnings = (list, summaries, sq, bowlerTbl, bowlerSq) => {
    if (list.length === 0) {
      return <p className="text-muted py-6 text-center text-[13px]">No balls recorded yet.</p>;
    }

    return list.map(({ ball, overBallLabel, validCount, overIndex }, idx) => (
      <Fragment key={ball.id ?? `ball-${idx}`}>
        <BallListRow
          overBallLabel={overBallLabel}
          ball={ball}
          squad={sq}
          bowlersInTable={bowlerTbl}
          bowlerSquad={bowlerSq}
          canManage={canManageBalls}
          onEdit={handleEditBall}
          onDelete={handleDeleteBall}
        />
        {isEndOfOver(validCount) && summaries[overIndex] && (
          <SummaryBlock summary={summaries[overIndex]} squad={sq} bowlersInTable={bowlerTbl} bowlerSquad={bowlerSq} />
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
          ? renderInnings(ballListWithMeta, overSummaries, innings1Squad, innings1BowlersInTable, innings1BowlerSquad)
          : renderInnings(
              ballListSecond,
              overSummariesSecond,
              innings2Squad.length ? innings2Squad : innings1Squad,
              innings2BowlersInTable,
              innings2BowlerSquad.length ? innings2BowlerSquad : innings1BowlerSquad,
            )}
      </div>
    </div>
  );
}
