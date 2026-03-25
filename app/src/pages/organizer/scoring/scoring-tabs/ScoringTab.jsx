import { useEffect, useMemo, useRef, useState } from 'react';

import teamMatchIcon from '@/assets/images/icons/team-match-icon.svg';
import AddBatsmanDialog from '@/components/dialogs/scoring/AddBatsmanDialog';
import AddBowlerDialog from '@/components/dialogs/scoring/AddBowlerDialog';
import CustomScoreDialog from '@/components/dialogs/scoring/CustomScoreDialog';
import ExtraRunsDialog from '@/components/dialogs/scoring/ExtraRunsDialog';
import FielderPickerDialog from '@/components/dialogs/scoring/FielderPickerDialog';
import OutReasonDialog from '@/components/dialogs/scoring/OutReasonDialog';
import { BORDER, HEADER_BG } from '@/lib/constants/tableStyles';
import { useGetEnumsQuery } from '@/store/api/enumApi';
import {
  useStoreMatchSquadMutation,
  useStorePlayingElevenMutation,
} from '@/store/api/matchApi';
import { Button } from '@/ui/Button';

import { MatchStatsRow } from '../MatchStatsRow';
import {
  dismissalRequiresFielder,
  getDismissalOptions,
  getExtraTypeOptions,
  getShotPositionOptions,
} from '../scoringMappers';
import { ballsToOvers, getRunsFromBall } from '../scoringUtils';
import { ShotAreaDialog } from '../ShotAreaDialog';
import { blankBatsman, blankBowler } from './useInningsState';
import { useScoringEngine } from './useScoringEngine';

// ─── Constants ────────────────────────────────────────────────────────────────

const DASH = '—';
const VALID_DELIVERIES_PER_OVER = 6;

/**
 * Max bowlers in the live table at once.
 * MUST match the `>= 2` check in useScoringEngine so end-of-over rotation works.
 */
const MAX_BOWLERS_IN_TABLE = 2;

const RUN_BUTTON_BG = [
  '#10100F',
  '#171715',
  '#1F1F1C',
  '#282824',
  '#31312C',
  '#3B3B35',
  '#46463F',
];

function strikeRate(runs, balls) {
  if (!balls) return '0.0';
  return ((Number(runs) / Number(balls)) * 100).toFixed(1);
}

function economyRate(runs, overs) {
  if (!overs) return '0.0';
  return (Number(runs) / Number(overs)).toFixed(1);
}

function getBallDisplay(ball) {
  if (!ball) return { label: '•', variant: 'dot' };
  switch (ball.type) {
    case 'runs': {
      const r = ball.runs ?? 0;
      if (r === 0) return { label: '•', variant: 'dot' };
      if (r === 4) return { label: '4', variant: 'four' };
      if (r === 6) return { label: '6', variant: 'six' };
      return { label: String(r), variant: 'runs' };
    }
    case 'out':
      return { label: 'W', variant: 'wicket' };
    case 'wd':
      return {
        label: ball.runs > 1 ? `WD ${ball.runs}` : 'WD',
        variant: 'extra',
      };
    case 'nb':
      return {
        label: ball.runs > 1 ? `NB ${ball.runs}` : 'NB',
        variant: 'extra',
      };
    case 'bye':
      return {
        label: (ball.runs ?? 0) > 0 ? `B ${ball.runs}` : 'B',
        variant: 'extra',
      };
    case 'lb':
      return {
        label: (ball.runs ?? 0) > 0 ? `LB ${ball.runs}` : 'LB',
        variant: 'extra',
      };
    default:
      return { label: '•', variant: 'dot' };
  }
}

function ballChipClass(variant) {
  switch (variant) {
    case 'four':
      return 'bg-[#22C55E] text-white';
    case 'six':
      return 'bg-[#A855F7] text-white';
    case 'wicket':
      return 'bg-[#EF4444] text-white';
    default:
      return 'bg-[#2a2a28] text-[#E5E7EB]';
  }
}

function overOrdinal(n) {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

/**
 * All props describe the ACTIVE innings only.
 * ScoringMatch resolves which innings is active and passes these directly.
 *
 * @param {string}   matchId
 * @param {object}   match                  Full match config (for overs / playersPerSide)
 * @param {string}   inningsNumber          '1' | '2' — for header label only
 * @param {string}   battingTeamName        Display name for the batting team
 * @param {number}   battingTeamId          For API squad saves
 * @param {number}   bowlingTeamId          For API squad saves
 *
 * Scoring state — all from useInningsState of the active innings:
 * @param {object[]} ballHistory
 * @param {Function} setBallHistory
 * @param {object[]} batsmenOnCrease
 * @param {Function} setBatsmenOnCrease
 * @param {object[]} bowlersInTable
 * @param {Function} setBowlersInTable
 * @param {number}   strikerIndex
 * @param {Function} setStrikerIndex
 * @param {number}   currentBowlerIndex
 * @param {Function} setCurrentBowlerIndex
 * @param {object}   currentPartnership     { runs, balls }
 * @param {Function} setCurrentPartnership
 * @param {object[]} completedPartnerships
 * @param {Function} setCompletedPartnerships
 * @param {object[]} battingSquad           Players for batting team (role: 'playing'|'bench')
 * @param {Function} setBattingSquad
 * @param {object[]} bowlingSquad           Players for bowling team
 * @param {Function} setBowlingSquad
 * @param {object}   liveScore              From computeLiveScore(ballHistory)
 * @param {Function} onInningsComplete      Called when wickets or overs end this innings
 * @param {boolean}  isApiMatch
 * @param {Function} syncBallToApi
 * @param {Function} syncUndoToApi
 */
export function ScoringTab({
  matchId,
  match,
  matchComplete = false,
  inningsNumber = '1',
  battingTeamName,
  battingTeamId,
  bowlingTeamId,

  ballHistory = [],
  setBallHistory,
  batsmenOnCrease = [],
  setBatsmenOnCrease,
  bowlersInTable = [],
  setBowlersInTable,
  strikerIndex = 0,
  setStrikerIndex,
  currentBowlerIndex = 0,
  setCurrentBowlerIndex,
  currentPartnership = { runs: 0, balls: 0 },
  setCurrentPartnership,
  completedPartnerships = [],
  setCompletedPartnerships,
  battingSquad = [],
  setBattingSquad,
  bowlingSquad = [],
  setBowlingSquad,

  liveScore,
  onInningsComplete,
  /** Innings 2 only: target = first innings total + 1. Match ends when totalRuns >= targetScore. */
  targetScore,
  isApiMatch,
  syncBallToApi,
  syncUndoToApi,
}) {
  // ── Enum data ──────────────────────────────────────────────────────────────

  const { data: enums = {} } = useGetEnumsQuery();
  const [storeMatchSquad] = useStoreMatchSquadMutation();
  const [storePlayingEleven] = useStorePlayingElevenMutation();

  const dismissalOptions = useMemo(
    () => getDismissalOptions(enums.dismissal_type),
    [enums.dismissal_type],
  );
  const extraTypeOptions = useMemo(
    () => getExtraTypeOptions(enums.extra_type),
    [enums.extra_type],
  );
  const shotPositionOptions = useMemo(
    () => getShotPositionOptions(enums.shot_position),
    [enums.shot_position],
  );

  // ── UI-only dialog state ───────────────────────────────────────────────────

  const [addBatsmanOpen, setAddBatsmanOpen] = useState(false);
  const [addBowlerOpen, setAddBowlerOpen] = useState(false);
  const [savingBatsmanSquad, setSavingBatsmanSquad] = useState(false);
  const [savingBowlerSquad, setSavingBowlerSquad] = useState(false);
  const [outReasonModalOpen, setOutReasonModalOpen] = useState(false);
  const [customScoreDialogOpen, setCustomScoreDialogOpen] = useState(false);
  const [extraRunsDialogOpen, setExtraRunsDialogOpen] = useState(false);
  const [pendingExtraType, setPendingExtraType] = useState(
    /** @type {'wd'|'nb'|'bye'|'lb'|null} */ (null),
  );
  const [customScoreInput, setCustomScoreInput] = useState('');
  const [shotAreaDialogOpen, setShotAreaDialogOpen] = useState(false);
  const [pendingRunsForShot, setPendingRunsForShot] = useState(null);
  const [pendingDismissal, setPendingDismissal] = useState(null);
  const [fielderPickerOpen, setFielderPickerOpen] = useState(false);

  // ── Innings header ─────────────────────────────────────────────────────────

  const inningsLabel = inningsNumber === '2' ? '2nd Innings' : '1st Innings';
  const displayTeamName =
    battingTeamName ||
    (inningsNumber === '2'
      ? match?.teamB?.name || 'Team B'
      : match?.teamA?.name || 'Team A');

  // ── Over strip ─────────────────────────────────────────────────────────────
  //
  // An over = 6 LEGAL deliveries. WD and NB are shown in the over but do NOT
  // count toward the 6, so an over can have 6+ balls when there are extras.

  const oversFromBalls = useMemo(() => {
    const list = [];
    let currentOver = [];
    let validCount = 0;

    for (const ball of ballHistory) {
      currentOver.push(ball);
      if (ball.type !== 'wd' && ball.type !== 'nb') validCount += 1;

      if (validCount === VALID_DELIVERIES_PER_OVER) {
        const runs = currentOver.reduce((s, b) => s + getRunsFromBall(b), 0);
        list.push({ overIndex: list.length + 1, runs, balls: currentOver });
        currentOver = [];
        validCount = 0;
      }
    }
    if (currentOver.length > 0) {
      const runs = currentOver.reduce((s, b) => s + getRunsFromBall(b), 0);
      list.push({ overIndex: list.length + 1, runs, balls: currentOver });
    }
    return list;
  }, [ballHistory]);

  const overStatsScrollRef = useRef(null);
  useEffect(() => {
    const el = overStatsScrollRef.current;
    if (!el || ballHistory.length === 0) return;
    requestAnimationFrame(() => {
      el.scrollLeft = el.scrollWidth - el.clientWidth;
    });
  }, [ballHistory.length]);

  // ── Innings-end detection ──────────────────────────────────────────────────
  //
  // Fires onInningsComplete only when a SINGLE new live ball ends the innings.
  // Skips: batch API load (jump 0→N), innings switch (drop N→0), undo (N→N-1).
  //
  // CRITICAL FIX: refs reset when inningsNumber changes so that innings 2 with
  // pre-loaded balls from API does NOT immediately fire onInningsComplete.

  const baselineRef = useRef(ballHistory.length);
  const prevLengthRef = useRef(ballHistory.length);

  useEffect(() => {
    // Re-baseline whenever we switch to a new innings
    baselineRef.current = ballHistory.length;
    prevLengthRef.current = ballHistory.length;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inningsNumber]);

  useEffect(() => {
    const curr = ballHistory.length;
    const prev = prevLengthRef.current;
    if (curr !== prev) {
      // Non-live change (batch load / undo): shift baseline so detection skips it
      if (curr - prev !== 1) baselineRef.current = curr;
      prevLengthRef.current = curr;
    }
  }, [ballHistory.length]);

  useEffect(() => {
    if (!onInningsComplete) return;
    if (ballHistory.length <= baselineRef.current) return;

    const totalRuns = liveScore?.totalRuns ?? 0;
    // Innings 2: target achieved – chasing team wins
    if (targetScore != null && totalRuns >= targetScore) {
      onInningsComplete();
      return;
    }
    const maxWickets =
      match?.playersPerSide != null ? match.playersPerSide - 1 : undefined;
    const maxValidBalls =
      match?.overs != null ? Number(match.overs) * 6 : undefined;
    if (
      (maxWickets != null && (liveScore?.totalWickets ?? 0) >= maxWickets) ||
      (maxValidBalls != null &&
        (liveScore?.validDeliveries ?? 0) >= maxValidBalls)
    ) {
      onInningsComplete();
    }
  }, [
    liveScore?.totalRuns,
    liveScore?.totalWickets,
    liveScore?.validDeliveries,
    ballHistory.length,
    onInningsComplete,
    targetScore,
    match?.playersPerSide,
    match?.overs,
  ]);

  // ── Capacity flags ─────────────────────────────────────────────────────────

  const canAddMoreBatsmen = batsmenOnCrease.length < 2;
  // FIX (BUG-16): was `< 1` — prevented second bowler, broke end-of-over rotation
  const canAddMoreBowlers = bowlersInTable.length < MAX_BOWLERS_IN_TABLE;

  // ── Squad helpers ──────────────────────────────────────────────────────────

  const playersPerSide = match?.playersPerSide;
  const battingCount = battingSquad.filter((p) =>
    Number.isFinite(Number(p.id)),
  ).length;
  const bowlingCount = bowlingSquad.filter((p) =>
    Number.isFinite(Number(p.id)),
  ).length;
  const requiredBatting =
    playersPerSide != null
      ? Math.min(playersPerSide, battingCount)
      : battingCount;
  const requiredBowling =
    playersPerSide != null
      ? Math.min(playersPerSide, bowlingCount)
      : bowlingCount;

  const isPlayerBattingOrOut = (playerId) =>
    batsmenOnCrease.some((b) => b.id === playerId) ||
    ballHistory.some((b) => b.type === 'out' && b.striker?.id === playerId);

  const getBatsmanDisplayStats = (playerId) => {
    const onCrease = batsmenOnCrease.find((b) => b.id === playerId);
    if (onCrease) {
      const { runs = 0, balls = 0, fours = 0, sixes = 0 } = onCrease;
      return { runs, balls, fours, sixes, strikeRate: strikeRate(runs, balls) };
    }
    const outBall = ballHistory.find(
      (b) => b.type === 'out' && b.striker?.id === playerId,
    );
    if (outBall?.striker) {
      const { runs = 0, balls = 0, fours = 0, sixes = 0 } = outBall.striker;
      return { runs, balls, fours, sixes, strikeRate: strikeRate(runs, balls) };
    }
    return null;
  };

  const getBowlerDisplayStats = (playerId) =>
    bowlersInTable.find((b) => String(b.id) === String(playerId)) ?? null;

  const battingOrder = useMemo(
    () => battingSquad.filter((p) => p.role === 'playing'),
    [battingSquad],
  );
  const bowlingOrder = useMemo(
    () => bowlingSquad.filter((p) => p.role === 'playing'),
    [bowlingSquad],
  );

  const needsFielder = (opt) =>
    dismissalRequiresFielder(
      typeof opt === 'object' && opt !== null ? opt : { value: opt },
    );

  // ── API squad persistence ──────────────────────────────────────────────────

  const handleSaveBatsmanSquad = async () => {
    if (!isApiMatch || !matchId || !battingTeamId) return;
    const playingIds = battingSquad
      .filter((p) => p.role === 'playing' && Number.isFinite(Number(p.id)))
      .map((p) => Number(p.id));
    if (playingIds.length !== requiredBatting) return;
    setSavingBatsmanSquad(true);
    try {
      const allIds = battingSquad
        .filter((p) => Number.isFinite(Number(p.id)))
        .map((p) => Number(p.id));
      await storeMatchSquad({
        matchId,
        teamId: battingTeamId,
        player_ids: allIds,
      }).unwrap();
      await storePlayingEleven({
        matchId,
        teamId: battingTeamId,
        player_ids: playingIds,
      }).unwrap();
      const playing = battingSquad.filter((p) => p.role === 'playing');
      if (playing.length >= 2)
        setBatsmenOnCrease(playing.slice(0, 2).map(blankBatsman));
      setAddBatsmanOpen(false);
    } catch {
      // @cursor-enhancement: surface error via toast / snackbar
    } finally {
      setSavingBatsmanSquad(false);
    }
  };

  const handleSaveBowlerSquad = async () => {
    if (!isApiMatch || !matchId || !bowlingTeamId) return;
    const playingIds = bowlingSquad
      .filter((p) => p.role === 'playing' && Number.isFinite(Number(p.id)))
      .map((p) => Number(p.id));
    if (playingIds.length !== requiredBowling) return;
    setSavingBowlerSquad(true);
    try {
      const allIds = bowlingSquad
        .filter((p) => Number.isFinite(Number(p.id)))
        .map((p) => Number(p.id));
      await storeMatchSquad({
        matchId,
        teamId: bowlingTeamId,
        player_ids: allIds,
      }).unwrap();
      await storePlayingEleven({
        matchId,
        teamId: bowlingTeamId,
        player_ids: playingIds,
      }).unwrap();
      const playing = bowlingSquad.filter((p) => p.role === 'playing');
      if (playing.length > 0)
        setBowlersInTable(playing.slice(0, 2).map(blankBowler));
      setAddBowlerOpen(false);
    } catch {
      // @cursor-enhancement: surface error via toast / snackbar
    } finally {
      setSavingBowlerSquad(false);
    }
  };

  // ── Squad role toggles ─────────────────────────────────────────────────────

  const setBatsmanRole = (id, role) =>
    setBattingSquad?.((prev) =>
      prev.map((b) => (b.id === id ? { ...b, role } : b)),
    );
  const setBowlerRole = (id, role) =>
    setBowlingSquad?.((prev) =>
      prev.map((b) => (b.id === id ? { ...b, role } : b)),
    );

  // ── Add players to live tables ─────────────────────────────────────────────

  const addBatsmanToCrease = (player) => {
    if (batsmenOnCrease.length >= 2) return;
    const isSecond = batsmenOnCrease.length === 1;

    const newBatsman = {
      id: player.id,
      name: player.name,
      runs: 0,
      balls: 0,
      fours: 0,
      sixes: 0,
      partnerRunsAtStart: 0,
      partnerBallsAtStart: 0,
    };

    setBatsmenOnCrease?.((prev) => {
      if (isSecond) {
        return [
          ...prev.map((b) => ({
            ...b,
            partnerRunsAtStart: b.runs,
            partnerBallsAtStart: b.balls,
          })),
          newBatsman,
        ];
      }
      return [...prev, newBatsman];
    });

    if (isSecond) {
      setCurrentPartnership?.({ runs: 0, balls: 0 });
      setAddBatsmanOpen(false);
    }
  };

  const addBowlerToTable = (player) => {
    if (!canAddMoreBowlers) return;
    const newIndex = bowlersInTable.length;
    const isLastSlot = newIndex === MAX_BOWLERS_IN_TABLE - 1;

    setBowlersInTable?.((prev) => [
      ...prev,
      {
        id: player.id,
        name: player.name,
        overs: 0,
        maidens: 0,
        runs: 0,
        wickets: 0,
        balls: 0,
      },
    ]);
    setCurrentBowlerIndex?.(newIndex);
    if (isLastSlot) setAddBowlerOpen(false);
  };

  const selectBowlerForNextOver = (player) => {
    const idx = bowlersInTable.findIndex(
      (bt) => String(bt.id) === String(player.id),
    );
    if (idx >= 0) {
      setCurrentBowlerIndex?.(idx);
      setAddBowlerOpen(false);
    } else if (canAddMoreBowlers && player.role === 'playing') {
      addBowlerToTable(player);
      setAddBowlerOpen(false);
    }
  };

  // ── Scoring engine ─────────────────────────────────────────────────────────

  const { handleRuns, handleSpecial, handleOut, handleUndo } = useScoringEngine(
    {
      ballHistory,
      setBallHistory,
      batsmenOnCrease,
      setBatsmenOnCrease,
      bowlersInTable,
      setBowlersInTable,
      strikerIndex,
      setStrikerIndex,
      currentBowlerIndex,
      setCurrentBowlerIndex,
      currentPartnership,
      setCurrentPartnership,
      completedPartnerships,
      setCompletedPartnerships,
      setAddBowlerOpen,
      setOutReasonModalOpen,
      setPendingDismissal,
      setFielderPickerOpen,
      syncBallToApi,
      syncUndoToApi,
    },
  );

  // ── Custom score dialog ────────────────────────────────────────────────────

  const openCustomScoreDialog = () => {
    setCustomScoreInput('');
    setCustomScoreDialogOpen(true);
  };
  const closeCustomScoreDialog = () => {
    setCustomScoreDialogOpen(false);
    setCustomScoreInput('');
  };
  const handleCustomScoreDone = () => {
    const n = parseInt(customScoreInput.trim(), 10);
    if (Number.isNaN(n) || n < 0 || n > 99) return;
    handleRuns(n);
    closeCustomScoreDialog();
  };

  // ── Shot area dialog ───────────────────────────────────────────────────────

  const openShotAreaDialog = (runs) => {
    setPendingRunsForShot(runs);
    setShotAreaDialogOpen(true);
  };
  const closeShotAreaDialog = () => {
    setShotAreaDialogOpen(false);
    setPendingRunsForShot(null);
  };
  const handleShotDirectionSelect = (zoneId) => {
    if (pendingRunsForShot != null) handleRuns(pendingRunsForShot, zoneId);
    closeShotAreaDialog();
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="mt-4 space-y-4 pb-8">
      {/* Innings header */}
      <div className="flex items-center justify-center gap-2">
        <img
          src={teamMatchIcon}
          alt=""
          className="h-8 w-8 shrink-0"
          aria-hidden
        />
        <span className="text-[16px] font-bold tracking-wide text-white uppercase">
          {displayTeamName}
        </span>
        <span className="text-[13px] text-[#DA9811]">{inningsLabel}</span>
      </div>

      {/* Live score box */}
      <div className="m-auto max-w-fit rounded-[17px] bg-[#141412] px-6 py-4 text-center">
        <div className="flex items-baseline justify-center gap-1">
          <span className="text-[36px] leading-none font-bold text-white">
            {liveScore?.totalRuns ?? 0}-{liveScore?.totalWickets ?? 0}
          </span>
          <span className="text-[16px] font-bold text-white/90">
            ({liveScore?.oversDisplay ?? '0'} /{' '}
            {liveScore?.maxOvers ?? match?.overs ?? ''})
          </span>
        </div>
      </div>

      {/* Match stats bar */}
      <MatchStatsRow
        extras={liveScore?.extras ?? 0}
        oversDisplay={liveScore?.oversDisplay ?? '0'}
        maxOvers={liveScore?.maxOvers ?? match?.overs}
        crr={liveScore?.crr ?? '0.0'}
        partnershipRuns={currentPartnership.runs}
        partnershipBalls={currentPartnership.balls}
      />

      {/* Batsman table — @cursor-enhancement: Extract as <BatsmenTable /> */}
      <div className="relative overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <table className="w-full border-collapse text-[12px]">
          <thead>
            <tr className={HEADER_BG}>
              <th
                className={`${HEADER_BG} border-r border-b border-l px-4 py-2.5 text-left font-bold text-white ${BORDER}`}
              >
                Batsman
              </th>
              {['R', 'B', '4s', '6s', 'SR'].map((h) => (
                <th
                  key={h}
                  className={`${HEADER_BG} w-[2rem] border-r border-b py-2.5 text-center font-bold text-white ${BORDER}`}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {battingOrder.map((player) => {
              const stats = getBatsmanDisplayStats(player.id);
              const creaseIndex = batsmenOnCrease.findIndex(
                (b) => String(b.id) === String(player.id),
              );
              const isOnCrease = creaseIndex >= 0;
              const isStriker = isOnCrease && creaseIndex === strikerIndex;
              const display = stats
                ? {
                    runs: stats.runs,
                    balls: stats.balls,
                    fours: stats.fours,
                    sixes: stats.sixes,
                    sr: stats.strikeRate,
                  }
                : { runs: 0, balls: 0, fours: 0, sixes: 0, sr: '0.0' };
              return (
                <tr
                  key={player.id}
                  role={isOnCrease ? 'button' : undefined}
                  tabIndex={isOnCrease ? 0 : undefined}
                  onClick={() => isOnCrease && setStrikerIndex?.(creaseIndex)}
                  onKeyDown={(e) => {
                    if (isOnCrease && (e.key === 'Enter' || e.key === ' ')) {
                      e.preventDefault();
                      setStrikerIndex?.(creaseIndex);
                    }
                  }}
                  className={
                    isOnCrease
                      ? 'cursor-pointer transition-opacity active:opacity-90'
                      : ''
                  }
                >
                  <td
                    className={`border-r border-b border-l ${BORDER} px-4 py-3`}
                  >
                    <span className="flex items-center gap-2">
                      <span
                        className={`text-[12px] font-medium ${isStriker ? 'text-[#DA9811]' : 'text-white'}`}
                      >
                        {player.name ?? DASH}
                      </span>
                      {isStriker && (
                        <span
                          className="scoring-blink-dot inline-block h-2.5 w-2.5 flex-shrink-0 rounded-full bg-red-500"
                          aria-label="On strike"
                        />
                      )}
                    </span>
                  </td>
                  {[
                    display.runs,
                    display.balls,
                    display.fours,
                    display.sixes,
                    display.sr,
                  ].map((val, i) => (
                    <td
                      key={i}
                      className={`border-r border-b ${BORDER} px-4 py-3 text-center text-white`}
                    >
                      {val ?? DASH}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
        {canAddMoreBatsmen && !matchComplete && (
          <div
            className="pointer-events-none absolute inset-x-0 top-0 bottom-0 flex min-h-[5rem] items-center justify-center"
            aria-hidden
          >
            <Button
              type="button"
              variant="dark"
              size="lg"
              className="pointer-events-auto flex flex-col items-center gap-1.5"
              aria-label="Add Batsman"
              onClick={() => setAddBatsmanOpen(true)}
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#DA9811] text-[#080807]">
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 4v16m8-8H4"
                  />
                </svg>
              </span>
              <span className="text-[13px] font-bold tracking-wide text-[#A2A6AB] uppercase">
                Add Batsman
              </span>
            </Button>
          </div>
        )}
      </div>

      {/* Bowler table — @cursor-enhancement: Extract as <BowlerTable /> */}
      <div className="relative overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <table className="w-full border-collapse text-[12px]">
          <thead>
            <tr className={HEADER_BG}>
              <th
                className={`${HEADER_BG} border-r border-b border-l px-4 py-2.5 text-left font-bold text-white ${BORDER}`}
              >
                Bowler
              </th>
              {['O', 'M', 'R', 'W', 'ECON'].map((h) => (
                <th
                  key={h}
                  className={`${HEADER_BG} ${h === 'ECON' ? 'w-14' : 'w-[2rem]'} border-r border-b py-2.5 text-center font-bold text-white ${BORDER}`}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {bowlingOrder.map((player) => {
              const bowler = getBowlerDisplayStats(player.id);
              const tableIndex = bowler
                ? bowlersInTable.findIndex(
                    (b) => String(b.id) === String(player.id),
                  )
                : -1;
              const isCurrentBowler =
                tableIndex >= 0 && tableIndex === currentBowlerIndex;
              const isInTable = tableIndex >= 0;
              const canSelect =
                isInTable || (canAddMoreBowlers && player.role === 'playing');
              const display = bowler
                ? {
                    o: ballsToOvers(bowler.balls ?? 0),
                    m: bowler.maidens ?? 0,
                    r: bowler.runs,
                    w: bowler.wickets,
                    econ: economyRate(bowler.runs, (bowler.balls ?? 0) / 6),
                  }
                : { o: '0', m: 0, r: 0, w: 0, econ: '0.0' };
              const handleBowlerClick = () => {
                if (isInTable) setCurrentBowlerIndex?.(tableIndex);
                else if (canAddMoreBowlers && player.role === 'playing')
                  addBowlerToTable(player);
              };
              return (
                <tr
                  key={player.id}
                  role={canSelect ? 'button' : undefined}
                  tabIndex={canSelect ? 0 : undefined}
                  onClick={() => canSelect && handleBowlerClick()}
                  onKeyDown={(e) => {
                    if (canSelect && (e.key === 'Enter' || e.key === ' ')) {
                      e.preventDefault();
                      handleBowlerClick();
                    }
                  }}
                  className={
                    canSelect
                      ? 'cursor-pointer transition-opacity active:opacity-90'
                      : ''
                  }
                >
                  <td
                    className={`border-r border-b border-l ${BORDER} bg-black px-4 py-3`}
                  >
                    <span className="flex items-center gap-2">
                      <span
                        className={`text-[12px] font-medium ${isCurrentBowler ? 'text-[#DA9811]' : 'text-white'}`}
                      >
                        {player.name ?? DASH}
                      </span>
                      {isCurrentBowler && (
                        <span
                          className="scoring-blink-dot inline-block h-2.5 w-2.5 flex-shrink-0 rounded-full bg-red-500"
                          aria-label="Bowling"
                        />
                      )}
                    </span>
                  </td>
                  {[
                    display.o,
                    display.m,
                    display.r,
                    display.w,
                    display.econ,
                  ].map((val, i) => (
                    <td
                      key={i}
                      className={`border-r border-b ${BORDER} px-4 py-3 text-center text-white`}
                    >
                      {val ?? DASH}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
        {canAddMoreBowlers && !matchComplete && (
          <div
            className="pointer-events-none absolute inset-x-0 top-0 bottom-0 flex min-h-[5rem] items-center justify-center"
            aria-hidden
          >
            <Button
              type="button"
              variant="dark"
              size="lg"
              className="pointer-events-auto flex flex-col items-center gap-1.5"
              aria-label="Add Bowler"
              onClick={() => setAddBowlerOpen(true)}
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#DA9811] text-[#080807]">
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 4v16m8-8H4"
                  />
                </svg>
              </span>
              <span className="text-[13px] font-bold tracking-wide text-[#A2A6AB] uppercase">
                Add Bowler
              </span>
            </Button>
          </div>
        )}
      </div>

      {/* Over strip — @cursor-enhancement: Extract as <OverStrip /> */}
      {oversFromBalls.length > 0 && (
        <div className="mt-4 flex items-center gap-2">
          <button
            type="button"
            onClick={() =>
              overStatsScrollRef.current?.scrollBy({
                left: -200,
                behavior: 'smooth',
              })
            }
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#1C1C1A] text-white transition-opacity hover:opacity-90 active:opacity-80"
            aria-label="Previous overs"
          >
            <span className="text-lg font-bold">&lsaquo;</span>
          </button>
          <div
            ref={overStatsScrollRef}
            className="flex flex-1 flex-nowrap items-center gap-3 overflow-x-auto py-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {oversFromBalls.map(({ overIndex, balls }) => (
              <div
                key={overIndex}
                className="flex shrink-0 items-center gap-2 border-r border-[#1C1C1A] pr-3 last:border-r-0 last:pr-0"
              >
                <span className="text-[11px] font-medium tracking-wide text-[#6B7280] uppercase">
                  {overOrdinal(overIndex)}
                </span>
                <div className="flex gap-1">
                  {balls.map((b, i) => {
                    const { label, variant } = getBallDisplay(b);
                    return (
                      <span
                        key={i}
                        className={`flex h-7 min-w-[1.75rem] items-center justify-center rounded-md text-[12px] font-bold ${ballChipClass(variant)}`}
                      >
                        {label}
                      </span>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() =>
              overStatsScrollRef.current?.scrollBy({
                left: 200,
                behavior: 'smooth',
              })
            }
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#1C1C1A] text-white transition-opacity hover:opacity-90 active:opacity-80"
            aria-label="Next overs"
          >
            <span className="text-lg font-bold">&rsaquo;</span>
          </button>
        </div>
      )}

      {/* Scoring controls — @cursor-enhancement: Extract as <ScoringControls /> */}
      {batsmenOnCrease.length === 2 &&
        bowlersInTable.length > 0 &&
        !matchComplete && (
          <div className="mt-6 flex flex-col items-center gap-4 pb-8">
            <div className="flex flex-wrap justify-center gap-2">
              {[0, 1, 2, 3, 4, 5, 6].map((runs) => (
                <button
                  key={runs}
                  type="button"
                  onClick={() =>
                    runs === 0 ? handleRuns(0) : openShotAreaDialog(runs)
                  }
                  className="flex h-[40px] w-[40px] shrink-0 cursor-pointer items-center justify-center rounded-full text-[14px] font-bold text-white transition-opacity active:opacity-80"
                  style={{ backgroundColor: RUN_BUTTON_BG[runs] }}
                  aria-label={`${runs} run${runs !== 1 ? 's' : ''}`}
                >
                  {runs}
                </button>
              ))}
              <button
                type="button"
                onClick={openCustomScoreDialog}
                className="flex h-[40px] w-[40px] shrink-0 cursor-pointer items-center justify-center rounded-full bg-[#46463F] text-[25px] font-bold text-[#DA9811] transition-opacity active:opacity-80"
                aria-label="Add custom score"
              >
                +
              </button>
            </div>

            <div className="flex flex-wrap justify-center gap-2">
              {extraTypeOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    if (
                      opt.value === 'wd' ||
                      opt.value === 'nb' ||
                      opt.value === 'bye' ||
                      opt.value === 'lb'
                    ) {
                      setPendingExtraType(opt.value);
                      setExtraRunsDialogOpen(true);
                    } else {
                      handleSpecial(opt.value);
                    }
                  }}
                  className="flex h-[40px] w-[40px] shrink-0 cursor-pointer items-center justify-center rounded-full bg-[#141412] text-[12px] font-bold text-white uppercase transition-opacity active:opacity-80"
                  aria-label={opt.label}
                >
                  {opt.short_label}
                </button>
              ))}
              <button
                type="button"
                onClick={() => {
                  if (batsmenOnCrease.length === 2 && bowlersInTable.length > 0)
                    setOutReasonModalOpen(true);
                }}
                className="flex h-[40px] w-[40px] shrink-0 cursor-pointer items-center justify-center rounded-full bg-[#141412] text-[12px] font-bold text-[#DA9811] uppercase transition-opacity active:opacity-80"
                aria-label="Out"
              >
                OUT
              </button>
              <button
                type="button"
                onClick={handleUndo}
                className="flex h-[40px] w-[40px] shrink-0 cursor-pointer items-center justify-center rounded-full border-2 border-red-500 bg-[#141412] text-[8px] font-bold text-red-500 uppercase transition-opacity active:opacity-80"
                aria-label="Undo"
              >
                <span className="flex flex-col items-center">
                  <svg
                    className="h-3 w-3"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M3 10h10a5 5 0 0 1 5 5v2" />
                    <path d="M3 10l4-4M3 10l4 4" />
                  </svg>
                  UNDO
                </span>
              </button>
            </div>
          </div>
        )}

      {/* ── Dialogs ──────────────────────────────────────────────────────────── */}

      <ExtraRunsDialog
        open={extraRunsDialogOpen}
        onOpenChange={(open) => {
          setExtraRunsDialogOpen(open);
          if (!open) setPendingExtraType(null);
        }}
        extraType={pendingExtraType}
        onSelect={(runs) => {
          if (pendingExtraType) handleSpecial(pendingExtraType, runs);
        }}
      />

      <OutReasonDialog
        open={outReasonModalOpen}
        onOpenChange={setOutReasonModalOpen}
        dismissalOptions={dismissalOptions}
        onSelectOption={(opt) => {
          if (needsFielder(opt)) {
            setPendingDismissal(opt.value);
            setOutReasonModalOpen(false);
            setFielderPickerOpen(true);
          } else {
            handleOut(opt.value);
          }
        }}
      />

      <FielderPickerDialog
        open={fielderPickerOpen}
        onOpenChange={(open) => {
          if (!open) setPendingDismissal(null);
          setFielderPickerOpen(open);
        }}
        message={`Who was the fielder? (required for ${
          pendingDismissal === 'run_out'
            ? 'run out'
            : pendingDismissal === 'caught'
              ? 'catch'
              : 'stumping'
        })`}
        players={bowlingSquad}
        onSelectFielder={(playerId) => handleOut(pendingDismissal, playerId)}
      />

      <ShotAreaDialog
        open={shotAreaDialogOpen}
        onOpenChange={(open) => !open && closeShotAreaDialog()}
        onSelect={handleShotDirectionSelect}
        zones={shotPositionOptions.length > 0 ? shotPositionOptions : undefined}
      />

      <CustomScoreDialog
        open={customScoreDialogOpen}
        onOpenChange={(open) => {
          if (!open) closeCustomScoreDialog();
        }}
        value={customScoreInput}
        onChange={setCustomScoreInput}
        onSubmit={handleCustomScoreDone}
      />

      <AddBatsmanDialog
        open={addBatsmanOpen}
        onOpenChange={(open) => {
          if (!open) setAddBatsmanOpen(false);
        }}
        players={battingSquad}
        canAddMoreBatsmen={canAddMoreBatsmen}
        isPlayerBattingOrOut={isPlayerBattingOrOut}
        getBatsmanDisplayStats={getBatsmanDisplayStats}
        isApiMatch={isApiMatch}
        savingBatsmanSquad={savingBatsmanSquad}
        requiredBatting={requiredBatting}
        currentSquad={battingSquad}
        onSaveSquad={handleSaveBatsmanSquad}
        onAddBatsmanToCrease={addBatsmanToCrease}
        onSetBatsmanRole={setBatsmanRole}
      />

      <AddBowlerDialog
        open={addBowlerOpen}
        onOpenChange={(open) => {
          if (!open) setAddBowlerOpen(false);
        }}
        players={bowlingSquad}
        canAddMoreBowlers={canAddMoreBowlers}
        bowlersInTable={bowlersInTable}
        isApiMatch={isApiMatch}
        savingBowlerSquad={savingBowlerSquad}
        requiredBowling={requiredBowling}
        currentBowlerSquad={bowlingSquad}
        onSaveBowlerSquad={handleSaveBowlerSquad}
        onSelectBowlerForNextOver={selectBowlerForNextOver}
        onSetBowlerRole={setBowlerRole}
      />
    </div>
  );
}
