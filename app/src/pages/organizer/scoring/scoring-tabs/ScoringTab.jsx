/**
 * ScoringTab
 *
 * Orchestrates the live scoring UI for one innings.
 * All business logic lives in hooks (useScoringEngine) and utils (scoringUtils, cricketRules).
 * All rendering of tables / controls is delegated to components/scoring/*.
 *
 * Responsibilities:
 *   • Wires useScoringEngine into inline innings state.
 *   • Computes derived values (overStrip, secondInningsChase, dismissal options).
 *   • Detects and emits innings-end events (onInningsComplete).
 *   • Manages dialog open/close state.
 *   • Manages squad save / player-picker interactions.
 */

import { useEffect, useMemo, useRef, useState } from 'react';

import CustomScoreDialog from '@/components/dialogs/scoring/CustomScoreDialog';
import ExtraRunsDialog from '@/components/dialogs/scoring/ExtraRunsDialog';
import FielderPickerDialog from '@/components/dialogs/scoring/FielderPickerDialog';
import OutReasonDialog from '@/components/dialogs/scoring/OutReasonDialog';
import ScoringSquadPlayerPickerDialog from '@/components/dialogs/scoring/ScoringSquadPlayerPickerDialog';
import { BatsmenTable } from '@/components/scoring/BatsmenTable';
import { BowlerTable } from '@/components/scoring/BowlerTable';
import { LiveScoreBox } from '@/components/scoring/LiveScoreBox';
import { OverStrip } from '@/components/scoring/OverStrip';
import { ScoringControls } from '@/components/scoring/ScoringControls';
import { blankBatsman, blankBowler } from '@/hooks/useInningsState';
import { useScoringEngine } from '@/hooks/useScoringEngine';
import { CLOUDFRONT_APP_BASE } from '@/lib/constants/assets';
import { isLegalDelivery } from '@/lib/utils/cricketRules';
import {
  dismissalRequiresFielder,
  getDismissalOptions,
  getExtraTypeOptions,
  getFreeHitDismissalOptions,
  getShotPositionOptions,
} from '@/lib/utils/scoringMappers';
import { getRunsFromBall } from '@/lib/utils/scoringUtils';
import { useGetEnumsQuery } from '@/store/api/enumApi';
import {
  useStoreMatchSquadMutation,
  useStorePlayingElevenMutation,
} from '@/store/api/matchApi';

import { MatchStatsRow, SecondInningsChaseRow } from '../MatchStatsRow';
import { ShotAreaDialog } from '../ShotAreaDialog';

// ─── Constants ────────────────────────────────────────────────────────────────

const TEAM_MATCH_ICON = `${CLOUDFRONT_APP_BASE}/images/icons/team-match-icon.svg`;

const LEGAL_DELIVERIES_PER_OVER = 6;
/** Max bowlers in the live table at once (must match useScoringEngine's rotation logic). */
const MAX_BOWLERS_IN_TABLE = 2;

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Build the over-strip data from ball history.
 * Returns an array of { overIndex, runs, balls } — one entry per completed or current over.
 */
function buildOversFromBalls(ballHistory) {
  const list = [];
  let currentOver = [];
  let validCount = 0;

  for (const ball of ballHistory) {
    currentOver.push(ball);
    if (isLegalDelivery(ball.type)) validCount += 1;
    if (validCount === LEGAL_DELIVERIES_PER_OVER) {
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
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * @param {string}   matchId
 * @param {object}   match                   Full match config (overs, playersPerSide, etc.)
 * @param {boolean}  [matchComplete]
 * @param {string}   inningsNumber           '1' | '2'
 * @param {string}   [battingTeamName]       Display name for the batting team
 * @param {number}   battingTeamId
 * @param {number}   bowlingTeamId
 * @param {number[]} [battingPlayingElevenIds]
 * @param {number[]} [bowlingPlayingElevenIds]
 *
 * Innings state (all from useInningsState of the active innings):
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
 * @param {object}   currentPartnership        { runs, balls }
 * @param {Function} setCurrentPartnership
 * @param {object[]} completedPartnerships
 * @param {Function} setCompletedPartnerships
 * @param {boolean}  pendingFreeHit
 * @param {Function} setPendingFreeHit
 * @param {object[]} retiredBatsmen
 * @param {Function} setRetiredBatsmen
 * @param {object[]} battingSquad
 * @param {Function} setBattingSquad
 * @param {object[]} bowlingSquad
 * @param {Function} setBowlingSquad
 *
 * @param {object}   liveScore               From computeLiveScore(ballHistory)
 * @param {Function} [onInningsComplete]     ({ reason }) => void
 * @param {number}   [targetScore]           2nd innings: first innings total + 1
 * @param {boolean}  [isApiMatch]
 * @param {Function} [syncBallToApi]
 * @param {Function} [syncUndoToApi]
 */
export function ScoringTab({
  matchId,
  match,
  matchComplete = false,
  inningsNumber = '1',
  battingTeamName,
  battingTeamId,
  bowlingTeamId,
  battingPlayingElevenIds = [],
  bowlingPlayingElevenIds = [],

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
  completedPartnerships: _completedPartnerships = [],
  setCompletedPartnerships,
  pendingFreeHit = false,
  setPendingFreeHit,
  retiredBatsmen = [],
  setRetiredBatsmen,
  battingSquad = [],
  setBattingSquad,
  bowlingSquad = [],
  setBowlingSquad,

  liveScore,
  onInningsComplete,
  targetScore,
  isApiMatch,
  syncBallToApi,
  syncUndoToApi,
}) {
  // ── Enum data ────────────────────────────────────────────────────────────────

  const { data: enums = {} } = useGetEnumsQuery();
  const [storeMatchSquad] = useStoreMatchSquadMutation();
  const [storePlayingEleven] = useStorePlayingElevenMutation();

  const allDismissalOptions = useMemo(
    () => getDismissalOptions(enums.dismissal_type),
    [enums.dismissal_type],
  );

  // On a free hit only run_out / obstructing / hit_ball_twice are valid.
  const activeDismissalOptions = useMemo(
    () =>
      pendingFreeHit
        ? getFreeHitDismissalOptions(allDismissalOptions)
        : allDismissalOptions,
    [allDismissalOptions, pendingFreeHit],
  );

  const extraTypeOptions = useMemo(
    () => getExtraTypeOptions(enums.extra_type),
    [enums.extra_type],
  );
  const shotPositionOptions = useMemo(
    () => getShotPositionOptions(enums.shot_position),
    [enums.shot_position],
  );

  // ── Dialog state ─────────────────────────────────────────────────────────────

  const [addBatsmanOpen, setAddBatsmanOpen] = useState(false);
  const [batsmanDialogReplaceStriker, setBatsmanDialogReplaceStriker] =
    useState(false);
  const [addBowlerOpen, setAddBowlerOpen] = useState(false);
  const [bowlerDialogReplaceActive, setBowlerDialogReplaceActive] =
    useState(false);
  const [savingBatsmanSquad, setSavingBatsmanSquad] = useState(false);
  const [savingBowlerSquad, setSavingBowlerSquad] = useState(false);
  const [outReasonModalOpen, setOutReasonModalOpen] = useState(false);
  const [retiredHurtConfirmOpen, setRetiredHurtConfirmOpen] = useState(false);
  const [customScoreDialogOpen, setCustomScoreDialogOpen] = useState(false);
  const [extraRunsDialogOpen, setExtraRunsDialogOpen] = useState(false);
  const [pendingExtraType, setPendingExtraType] = useState(null);
  const [customScoreInput, setCustomScoreInput] = useState('');
  const [shotAreaDialogOpen, setShotAreaDialogOpen] = useState(false);
  const [pendingRunsForShot, setPendingRunsForShot] = useState(null);
  const [pendingDismissal, setPendingDismissal] = useState(null);
  const [fielderPickerOpen, setFielderPickerOpen] = useState(false);

  // ── Derived ──────────────────────────────────────────────────────────────────

  const inningsLabel = inningsNumber === '2' ? '2nd Innings' : '1st Innings';
  const displayTeamName =
    battingTeamName ||
    (inningsNumber === '2'
      ? match?.teamB?.name || 'Team B'
      : match?.teamA?.name || 'Team A');

  const oversFromBalls = useMemo(
    () => buildOversFromBalls(ballHistory),
    [ballHistory],
  );

  const secondInningsChase = useMemo(() => {
    if (inningsNumber !== '2' || targetScore == null || liveScore == null)
      return null;
    const maxOversNum =
      liveScore.maxOvers ??
      (match?.overs != null && match.overs !== ''
        ? Number(match.overs)
        : undefined);
    if (maxOversNum == null || Number.isNaN(maxOversNum)) return null;
    const maxBalls = Math.floor(maxOversNum * 6);
    const valid = liveScore.validDeliveries ?? 0;
    const ballsLeft = Math.max(0, maxBalls - valid);
    const runsToWin = Math.max(0, targetScore - (liveScore.totalRuns ?? 0));
    const oversRemaining = ballsLeft / 6;
    const requiredRunRate =
      runsToWin <= 0
        ? '0.0'
        : ballsLeft <= 0
          ? '—'
          : (runsToWin / oversRemaining).toFixed(1);
    return { target: targetScore, requiredRunRate, ballsLeft, runsToWin };
  }, [inningsNumber, targetScore, liveScore, match?.overs]);

  // ── Auto-scroll over strip ────────────────────────────────────────────────────

  const overStatsScrollRef = useRef(null);
  useEffect(() => {
    const el = overStatsScrollRef.current;
    if (!el || ballHistory.length === 0) return;
    requestAnimationFrame(() => {
      el.scrollLeft = el.scrollWidth - el.clientWidth;
    });
  }, [ballHistory.length]);

  // ── Innings-end detection ────────────────────────────────────────────────────
  //
  // Fires onInningsComplete only for a SINGLE newly added live ball.
  // Skips batch loads (0 → N), undo (N → N-1), and innings switch.

  const baselineRef = useRef(ballHistory.length);
  const prevLengthRef = useRef(ballHistory.length);
  const inningsEndEmittedRef = useRef(false);

  useEffect(() => {
    baselineRef.current = ballHistory.length;
    prevLengthRef.current = ballHistory.length;
    inningsEndEmittedRef.current = false;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inningsNumber]);

  useEffect(() => {
    const curr = ballHistory.length;
    const prev = prevLengthRef.current;
    if (curr !== prev) {
      if (curr - prev !== 1) baselineRef.current = curr;
      prevLengthRef.current = curr;
    }
  }, [ballHistory.length]);

  useEffect(() => {
    if (!onInningsComplete) return;
    const totalRuns = liveScore?.totalRuns ?? 0;
    const maxWickets =
      match?.playersPerSide != null ? match.playersPerSide - 1 : undefined;
    const maxValidBalls =
      match?.overs != null ? Number(match.overs) * 6 : undefined;

    const targetMet = targetScore != null && totalRuns >= targetScore;
    const wicketsMet =
      maxWickets != null && (liveScore?.totalWickets ?? 0) >= maxWickets;
    const oversMet =
      maxValidBalls != null &&
      (liveScore?.validDeliveries ?? 0) >= maxValidBalls;
    const inningsEnded = targetMet || wicketsMet || oversMet;

    if (!inningsEnded) {
      inningsEndEmittedRef.current = false;
      return;
    }
    if (ballHistory.length <= baselineRef.current) return;
    if (inningsEndEmittedRef.current) return;

    const reason = targetMet ? 'target' : wicketsMet ? 'wickets' : 'overs';
    inningsEndEmittedRef.current = true;
    onInningsComplete({ reason });
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

  // Close dialogs when match completes
  useEffect(() => {
    if (matchComplete) {
      setAddBowlerOpen(false);
      setBowlerDialogReplaceActive(false);
      setAddBatsmanOpen(false);
      setBatsmanDialogReplaceStriker(false);
    }
  }, [matchComplete]);

  // ── Capacity flags ────────────────────────────────────────────────────────────

  const canAddMoreBatsmen = batsmenOnCrease.length < 2;
  const canAddMoreBowlers = bowlersInTable.length < MAX_BOWLERS_IN_TABLE;

  // ── Squad helpers ─────────────────────────────────────────────────────────────

  const playersPerSide = match?.playersPerSide;
  const expectedXiSize = useMemo(() => {
    const n = match?.playersPerSide;
    return n != null && Number.isFinite(Number(n)) ? Number(n) : 11;
  }, [match?.playersPerSide]);

  const battingXiSavedOnApi = useMemo(() => {
    const ids = battingPlayingElevenIds ?? [];
    return Array.isArray(ids) && ids.length >= expectedXiSize;
  }, [battingPlayingElevenIds, expectedXiSize]);

  const bowlingXiSavedOnApi = useMemo(() => {
    const ids = bowlingPlayingElevenIds ?? [];
    return Array.isArray(ids) && ids.length >= expectedXiSize;
  }, [bowlingPlayingElevenIds, expectedXiSize]);

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

  const addBatsmanDialogPlayers = useMemo(() => {
    if (!battingXiSavedOnApi) return battingSquad;
    const ids = new Set((battingPlayingElevenIds ?? []).map(String));
    const filtered = battingSquad.filter(
      (p) => p.id != null && ids.has(String(p.id)),
    );
    return filtered.length > 0 ? filtered : battingSquad;
  }, [battingSquad, battingPlayingElevenIds, battingXiSavedOnApi]);

  const addBowlerDialogPlayers = useMemo(() => {
    if (!bowlingXiSavedOnApi) return bowlingSquad;
    const ids = new Set((bowlingPlayingElevenIds ?? []).map(String));
    const filtered = bowlingSquad.filter(
      (p) => p.id != null && ids.has(String(p.id)),
    );
    return filtered.length > 0 ? filtered : bowlingSquad;
  }, [bowlingSquad, bowlingPlayingElevenIds, bowlingXiSavedOnApi]);

  const battingOrder = useMemo(
    () => battingSquad.filter((p) => p.role === 'playing'),
    [battingSquad],
  );
  const bowlingOrder = useMemo(
    () => bowlingSquad.filter((p) => p.role === 'playing'),
    [bowlingSquad],
  );

  // ── Player lookup helpers ─────────────────────────────────────────────────────

  const isPlayerBattingOrOut = (playerId) =>
    batsmenOnCrease.some((b) => b.id === playerId) ||
    ballHistory.some(
      (b) =>
        (b.type === 'out' || b.type === 'retired_hurt') &&
        b.striker?.id === playerId,
    );

  const getBatsmanDisplayStats = (playerId) => {
    const onCrease = batsmenOnCrease.find((b) => b.id === playerId);
    if (onCrease) {
      const { runs = 0, balls = 0, fours = 0, sixes = 0 } = onCrease;
      return {
        runs,
        balls,
        fours,
        sixes,
        strikeRate: !balls ? '0.0' : ((runs / balls) * 100).toFixed(1),
      };
    }
    const outBall = ballHistory.find(
      (b) =>
        (b.type === 'out' || b.type === 'retired_hurt') &&
        b.striker?.id === playerId,
    );
    if (outBall?.striker) {
      const { runs = 0, balls = 0, fours = 0, sixes = 0 } = outBall.striker;
      return {
        runs,
        balls,
        fours,
        sixes,
        strikeRate: !balls ? '0.0' : ((runs / balls) * 100).toFixed(1),
      };
    }
    return null;
  };

  // ── Scoring engine ────────────────────────────────────────────────────────────

  const {
    handleRuns,
    handleSpecial,
    handleOut,
    handleRetiredHurt,
    handleUndo,
  } = useScoringEngine({
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
    setCompletedPartnerships,
    pendingFreeHit,
    setPendingFreeHit,
    retiredBatsmen,
    setRetiredBatsmen,
    setAddBowlerOpen,
    setOutReasonModalOpen,
    setPendingDismissal,
    setFielderPickerOpen,
    syncBallToApi,
    syncUndoToApi,
    matchOvers: match?.overs,
    playersPerSide: match?.playersPerSide,
    targetScore,
    matchComplete,
  });

  // ── API squad persistence ─────────────────────────────────────────────────────

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
    } finally {
      setSavingBowlerSquad(false);
    }
  };

  // ── Squad role toggles ────────────────────────────────────────────────────────

  const setBatsmanRole = (id, role) =>
    setBattingSquad?.((prev) =>
      prev.map((b) => (b.id === id ? { ...b, role } : b)),
    );

  const setBowlerRole = (id, role) =>
    setBowlingSquad?.((prev) =>
      prev.map((b) => (b.id === id ? { ...b, role } : b)),
    );

  // ── Add players to live tables ────────────────────────────────────────────────

  const addBatsmanToCrease = (player) => {
    if (batsmenOnCrease.length >= 2) return;
    const isSecond = batsmenOnCrease.length === 1;
    const newBatsman = blankBatsman(player);

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

  const replaceStrikerWith = (player) => {
    const i = Math.min(
      Math.max(0, Number(strikerIndex) || 0),
      Math.max(0, batsmenOnCrease.length - 1),
    );
    const cur = batsmenOnCrease[i];
    if (!cur || String(cur.id) === String(player.id)) {
      setAddBatsmanOpen(false);
      setBatsmanDialogReplaceStriker(false);
      return;
    }
    setBatsmenOnCrease?.((prev) => {
      const next = [...prev];
      if (!next[i]) return prev;
      next[i] = blankBatsman(player);
      return next;
    });
    setAddBatsmanOpen(false);
    setBatsmanDialogReplaceStriker(false);
  };

  const addBowlerToTable = (player) => {
    if (!canAddMoreBowlers) return;
    const newIndex = bowlersInTable.length;
    const isLastSlot = newIndex === MAX_BOWLERS_IN_TABLE - 1;
    setBowlersInTable?.((prev) => [...prev, blankBowler(player)]);
    setCurrentBowlerIndex?.(newIndex);
    if (isLastSlot) setAddBowlerOpen(false);
  };

  const selectBowlerForNextOver = (player) => {
    const playingOk = bowlingXiSavedOnApi || player?.role === 'playing';
    if (!playingOk) return;

    const idx = bowlersInTable.findIndex(
      (bt) => String(bt.id) === String(player.id),
    );
    if (idx >= 0) {
      setCurrentBowlerIndex?.(idx);
      setAddBowlerOpen(false);
      return;
    }
    if (canAddMoreBowlers) {
      addBowlerToTable(player);
      setAddBowlerOpen(false);
      return;
    }
    // Swap current slot with the new bowler
    const table = bowlersInTable ?? [];
    if (table.length === 0) return;
    const cur = Math.min(
      Math.max(0, Number(currentBowlerIndex) || 0),
      table.length - 1,
    );
    setBowlersInTable?.((prev) => {
      const next = [...prev];
      next[cur] = blankBowler(player);
      return next;
    });
    setAddBowlerOpen(false);
  };

  const handleReplaceActiveBowlerPick = (player) => {
    const playingOk = bowlingXiSavedOnApi || player?.role === 'playing';
    if (!playingOk) return;
    const table = bowlersInTable ?? [];
    if (table.length === 0) return;
    const cur = Math.min(
      Math.max(0, Number(currentBowlerIndex) || 0),
      table.length - 1,
    );
    const idxInTable = table.findIndex(
      (bt) => String(bt.id) === String(player.id),
    );
    if (idxInTable >= 0 && idxInTable !== cur) {
      setCurrentBowlerIndex?.(idxInTable);
      setAddBowlerOpen(false);
      setBowlerDialogReplaceActive(false);
      return;
    }
    setBowlersInTable?.((prev) => {
      const next = [...prev];
      const slot = next[cur];
      if (!slot || String(slot.id) === String(player.id)) return prev;
      next[cur] = blankBowler(player);
      return next;
    });
    setAddBowlerOpen(false);
    setBowlerDialogReplaceActive(false);
  };

  // ── Shot area / custom score dialog flows ─────────────────────────────────────

  const openCustomScore = () => {
    setCustomScoreInput('');
    setCustomScoreDialogOpen(true);
  };
  const closeCustomScore = () => {
    setCustomScoreDialogOpen(false);
    setCustomScoreInput('');
  };
  const handleCustomScoreDone = () => {
    const n = parseInt(customScoreInput.trim(), 10);
    if (Number.isNaN(n) || n < 0 || n > 99) return;
    handleRuns(n);
    closeCustomScore();
  };

  const openShotArea = (runs) => {
    setPendingRunsForShot(runs);
    setShotAreaDialogOpen(true);
  };
  const closeShotArea = () => {
    setShotAreaDialogOpen(false);
    setPendingRunsForShot(null);
  };
  const handleShotSelect = (zoneId) => {
    if (pendingRunsForShot != null) handleRuns(pendingRunsForShot, zoneId);
    closeShotArea();
  };

  // ── Penalty runs ──────────────────────────────────────────────────────────────

  const handlePenaltyRuns = () => {
    // Award 5 penalty runs to the batting team as a wide (extra ball).
    // Bowler is charged the runs but the delivery doesn't count toward the over.
    handleSpecial('wd', 5);
  };

  // ── Retired Hurt flow ─────────────────────────────────────────────────────────

  const handleRetiredHurtConfirm = () => {
    handleRetiredHurt();
    setRetiredHurtConfirmOpen(false);
  };

  // ── Fielder / dismissal ───────────────────────────────────────────────────────

  const needsFielder = (opt) =>
    dismissalRequiresFielder(
      typeof opt === 'object' && opt !== null ? opt : { value: opt },
    );

  // ── Render ────────────────────────────────────────────────────────────────────

  const isReadyToScore =
    batsmenOnCrease.length === 2 && bowlersInTable.length > 0 && !matchComplete;

  return (
    <div className="mt-4 space-y-4 pb-8">
      {/* Innings header */}
      <div className="flex items-center justify-center gap-2">
        <img
          src={TEAM_MATCH_ICON}
          alt=""
          className="h-8 w-8 shrink-0"
          aria-hidden
        />
        <span className="text-[16px] font-bold tracking-wide text-white uppercase">
          {displayTeamName}
        </span>
        <span className="text-[13px] text-[#DA9811]">{inningsLabel}</span>
      </div>

      {/* 2nd innings chase row */}
      {secondInningsChase ? (
        <SecondInningsChaseRow
          target={secondInningsChase.target}
          requiredRunRate={secondInningsChase.requiredRunRate}
          ballsLeft={secondInningsChase.ballsLeft}
          runsToWin={secondInningsChase.runsToWin}
        />
      ) : null}

      {/* Live score */}
      <LiveScoreBox
        totalRuns={liveScore?.totalRuns ?? 0}
        totalWickets={liveScore?.totalWickets ?? 0}
        oversDisplay={liveScore?.oversDisplay ?? '0'}
        maxOvers={liveScore?.maxOvers ?? match?.overs}
      />

      {/* Match stats bar */}
      <MatchStatsRow
        extras={liveScore?.extras ?? 0}
        oversDisplay={liveScore?.oversDisplay ?? '0'}
        maxOvers={liveScore?.maxOvers ?? match?.overs}
        crr={liveScore?.crr ?? '0.0'}
        partnershipRuns={currentPartnership.runs}
        partnershipBalls={currentPartnership.balls}
      />

      {/* Batsmen table */}
      <BatsmenTable
        batsmenOnCrease={batsmenOnCrease}
        strikerIndex={strikerIndex}
        onStrikerChange={setStrikerIndex}
        retiredBatsmen={retiredBatsmen}
        hasSquad={battingOrder.length > 0}
        matchComplete={matchComplete}
        onAddBatsman={() => setAddBatsmanOpen(true)}
        onReplaceStriker={() => {
          setBatsmanDialogReplaceStriker(true);
          setAddBatsmanOpen(true);
        }}
      />

      {/* Bowler table */}
      <BowlerTable
        bowlersInTable={bowlersInTable}
        currentBowlerIndex={currentBowlerIndex}
        hasSquad={bowlingOrder.length > 0}
        matchComplete={matchComplete}
        onAddBowler={() => setAddBowlerOpen(true)}
        onReplaceBowler={() => {
          setBowlerDialogReplaceActive(true);
          setAddBowlerOpen(true);
        }}
      />

      {/* Over strip */}
      <OverStrip
        oversFromBalls={oversFromBalls}
        scrollRef={overStatsScrollRef}
      />

      {/* Scoring controls (hidden when match is complete or teams not ready) */}
      {isReadyToScore && (
        <ScoringControls
          pendingFreeHit={pendingFreeHit}
          extraTypeOptions={extraTypeOptions}
          onRun={handleRuns}
          onRunWithShot={openShotArea}
          onExtra={(type) => {
            setPendingExtraType(type);
            setExtraRunsDialogOpen(true);
          }}
          onPenaltyRuns={handlePenaltyRuns}
          onOut={() => setOutReasonModalOpen(true)}
          onRetiredHurt={() => setRetiredHurtConfirmOpen(true)}
          onUndo={handleUndo}
          onCustomScore={openCustomScore}
        />
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
        dismissalOptions={activeDismissalOptions}
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
        players={addBowlerDialogPlayers}
        onSelectFielder={(playerId) => handleOut(pendingDismissal, playerId)}
      />

      {/* Retired Hurt confirmation */}
      {retiredHurtConfirmOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 pb-8"
          role="dialog"
          aria-modal
          aria-label="Confirm retired hurt"
        >
          <div className="w-full max-w-sm rounded-t-2xl bg-[#141412] px-6 pt-6 pb-8">
            <p className="mb-1 text-center text-[15px] font-bold text-white">
              Retired Hurt?
            </p>
            <p className="mb-6 text-center text-[12px] text-white/60">
              {batsmenOnCrease[strikerIndex]?.name ?? 'Batsman'} will leave the
              crease. This does NOT count as a wicket and they may return later.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setRetiredHurtConfirmOpen(false)}
                className="flex-1 rounded-xl border border-[#3B3B35] py-3 text-[13px] font-bold text-white/70"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRetiredHurtConfirm}
                className="flex-1 rounded-xl bg-[#DA9811] py-3 text-[13px] font-bold text-[#080807]"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      <ShotAreaDialog
        open={shotAreaDialogOpen}
        onOpenChange={(open) => !open && closeShotArea()}
        onSelect={handleShotSelect}
        zones={shotPositionOptions.length > 0 ? shotPositionOptions : undefined}
      />

      <CustomScoreDialog
        open={customScoreDialogOpen}
        onOpenChange={(open) => {
          if (!open) closeCustomScore();
        }}
        value={customScoreInput}
        onChange={setCustomScoreInput}
        onSubmit={handleCustomScoreDone}
      />

      <ScoringSquadPlayerPickerDialog
        variant="batsman"
        open={addBatsmanOpen}
        onOpenChange={(open) => {
          if (!open) {
            setAddBatsmanOpen(false);
            setBatsmanDialogReplaceStriker(false);
          }
        }}
        players={addBatsmanDialogPlayers}
        ballHistory={ballHistory}
        canAddMoreBatsmen={canAddMoreBatsmen}
        isPlayerBattingOrOut={isPlayerBattingOrOut}
        getBatsmanDisplayStats={getBatsmanDisplayStats}
        isApiMatch={isApiMatch}
        hideSquadSetup={battingXiSavedOnApi}
        savingSquad={savingBatsmanSquad}
        requiredPlayingCount={requiredBatting}
        squad={battingSquad}
        onSaveSquad={handleSaveBatsmanSquad}
        onSetRole={setBatsmanRole}
        onPickBatsman={
          batsmanDialogReplaceStriker ? replaceStrikerWith : addBatsmanToCrease
        }
        replaceStrikerMode={batsmanDialogReplaceStriker}
        strikerId={batsmenOnCrease[strikerIndex]?.id}
        nonStrikerId={
          batsmenOnCrease.length > 1
            ? batsmenOnCrease[strikerIndex === 0 ? 1 : 0]?.id
            : undefined
        }
      />

      <ScoringSquadPlayerPickerDialog
        variant="bowler"
        open={addBowlerOpen}
        onOpenChange={(open) => {
          if (!open) {
            setAddBowlerOpen(false);
            setBowlerDialogReplaceActive(false);
          }
        }}
        players={addBowlerDialogPlayers}
        isApiMatch={isApiMatch}
        hideSquadSetup={bowlingXiSavedOnApi}
        savingSquad={savingBowlerSquad}
        requiredPlayingCount={requiredBowling}
        squad={bowlingSquad}
        onSaveSquad={handleSaveBowlerSquad}
        onSetRole={setBowlerRole}
        bowlersInTable={bowlersInTable}
        onSelectBowlerForNextOver={selectBowlerForNextOver}
        replaceActiveBowlerMode={bowlerDialogReplaceActive}
        activeBowlerId={
          bowlersInTable[
            Math.min(Math.max(0, currentBowlerIndex), bowlersInTable.length - 1)
          ]?.id
        }
        onReplaceActiveBowlerPick={handleReplaceActiveBowlerPick}
      />
    </div>
  );
}
