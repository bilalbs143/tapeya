/**
 * ScoringMatch – live scoring page.
 *
 * ── ARCHITECTURE ────────────────────────────────────────────────────────────
 *
 * State:
 *   innings1 = useInningsState()   ← all state for innings 1
 *   innings2 = useInningsState()   ← all state for innings 2
 *   currentInnings: '1' | '2'
 *
 *   The active innings is: currentInnings === '1' ? innings1 : innings2
 *   ScoringTab receives ONE flat set of props from the active innings.
 *   It has zero knowledge of innings numbers or the other innings.
 *
 * Team flip (handleInnings1Complete):
 *   Innings 1: teamA bats  (battingSquad = teamA), teamB bowls (bowlingSquad = teamB)
 *   Innings 2: teamB bats  (battingSquad = teamB), teamA bowls (bowlingSquad = teamA)
 *   We derive the correct squads from the API scorecard batting_team_id (source of truth),
 *   NOT from match.teamA/teamB which can be in unexpected order depending on toss.
 *
 * Ball replay (scorecardInningsToBallHistory):
 *   API returns balls in indeterminate order. They MUST be sorted by
 *   (over ASC, ball_in_over ASC) before replay. See useApiMatchSync.
 *
 * Responsibilities:
 *   ✓ Load match data from API only (no /match/new)
 *   ✓ Own ALL shared scoring state (via two useInningsState instances)
 *   ✓ useApiMatchSync hydrates innings from API scorecard + playing eleven
 *   ✓ Build API sync callbacks (syncBallToApi / syncUndoToApi) per innings
 *   ✓ Handle innings transition (1 → 2) with correct team flip
 *   ✓ Render tab shell + pass active innings props to ScoringTab
 *   ✓ Show toss dialog
 */

// ─── Imports ──────────────────────────────────────────────────────────────────

import { useCallback, useEffect, useMemo, useState } from 'react';

import { useNavigate, useParams, useSearchParams } from 'react-router-dom';

import matchCenterHeader from '@/assets/images/background/match-center-header.png';
import teamMatchIcon from '@/assets/images/icons/team-match-icon.svg';
import {
  useDeleteBallMutation,
  useGetMatchQuery,
  useGetPlayingElevenQuery,
  useGetScorecardQuery,
  useStoreBallMutation,
  useUpdateTossMutation,
} from '@/store/api/matchApi';
import { useGetTeamSquadQuery } from '@/store/api/teamApi';
import { Button } from '@/ui/Button';
import { Container } from '@/ui/Container';
import { Dialog, DialogContentProfile, DialogTitle } from '@/ui/Dialog';
import {
  scorecardListClass,
  scorecardTriggerClass,
  Tabs,
  TabsList,
  TabsTrigger,
} from '@/ui/Tabs';
import { ToggleGroup, ToggleGroupItem } from '@/ui/ToggleGroup';

import {
  BallsTab,
  InfoTab,
  PartnershipTab,
  ScorecardTab,
  ScoringTab,
  StatsTab,
} from './scoring-tabs';
import {
  blankBatsman,
  blankBowler,
  INITIAL_PARTNERSHIP,
  useInningsState,
} from './scoring-tabs/useInningsState';
import {
  apiMatchToUiMatchConfig,
  uiBallToStoreBallPayload,
} from './scoringMappers';
import { computeLiveScore } from './scoringUtils';
import { useApiMatchSync } from './useApiMatchSync';

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

// ─── Module-level helpers ─────────────────────────────────────────────────────

/** True when matchId is a valid numeric API match id (scoring is API-only). */
const isApiMatchId = (id) =>
  id != null && id !== '' && !Number.isNaN(Number(id));

/**
 * Builds a squad array with correct playing/bench roles.
 *
 * IMPORTANT: accepts either raw API squad objects ({ id, name }) OR already-processed
 * UI squad objects ({ id, name, role }). The role is ALWAYS re-derived from
 * playingIds — never trusted from the input object — so team-flip re-mapping is safe.
 *
 * @param {object[]} squadList    Array of { id, name, ... } objects.
 * @param {number[]} playingIds   IDs that should be marked 'playing'.
 * @returns {{ id, name, role }[]}
 */
function buildRoleSquad(squadList, playingIds) {
  const playingSet = new Set((playingIds ?? []).map(String));
  return (squadList ?? [])
    .filter((p) => p.id != null)
    .map((p) => ({
      id: p.id ?? p.user_id,
      name: p.name ?? p.nickname ?? `Player ${p.id ?? p.user_id}`,
      role: playingSet.has(String(p.id ?? p.user_id)) ? 'playing' : 'bench',
    }));
}

/**
 * Maps player IDs to { id, name } using a name-lookup map.
 * Falls back to "Player {id}" when the name is not found.
 */
function idsToPlayers(ids, nameMap) {
  return (ids ?? []).map((id) => ({
    id,
    name: nameMap[String(id)] ?? `Player ${id}`,
  }));
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ScoringMatch() {
  const navigate = useNavigate();
  const { matchId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const fromApi = isApiMatchId(matchId);

  // ── API queries ────────────────────────────────────────────────────────────

  const {
    data: apiMatch,
    isLoading: matchLoading,
    isError: matchError,
  } = useGetMatchQuery(matchId, { skip: !fromApi });

  const { data: scorecard } = useGetScorecardQuery(matchId, {
    skip: !fromApi || !apiMatch,
  });

  const homeTeamId = apiMatch?.home_team_id ?? apiMatch?.home_team?.id;
  const awayTeamId = apiMatch?.away_team_id ?? apiMatch?.away_team?.id;

  const { data: playingElevenHome } = useGetPlayingElevenQuery(
    { matchId, teamId: homeTeamId },
    { skip: !fromApi || !homeTeamId },
  );
  const { data: playingElevenAway } = useGetPlayingElevenQuery(
    { matchId, teamId: awayTeamId },
    { skip: !fromApi || !awayTeamId },
  );
  const { data: squadHome } = useGetTeamSquadQuery(homeTeamId, {
    skip: !fromApi || !homeTeamId,
  });
  const { data: squadAway } = useGetTeamSquadQuery(awayTeamId, {
    skip: !fromApi || !awayTeamId,
  });

  // ── Derived match config ───────────────────────────────────────────────────

  const match = useMemo(() => {
    if (!fromApi || !apiMatch) return null;
    const homeSquadArr = Array.isArray(squadHome) ? squadHome : [];
    const awaySquadArr = Array.isArray(squadAway) ? squadAway : [];
    const battingIds = playingElevenHome?.player_ids ?? [];
    const bowlingIds = playingElevenAway?.player_ids ?? [];
    const battingPlayers = battingIds.map((id) => {
      const u = homeSquadArr.find((x) => x.id === id);
      return { id, name: u?.name ?? u?.nickname ?? `Player ${id}` };
    });
    const bowlingPlayers = bowlingIds.map((id) => {
      const u = awaySquadArr.find((x) => x.id === id);
      return { id, name: u?.name ?? u?.nickname ?? `Player ${id}` };
    });
    return apiMatchToUiMatchConfig(apiMatch, battingPlayers, bowlingPlayers);
  }, [
    fromApi,
    apiMatch,
    playingElevenHome?.player_ids,
    playingElevenAway?.player_ids,
    squadHome,
    squadAway,
  ]);

  // Scoring is API-only: redirect if matchId is not a valid numeric id (e.g. /match/new)
  useEffect(() => {
    if (!fromApi) {
      navigate('/organizer/scoring/start-match', { replace: true });
    }
  }, [fromApi, navigate]);

  // ── Innings state — one hook per innings (Rules of Hooks: always top level) ─

  const innings1 = useInningsState();
  const innings2 = useInningsState();

  // Which innings is currently live
  const [currentInnings, setCurrentInnings] = useState('1');

  // ── Toss state ─────────────────────────────────────────────────────────────

  const [tossDialogOpen, setTossDialogOpen] = useState(false);
  const [tossWinner, setTossWinner] = useState(''); // 'home' | 'away'
  const [tossDecision, setTossDecision] = useState(''); // 'bat'  | 'bowl'

  // ── API mutations ──────────────────────────────────────────────────────────

  const [storeBall] = useStoreBallMutation();
  const [deleteBall] = useDeleteBallMutation();
  const [updateToss, { isLoading: isUpdatingToss }] = useUpdateTossMutation();

  // Scorecard innings IDs for sync callbacks
  const innings1Id = useMemo(
    () => (fromApi && scorecard?.innings?.[0] ? scorecard.innings[0].id : null),
    [fromApi, scorecard?.innings],
  );
  const innings2Id = useMemo(
    () => (fromApi && scorecard?.innings?.[1] ? scorecard.innings[1].id : null),
    [fromApi, scorecard?.innings],
  );

  useApiMatchSync({
    matchId,
    fromApi,
    apiMatch,
    scorecard,
    homeTeamId,
    awayTeamId,
    playingElevenHome,
    playingElevenAway,
    squadHome,
    squadAway,
    innings1,
    innings2,
    setCurrentInnings,
  });

  // ── Toss dialog trigger ────────────────────────────────────────────────────

  useEffect(() => {
    if (!fromApi || !apiMatch) return;
    const hasToss =
      apiMatch.winning_team_id != null && apiMatch.chose_to_bat_or_bowl != null;
    if (!hasToss && apiMatch.status === 'scheduled') setTossDialogOpen(true);
  }, [
    fromApi,
    apiMatch,
    apiMatch?.id,
    apiMatch?.status,
    apiMatch?.winning_team_id,
    apiMatch?.chose_to_bat_or_bowl,
  ]);

  const handleSaveToss = async () => {
    if (!fromApi || !matchId || !apiMatch || !tossWinner || !tossDecision)
      return;
    const winningTeamId =
      tossWinner === 'home' ? apiMatch.home_team_id : apiMatch.away_team_id;
    try {
      await updateToss({
        matchId,
        winning_team_id: winningTeamId,
        chose_to_bat_or_bowl: tossDecision,
      }).unwrap();
      setTossDialogOpen(false);
    } catch {
      // Errors handled by API layer / toasts
    }
  };

  // ── Innings 1 → 2 transition ───────────────────────────────────────────────
  //
  // Called by ScoringTab when wickets or overs end innings 1.
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

  const [matchComplete, setMatchComplete] = useState(false);

  const handleMatchComplete = useCallback(() => {
    setMatchComplete(true);
  }, []);

  const handleInnings1Complete = useCallback(() => {
    // Innings 2 batting = who bowled in innings 1 (innings1.bowlingSquad)
    // Innings 2 bowling = who batted in innings 1 (innings1.battingSquad)
    const i2BatTeamId = match?.teamB?.id ?? awayTeamId;
    const i2BowlTeamId = match?.teamA?.id ?? homeTeamId;

    const i2BatIds =
      i2BatTeamId === homeTeamId
        ? (playingElevenHome?.player_ids ?? [])
        : (playingElevenAway?.player_ids ?? []);
    const i2BowlIds =
      i2BowlTeamId === homeTeamId
        ? (playingElevenHome?.player_ids ?? [])
        : (playingElevenAway?.player_ids ?? []);

    // Build name map from innings-1 squads (names already resolved, no re-fetch needed)
    const nameMap = Object.fromEntries(
      [...innings1.battingSquad, ...innings1.bowlingSquad]
        .filter((p) => p.id != null)
        .map((p) => [String(p.id), p.name]),
    );

    const bat2Squad = buildRoleSquad(innings1.bowlingSquad, i2BatIds);
    const bowl2Squad = buildRoleSquad(innings1.battingSquad, i2BowlIds);

    const bat2Players = idsToPlayers(i2BatIds, nameMap);
    const bowl2Players = idsToPlayers(i2BowlIds, nameMap);

    innings2.reset({
      battingSquad: bat2Squad,
      bowlingSquad: bowl2Squad,
      batsmenOnCrease:
        bat2Players.length >= 2
          ? bat2Players.slice(0, 2).map(blankBatsman)
          : [],
      bowlersInTable:
        bowl2Players.length > 0
          ? bowl2Players.slice(0, 2).map(blankBowler)
          : [],
      ballHistory: [],
      completedPartnerships: [],
      currentPartnership: INITIAL_PARTNERSHIP,
      strikerIndex: 0,
      currentBowlerIndex: 0,
    });

    setCurrentInnings('2');
  }, [
    innings1.battingSquad,
    innings1.bowlingSquad,
    innings2,
    match,
    homeTeamId,
    awayTeamId,
    playingElevenHome,
    playingElevenAway,
  ]);

  // ── Live score computation ─────────────────────────────────────────────────

  const liveScore1 = useMemo(
    () => computeLiveScore(innings1.ballHistory, match?.overs),
    [innings1.ballHistory, match?.overs],
  );

  const liveScore2 = useMemo(
    () => computeLiveScore(innings2.ballHistory, match?.overs),
    [innings2.ballHistory, match?.overs],
  );

  // Active innings convenience
  const isInnings2 = currentInnings === '2';
  const activeInnings = isInnings2 ? innings2 : innings1;
  const activeLiveScore = isInnings2 ? liveScore2 : liveScore1;

  // ── API sync callbacks ─────────────────────────────────────────────────────
  //
  // Each callback closes over its own innings state. Created as two separate
  // useCallbacks so only the relevant one re-creates on state change.

  const syncBallToApi1 = useCallback(
    (ball, setLastBallId) => {
      if (!fromApi || !innings1Id || !matchId) return;
      const nonStriker = innings1.batsmenOnCrease[1 - innings1.strikerIndex];
      const payload = uiBallToStoreBallPayload({
        ballHistory: innings1.ballHistory,
        ball,
        nonStrikerId: nonStriker?.id,
        fielderId: ball.fielderId,
      });
      storeBall({ matchId, inningsId: innings1Id, payload })
        .unwrap()
        .then((data) => {
          if (data?.id) setLastBallId?.(data);
        })
        .catch(() => {});
    },
    [
      fromApi,
      matchId,
      innings1Id,
      innings1.ballHistory,
      innings1.batsmenOnCrease,
      innings1.strikerIndex,
      storeBall,
    ],
  );

  const syncUndoToApi1 = useCallback(
    (ballId) => {
      if (!fromApi || !innings1Id || !matchId || ballId == null) return;
      deleteBall({ matchId, inningsId: innings1Id, ballId }).catch(() => {});
    },
    [fromApi, matchId, innings1Id, deleteBall],
  );

  const syncBallToApi2 = useCallback(
    (ball, setLastBallId) => {
      if (!fromApi || !innings2Id || !matchId) return;
      const nonStriker = innings2.batsmenOnCrease[1 - innings2.strikerIndex];
      const payload = uiBallToStoreBallPayload({
        ballHistory: innings2.ballHistory,
        ball,
        nonStrikerId: nonStriker?.id,
        fielderId: ball.fielderId,
      });
      storeBall({ matchId, inningsId: innings2Id, payload })
        .unwrap()
        .then((data) => {
          if (data?.id) setLastBallId?.(data);
        })
        .catch(() => {});
    },
    [
      fromApi,
      matchId,
      innings2Id,
      innings2.ballHistory,
      innings2.batsmenOnCrease,
      innings2.strikerIndex,
      storeBall,
    ],
  );

  const syncUndoToApi2 = useCallback(
    (ballId) => {
      if (!fromApi || !innings2Id || !matchId || ballId == null) return;
      deleteBall({ matchId, inningsId: innings2Id, ballId }).catch(() => {});
    },
    [fromApi, matchId, innings2Id, deleteBall],
  );

  // ── Tab routing ────────────────────────────────────────────────────────────

  const tabParam = searchParams.get('tab');
  const activeTab = VALID_TABS.includes(tabParam) ? tabParam : 'scoring';
  const ActiveView = TAB_VIEWS[activeTab];

  // ── Tab view props ─────────────────────────────────────────────────────────
  //
  // ScoringTab receives ONLY the active innings props — flat, no innings2* prefix.
  // Other tabs receive both innings' data for display purposes.
  //
  // Split into two memos:
  //   scoringProps  — changes on every ball (scoring state)
  //   sharedProps   — stable match metadata

  const sharedProps = useMemo(
    () => ({
      matchId,
      match,
      matchComplete,
      isApiMatch: fromApi,
      innings1Id: innings1Id ?? undefined,
      // Both innings histories for display tabs (Scorecard, Stats, Partnership, Balls)
      ballHistory: innings1.ballHistory,
      innings2BallHistory: innings2.ballHistory,
      completedPartnerships: innings1.completedPartnerships,
      innings2CompletedPartnerships: innings2.completedPartnerships,
      liveScore: liveScore1,
      innings2LiveScore: liveScore2,

      // StatsTab + ScorecardTab/BallsTab need both innings' batsmen & bowlers
      squad: innings1.battingSquad,
      batsmenOnCrease: innings1.batsmenOnCrease,
      bowlersInTable: innings1.bowlersInTable,
      bowlerSquad: innings1.bowlingSquad,
      secondInningsBallHistory: innings2.ballHistory,
      secondInningsBatsmenOnCrease: innings2.batsmenOnCrease,
      secondInningsBowlersInTable: innings2.bowlersInTable,
      secondInningsSquad: innings2.battingSquad,
      secondInningsBowlerSquad: innings2.bowlingSquad,
      secondInningsLiveScore: liveScore2,

      // StatsTab expects innings-prefixed props
      innings1BatsmenOnCrease: innings1.batsmenOnCrease,
      innings1BowlersInTable: innings1.bowlersInTable,
      innings1BallHistory: innings1.ballHistory,
      innings1LiveScore: liveScore1,
      innings2BatsmenOnCrease: innings2.batsmenOnCrease,
      innings2BowlersInTable: innings2.bowlersInTable,
    }),
    [
      matchId,
      match,
      matchComplete,
      fromApi,
      innings1Id,
      innings1.ballHistory,
      innings2.ballHistory,
      innings1.battingSquad,
      innings2.battingSquad,
      innings1.bowlingSquad,
      innings2.bowlingSquad,
      innings1.batsmenOnCrease,
      innings2.batsmenOnCrease,
      innings1.bowlersInTable,
      innings2.bowlersInTable,
      innings1.completedPartnerships,
      innings2.completedPartnerships,
      liveScore1,
      liveScore2,
    ],
  );

  // Props specifically for ScoringTab — derived from the ACTIVE innings
  const scoringProps = useMemo(
    () => ({
      // Innings identity
      inningsNumber: currentInnings,
      battingTeamName: isInnings2
        ? match?.teamB?.name || ''
        : match?.teamA?.name || '',
      // FIX (BUG-10): use scorecard batting_team_id as source of truth, not match.teamA/B
      battingTeamId: isInnings2
        ? (scorecard?.innings?.[1]?.batting_team_id ??
          match?.teamB?.id ??
          awayTeamId)
        : (scorecard?.innings?.[0]?.batting_team_id ??
          match?.teamA?.id ??
          homeTeamId),
      bowlingTeamId: isInnings2
        ? (scorecard?.innings?.[1]?.bowling_team_id ??
          match?.teamA?.id ??
          homeTeamId)
        : (scorecard?.innings?.[0]?.bowling_team_id ??
          match?.teamB?.id ??
          awayTeamId),

      // Active innings state (flat — ScoringTab needs no innings2* props)
      ballHistory: activeInnings.ballHistory,
      setBallHistory: activeInnings.setBallHistory,
      batsmenOnCrease: activeInnings.batsmenOnCrease,
      setBatsmenOnCrease: activeInnings.setBatsmenOnCrease,
      bowlersInTable: activeInnings.bowlersInTable,
      setBowlersInTable: activeInnings.setBowlersInTable,
      strikerIndex: activeInnings.strikerIndex,
      setStrikerIndex: activeInnings.setStrikerIndex,
      currentBowlerIndex: activeInnings.currentBowlerIndex,
      setCurrentBowlerIndex: activeInnings.setCurrentBowlerIndex,
      currentPartnership: activeInnings.currentPartnership,
      setCurrentPartnership: activeInnings.setCurrentPartnership,
      completedPartnerships: activeInnings.completedPartnerships,
      setCompletedPartnerships: activeInnings.setCompletedPartnerships,
      battingSquad: activeInnings.battingSquad,
      setBattingSquad: activeInnings.setBattingSquad,
      bowlingSquad: activeInnings.bowlingSquad,
      setBowlingSquad: activeInnings.setBowlingSquad,
      liveScore: activeLiveScore,

      // Innings lifecycle
      onInningsComplete:
        currentInnings === '1'
          ? handleInnings1Complete
          : currentInnings === '2'
            ? handleMatchComplete
            : undefined,
      targetScore:
        isInnings2 && liveScore1?.totalRuns != null
          ? liveScore1.totalRuns + 1
          : undefined,

      // API sync (routed to correct innings)
      syncBallToApi: fromApi
        ? isInnings2
          ? syncBallToApi2
          : syncBallToApi1
        : undefined,
      syncUndoToApi: fromApi
        ? isInnings2
          ? syncUndoToApi2
          : syncUndoToApi1
        : undefined,
    }),
    [
      currentInnings,
      isInnings2,
      match,
      scorecard,
      homeTeamId,
      awayTeamId,
      activeInnings,
      activeLiveScore,
      liveScore1,
      handleInnings1Complete,
      handleMatchComplete,
      fromApi,
      syncBallToApi1,
      syncUndoToApi1,
      syncBallToApi2,
      syncUndoToApi2,
    ],
  );

  // Combined props for the active view.
  // Only merge scoringProps when on Scoring tab (it overrides ballHistory with active innings).
  // Display tabs (Stats, Scorecard, Balls, etc.) need ballHistory = innings 1 from sharedProps.
  const tabViewProps =
    activeTab === 'scoring'
      ? { ...sharedProps, ...scoringProps }
      : { ...sharedProps };

  // ── Render ────────────────────────────────────────────────────────────────

  const isLoadingMatch = fromApi && matchLoading;
  const isMatchError = fromApi && matchError;

  if (!fromApi) {
    return null; // Redirect to start-match is done in useEffect above
  }

  return (
    <div className="bg-black">
      <Container className="!px-4 !py-0">
        <Tabs
          value={activeTab}
          onValueChange={(value) => setSearchParams({ tab: value })}
          className="w-full"
        >
          {/* Header + tab strip */}
          <header className="-mx-4 pb-10">
            <div className="relative w-full">
              <img
                src={matchCenterHeader}
                alt=""
                className="h-auto w-full"
                aria-hidden
              />

              <div className="absolute inset-0 flex items-start px-4 pt-6">
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="flex h-[27px] w-[27px] shrink-0 cursor-pointer items-center justify-center rounded-full bg-white text-[#4a4a4a] transition-opacity active:opacity-80"
                  aria-label="Back"
                >
                  <BackIcon />
                </button>
              </div>

              <div className="pointer-events-auto absolute inset-x-0 bottom-0 translate-y-1/2 px-4">
                <div className="rounded-[24px] bg-black/0">
                  <TabsList className={scorecardListClass}>
                    {SCORING_TABS.map(({ value, label }) => (
                      <TabsTrigger
                        key={value}
                        value={value}
                        className={scorecardTriggerClass}
                      >
                        {label}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </div>
              </div>
            </div>
          </header>

          {/* Active tab view */}
          <div className="-mx-4 bg-black px-4 pb-2">
            {isLoadingMatch && (
              <div className="flex min-h-[200px] items-center justify-center py-8 text-[14px] text-[#A2A6AB]">
                Loading match…
              </div>
            )}
            {isMatchError && (
              <div className="flex min-h-[200px] flex-col items-center justify-center gap-2 py-8 text-center">
                <p className="text-[14px] text-red-400">
                  Failed to load match.
                </p>
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="text-[14px] font-medium text-[#DA9811] underline"
                >
                  Go back
                </button>
              </div>
            )}
            {matchComplete && !isLoadingMatch && !isMatchError && (
              <MatchResultBanner
                match={match}
                liveScore1={liveScore1}
                liveScore2={liveScore2}
              />
            )}
            {!isLoadingMatch && !isMatchError && (
              <ActiveView {...tabViewProps} />
            )}
          </div>

          {/* Toss dialog */}
          <Dialog open={tossDialogOpen} onOpenChange={setTossDialogOpen}>
            <DialogContentProfile className="!h-auto !max-h-[90vh]">
              <div className="flex min-h-0 flex-1 flex-col p-5">
                <DialogTitle className="text-[14px] !font-bold tracking-wide text-[#DA9811] uppercase">
                  Who Won the Toss?
                </DialogTitle>

                <div className="mt-5 flex gap-3">
                  {[
                    {
                      key: 'home',
                      label: apiMatch?.home_team?.name || 'Home Team',
                    },
                    {
                      key: 'away',
                      label: apiMatch?.away_team?.name || 'Away Team',
                    },
                  ].map(({ key, label }) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setTossWinner(key)}
                      className={`flex flex-1 cursor-pointer flex-col items-center justify-center gap-2 rounded-[17px] border-2 px-4 py-4 transition-colors focus:outline-none ${
                        tossWinner === key
                          ? 'border-[#DA9811] bg-[#DA9811] text-white'
                          : 'border-[#141412] bg-[#141412] text-white'
                      }`}
                    >
                      <img
                        src={teamMatchIcon}
                        alt=""
                        className="h-8 w-8 shrink-0"
                        aria-hidden
                      />
                      <span className="text-[14px] font-bold uppercase">
                        {label}
                      </span>
                    </button>
                  ))}
                </div>

                <p className="mt-6 text-[14px] font-medium text-white">
                  Decided To?
                </p>
                <ToggleGroup
                  type="single"
                  value={tossDecision}
                  onValueChange={(v) => v && setTossDecision(v)}
                  className="mt-2 flex cursor-pointer gap-2"
                >
                  <ToggleGroupItem
                    value="bat"
                    className="cursor-pointer"
                    aria-label="Bat"
                  >
                    Bat
                  </ToggleGroupItem>
                  <ToggleGroupItem
                    value="bowl"
                    className="cursor-pointer"
                    aria-label="Bowl"
                  >
                    Bowl
                  </ToggleGroupItem>
                </ToggleGroup>

                <div className="mt-6">
                  <Button
                    type="button"
                    variant="orange"
                    className="w-full cursor-pointer"
                    onClick={handleSaveToss}
                    disabled={
                      isUpdatingToss || !tossWinner || !tossDecision || !fromApi
                    }
                  >
                    {isUpdatingToss ? 'Saving toss…' : 'Save Toss'}
                  </Button>
                </div>
              </div>
            </DialogContentProfile>
          </Dialog>
        </Tabs>
      </Container>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

/** Displays match result when innings 2 completes (target achieved, all wickets, or all overs). */
function MatchResultBanner({ match, liveScore1, liveScore2 }) {
  const target = (liveScore1?.totalRuns ?? 0) + 1;
  const runs2 = liveScore2?.totalRuns ?? 0;
  const wickets2 = liveScore2?.totalWickets ?? 0;
  const maxWickets =
    match?.playersPerSide != null ? match.playersPerSide - 1 : 10;
  const teamA = match?.teamA?.name ?? '';
  const teamB = match?.teamB?.name ?? '';

  const chasingWon = runs2 >= target;
  const winnerName = chasingWon ? teamB : teamA;
  const margin = chasingWon
    ? `${maxWickets - wickets2} wicket${maxWickets - wickets2 !== 1 ? 's' : ''}`
    : `${target - 1 - runs2} run${target - 1 - runs2 !== 1 ? 's' : ''}`;

  return (
    <div className="mb-6 rounded-[17px] border border-[#DA9811] bg-[#141412] p-6 text-center">
      <p className="text-[12px] font-bold tracking-wide text-[#DA9811] uppercase">
        Match Complete
      </p>
      <p className="mt-3 text-[18px] font-bold text-white">
        {winnerName || '—'} won by {margin}
      </p>
    </div>
  );
}

function BackIcon() {
  return (
    <svg
      className="h-5 w-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M15 19l-7-7 7-7" />
    </svg>
  );
}
