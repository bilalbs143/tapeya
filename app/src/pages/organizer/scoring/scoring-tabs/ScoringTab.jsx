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
 *   • Manages dialog open/close state via unified DialogContext.
 *   • Manages squad save / player-picker interactions.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { BatsmenTable } from '@/components/scoring/BatsmenTable';
import { BowlerTable } from '@/components/scoring/BowlerTable';
import { LiveScoreBox } from '@/components/scoring/LiveScoreBox';
import { OverStrip } from '@/components/scoring/OverStrip';
import { ScoringControls } from '@/components/scoring/ScoringControls';
import { TeamLogo } from '@/components/TeamLogo';
import { useDialog } from '@/context/DialogContext';
import { useScoringEngine } from '@/hooks/useScoringEngine';
import {
  batsmenOnCreaseFromMatchState,
  bowlersInTableForLiveScoring,
  currentBowlerIndexInTable,
  dismissalRequiresFielder,
  getDismissalOptions,
  getExtraTypeOptions,
  getFreeHitDismissalOptions,
  getShotPositionOptions,
} from '@/lib/utils/scoringMappers';
import { buildOversFromBalls, buildPreBallCreasePatch } from '@/lib/utils/scoringUtils';
import { useGetEnumsQuery } from '@/store/api/enumApi';
import { useStoreMatchSquadMutation, useStorePlayingElevenMutation } from '@/store/api/matchApi';

import { MatchStatsRow, SecondInningsChaseRow } from '../MatchStatsRow';

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * @param {string}   matchId
 * @param {object}   match                   Full match config (overs, playersPerSide, etc.)
 * @param {boolean}  [matchComplete]
 * @param {string}   inningsNumber           '1' | '2'
 * @param {string}   [battingTeamName]       Display name for the batting team
 * @param {string|null} [battingTeamLogo]    Logo URL for the batting team
 * @param {number}   battingTeamId
 * @param {number}   bowlingTeamId
 * @param {number[]} [battingPlayingElevenIds]
 * @param {number[]} [bowlingPlayingElevenIds]
 *
 * @param {object}   matchState              GET /match-state (live crease + flags)
 * @param {object}   scorecardInnings        Active tab's innings slice
 * @param {object[]} scorecardBalls          UI balls for over strip (from scorecard)
 * @param {object[]} battingSquad
 * @param {object[]} bowlingSquad
 * @param {object}   liveScore               From match_state or scorecard totals
 * @param {number}   [targetScore]           2nd innings: first innings total + 1
 * @param {string|null} [inningsId]
 * @param {Function} [storeBall]
 * @param {Function} [deleteLastBall]
 * @param {Function} [onCreaseChange]      Partial PATCH /crease (manual picker actions).
 * @param {Function} [syncPreBallCrease]     Full crease sync from match_state (XI save, effect).
 */
export function ScoringTab({
  matchId,
  match,
  matchComplete = false,
  inningsNumber = '1',
  battingTeamName,
  battingTeamLogo,
  battingTeamId,
  bowlingTeamId,
  battingPlayingElevenIds = [],
  bowlingPlayingElevenIds = [],

  matchState,
  scorecardInnings,
  scorecardBalls = [],
  battingSquad: battingSquadFromProps = [],
  bowlingSquad: bowlingSquadFromProps = [],

  liveScore,
  targetScore,
  inningsId,
  storeBall,
  deleteLastBall,
  onCreaseChange,
  syncPreBallCrease,
}) {
  const [battingSquadDraft, setBattingSquadDraft] = useState(null);
  const [bowlingSquadDraft, setBowlingSquadDraft] = useState(null);

  useEffect(() => {
    setBattingSquadDraft(null);
  }, [battingSquadFromProps]);

  useEffect(() => {
    setBowlingSquadDraft(null);
  }, [bowlingSquadFromProps]);

  const battingSquad = battingSquadDraft ?? battingSquadFromProps;
  const bowlingSquad = bowlingSquadDraft ?? bowlingSquadFromProps;
  const setBattingSquad = useCallback(
    (fn) => setBattingSquadDraft((prev) => fn(prev ?? battingSquadFromProps)),
    [battingSquadFromProps],
  );
  const setBowlingSquad = useCallback(
    (fn) => setBowlingSquadDraft((prev) => fn(prev ?? bowlingSquadFromProps)),
    [bowlingSquadFromProps],
  );

  const tabInningsNum = Number(inningsNumber);
  const activeInnings = matchState?.active_innings;
  const isLiveInnings = activeInnings && activeInnings.innings_number === tabInningsNum;

  const batsmenOnCrease = useMemo(
    () => (isLiveInnings ? batsmenOnCreaseFromMatchState(activeInnings) : []),
    [isLiveInnings, activeInnings],
  );
  const bowlersInTable = useMemo(
    () => (isLiveInnings ? bowlersInTableForLiveScoring(activeInnings, scorecardInnings?.bowling_stats) : []),
    [isLiveInnings, activeInnings, scorecardInnings?.bowling_stats],
  );
  const strikerIndex = 0;
  const currentBowlerIndex = useMemo(
    () => currentBowlerIndexInTable(bowlersInTable, activeInnings),
    [bowlersInTable, activeInnings],
  );
  const pendingFreeHit = isLiveInnings ? Boolean(activeInnings.next_is_free_hit) : false;
  const currentPartnership = isLiveInnings ? (activeInnings.current_partnership ?? { runs: 0, balls: 0 }) : { runs: 0, balls: 0 };

  const hasBallsBowled = (scorecardBalls?.length ?? 0) > 0;
  // ── Enum data ────────────────────────────────────────────────────────────────

  const { data: enums = {} } = useGetEnumsQuery();
  const [storeMatchSquad] = useStoreMatchSquadMutation();
  const [storePlayingEleven] = useStorePlayingElevenMutation();

  const allDismissalOptions = useMemo(() => getDismissalOptions(enums.dismissal_type), [enums.dismissal_type]);

  // On a free hit only run_out / obstructing / hit_ball_twice are valid.
  const activeDismissalOptions = useMemo(
    () => (pendingFreeHit ? getFreeHitDismissalOptions(allDismissalOptions) : allDismissalOptions),
    [allDismissalOptions, pendingFreeHit],
  );

  const extraTypeOptions = useMemo(() => getExtraTypeOptions(enums.extra_type), [enums.extra_type]);
  const shotPositionOptions = useMemo(() => getShotPositionOptions(enums.shot_position), [enums.shot_position]);

  // ── Dialog context ───────────────────────────────────────────────────────────

  const { dialogKey, openDialog, closeDialog } = useDialog();

  // ── Derived ──────────────────────────────────────────────────────────────────

  const inningsLabel = inningsNumber === '2' ? '2nd Innings' : '1st Innings';
  const displayTeamName =
    battingTeamName || (inningsNumber === '2' ? match?.teamB?.name || 'Team B' : match?.teamA?.name || 'Team A');

  // Over strip reads from the RTK Scorecard cache (~4s lag after each ball — acceptable).
  // If zero-lag on the current over becomes a requirement, matchState.active_innings.current_over_balls
  // already contains the live over's balls in the same API shape and can be appended to the
  // completed overs from scorecard without any additional state or hooks.
  const oversFromBalls = useMemo(() => buildOversFromBalls(scorecardBalls), [scorecardBalls]);

  const secondInningsChase = useMemo(() => {
    if (inningsNumber !== '2' || targetScore == null) return null;
    // Prefer server-computed chase metrics (populated by matchState.active_innings)
    if (liveScore?.serverRunsToWin != null) {
      return {
        target: targetScore,
        requiredRunRate: liveScore.serverRequiredRunRate ?? '—',
        ballsLeft: liveScore.serverBallsRemaining ?? 0,
        runsToWin: liveScore.serverRunsToWin,
      };
    }
    // Fallback: local computation for the pre-hydration window
    if (liveScore == null) return null;
    const maxOversNum = liveScore.maxOvers ?? (match?.overs != null && match.overs !== '' ? Number(match.overs) : undefined);
    if (maxOversNum == null || Number.isNaN(maxOversNum)) return null;
    const maxBalls = Math.floor(maxOversNum * 6);
    const valid = liveScore.validDeliveries ?? 0;
    const ballsLeft = Math.max(0, maxBalls - valid);
    const runsToWin = Math.max(0, targetScore - (liveScore.totalRuns ?? 0));
    const oversRemaining = ballsLeft / 6;
    const requiredRunRate = runsToWin <= 0 ? '0.0' : ballsLeft <= 0 ? '—' : (runsToWin / oversRemaining).toFixed(1);
    return { target: targetScore, requiredRunRate, ballsLeft, runsToWin };
  }, [inningsNumber, targetScore, liveScore, match?.overs]);

  // ── Auto-scroll over strip ────────────────────────────────────────────────────

  const overStatsScrollRef = useRef(null);
  useEffect(() => {
    const el = overStatsScrollRef.current;
    if (!el || scorecardBalls.length === 0) return;
    requestAnimationFrame(() => {
      el.scrollLeft = el.scrollWidth - el.clientWidth;
    });
  }, [scorecardBalls.length]);

  // Innings-end is signalled by match_state.innings_just_completed in ScoringMatch (useEffect).
  // Do not close inningsEnd / manOfTheMatch here — ScoringMatch opens MOTM only after
  // the user taps Continue on the innings-end dialog (see pendingInningsEndRef effect).

  // Close in-progress scoring pickers when the match finishes (not flow dialogs).
  useEffect(() => {
    if (!matchComplete || !dialogKey) return;
    if (dialogKey === 'inningsEnd' || dialogKey === 'manOfTheMatch') return;
    if (dialogKey.startsWith('scoring')) closeDialog();
  }, [matchComplete, dialogKey, closeDialog]);

  // ── Capacity flags ────────────────────────────────────────────────────────────

  const canAddMoreBatsmen = batsmenOnCrease.length < 2;

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

  const battingCount = battingSquad.filter((p) => Number.isFinite(Number(p.id))).length;
  const bowlingCount = bowlingSquad.filter((p) => Number.isFinite(Number(p.id))).length;
  const requiredBatting = playersPerSide != null ? Math.min(playersPerSide, battingCount) : battingCount;
  const requiredBowling = playersPerSide != null ? Math.min(playersPerSide, bowlingCount) : bowlingCount;

  const addBatsmanDialogPlayers = useMemo(() => {
    if (!battingXiSavedOnApi) return battingSquad;
    const ids = new Set((battingPlayingElevenIds ?? []).map(String));
    const filtered = battingSquad.filter((p) => p.id != null && ids.has(String(p.id)));
    return filtered.length > 0 ? filtered : battingSquad;
  }, [battingSquad, battingPlayingElevenIds, battingXiSavedOnApi]);

  const addBowlerDialogPlayers = useMemo(() => {
    if (!bowlingXiSavedOnApi) return bowlingSquad;
    const ids = new Set((bowlingPlayingElevenIds ?? []).map(String));
    const filtered = bowlingSquad.filter((p) => p.id != null && ids.has(String(p.id)));
    return filtered.length > 0 ? filtered : bowlingSquad;
  }, [bowlingSquad, bowlingPlayingElevenIds, bowlingXiSavedOnApi]);

  const battingOrder = useMemo(() => battingSquad.filter((p) => p.role === 'playing'), [battingSquad]);
  const bowlingOrder = useMemo(() => bowlingSquad.filter((p) => p.role === 'playing'), [bowlingSquad]);

  // ── Player lookup helpers ─────────────────────────────────────────────────────

  const isPlayerBattingOrOut = useCallback(
    (playerId) => {
      const onCrease = batsmenOnCrease.some((b) => String(b.id) === String(playerId));
      if (onCrease) return true;
      const batted = scorecardInnings?.batting?.find((b) => String(b.player_id) === String(playerId));
      if (!batted) return false;
      return batted.dismissal_type != null && batted.dismissal_type !== 'retired_hurt';
    },
    [batsmenOnCrease, scorecardInnings?.batting],
  );

  const getBatsmanDisplayStats = useCallback(
    (playerId) => {
      const onCrease = batsmenOnCrease.find((b) => String(b.id) === String(playerId));
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
      const row = scorecardInnings?.batting?.find((b) => String(b.player_id) === String(playerId));
      if (row) {
        const runs = row.runs ?? 0;
        const balls = row.balls ?? 0;
        const fours = row.fours ?? 0;
        const sixes = row.sixes ?? 0;
        return {
          runs,
          balls,
          fours,
          sixes,
          strikeRate: !balls ? '0.0' : ((runs / balls) * 100).toFixed(1),
        };
      }
      return null;
    },
    [batsmenOnCrease, scorecardInnings?.batting],
  );

  // ── Engine callback refs (break circular dep: dialog openers ↔ engine) ────────

  const engineRef = useRef({});

  // ── Dialog openers (declared BEFORE engine so they can be passed as callbacks) ──

  const openOutReasonDialog = useCallback(() => {
    openDialog('scoringOutReason', {
      dismissalOptions: activeDismissalOptions,
      onSelectOption: (opt) => {
        engineRef.current.handleOut?.({
          dismissalType: opt.value,
          requiresFielder: dismissalRequiresFielder(opt),
        });
      },
    });
  }, [openDialog, activeDismissalOptions]);

  const openFielderPickerDialog = useCallback(
    (ball) => {
      openDialog('scoringFielderPicker', {
        message: 'Who was the fielder?',
        players: addBowlerDialogPlayers,
        onSelectFielder: (playerId) => {
          engineRef.current.handleOutWithFielder?.(ball, playerId);
        },
      });
    },
    [openDialog, addBowlerDialogPlayers],
  );

  // ── Scoring engine ────────────────────────────────────────────────────────────

  const striker = batsmenOnCrease[strikerIndex] ?? null;
  const nonStriker = batsmenOnCrease[1 - strikerIndex] ?? null;
  const currentBowler = bowlersInTable[currentBowlerIndex] ?? null;

  // Stable refs for dialog openers used in handleMatchState
  const openBatsmanDialogRef = useRef(null);
  const openBowlerDialogRef = useRef(null);

  const prevNeedsBatterRef = useRef(false);
  const prevNeedsBowlerRef = useRef(false);

  useEffect(() => {
    if (!isLiveInnings) return;
    const needsBatter = Boolean(matchState?.needs_new_batter);
    const needsBowler = Boolean(matchState?.needs_new_bowler);
    if (needsBatter && !prevNeedsBatterRef.current) {
      openBatsmanDialogRef.current?.();
    }
    if (needsBowler && !prevNeedsBowlerRef.current) {
      openBowlerDialogRef.current?.();
    }
    prevNeedsBatterRef.current = needsBatter;
    prevNeedsBowlerRef.current = needsBowler;
  }, [isLiveInnings, matchState?.needs_new_batter, matchState?.needs_new_bowler]);

  const scoringInningsId = isLiveInnings && activeInnings?.innings_id ? activeInnings.innings_id : inningsId;

  const {
    handleRuns,
    handleSpecial,
    handlePenaltyRuns,
    initiateOut,
    handleOut,
    handleOutWithFielder,
    handleRetiredHurt,
    handleUndo,
    isSubmitting,
  } = useScoringEngine({
    matchId,
    inningsId: scoringInningsId,
    striker,
    nonStriker,
    currentBowler,
    storeBall,
    deleteLastBall,
    onDismissalRequired: openOutReasonDialog,
    onFielderRequired: openFielderPickerDialog,
    matchComplete: matchComplete || !isLiveInnings,
  });

  // Keep engine ref current (used by dialog opener closures)
  engineRef.current = { handleRuns, handleOut, handleOutWithFielder };

  // Push local openers / bowler to API before the first ball (overlay + match_state).
  useEffect(() => {
    if (!isLiveInnings || hasBallsBowled) return;
    syncPreBallCrease?.();
  }, [isLiveInnings, hasBallsBowled, syncPreBallCrease]);

  // ── API squad persistence ─────────────────────────────────────────────────────

  const handleSaveBatsmanSquad = useCallback(
    async (updatedPlayers) => {
      if (!matchId || !battingTeamId) return;
      // Prefer the up-to-date players passed from the dialog over the
      // potentially-stale battingSquad closure value.
      const squad = updatedPlayers ?? battingSquad;
      const playingIds = squad.filter((p) => p.role === 'playing' && Number.isFinite(Number(p.id))).map((p) => Number(p.id));
      if (playingIds.length !== requiredBatting) return;
      try {
        const allIds = squad.filter((p) => Number.isFinite(Number(p.id))).map((p) => Number(p.id));
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
        const playing = squad.filter((p) => p.role === 'playing');
        closeDialog();
        if (playing.length >= 2 && !hasBallsBowled) {
          onCreaseChange?.({
            next_batter_id: Number(playing[0].id),
            next_non_striker_id: Number(playing[1].id),
          });
          syncPreBallCrease?.();
        }
      } catch {
        // Errors handled by API layer / toasts
      }
    },
    [
      matchId,
      battingTeamId,
      battingSquad,
      requiredBatting,
      storeMatchSquad,
      storePlayingEleven,
      closeDialog,
      hasBallsBowled,
      onCreaseChange,
      syncPreBallCrease,
    ],
  );

  const handleSaveBowlerSquad = useCallback(
    async (updatedPlayers) => {
      if (!matchId || !bowlingTeamId) return;
      // Prefer the up-to-date players passed from the dialog over the
      // potentially-stale bowlingSquad closure value.
      const squad = updatedPlayers ?? bowlingSquad;
      const playingIds = squad.filter((p) => p.role === 'playing' && Number.isFinite(Number(p.id))).map((p) => Number(p.id));
      if (playingIds.length !== requiredBowling) return;
      try {
        const allIds = squad.filter((p) => Number.isFinite(Number(p.id))).map((p) => Number(p.id));
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
        const playing = squad.filter((p) => p.role === 'playing');
        closeDialog();
        if (playing.length > 0 && !hasBallsBowled) {
          onCreaseChange?.({ next_bowler_id: Number(playing[0].id) });
          syncPreBallCrease?.();
        }
      } catch {
        // Errors handled by API layer / toasts
      }
    },
    [
      matchId,
      bowlingTeamId,
      bowlingSquad,
      requiredBowling,
      storeMatchSquad,
      storePlayingEleven,
      closeDialog,
      hasBallsBowled,
      onCreaseChange,
      syncPreBallCrease,
    ],
  );

  // ── Squad role toggles ────────────────────────────────────────────────────────

  const setBatsmanRole = useCallback(
    (id, role) => setBattingSquad((prev) => prev.map((b) => (b.id === id ? { ...b, role } : b))),
    [setBattingSquad],
  );

  const setBowlerRole = useCallback(
    (id, role) => setBowlingSquad((prev) => prev.map((b) => (b.id === id ? { ...b, role } : b))),
    [setBowlingSquad],
  );

  const handleStrikerIndexChange = useCallback(
    (newIndex) => {
      if (hasBallsBowled || !onCreaseChange) return;
      const patch = buildPreBallCreasePatch({
        batsmenOnCrease,
        strikerIndex: newIndex,
      });
      if (patch.next_batter_id && patch.next_non_striker_id) {
        onCreaseChange({
          next_batter_id: patch.next_batter_id,
          next_non_striker_id: patch.next_non_striker_id,
        });
      }
    },
    [hasBallsBowled, onCreaseChange, batsmenOnCrease],
  );

  // ── Add players to live tables ────────────────────────────────────────────────

  const addBatsmanToCrease = useCallback(
    async (player) => {
      if (batsmenOnCrease.length >= 2) return;
      const isSecond = batsmenOnCrease.length === 1;
      const key = isSecond ? (!hasBallsBowled ? 'next_non_striker_id' : 'next_batter_id') : 'next_batter_id';
      const patch = { [key]: Number(player.id) };
      try {
        await onCreaseChange?.(patch);
        closeDialog();
      } catch {
        // API layer / toasts handle errors; keep dialog open to retry.
      }
    },
    [batsmenOnCrease, hasBallsBowled, onCreaseChange, closeDialog],
  );

  const replaceStrikerWith = useCallback(
    (player) => {
      const cur = batsmenOnCrease[strikerIndex];
      if (!cur || String(cur.id) === String(player.id)) {
        closeDialog();
        return;
      }
      closeDialog();
      if (!hasBallsBowled) {
        onCreaseChange?.({ next_batter_id: Number(player.id) });
      }
    },
    [batsmenOnCrease, strikerIndex, closeDialog, hasBallsBowled, onCreaseChange],
  );

  const selectBowlerForNextOver = useCallback(
    async (player) => {
      const playingOk = bowlingXiSavedOnApi || player?.role === 'playing';
      if (!playingOk) return;
      try {
        await onCreaseChange?.({ next_bowler_id: Number(player.id) });
        closeDialog();
      } catch {
        // API layer / toasts handle errors; keep dialog open to retry.
      }
    },
    [bowlingXiSavedOnApi, closeDialog, onCreaseChange],
  );

  const handleReplaceActiveBowlerPick = useCallback(
    (player) => {
      const playingOk = bowlingXiSavedOnApi || player?.role === 'playing';
      if (!playingOk) return;
      closeDialog();
      onCreaseChange?.({ next_bowler_id: Number(player.id) });
    },
    [bowlingXiSavedOnApi, closeDialog, onCreaseChange],
  );

  // ── Dialog openers for batsman/bowler pickers ─────────────────────────────────

  const openBatsmanDialog = useCallback(
    (replaceStriker = false) => {
      // Once balls have been bowled the match is in progress — hide squad-setup
      // controls even if the API-saved XI isn't available yet.
      const matchInProgress = hasBallsBowled;
      openDialog('scoringBatsman', {
        variant: battingXiSavedOnApi ? 'picker' : 'squad',
        hideSquadSetup: matchInProgress,
        replaceStrikerMode: replaceStriker,
        players: addBatsmanDialogPlayers,
        ballHistory: scorecardBalls,
        canAddMoreBatsmen,
        isPlayerBattingOrOut,
        getBatsmanDisplayStats,
        strikerId: batsmenOnCrease[strikerIndex]?.id,
        nonStrikerId: batsmenOnCrease.length > 1 ? batsmenOnCrease[1 - strikerIndex]?.id : undefined,
        onPickBatsman: replaceStriker ? replaceStrikerWith : addBatsmanToCrease,
        // Squad-setup props (only used when variant === 'squad' and !matchInProgress)
        squad: battingSquad,
        onSaveSquad: handleSaveBatsmanSquad,
        onSetRole: setBatsmanRole,
        requiredPlayingCount: requiredBatting,
      });
    },
    [
      openDialog,
      battingXiSavedOnApi,
      addBatsmanDialogPlayers,
      scorecardBalls,
      hasBallsBowled,
      canAddMoreBatsmen,
      isPlayerBattingOrOut,
      getBatsmanDisplayStats,
      batsmenOnCrease,
      strikerIndex,
      replaceStrikerWith,
      addBatsmanToCrease,
      battingSquad,
      handleSaveBatsmanSquad,
      setBatsmanRole,
      requiredBatting,
    ],
  );
  openBatsmanDialogRef.current = openBatsmanDialog;

  const openBowlerDialog = useCallback(
    (replaceActive = false) => {
      const matchInProgress = hasBallsBowled;
      openDialog('scoringBowler', {
        variant: bowlingXiSavedOnApi ? 'picker' : 'squad',
        hideSquadSetup: matchInProgress,
        replaceActiveBowlerMode: replaceActive,
        players: addBowlerDialogPlayers,
        bowlersInTable,
        activeBowlerId: bowlersInTable[Math.min(Math.max(0, currentBowlerIndex), bowlersInTable.length - 1)]?.id,
        onSelectBowlerForNextOver: selectBowlerForNextOver,
        onReplaceActiveBowlerPick: handleReplaceActiveBowlerPick,
        // Squad-setup props (only used when variant === 'squad' and !matchInProgress)
        squad: bowlingSquad,
        onSaveSquad: handleSaveBowlerSquad,
        onSetRole: setBowlerRole,
        requiredPlayingCount: requiredBowling,
      });
    },
    [
      openDialog,
      bowlingXiSavedOnApi,
      addBowlerDialogPlayers,
      hasBallsBowled,
      bowlersInTable,
      currentBowlerIndex,
      selectBowlerForNextOver,
      handleReplaceActiveBowlerPick,
      bowlingSquad,
      handleSaveBowlerSquad,
      setBowlerRole,
      requiredBowling,
    ],
  );
  openBowlerDialogRef.current = openBowlerDialog;

  // ── Penalty runs ──────────────────────────────────────────────────────────────
  // Law 41.17: handled by useScoringEngine as type 'penalty' (not a wide).

  // ── Render ────────────────────────────────────────────────────────────────────

  const isReadyToScore = isLiveInnings && batsmenOnCrease.length === 2 && bowlersInTable.length > 0 && !matchComplete;

  return (
    <div className="mt-4 space-y-4 pb-8">
      {/* Innings header */}
      <div className="flex items-center justify-center gap-2">
        <TeamLogo name={battingTeamName} logo={battingTeamLogo} variant="scoring" />
        <span className="text-[16px] font-bold tracking-wide text-white uppercase">{displayTeamName}</span>
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
        onStrikerChange={handleStrikerIndexChange}
        hasSquad={battingOrder.length > 0}
        matchComplete={matchComplete}
        onAddBatsman={() => openBatsmanDialog(false)}
        onReplaceStriker={() => openBatsmanDialog(true)}
      />

      {/* Bowler table */}
      <BowlerTable
        bowlersInTable={bowlersInTable}
        currentBowlerIndex={currentBowlerIndex}
        hasSquad={bowlingOrder.length > 0}
        matchComplete={matchComplete}
        onAddBowler={() => openBowlerDialog(false)}
        onReplaceBowler={() => openBowlerDialog(true)}
      />

      {/* Over strip */}
      <OverStrip oversFromBalls={oversFromBalls} scrollRef={overStatsScrollRef} />

      {/* Scoring controls (hidden when match is complete or teams not ready) */}
      {isReadyToScore && (
        <ScoringControls
          pendingFreeHit={pendingFreeHit}
          extraTypeOptions={extraTypeOptions}
          isSubmitting={isSubmitting}
          onRun={handleRuns}
          onRunWithShot={(runs) =>
            openDialog('scoringShotArea', {
              zones: shotPositionOptions.length > 0 ? shotPositionOptions : undefined,
              onSelect: (zoneId) => engineRef.current.handleRuns?.(runs, { shotDirection: zoneId }),
            })
          }
          onExtra={(type) =>
            openDialog('scoringExtraRuns', {
              onSelect: (runs) => handleSpecial({ type, runs }),
            })
          }
          onPenaltyRuns={handlePenaltyRuns}
          onOut={initiateOut}
          onRetiredHurt={() =>
            openDialog('scoringRetiredHurt', {
              batsmanName: striker?.name,
              onConfirm: handleRetiredHurt,
            })
          }
          onUndo={handleUndo}
          onCustomScore={() =>
            openDialog('scoringCustomScore', {
              onSubmit: (n) => handleRuns(n),
            })
          }
        />
      )}
    </div>
  );
}
