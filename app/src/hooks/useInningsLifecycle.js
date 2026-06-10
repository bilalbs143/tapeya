import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { buildPlayerOfMatchCandidates, computeMatchResultSummary, resolveManOfMatchWinnerScope } from '@/lib/utils/scoringUtils';
import { useUpdateTossMutation } from '@/store/api/matchApi';
import { useGetTeamSquadQuery } from '@/store/api/teamApi';

/**
 * Manages all innings-lifecycle events:
 *   - Toss dialog (auto-triggered on first load when toss is missing)
 *   - Pre-ball crease sync (PATCH /crease before first ball)
 *   - innings 1 → 2 transition
 *   - Innings-end / match-over dialog + MOTM flow
 *   - Post-match navigation
 *
 * Owns the currentInnings UI state so all inning-switching logic lives here.
 */
export function useInningsLifecycle({
  matchId,
  apiMatch,
  match,
  matchState,
  scorecard: _scorecard,
  dialogKey,
  openDialog,
  homeTeamId,
  awayTeamId,
  navigate,
}) {
  const playingElevenHome = matchState?.playing_eleven?.home;
  const playingElevenAway = matchState?.playing_eleven?.away;
  const { data: squadHome } = useGetTeamSquadQuery(homeTeamId, { skip: !homeTeamId });
  const { data: squadAway } = useGetTeamSquadQuery(awayTeamId, { skip: !awayTeamId });
  const scorecardLiveScore = useMemo(() => {
    const inn = (idx) => _scorecard?.innings?.[idx];
    const extrasTotal = (e) =>
      (e?.wides ?? 0) + (e?.no_balls ?? 0) + (e?.byes ?? 0) + (e?.leg_byes ?? 0) + (e?.penalty_runs ?? 0);
    return {
      innings1: inn(0)
        ? { totalRuns: inn(0).total_runs ?? 0, totalWickets: inn(0).total_wickets ?? 0, extras: extrasTotal(inn(0).extras) }
        : null,
      innings2: inn(1)
        ? { totalRuns: inn(1).total_runs ?? 0, totalWickets: inn(1).total_wickets ?? 0, extras: extrasTotal(inn(1).extras) }
        : null,
    };
  }, [_scorecard?.innings]);
  const [updateToss] = useUpdateTossMutation();

  // ── Innings tab state ─────────────────────────────────────────────────────
  const [currentInnings, setCurrentInnings] = useState('1');
  const isInnings2 = currentInnings === '2';

  // Auto-switch to innings 2 when the server advances (last ball of innings 1).
  useEffect(() => {
    if (matchState?.active_innings?.innings_number === 2) {
      setCurrentInnings('2');
    }
  }, [matchState?.active_innings?.innings_number]);

  // ── Toss ──────────────────────────────────────────────────────────────────

  const tossPromptedRef = useRef(false);

  useEffect(() => {
    tossPromptedRef.current = false;
  }, [matchId]);

  const handleSaveToss = useCallback(
    async ({ tossWinner, tossDecision }) => {
      if (!matchId || !apiMatch || !tossWinner || !tossDecision) return;
      const winningTeamId = tossWinner === 'home' ? apiMatch.home_team_id : apiMatch.away_team_id;
      await updateToss({ matchId, winning_team_id: winningTeamId, chose_to_bat_or_bowl: tossDecision }).unwrap();
    },
    [matchId, apiMatch, updateToss],
  );

  useEffect(() => {
    if (!apiMatch) return;
    const hasToss =
      apiMatch.chose_to_bat_or_bowl != null && (apiMatch.toss_winner_team_id != null || apiMatch.status === 'completed');
    if (!hasToss && apiMatch.status === 'scheduled' && !tossPromptedRef.current) {
      tossPromptedRef.current = true;
      openDialog('scoringToss', {
        homeTeamName: apiMatch.home_team?.name,
        awayTeamName: apiMatch.away_team?.name,
        homeTeamLogo: apiMatch.home_team?.logo ?? null,
        awayTeamLogo: apiMatch.away_team?.logo ?? null,
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

  // ── Innings-end / match-over dialog ───────────────────────────────────────

  const pendingInningsEndRef = useRef(null);
  const prevDialogKeyRef = useRef(null);
  const lastInningsEndShownRef = useRef(null);

  useEffect(() => {
    lastInningsEndShownRef.current = null;
  }, [matchId]);

  const handleInnings1Complete = useCallback(() => {
    setCurrentInnings('2');
    // syncPreBallCrease fires via ScoringTab's [isLiveInnings, hasBallsBowled] effect
  }, []);

  const requestInningsEndUI = useCallback(
    (payload) => {
      if (dialogKey === 'inningsEnd' || dialogKey === 'manOfTheMatch') return;

      const isMatchOver = payload?.completedInnings === 2;
      const battingTeamName = isInnings2 ? match?.teamB?.name || '' : match?.teamA?.name || '';
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

  // Auto-trigger innings-end dialog when match_state signals a completed innings.
  useEffect(() => {
    const completedInnings = matchState?.innings_just_completed;
    if (completedInnings == null || lastInningsEndShownRef.current === completedInnings) return;
    lastInningsEndShownRef.current = completedInnings;
    requestInningsEndUI({
      completedInnings,
      reason: matchState?.active_innings?.innings_complete_reason ?? 'overs_complete',
    });
  }, [matchState?.innings_just_completed, matchState?.active_innings?.innings_complete_reason, requestInningsEndUI]);

  // ── Navigation callbacks ──────────────────────────────────────────────────

  const onMatchEnded = useCallback(() => {
    const tid = apiMatch?.tournament_id;
    if (tid != null && tid !== '') {
      navigate(`/upcoming-tournaments/${tid}?tab=fixtures`, { replace: true });
    }
  }, [apiMatch?.tournament_id, navigate]);

  const onMatchDeclared = useCallback(() => {
    requestInningsEndUI({ completedInnings: 2, reason: 'manual' });
  }, [requestInningsEndUI]);

  const onTargetRevisionEnded = useCallback(() => {
    requestInningsEndUI({ completedInnings: 2, reason: 'target_reached' });
  }, [requestInningsEndUI]);

  return {
    currentInnings,
    setCurrentInnings,
    isInnings2,
    handleSaveToss,
    requestInningsEndUI,
    handleInnings1Complete,
    onMatchEnded,
    onMatchDeclared,
    onTargetRevisionEnded,
  };
}
