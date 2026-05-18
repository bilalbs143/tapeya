/**
 * ScoringMatch – live scoring page (backend-first).
 *
 * Server data: RTK Query caches for Match, MatchState, Scorecard, squads.
 * Local UI state only: currentInnings tab, innings-end flow (toss via DialogManager).
 * ScoringTab reads crease/score from match_state and balls from scorecard.
 */

// ─── Imports ──────────────────────────────────────────────────────────────────

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { useNavigate, useParams, useSearchParams } from 'react-router-dom';

import { MatchCenterHero } from '@/components/MatchCenterHero';
import { useDialog } from '@/context/DialogContext';
import { useMatchScoringChannel } from '@/hooks/useMatchScoringChannel';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { MATCH_CENTER_HEADER_DESKTOP, MATCH_CENTER_HEADER_MOBILE } from '@/lib/constants/assets';
import { LG_MEDIA_QUERY } from '@/lib/constants/layout';
import {
  apiMatchToUiMatchConfig,
  apiPartnershipsToUiState,
  batsmenOnCreaseFromMatchState,
  bowlersInTableFromMatchState,
  buildInningsSquads,
  getDefaultInnings1TeamIds,
  scorecardInningsToBallHistory,
} from '@/lib/utils/scoringMappers';
import {
  buildPlayerOfMatchCandidates,
  buildPreBallCreasePatch,
  computeMatchResultSummary,
  resolveManOfMatchWinnerScope,
} from '@/lib/utils/scoringUtils';
import {
  useDeleteLastBallMutation,
  useGetMatchQuery,
  useGetMatchStateQuery,
  useGetScorecardQuery,
  useStoreBallMutation,
  useUpdateCreaseMutation,
  useUpdateTossMutation,
} from '@/store/api/matchApi';
import { useGetTeamSquadQuery } from '@/store/api/teamApi';
import { Container } from '@/ui/Container';
import { scorecardListClass, scorecardTriggerClass, Tabs, TabsList, TabsTrigger } from '@/ui/Tabs';

import { BallsTab, InfoTab, PartnershipTab, ScorecardTab, ScoringTab, StatsTab } from './scoring-tabs';

// ─── Constants ────────────────────────────────────────────────────────────────

const SCORING_TABS = [
  { value: 'scoring', label: 'Scoring' },
  { value: 'scorecard', label: 'Scorecard' },
  { value: 'partnership', label: 'Partnership' },
  { value: 'stats', label: 'Stats' },
  { value: 'balls', label: 'Balls' },
  { value: 'info', label: 'Info' },
];
const VALID_TABS = SCORING_TABS.map((t) => t.value);
const TAB_VIEWS = {
  balls: BallsTab,
  info: InfoTab,
  partnership: PartnershipTab,
  scorecard: ScorecardTab,
  scoring: ScoringTab,
  stats: StatsTab,
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function ScoringMatch() {
  const navigate = useNavigate();
  const { matchId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const isDesktop = useMediaQuery(LG_MEDIA_QUERY);
  const headerImageSrc = isDesktop ? MATCH_CENTER_HEADER_DESKTOP : MATCH_CENTER_HEADER_MOBILE;

  // ── API queries ────────────────────────────────────────────────────────────

  const { data: apiMatch, isLoading: matchLoading, isError: matchError } = useGetMatchQuery(matchId, { skip: !matchId });

  const { data: scorecard } = useGetScorecardQuery(matchId, {
    skip: !matchId || !apiMatch,
  });

  const homeTeamId = apiMatch?.home_team_id ?? apiMatch?.home_team?.id;
  const awayTeamId = apiMatch?.away_team_id ?? apiMatch?.away_team?.id;

  const { data: squadHome } = useGetTeamSquadQuery(homeTeamId, {
    skip: !matchId || !homeTeamId,
  });
  const { data: squadAway } = useGetTeamSquadQuery(awayTeamId, {
    skip: !matchId || !awayTeamId,
  });

  const { data: matchState } = useGetMatchStateQuery(matchId, {
    skip: !matchId || !apiMatch,
  });

  const playingElevenHome = matchState?.playing_eleven?.home;
  const playingElevenAway = matchState?.playing_eleven?.away;

  // ── Derived match config ───────────────────────────────────────────────────

  const match = useMemo(() => {
    if (!apiMatch) return null;
    const needsScorecardForLegacyToss =
      apiMatch.status === 'completed' && apiMatch.toss_winner_team_id == null && apiMatch.chose_to_bat_or_bowl != null;
    if (needsScorecardForLegacyToss && !scorecard?.innings?.[0]) return null;
    const homeSquadArr = Array.isArray(squadHome) ? squadHome : [];
    const awaySquadArr = Array.isArray(squadAway) ? squadAway : [];

    const { battingTeamId } = getDefaultInnings1TeamIds(apiMatch, scorecard);
    const hid = apiMatch.home_team_id != null ? Number(apiMatch.home_team_id) : null;
    const homeIsBatting = battingTeamId != null && hid != null && Number(battingTeamId) === hid;

    const batSquadArr = homeIsBatting ? homeSquadArr : awaySquadArr;
    const bowlSquadArr = homeIsBatting ? awaySquadArr : homeSquadArr;
    const batIds = homeIsBatting ? (playingElevenHome?.player_ids ?? []) : (playingElevenAway?.player_ids ?? []);
    const bowlIds = homeIsBatting ? (playingElevenAway?.player_ids ?? []) : (playingElevenHome?.player_ids ?? []);

    const battingPlayers = batIds.map((id) => {
      const u = batSquadArr.find((x) => x.id === id);
      return { id, name: u?.name ?? u?.nickname ?? `Player ${id}` };
    });
    const bowlingPlayers = bowlIds.map((id) => {
      const u = bowlSquadArr.find((x) => x.id === id);
      return { id, name: u?.name ?? u?.nickname ?? `Player ${id}` };
    });
    return apiMatchToUiMatchConfig(apiMatch, battingPlayers, bowlingPlayers, scorecard);
  }, [apiMatch, scorecard, playingElevenHome?.player_ids, playingElevenAway?.player_ids, squadHome, squadAway]);

  // Which innings tab is shown (UI only — not cricket authority)
  const [currentInnings, setCurrentInnings] = useState('1');
  /** Declared here (not below live scores) so no hook/useMemo deps hit TDZ before init. */
  const isInnings2 = currentInnings === '2';

  // ── API mutations ──────────────────────────────────────────────────────────

  const [storeBall] = useStoreBallMutation();
  const [deleteLastBall] = useDeleteLastBallMutation();
  const [updateCrease] = useUpdateCreaseMutation();
  const [updateToss] = useUpdateTossMutation();

  const { dialogKey, openDialog } = useDialog();
  const tossPromptedRef = useRef(false);

  /** Dedupes PATCH /crease when pre-ball crease is unchanged (XI save + effect). */
  const lastPreBallCreaseSyncRef = useRef(null);

  useEffect(() => {
    lastPreBallCreaseSyncRef.current = null;
  }, [matchId, currentInnings]);

  /**
   * Sync pre-ball crease from match_state (pending_players + broadcast).
   * Skips once the active innings has legal deliveries.
   */
  const syncPreBallCrease = useCallback(() => {
    if (!matchId) return;
    const ai = matchState?.active_innings;
    if (!ai || (ai.legal_balls ?? 0) > 0) {
      lastPreBallCreaseSyncRef.current = null;
      return;
    }

    const patch = buildPreBallCreasePatch({
      batsmenOnCrease: batsmenOnCreaseFromMatchState(ai),
      bowlersInTable: bowlersInTableFromMatchState(ai),
      strikerIndex: 0,
      currentBowlerIndex: 0,
    });
    if (Object.keys(patch).length === 0) return;

    const fingerprint = JSON.stringify(patch);
    if (lastPreBallCreaseSyncRef.current === fingerprint) return;
    lastPreBallCreaseSyncRef.current = fingerprint;

    updateCrease({ matchId, ...patch }).catch(() => {});
  }, [matchId, matchState?.active_innings, updateCrease]);

  // Scorecard innings IDs
  const innings1Id = useMemo(() => (scorecard?.innings?.[0] ? scorecard.innings[0].id : null), [scorecard?.innings]);
  const innings2Id = useMemo(() => (scorecard?.innings?.[1] ? scorecard.innings[1].id : null), [scorecard?.innings]);

  const defaultTeams = useMemo(() => getDefaultInnings1TeamIds(apiMatch, scorecard), [apiMatch, scorecard]);

  const innings1Squads = useMemo(() => {
    const sc = scorecard?.innings?.[0];
    const bat1TeamId = sc?.batting_team_id ?? defaultTeams.battingTeamId;
    const bowl1TeamId = sc?.bowling_team_id ?? defaultTeams.bowlingTeamId;
    if (bat1TeamId == null || bowl1TeamId == null) {
      return { battingSquad: [], bowlingSquad: [], nameMap: {} };
    }
    return buildInningsSquads({
      battingTeamId: bat1TeamId,
      bowlingTeamId: bowl1TeamId,
      homeTeamId,
      squadHome,
      squadAway,
      playingElevenHome,
      playingElevenAway,
    });
  }, [scorecard?.innings, defaultTeams, homeTeamId, squadHome, squadAway, playingElevenHome, playingElevenAway]);

  const innings2Squads = useMemo(() => {
    const sc1 = scorecard?.innings?.[0];
    const sc2 = scorecard?.innings?.[1];
    const ai = matchState?.active_innings;
    const bat2TeamId = sc2?.batting_team_id ?? ai?.batting_team_id ?? sc1?.bowling_team_id;
    const bowl2TeamId = sc2?.bowling_team_id ?? ai?.bowling_team_id ?? sc1?.batting_team_id;
    if (bat2TeamId == null || bowl2TeamId == null) {
      return { battingSquad: [], bowlingSquad: [], nameMap: {} };
    }
    return buildInningsSquads({
      battingTeamId: bat2TeamId,
      bowlingTeamId: bowl2TeamId,
      homeTeamId,
      squadHome,
      squadAway,
      playingElevenHome,
      playingElevenAway,
    });
  }, [scorecard?.innings, matchState?.active_innings, homeTeamId, squadHome, squadAway, playingElevenHome, playingElevenAway]);

  const activeSquads = isInnings2 ? innings2Squads : innings1Squads;

  // Auto-switch to innings 2 when the server advances (e.g. last ball of innings 1).
  // Manual tab changes are still allowed for read-only view of a completed innings.
  useEffect(() => {
    if (matchState?.active_innings?.innings_number === 2) {
      setCurrentInnings('2');
    }
  }, [matchState?.active_innings?.innings_number]);

  const handleSaveToss = useCallback(
    async ({ tossWinner, tossDecision }) => {
      if (!matchId || !apiMatch || !tossWinner || !tossDecision) return;
      const winningTeamId = tossWinner === 'home' ? apiMatch.home_team_id : apiMatch.away_team_id;
      await updateToss({
        matchId,
        winning_team_id: winningTeamId,
        chose_to_bat_or_bowl: tossDecision,
      }).unwrap();
    },
    [matchId, apiMatch, updateToss],
  );

  useEffect(() => {
    tossPromptedRef.current = false;
  }, [matchId]);

  // ── Toss dialog trigger ────────────────────────────────────────────────────

  useEffect(() => {
    if (!apiMatch) return;
    const hasToss =
      apiMatch.chose_to_bat_or_bowl != null &&
      (apiMatch.toss_winner_team_id != null || (apiMatch.status !== 'completed' && apiMatch.winning_team_id != null));
    if (!hasToss && apiMatch.status === 'scheduled' && !tossPromptedRef.current) {
      tossPromptedRef.current = true;
      openDialog('scoringToss', {
        homeTeamName: apiMatch.home_team?.name,
        awayTeamName: apiMatch.away_team?.name,
        onSave: handleSaveToss,
      });
    }
  }, [
    apiMatch,
    apiMatch?.id,
    apiMatch?.status,
    apiMatch?.winning_team_id,
    apiMatch?.toss_winner_team_id,
    apiMatch?.chose_to_bat_or_bowl,
    handleSaveToss,
    openDialog,
  ]);

  // ── Innings 1 → 2 transition ───────────────────────────────────────────────
  //
  // Invoked from the Redux dialog effect when `inningsEnd` closes after the first
  // innings (`pendingInningsEndRef.kind === 'first_break'`) — not from ScoringTab directly.
  //
  // Team flip logic:
  //   innings 1 bowling squad → innings 2 batting squad
  //   innings 1 batting squad → innings 2 bowling squad
  //
  // We use the ALREADY-RESOLVED innings1 squads (which have correct names from API)
  // and re-derive roles from the playing-eleven IDs (source of truth).
  //
  // Note: innings1.battingSquad and innings1.bowlingSquad already have { id, name }
  // from API hydration. buildRoleSquad handles them correctly whether or not they
  // already have a role field — roles are always re-derived from playingIds.

  /** Match finished — from API / scorecard only (no local scoring flag). */
  const matchComplete = useMemo(() => {
    if (!apiMatch) return false;
    if (apiMatch.status === 'completed') return true;
    const i1 = scorecard?.innings?.[0];
    const i2 = scorecard?.innings?.[1];
    if (!i1 || !i2) return false;
    return i1.status === 'completed' && i2.status === 'completed';
  }, [apiMatch, scorecard?.innings]);

  const handleInnings1Complete = useCallback(() => {
    setCurrentInnings('2');
    syncPreBallCrease();
  }, [syncPreBallCrease]);

  const scorecardLiveScore = useMemo(() => {
    const inn = (idx) => scorecard?.innings?.[idx];
    const extrasTotal = (e) =>
      (e?.wides ?? 0) + (e?.no_balls ?? 0) + (e?.byes ?? 0) + (e?.leg_byes ?? 0) + (e?.penalty_runs ?? 0);
    return {
      innings1: inn(0)
        ? {
            totalRuns: inn(0).total_runs ?? 0,
            totalWickets: inn(0).total_wickets ?? 0,
            extras: extrasTotal(inn(0).extras),
          }
        : null,
      innings2: inn(1)
        ? {
            totalRuns: inn(1).total_runs ?? 0,
            totalWickets: inn(1).total_wickets ?? 0,
            extras: extrasTotal(inn(1).extras),
          }
        : null,
    };
  }, [scorecard?.innings]);

  const activeLiveScore = useMemo(() => {
    const ai = matchState?.active_innings;
    const tabInningsNum = isInnings2 ? 2 : 1;
    const scIdx = tabInningsNum - 1;
    const scInnings = scorecard?.innings?.[scIdx];

    if (ai && ai.innings_number === tabInningsNum) {
      return {
        totalRuns: ai.total_runs ?? 0,
        totalWickets: ai.total_wickets ?? 0,
        totalBalls: ai.legal_balls ?? 0,
        validDeliveries: ai.legal_balls ?? 0,
        oversDisplay: ai.overs_display ?? '0.0',
        maxOvers: match?.overs ?? null,
        extras: null,
        extrasBreakdown: ai.extras_breakdown ?? {},
        crr: ai.current_run_rate ?? '0.00',
        serverTarget: ai.target ?? null,
        serverRunsToWin: ai.runs_to_win ?? null,
        serverBallsRemaining: ai.balls_remaining ?? null,
        serverRequiredRunRate: ai.required_run_rate ?? null,
      };
    }

    if (scInnings) {
      const e = scInnings.extras ?? {};
      const extras = (e.wides ?? 0) + (e.no_balls ?? 0) + (e.byes ?? 0) + (e.leg_byes ?? 0) + (e.penalty_runs ?? 0);
      return {
        totalRuns: scInnings.total_runs ?? 0,
        totalWickets: scInnings.total_wickets ?? 0,
        oversDisplay: scInnings.overs_display ?? '0.0',
        maxOvers: match?.overs ?? null,
        extras,
        extrasBreakdown: e,
        crr: scInnings.run_rate ?? '0.00',
      };
    }

    return {
      totalRuns: 0,
      totalWickets: 0,
      oversDisplay: '0.0',
      maxOvers: match?.overs ?? null,
      extras: 0,
      crr: '0.00',
    };
  }, [matchState?.active_innings, isInnings2, scorecard?.innings, match?.overs]);

  // Over strip reads from the RTK Scorecard cache (~4s lag after each ball — acceptable).
  // If zero-lag on the current over becomes a requirement, matchState.active_innings.current_over_balls
  // already contains the live over's balls in the same API shape and can be appended to the
  // completed overs from scorecard without any additional state or hooks.
  const activeScorecardBalls = useMemo(() => {
    const idx = isInnings2 ? 1 : 0;
    const scInnings = scorecard?.innings?.[idx];
    const nameMap = isInnings2 ? innings2Squads.nameMap : innings1Squads.nameMap;
    return scInnings ? scorecardInningsToBallHistory(scInnings, nameMap) : [];
  }, [scorecard?.innings, isInnings2, innings1Squads.nameMap, innings2Squads.nameMap]);

  // Snapshot written when opening `inningsEnd`, consumed when that dialog closes
  // (single source of truth for what happens next — keeps Dialog bodies stateless).
  // Shapes:
  //   { kind: 'first_break' } → run handleInnings1Complete
  //   { kind: 'match_over', openManOfTheMatch?, manOfTheMatchProps?, tournamentIdForNavigate? }
  //     → optional `openDialog({ key: 'manOfTheMatch' })`, else navigate to fixtures.
  const pendingInningsEndRef = useRef(null);
  const prevDialogKeyRef = useRef(null);

  const requestInningsEndUI = useCallback(
    (payload) => {
      if (dialogKey === 'inningsEnd' || dialogKey === 'manOfTheMatch') return;

      const isMatchOver = payload?.completedInnings === 2;
      const battingTeamName = isInnings2 ? match?.teamB?.name || '' : match?.teamA?.name || '';
      // Same string as GET /matches after refresh — already on match_state when the match ends.
      const serverResult = matchState?.match_result ?? apiMatch?.result_summary;
      const matchResultForDialog =
        isMatchOver && serverResult
          ? {
              tie: /^tie$/i.test(String(serverResult).trim()),
              winningTeamId: apiMatch?.winning_team_id ?? null,
              titleLine: serverResult,
            }
          : isMatchOver && scorecardLiveScore.innings1 && scorecardLiveScore.innings2
            ? computeMatchResultSummary(match, scorecardLiveScore.innings1, scorecardLiveScore.innings2)
            : undefined;
      const playerOfMatchAlreadySet = apiMatch?.player_of_match_user_id != null || apiMatch?.player_of_match?.id != null;
      const { useBothTeams: manOfMatchPickerUsesBothTeams } = resolveManOfMatchWinnerScope(
        apiMatch?.winning_team_id,
        matchResultForDialog,
      );
      const manOfMatchCandidates = isMatchOver
        ? buildPlayerOfMatchCandidates({
            winningTeamIdFromApi: apiMatch?.winning_team_id,
            liveSummary: matchResultForDialog,
            homeTeamId,
            awayTeamId,
            playingElevenHome,
            playingElevenAway,
            squadHome,
            squadAway,
          })
        : [];

      if (!isMatchOver) {
        pendingInningsEndRef.current = { kind: 'first_break' };
      } else {
        pendingInningsEndRef.current = {
          kind: 'match_over',
          openManOfTheMatch: !playerOfMatchAlreadySet && manOfMatchCandidates.length > 0,
          manOfTheMatchProps: {
            matchId,
            tournamentId: apiMatch?.tournament_id,
            manOfMatchPickerUsesBothTeams,
            manOfMatchCandidates,
          },
          tournamentIdForNavigate: apiMatch?.tournament_id ?? null,
        };
      }

      openDialog('inningsEnd', {
        variant: isMatchOver ? 'match_over' : 'first_innings_break',
        reason: payload?.reason ?? 'overs',
        battingTeamName,
        matchOvers: match?.overs != null ? Number(match.overs) : undefined,
        matchResult: matchResultForDialog,
      });
    },
    [
      apiMatch?.tournament_id,
      apiMatch?.winning_team_id,
      apiMatch?.player_of_match_user_id,
      apiMatch?.player_of_match,
      awayTeamId,
      currentInnings,
      dialogKey,
      openDialog,
      homeTeamId,
      isInnings2,
      scorecardLiveScore,
      match,
      matchId,
      matchState,
      playingElevenAway,
      playingElevenHome,
      squadAway,
      squadHome,
    ],
  );

  // When `inningsEnd` closes: first-innings break → team flip; match over → MOTM or navigate.
  useEffect(() => {
    const prev = prevDialogKeyRef.current;
    if (prev === 'inningsEnd' && dialogKey != null && dialogKey !== 'inningsEnd' && dialogKey !== 'manOfTheMatch') {
      pendingInningsEndRef.current = null;
    }
    if (prev === 'inningsEnd' && dialogKey == null) {
      const pending = pendingInningsEndRef.current;
      pendingInningsEndRef.current = null;
      if (pending?.kind === 'first_break') {
        handleInnings1Complete();
      } else if (pending?.kind === 'match_over') {
        if (pending.openManOfTheMatch && pending.manOfTheMatchProps) {
          openDialog('manOfTheMatch', pending.manOfTheMatchProps);
        } else if (pending.tournamentIdForNavigate != null && pending.tournamentIdForNavigate !== '') {
          navigate(`/upcoming-tournaments/${pending.tournamentIdForNavigate}?tab=fixtures`, { replace: true });
        }
      }
    }
    prevDialogKeyRef.current = dialogKey;
  }, [dialogKey, openDialog, handleInnings1Complete, navigate]);

  const lastInningsEndShownRef = useRef(null);

  useEffect(() => {
    lastInningsEndShownRef.current = null;
  }, [matchId]);

  useEffect(() => {
    const completedInnings = matchState?.innings_just_completed;
    if (completedInnings == null || lastInningsEndShownRef.current === completedInnings) {
      return;
    }
    lastInningsEndShownRef.current = completedInnings;
    requestInningsEndUI({
      completedInnings,
      reason: matchState?.active_innings?.innings_complete_reason ?? 'overs',
    });
  }, [matchState?.innings_just_completed, matchState?.active_innings?.innings_complete_reason, requestInningsEndUI]);

  useMatchScoringChannel(matchId);

  // Tell the API (and, by side-effect, the graphic overlay) which player is
  // about to bat or bowl, before they face or bowl their first ball.
  // Fire-and-forget — a failure only means the overlay briefly shows a blank
  // slot; it does not affect scoring correctness.
  const onCreaseChange = useCallback(
    (patch = {}) => {
      if (!matchId) return Promise.resolve();
      if (!patch || typeof patch !== 'object' || Object.keys(patch).length === 0) {
        return Promise.resolve();
      }
      return updateCrease({ matchId, ...patch }).unwrap();
    },
    [matchId, updateCrease],
  );

  // ── Tab routing ────────────────────────────────────────────────────────────

  const tabParam = searchParams.get('tab');
  const activeTab = VALID_TABS.includes(tabParam) ? tabParam : 'scoring';
  const ActiveView = TAB_VIEWS[activeTab];

  // ── Tab view props ─────────────────────────────────────────────────────────
  //
  // ScoringTab receives ONLY the active innings props — flat, no innings2* prefix.
  // Other tabs receive only what they need (per-tab scoped).
  //
  // Props specifically for ScoringTab — derived from the ACTIVE innings
  const scoringProps = useMemo(() => {
    const battingTeamId = isInnings2
      ? (scorecard?.innings?.[1]?.batting_team_id ?? match?.teamB?.id ?? awayTeamId)
      : (scorecard?.innings?.[0]?.batting_team_id ?? match?.teamA?.id ?? homeTeamId);
    const bowlingTeamId = isInnings2
      ? (scorecard?.innings?.[1]?.bowling_team_id ?? match?.teamA?.id ?? homeTeamId)
      : (scorecard?.innings?.[0]?.bowling_team_id ?? match?.teamB?.id ?? awayTeamId);
    const hid = homeTeamId != null ? Number(homeTeamId) : NaN;
    const battingPlayingElevenIds =
      Number(battingTeamId) === hid ? (playingElevenHome?.player_ids ?? []) : (playingElevenAway?.player_ids ?? []);
    const bowlingPlayingElevenIds =
      Number(bowlingTeamId) === hid ? (playingElevenHome?.player_ids ?? []) : (playingElevenAway?.player_ids ?? []);

    const scIdx = isInnings2 ? 1 : 0;
    const scInnings = scorecard?.innings?.[scIdx];

    return {
      inningsNumber: currentInnings,
      battingTeamName: isInnings2 ? match?.teamB?.name || '' : match?.teamA?.name || '',
      battingTeamId,
      bowlingTeamId,
      battingPlayingElevenIds,
      bowlingPlayingElevenIds,

      matchState,
      scorecardInnings: scInnings,
      scorecardBalls: activeScorecardBalls,
      battingSquad: activeSquads.battingSquad,
      bowlingSquad: activeSquads.bowlingSquad,
      liveScore: activeLiveScore,

      onInningsComplete: currentInnings === '1' || currentInnings === '2' ? requestInningsEndUI : undefined,
      targetScore: isInnings2
        ? (matchState?.active_innings?.target ??
          (scorecard?.innings?.[0]?.total_runs != null ? scorecard.innings[0].total_runs + 1 : undefined))
        : undefined,

      inningsId: isInnings2 ? innings2Id : innings1Id,
      storeBall,
      deleteLastBall,
      onCreaseChange,
      syncPreBallCrease,
    };
  }, [
    currentInnings,
    isInnings2,
    match,
    scorecard,
    homeTeamId,
    awayTeamId,
    playingElevenHome?.player_ids,
    playingElevenAway?.player_ids,
    activeSquads,
    activeLiveScore,
    activeScorecardBalls,
    matchState,
    requestInningsEndUI,
    innings1Id,
    innings2Id,
    storeBall,
    deleteLastBall,
    onCreaseChange,
    syncPreBallCrease,
  ]);

  // ── Tab view props (per-tab scoped — no 65-prop blob) ─────────────────────
  //
  // Each tab receives only what it needs.
  // ScoringTab: active innings state + engine actions (from scoringProps)
  // Display tabs: read-only pre-computed data only

  // Player name maps for scorecard → UI ball conversion.
  // Used by Stats/Balls tabs to resolve wicket-ball player names when the
  // scorecard is the data source (post-reconnect fresh data path).
  const nameMap1 = innings1Squads.nameMap;
  const nameMap2 = innings2Squads.nameMap;

  const tabViewProps = useMemo(() => {
    switch (activeTab) {
      case 'scoring':
        return {
          matchId,
          match,
          matchComplete,
          ...scoringProps,
        };

      case 'scorecard':
        return {
          match,
          innings1: scorecard?.innings?.[0] ?? null,
          innings2: scorecard?.innings?.[1] ?? null,
          // Active bowler from live match_state — used to show the red-dot
          // indicator on the currently bowling player in the scorecard table.
          activeBowlerId: matchState?.active_innings?.bowler?.id ?? null,
        };

      case 'partnership': {
        const sc1 = scorecard?.innings?.[0];
        const sc2 = scorecard?.innings?.[1];
        return {
          innings1: {
            partnerships: apiPartnershipsToUiState(sc1?.partnerships ?? [], nameMap1, sc1?.batting_stats ?? []),
          },
          innings2: {
            partnerships: apiPartnershipsToUiState(sc2?.partnerships ?? [], nameMap2, sc2?.batting_stats ?? []),
          },
        };
      }

      case 'stats':
        return {
          match,
          innings1BallHistory: scorecard?.innings?.[0] ? scorecardInningsToBallHistory(scorecard.innings[0], nameMap1) : [],
          innings2BallHistory: scorecard?.innings?.[1] ? scorecardInningsToBallHistory(scorecard.innings[1], nameMap2) : [],
        };

      case 'balls':
        return {
          innings1BallHistory: scorecard?.innings?.[0] ? scorecardInningsToBallHistory(scorecard.innings[0], nameMap1) : [],
          innings1Squad: innings1Squads.battingSquad,
          innings1BowlersInTable: [],
          innings1BowlerSquad: innings1Squads.bowlingSquad,
          innings2BallHistory: scorecard?.innings?.[1] ? scorecardInningsToBallHistory(scorecard.innings[1], nameMap2) : [],
          innings2BowlersInTable: [],
          innings2Squad: innings2Squads.battingSquad,
          innings2BowlerSquad: innings2Squads.bowlingSquad,
        };

      case 'info':
      default:
        return { match };
    }
  }, [
    activeTab,
    matchId,
    match,
    matchComplete,
    scoringProps,
    scorecard,
    matchState,
    activeLiveScore,
    currentInnings,
    isInnings2,
    innings1Squads,
    innings2Squads,
    nameMap1,
    nameMap2,
  ]);

  // ── Render ────────────────────────────────────────────────────────────────

  const isLoadingMatch = matchLoading;
  const isMatchError = matchError;

  return (
    <div className="bg-black">
      <Container className="!px-4 !py-0">
        <Tabs value={activeTab} onValueChange={(value) => setSearchParams({ tab: value })} className="w-full">
          <MatchCenterHero imageSrc={headerImageSrc} onBack={() => navigate(-1)}>
            <div className="pointer-events-auto absolute inset-x-0 bottom-0 translate-y-1/2 px-4">
              <TabsList className={`${scorecardListClass} lg:justify-center lg:overflow-x-visible`}>
                {SCORING_TABS.map(({ value, label }) => (
                  <TabsTrigger key={value} value={value} className={scorecardTriggerClass}>
                    {label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>
          </MatchCenterHero>

          {/* Active tab view */}
          <div className="-mx-4 bg-black px-4 pb-2">
            {isLoadingMatch && (
              <div className="flex min-h-[200px] items-center justify-center py-8 text-[14px] text-[#A2A6AB]">Loading match…</div>
            )}
            {isMatchError && (
              <div className="flex min-h-[200px] flex-col items-center justify-center gap-2 py-8 text-center">
                <p className="text-[14px] text-red-400">Failed to load match.</p>
                <button type="button" onClick={() => navigate(-1)} className="text-[14px] font-medium text-[#DA9811] underline">
                  Go back
                </button>
              </div>
            )}
            {matchComplete && !isLoadingMatch && !isMatchError && (
              <MatchResultBanner
                match={match}
                liveScore1={scorecardLiveScore.innings1}
                liveScore2={scorecardLiveScore.innings2}
                playerOfMatch={apiMatch?.player_of_match ?? null}
              />
            )}
            {!isLoadingMatch && !isMatchError && <ActiveView {...tabViewProps} />}
          </div>
        </Tabs>
      </Container>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

/** Displays match result when innings 2 completes (target achieved, all wickets, or all overs). */
function MatchResultBanner({ match, liveScore1, liveScore2, playerOfMatch }) {
  const s = computeMatchResultSummary(match, liveScore1, liveScore2);

  return (
    <div className="mb-6 rounded-[17px] bg-[#141412] p-8 text-center">
      <p className="text-[12px] font-bold tracking-wide text-[#DA9811] uppercase">Match Complete</p>
      <p className="mt-3 text-[18px] font-bold text-white capitalize">
        {s.tie ? s.titleLine : `${s.titleLine} ${s.marginLine ?? ''}`}
      </p>
      {s.tie && s.detailLine ? <p className="mt-2 text-[13px] text-[#A2A6AB]">{s.detailLine}</p> : null}
      {playerOfMatch?.name ? (
        <>
          <p className="mt-6 text-[12px] font-bold tracking-wide text-[#DA9811] uppercase">Man of the match</p>
          <p className="mt-3 text-[16px] font-bold text-white capitalize">{playerOfMatch.name}</p>
        </>
      ) : null}
    </div>
  );
}
