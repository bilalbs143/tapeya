import { useCallback, useEffect, useMemo, useRef } from 'react';

import { ActionMenuSheet } from '@/components/scoring/ActionMenuSheet';
import { BatsmenTable } from '@/components/scoring/BatsmenTable';
import { BowlerTable } from '@/components/scoring/BowlerTable';
import { LiveScoreBox } from '@/components/scoring/LiveScoreBox';
import { OverStrip } from '@/components/scoring/OverStrip';
import { ScoringControls } from '@/components/scoring/ScoringControls';
import { WicketSummaryScreen } from '@/components/scoring/wicket-summary/WicketSummaryScreen';
import { TeamLogo } from '@/components/TeamLogo';
import { useDialog } from '@/context/DialogContext';
import { InningsContext } from '@/context/InningsContext';
import { useScoringMatch } from '@/context/ScoringMatchContext';
import { useActionMenu } from '@/hooks/useActionMenu';
import { useCreaseSync } from '@/hooks/useCreaseSync';
import { useDismissalDialogs } from '@/hooks/useDismissalDialogs';
import { useInningsSquads } from '@/hooks/useInningsSquads';
import { usePlayerDialogs } from '@/hooks/usePlayerDialogs';
import { useScoringEngine } from '@/hooks/useScoringEngine';
import { useSquadPersistence } from '@/hooks/useSquadPersistence';
import { useToast } from '@/hooks/useToast';
import { useWicketSummaryFlow } from '@/hooks/useWicketSummaryFlow';
import { calculateStrikeRate } from '@/lib/utils/matchPlayerStatsUtils';
import {
  batsmenOnCreaseFromMatchState,
  bowlersInTableForLiveScoring,
  currentBowlerIndexInTable,
  getDismissalOptions,
  getExtraTypeOptions,
  getFreeHitDismissalOptions,
  getShotPositionOptions,
  scorecardInningsToBallHistory,
} from '@/lib/utils/scoringMappers';
import { buildOversFromBalls } from '@/lib/utils/scoringUtils';
import { useGetEnumsQuery } from '@/store/api/enumApi';
import { useGetMatchStateQuery, useGetScorecardQuery } from '@/store/api/matchApi';

import { MatchStatsRow, SecondInningsChaseRow } from '../MatchStatsRow';

// ─── Component ────────────────────────────────────────────────────────────────

export function ScoringTab({
  inningsNumber = '1',
  battingTeamName,
  battingTeamLogo,
  bowlingTeamName,
  bowlingTeamLogo,
  battingTeamId,
  bowlingTeamId,
  onMatchEnded,
  onMatchDeclared,
  onTargetRevisionEnded,
  registerOpenActionMenu,
}) {
  const { matchId, match, matchComplete, wagonWheelEnabled, innings1Id, innings2Id } = useScoringMatch();
  const toast = useToast();
  const { dialogKey, openDialog, closeDialog } = useDialog();

  // ── Squad state ───────────────────────────────────────────────────────────

  const {
    battingSquad,
    bowlingSquad,
    nameMap,
    battingPlayingElevenIds,
    bowlingPlayingElevenIds,
    battingXiSavedOnApi,
    bowlingXiSavedOnApi,
    addBatsmanDialogPlayers,
    addBowlerDialogPlayers,
    battingOrder,
    bowlingOrder,
    requiredBatting,
    requiredBowling,
    matchHasStarted,
    configuredPerSide,
    setBatsmanRole,
    setBowlerRole,
    addPlayerToBattingSquad,
    removePlayerFromBattingSquad,
    addPlayerToBowlingSquad,
    removePlayerFromBowlingSquad,
  } = useInningsSquads({ battingTeamId, bowlingTeamId });

  // ── Server data ───────────────────────────────────────────────────────────

  const { data: matchState } = useGetMatchStateQuery(matchId, { skip: !matchId });
  const { data: scorecard } = useGetScorecardQuery(matchId, { skip: !matchId });

  const inningsIdx = inningsNumber === '2' ? 1 : 0;
  const isInnings2 = inningsNumber === '2';
  const scorecardInnings = scorecard?.innings?.[inningsIdx] ?? null;
  const scorecardAllInnings = scorecard?.innings ?? [];

  const inningsId = isInnings2 ? innings2Id : innings1Id;
  const firstInningsComplete = scorecard?.innings?.[0]?.status === 'completed';
  const playersPerSide = match?.playersPerSide;

  const scorecardBalls = useMemo(
    () => (scorecardInnings ? scorecardInningsToBallHistory(scorecardInnings, nameMap) : []),
    [scorecardInnings, nameMap],
  );

  // Live score for this innings.
  const liveScore = useMemo(() => {
    const ai = matchState?.active_innings;
    const scInnings = scorecard?.innings?.[inningsIdx];
    if (ai && ai.innings_number === Number(inningsNumber)) {
      return {
        totalRuns: ai.total_runs ?? 0,
        totalWickets: ai.total_wickets ?? 0,
        totalBalls: ai.legal_balls ?? 0,
        validDeliveries: ai.legal_balls ?? 0,
        oversDisplay: ai.overs_display ?? '0.0',
        maxOvers: match?.overs ?? null,
        extras: ai.extras_breakdown?.total ?? 0,
        extrasBreakdown: ai.extras_breakdown ?? {},
        crr: ai.current_run_rate ?? '0.00',
        serverTarget: ai.target ?? null,
        serverRunsToWin: ai.runs_to_win ?? null,
        serverBallsRemaining: ai.balls_remaining ?? null,
        serverRequiredRunRate: ai.required_run_rate ?? null,
      };
    }
    if (scInnings) {
      return {
        totalRuns: scInnings.total_runs ?? 0,
        totalWickets: scInnings.total_wickets ?? 0,
        oversDisplay: scInnings.overs_display ?? '0.0',
        maxOvers: match?.overs ?? null,
        extras: scInnings.total_extras ?? 0,
        extrasBreakdown: scInnings.extras_breakdown ?? {},
        crr: scInnings.run_rate ?? '0.00',
      };
    }
    return { totalRuns: 0, totalWickets: 0, oversDisplay: '0.0', maxOvers: match?.overs ?? null, extras: 0, crr: '0.00' };
  }, [matchState?.active_innings, inningsIdx, inningsNumber, scorecard?.innings, match?.overs]);

  // Target for second innings chase display.
  const targetScore = useMemo(() => {
    if (!isInnings2) return undefined;
    return (
      matchState?.active_innings?.target ??
      (scorecard?.innings?.[0]?.total_runs != null ? scorecard.innings[0].total_runs + 1 : undefined)
    );
  }, [isInnings2, matchState?.active_innings?.target, scorecard?.innings]);

  // ── Derived live state ────────────────────────────────────────────────────

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
  const currentBowlerIndex = useMemo(
    () => currentBowlerIndexInTable(bowlersInTable, activeInnings),
    [bowlersInTable, activeInnings],
  );
  const strikerIndex = 0;
  const pendingFreeHit = isLiveInnings ? Boolean(activeInnings.next_is_free_hit) : false;
  const currentPartnership = isLiveInnings ? (activeInnings.current_partnership ?? { runs: 0, balls: 0 }) : { runs: 0, balls: 0 };
  const hasBallsBowled = (scorecardBalls?.length ?? 0) > 0;

  // ── Enum data ─────────────────────────────────────────────────────────────

  const { data: enums = {} } = useGetEnumsQuery();

  const allDismissalOptions = useMemo(() => getDismissalOptions(enums.dismissal_type), [enums.dismissal_type]);
  const activeDismissalOptions = useMemo(
    () => (pendingFreeHit ? getFreeHitDismissalOptions(allDismissalOptions) : allDismissalOptions),
    [allDismissalOptions, pendingFreeHit],
  );
  const extraTypeOptions = useMemo(() => getExtraTypeOptions(enums.extra_type), [enums.extra_type]);
  const shotPositionOptions = useMemo(() => getShotPositionOptions(enums.shot_position), [enums.shot_position]);

  // ── Derived display values ────────────────────────────────────────────────

  const inningsLabel = inningsNumber === '2' ? '2nd Innings' : '1st Innings';
  const displayTeamName =
    battingTeamName || (inningsNumber === '2' ? match?.teamB?.name || 'Team B' : match?.teamA?.name || 'Team A');

  const oversFromBalls = useMemo(() => buildOversFromBalls(scorecardBalls), [scorecardBalls]);

  const secondInningsChase = useMemo(() => {
    if (inningsNumber !== '2' || targetScore == null) return null;
    if (liveScore?.serverRunsToWin != null) {
      return {
        target: liveScore.serverTarget ?? targetScore,
        requiredRunRate: liveScore.serverRequiredRunRate ?? '—',
        ballsLeft: liveScore.serverBallsRemaining ?? 0,
        runsToWin: liveScore.serverRunsToWin,
      };
    }
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

  // ── Auto-scroll over strip ────────────────────────────────────────────────

  const overStatsScrollRef = useRef(null);
  useEffect(() => {
    const el = overStatsScrollRef.current;
    if (!el || scorecardBalls.length === 0) return;
    requestAnimationFrame(() => {
      el.scrollLeft = el.scrollWidth - el.clientWidth;
    });
  }, [scorecardBalls.length]);

  // Close in-progress scoring pickers when the match finishes.
  useEffect(() => {
    if (!matchComplete || !dialogKey) return;
    if (dialogKey === 'inningsEnd' || dialogKey === 'manOfTheMatch') return;
    if (dialogKey.startsWith('scoring')) {
      toast.info('Match completed — scoring controls locked.');
      closeDialog();
    }
  }, [matchComplete, dialogKey, closeDialog, toast]);

  const needsNewBatter = Boolean(isLiveInnings && matchState?.needs_new_batter);
  const canAddMoreBatsmen = batsmenOnCrease.length < 2 || needsNewBatter;

  // ── Player lookup helpers ─────────────────────────────────────────────────

  const isPlayerBattingOrOut = useCallback(
    (playerId) => {
      if (batsmenOnCrease.some((b) => String(b.id) === String(playerId))) return true;
      const rows = scorecardInnings?.batting_stats ?? scorecardInnings?.batting ?? [];
      const batted = rows.find((b) => String(b.id ?? b.player_id) === String(playerId));
      if (!batted) return false;
      return batted.dismissal_type != null && batted.dismissal_type !== 'retired_hurt';
    },
    [batsmenOnCrease, scorecardInnings?.batting_stats, scorecardInnings?.batting],
  );

  const eligibleTimedOutPlayers = useMemo(
    () =>
      addBatsmanDialogPlayers.filter((p) => {
        const row = scorecardInnings?.batting?.find((b) => String(b.player_id) === String(p.id));
        if (!row?.dismissal_type) return true;
        return row.dismissal_type === 'retired_hurt';
      }),
    [addBatsmanDialogPlayers, scorecardInnings?.batting],
  );

  const eligibleSubstitutePlayers = useMemo(
    () =>
      addBatsmanDialogPlayers.filter((p) => {
        if (batsmenOnCrease.some((b) => String(b.id) === String(p.id))) return false;
        const row = scorecardInnings?.batting?.find((b) => String(b.player_id) === String(p.id));
        if (!row?.dismissal_type) return true;
        return row.dismissal_type === 'retired_hurt';
      }),
    [addBatsmanDialogPlayers, batsmenOnCrease, scorecardInnings?.batting],
  );

  const getBatsmanDisplayStats = useCallback(
    (playerId) => {
      const onCrease = batsmenOnCrease.find((b) => String(b.id) === String(playerId));
      if (onCrease) {
        const { runs = 0, balls = 0, fours = 0, sixes = 0 } = onCrease;
        return { runs, balls, fours, sixes, strikeRate: calculateStrikeRate(runs, balls) };
      }
      const row = (scorecardInnings?.batting_stats ?? scorecardInnings?.batting ?? []).find(
        (b) => String(b.id ?? b.player_id) === String(playerId),
      );
      if (row) {
        const { runs = 0, balls = 0, fours = 0, sixes = 0 } = row;
        return {
          runs,
          balls,
          fours,
          sixes,
          strikeRate: row.strike_rate ?? calculateStrikeRate(runs, balls),
          creaseTimeSeconds: row.crease_time_seconds ?? undefined,
        };
      }
      return null;
    },
    [batsmenOnCrease, scorecardInnings?.batting, scorecardInnings?.batting_stats],
  );

  // ── Engine callback refs ──────────────────────────────────────────────────
  // Declared BEFORE engine so dialog openers can be passed as engine callbacks.

  const engineRef = useRef({});
  const openBatsmanDialogRef = useRef(null);
  const openBowlerDialogRef = useRef(null);

  // ── Crease operations ─────────────────────────────────────────────────────

  const { syncPreBallCrease } = useCreaseSync({ inningsKey: inningsNumber });

  // ── Squad persistence ─────────────────────────────────────────────────────

  const { handleSaveBatsmanSquad, handleSaveBowlerSquad } = useSquadPersistence({
    battingTeamId,
    bowlingTeamId,
    battingSquad,
    bowlingSquad,
    requiredBatting,
    requiredBowling,
    matchHasStarted,
    configuredPerSide,
    hasBallsBowled,
  });

  const scoringInningsId = isLiveInnings && activeInnings?.innings_id ? activeInnings.innings_id : inningsId;

  const inningsContextValue = useMemo(
    () => ({
      inningsNumber,
      inningsId: scoringInningsId,
      battingTeamId,
      bowlingTeamId,
      battingTeamName,
      bowlingTeamName,
      battingTeamLogo,
      bowlingTeamLogo,
      battingPlayingElevenIds,
      bowlingPlayingElevenIds,
      firstInningsComplete,
      isLiveInnings,
      battingSquad,
      bowlingSquad,
      addBatsmanDialogPlayers,
      addBowlerDialogPlayers,
      battingXiSavedOnApi,
      bowlingXiSavedOnApi,
      battingOrder,
      bowlingOrder,
      requiredBatting,
      requiredBowling,
      setBatsmanRole,
      setBowlerRole,
      addPlayerToBattingSquad,
      removePlayerFromBattingSquad,
      addPlayerToBowlingSquad,
      removePlayerFromBowlingSquad,
    }),
    [
      inningsNumber,
      scoringInningsId,
      battingTeamId,
      bowlingTeamId,
      battingTeamName,
      bowlingTeamName,
      battingTeamLogo,
      bowlingTeamLogo,
      battingPlayingElevenIds,
      bowlingPlayingElevenIds,
      firstInningsComplete,
      isLiveInnings,
      battingSquad,
      bowlingSquad,
      addBatsmanDialogPlayers,
      addBowlerDialogPlayers,
      battingXiSavedOnApi,
      bowlingXiSavedOnApi,
      battingOrder,
      bowlingOrder,
      requiredBatting,
      requiredBowling,
      setBatsmanRole,
      setBowlerRole,
      addPlayerToBattingSquad,
      removePlayerFromBattingSquad,
      addPlayerToBowlingSquad,
      removePlayerFromBowlingSquad,
    ],
  );

  // ── Scoring engine ────────────────────────────────────────────────────────
  // Must be called before useWicketSummaryFlow (which provides handleUndo).

  const prevNeedsBowlerRef = useRef(false);
  const prevDismissalBallIdRef = useRef(null);
  const innings2SetupPromptedRef = useRef(false);
  const preBallBowlerPromptedRef = useRef(false);

  // Declared before useScoringEngine so onWicketPending can reference it.
  const setWicketGateRef = useRef(null);

  const onWicketPending = useCallback(() => {
    setWicketGateRef.current?.(true);
    // Close any open dismissal dialog immediately so it never overlaps the summary.
    closeDialog();
  }, [closeDialog]);

  const onWicketFailed = useCallback(() => {
    setWicketGateRef.current?.(false);
  }, []);

  // Declared before engine so dialog openers can be passed as engine callbacks.
  const { openOutReasonDialog, openFielderPickerDialog, openCombinedWicketDialog } = useDismissalDialogs({
    openDialog,
    bowlingTeamId,
    batsmenOnCrease,
    addBowlerDialogPlayers,
    bowlersInTable,
    currentBowlerIndex,
    activeDismissalOptions,
    eligibleTimedOutPlayers,
    pendingFreeHit,
    engineRef,
  });

  const striker = batsmenOnCrease[strikerIndex] ?? null;
  const nonStriker = batsmenOnCrease[1 - strikerIndex] ?? null;
  const currentBowler = bowlersInTable[currentBowlerIndex] ?? null;

  const {
    handleRuns,
    handleSpecial,
    handlePenaltyRuns,
    initiateOut,
    handleOut,
    handleOutWithFielder,
    handleObstructTheField,
    handleSpecialDismissal,
    handleRunOut,
    handleCaughtOut,
    handleRetiredOut,
    handleRetiredHurt,
    handleUndo,
    isSubmitting,
  } = useScoringEngine({
    inningsId: scoringInningsId,
    striker,
    nonStriker,
    currentBowler,
    onDismissalRequired: openOutReasonDialog,
    onFielderRequired: openFielderPickerDialog,
    onBallStored: (result) => handleWicketBallStored(result),
    onWicketPending,
    onWicketFailed,
    matchComplete: matchComplete || !isLiveInnings,
  });

  // Keep engine ref current (dialog opener closures read it after render).
  engineRef.current = {
    handleRuns,
    handleOut,
    handleOutWithFielder,
    handleObstructTheField,
    handleSpecialDismissal,
    handleRunOut,
    handleCaughtOut,
    handleRetiredOut,
  };

  // ── Wicket summary flow ───────────────────────────────────────────────────

  const {
    wicketSummaryModel,
    wicketSummaryUndoing,
    handleWicketBallStored,
    handleWicketSummaryProceed,
    handleWicketSummaryUndo,
    wicketSummaryGateRef,
    setWicketGate,
  } = useWicketSummaryFlow({
    battingSquad,
    bowlingSquad,
    displayTeamName,
    bowlingTeamName,
    bowlingTeamId,
    inningsNumber,
    playersPerSide,
    getBatsmanDisplayStats,
    handleUndo,
    matchState,
    openBatsmanDialogRef,
  });

  // Wire the stable gate setter now that useWicketSummaryFlow has returned it.
  setWicketGateRef.current = setWicketGate;

  const openUndoConfirm = useCallback(
    (onConfirm) => {
      openDialog('confirm', {
        title: 'Undo Last Ball?',
        message: 'The last delivery will be removed and the innings score recalculated.',
        confirmLabel: 'Undo',
        onConfirm,
      });
    },
    [openDialog],
  );

  const requestUndoLastBall = useCallback(() => {
    openUndoConfirm(handleUndo);
  }, [openUndoConfirm, handleUndo]);

  const requestWicketSummaryUndo = useCallback(() => {
    openUndoConfirm(handleWicketSummaryUndo);
  }, [openUndoConfirm, handleWicketSummaryUndo]);

  // ── Player dialogs ────────────────────────────────────────────────────────

  const { handleStrikerIndexChange, openBatsmanDialog, openBowlerDialog, openChangeSquadWizard } = usePlayerDialogs({
    battingTeamId,
    bowlingTeamId,
    battingTeamName,
    bowlingTeamName,
    battingSquad,
    bowlingSquad,
    addBatsmanDialogPlayers,
    addBowlerDialogPlayers,
    battingXiSavedOnApi,
    bowlingXiSavedOnApi,
    requiredBatting,
    requiredBowling,
    setBatsmanRole,
    setBowlerRole,
    addPlayerToBattingSquad,
    removePlayerFromBattingSquad,
    addPlayerToBowlingSquad,
    removePlayerFromBowlingSquad,
    batsmenOnCrease,
    bowlersInTable,
    currentBowlerIndex,
    hasBallsBowled,
    strikerIndex,
    scorecardBalls,
    canAddMoreBatsmen,
    needsNewBatter,
    isPlayerBattingOrOut,
    getBatsmanDisplayStats,
    handleSaveBatsmanSquad,
    handleSaveBowlerSquad,
    openBatsmanDialogRef,
    battingStats: scorecardInnings?.batting_stats ?? [],
    bowlingStats: scorecardInnings?.bowling_stats ?? [],
    dismissalTypeOptions: allDismissalOptions,
  });

  // Assign refs so effects and wicket-summary can fire dialogs by ref.
  openBatsmanDialogRef.current = openBatsmanDialog;
  openBowlerDialogRef.current = openBowlerDialog;

  // ── needs_new_batter / needs_new_bowler effect ────────────────────────────

  // wicketSummaryModel is the state-based gate (ref gate handles the WebSocket
  // race condition; state gate handles late renders after the ref is already set).
  const summaryIsOpen = wicketSummaryModel !== null;

  useEffect(() => {
    if (!isLiveInnings) return;
    const needsBatter = Boolean(matchState?.needs_new_batter);
    const needsBowler = Boolean(matchState?.needs_new_bowler);
    const dismissalBallId = matchState?.last_dismissal_ball_id ?? null;
    const newDismissal = dismissalBallId != null && dismissalBallId !== prevDismissalBallIdRef.current;

    // Safety net: open picker on every new dismissal (even if needs_new_batter stayed true).
    if (needsBatter && newDismissal && !wicketSummaryGateRef.current && !summaryIsOpen) {
      prevDismissalBallIdRef.current = dismissalBallId;
      openBatsmanDialogRef.current?.(false, { afterWicket: true });
    } else if (!needsBatter) {
      prevDismissalBallIdRef.current = dismissalBallId;
    }

    // Suppress bowler dialog while wicket summary is showing, AND while a new
    // batsman still needs to be selected — batsman always comes first.
    if (needsBowler && !prevNeedsBowlerRef.current && !summaryIsOpen && !needsBatter) {
      openBowlerDialogRef.current?.();
    }

    prevNeedsBowlerRef.current = needsBowler;
  }, [
    isLiveInnings,
    matchState?.needs_new_batter,
    matchState?.needs_new_bowler,
    matchState?.last_dismissal_ball_id,
    summaryIsOpen,
    wicketSummaryGateRef,
  ]);

  // ── Pre-ball / innings-2 opening setup ────────────────────────────────────

  useEffect(() => {
    if (inningsNumber !== '2') {
      innings2SetupPromptedRef.current = false;
      return;
    }
    if (!firstInningsComplete || !isLiveInnings || hasBallsBowled) return;
    if (!battingXiSavedOnApi || !bowlingXiSavedOnApi) return;
    if (dialogKey || summaryIsOpen) return;
    if (batsmenOnCrease.length > 0) return;
    if (innings2SetupPromptedRef.current) return;

    innings2SetupPromptedRef.current = true;
    openBatsmanDialogRef.current?.(false);
  }, [
    inningsNumber,
    firstInningsComplete,
    isLiveInnings,
    hasBallsBowled,
    battingXiSavedOnApi,
    bowlingXiSavedOnApi,
    dialogKey,
    summaryIsOpen,
    batsmenOnCrease.length,
  ]);

  useEffect(() => {
    if (!isLiveInnings || hasBallsBowled) {
      preBallBowlerPromptedRef.current = false;
      return;
    }
    if (!battingXiSavedOnApi || !bowlingXiSavedOnApi) return;
    if (batsmenOnCrease.length < 2) {
      preBallBowlerPromptedRef.current = false;
      return;
    }
    if (bowlersInTable.length > 0) return;
    if (dialogKey || summaryIsOpen || matchState?.needs_new_batter || matchState?.needs_new_bowler) return;
    if (preBallBowlerPromptedRef.current) return;

    preBallBowlerPromptedRef.current = true;
    openBowlerDialogRef.current?.();
  }, [
    isLiveInnings,
    hasBallsBowled,
    battingXiSavedOnApi,
    bowlingXiSavedOnApi,
    batsmenOnCrease.length,
    bowlersInTable.length,
    dialogKey,
    summaryIsOpen,
    matchState?.needs_new_batter,
    matchState?.needs_new_bowler,
  ]);

  // ── Penalty runs dialog ───────────────────────────────────────────────────

  const openPenaltyRunsDialog = useCallback(() => {
    openDialog('scoringPenaltyRuns', {
      battingTeamName: battingTeamName ?? '',
      bowlingTeamName: bowlingTeamName ?? '',
      battingTeamLogo: battingTeamLogo ?? null,
      bowlingTeamLogo: bowlingTeamLogo ?? null,
      battingTeamId,
      bowlingTeamId,
      liveScore: isLiveInnings ? liveScore : null,
      allInnings: scorecardAllInnings,
      onConfirm: (uiFields) => handlePenaltyRuns(uiFields),
    });
  }, [
    openDialog,
    battingTeamName,
    bowlingTeamName,
    battingTeamLogo,
    bowlingTeamLogo,
    battingTeamId,
    bowlingTeamId,
    isLiveInnings,
    liveScore,
    scorecardAllInnings,
    handlePenaltyRuns,
  ]);

  // ── Action menu ───────────────────────────────────────────────────────────

  const { actionMenuOpen, setActionMenuOpen, actionMenuDisabledIds, handleActionMenuSelect } = useActionMenu({
    inningsNumber,
    battingTeamName,
    bowlingTeamName,
    bowlingTeamId,
    batsmenOnCrease,
    eligibleSubstitutePlayers,
    addBowlerDialogPlayers,
    onMatchEnded,
    onMatchDeclared,
    onTargetRevisionEnded,
    openPenaltyRunsDialog,
    openChangeSquadWizard,
  });

  // Close action menu when any dialog opens.
  useEffect(() => {
    if (dialogKey) setActionMenuOpen(false);
  }, [dialogKey, setActionMenuOpen]);

  useEffect(() => {
    registerOpenActionMenu?.(() => setActionMenuOpen(true));
    return () => registerOpenActionMenu?.(null);
  }, [registerOpenActionMenu, setActionMenuOpen]);

  // Push pre-ball crease to API before first ball.
  useEffect(() => {
    if (!isLiveInnings || hasBallsBowled) return;
    syncPreBallCrease();
  }, [isLiveInnings, hasBallsBowled, syncPreBallCrease]);

  // ── Inline scoring action helpers ─────────────────────────────────────────

  const openShotAreaForRuns = useCallback(
    (runs) => {
      openDialog('scoringShotArea', {
        zones: shotPositionOptions.length > 0 ? shotPositionOptions : undefined,
        onSelect: (zoneId) => engineRef.current.handleRuns?.(runs, { shotDirection: zoneId }),
      });
    },
    [openDialog, shotPositionOptions],
  );

  const openOverthrowDialog = useCallback(
    (initialDeliveryType = null) => {
      openDialog('scoringOverthrow', {
        initialDeliveryType,
        onConfirm: (uiFields) => handleSpecial(uiFields),
      });
    },
    [openDialog, handleSpecial],
  );

  const openRetiredHurtDialog = useCallback(() => {
    openDialog('scoringRetiredHurt', {
      batsmen: batsmenOnCrease,
      strikerId: batsmenOnCrease[0]?.id,
      nonStrikerId: batsmenOnCrease[1]?.id,
      bowlerId: bowlersInTable[currentBowlerIndex]?.id,
      onConfirm: (uiFields) => handleRetiredHurt(uiFields),
    });
  }, [openDialog, batsmenOnCrease, bowlersInTable, currentBowlerIndex, handleRetiredHurt]);

  // ── Render ────────────────────────────────────────────────────────────────

  const isReadyToScore =
    isLiveInnings && (batsmenOnCrease.length === 2 || needsNewBatter) && bowlersInTable.length > 0 && !matchComplete;

  return (
    <InningsContext.Provider value={inningsContextValue}>
      <div className="mt-4 space-y-4">
        {/* Innings header */}
        <div className="flex items-center justify-center gap-2">
          <TeamLogo name={battingTeamName} logo={battingTeamLogo} variant="scoring" />
          <span className="text-[16px] font-bold tracking-wide text-white uppercase">{displayTeamName}</span>
          <span className="text-brand text-[13px]">{inningsLabel}</span>
        </div>

        {secondInningsChase ? (
          <SecondInningsChaseRow
            target={secondInningsChase.target}
            requiredRunRate={secondInningsChase.requiredRunRate}
            ballsLeft={secondInningsChase.ballsLeft}
            runsToWin={secondInningsChase.runsToWin}
          />
        ) : null}

        <LiveScoreBox
          totalRuns={liveScore?.totalRuns ?? 0}
          totalWickets={liveScore?.totalWickets ?? 0}
          oversDisplay={liveScore?.oversDisplay ?? '0'}
          maxOvers={liveScore?.maxOvers ?? match?.overs}
          battingTeamName={displayTeamName}
          battingTeamLogo={battingTeamLogo}
          bowlingTeamName={bowlingTeamName}
          bowlingTeamLogo={bowlingTeamLogo}
        />

        <MatchStatsRow
          extras={liveScore?.extras ?? 0}
          oversDisplay={liveScore?.oversDisplay ?? '0'}
          maxOvers={liveScore?.maxOvers ?? match?.overs}
          crr={liveScore?.crr ?? '0.0'}
          partnershipRuns={currentPartnership.runs}
          partnershipBalls={currentPartnership.balls}
        />

        <BatsmenTable
          batsmenOnCrease={batsmenOnCrease}
          strikerIndex={strikerIndex}
          onStrikerChange={handleStrikerIndexChange}
          hasSquad={battingOrder.length > 0}
          matchComplete={matchComplete}
          onAddBatsman={() => openBatsmanDialog(false)}
          onReplaceStriker={() => openBatsmanDialog(true)}
        />

        <BowlerTable
          bowlersInTable={bowlersInTable}
          currentBowlerIndex={currentBowlerIndex}
          hasSquad={bowlingOrder.length > 0}
          matchComplete={matchComplete}
          onAddBowler={() => openBowlerDialog(false)}
          onReplaceBowler={() => openBowlerDialog(true)}
        />

        <OverStrip oversFromBalls={oversFromBalls} scrollRef={overStatsScrollRef} />

        {isReadyToScore && (
          <ScoringControls
            pendingFreeHit={pendingFreeHit}
            extraTypeOptions={extraTypeOptions}
            isSubmitting={isSubmitting}
            onRun={handleRuns}
            onRunWithShot={(runs) => (wagonWheelEnabled ? openShotAreaForRuns(runs) : handleRuns(runs))}
            onExtra={(type) => {
              if (type === 'nb') {
                openDialog('scoringNoBall', { onConfirm: (uiFields) => handleSpecial(uiFields) });
                return;
              }
              if (type === 'wd') {
                openDialog('scoringWideBall', { onConfirm: (uiFields) => handleSpecial(uiFields) });
                return;
              }
              openDialog('scoringExtraRuns', { extraType: type, onSelect: (runs) => handleSpecial({ type, runs }) });
            }}
            onOverthrow={() => openOverthrowDialog()}
            onOverthrowWide={() => openOverthrowDialog('wide')}
            onOverthrowNoBall={() => openOverthrowDialog('no_ball')}
            onWideWicket={() => openCombinedWicketDialog('wide')}
            onNoBallWicket={() => openCombinedWicketDialog('no_ball')}
            onPenaltyRuns={openPenaltyRunsDialog}
            onOut={initiateOut}
            onRetiredHurt={openRetiredHurtDialog}
            onUndo={requestUndoLastBall}
            onCustomScore={() => openDialog('scoringCustomScore', { onSubmit: (n) => handleRuns(n) })}
          />
        )}

        <ActionMenuSheet
          open={actionMenuOpen}
          onClose={() => setActionMenuOpen(false)}
          onSelect={handleActionMenuSelect}
          disabledIds={actionMenuDisabledIds}
        />

        <WicketSummaryScreen
          open={Boolean(wicketSummaryModel)}
          model={wicketSummaryModel}
          onUndo={requestWicketSummaryUndo}
          onProceed={() => {
            // Note: prevNeedsBowlerRef is NOT reset here. The API no longer sets
            // needs_new_bowler=true when an over ends on a wicket, so the bowler
            // dialog must not be forced after the incoming batsman is selected.
            // The scorer can change the bowler manually via Add/Replace Bowler.
            handleWicketSummaryProceed();
          }}
          isUndoing={wicketSummaryUndoing}
        />
      </div>
    </InningsContext.Provider>
  );
}
