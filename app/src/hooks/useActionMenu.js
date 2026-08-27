import { useCallback, useMemo, useState } from 'react';

import { useDialog } from '@/context/DialogContext';
import { useScoringMatch } from '@/context/ScoringMatchContext';
import { useToast } from '@/hooks/useToast';
import { SCORING_ACTION_MENU_ITEMS } from '@/lib/constants/scoringActionMenu';
import { useGetMatchStateQuery, useGetScorecardQuery } from '@/store/api/matchApi';

/**
 * Action menu open/close state, disabled item set, and selection handler.
 * openPenaltyRunsDialog and openChangeSquadWizard are passed in because
 * they depend on engine state and player dialog state respectively.
 */
export function useActionMenu({
  // matchId/match/matchComplete → useScoringMatch()
  // openDialog/toast → useDialog()/useToast()
  // isLiveInnings/inningsId/activeInnings/scorecardInnings/firstInningsComplete → RTK cache
  // targetScore/liveScore → derived from RTK cache internally
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
}) {
  const { matchId, match, matchComplete, canOperate } = useScoringMatch();
  const { openDialog } = useDialog();
  const toast = useToast();

  // Derived from RTK cache — already subscribed by ScoringMatch, zero extra requests.
  const { data: matchState } = useGetMatchStateQuery(matchId, { skip: !matchId });
  const { data: scorecard } = useGetScorecardQuery(matchId, { skip: !matchId });

  const activeInnings = matchState?.active_innings ?? null;
  const inningsIdx = inningsNumber === '2' ? 1 : 0;
  const isLiveInnings = Boolean(activeInnings && activeInnings.innings_number === Number(inningsNumber));
  const inningsId = activeInnings?.innings_id ?? scorecard?.innings?.[inningsIdx]?.id ?? null;
  const scorecardInnings = scorecard?.innings?.[inningsIdx] ?? null;
  const firstInningsComplete = scorecard?.innings?.[0]?.status === 'completed';

  // targetScore and serverTarget derived from internal RTK queries.
  const serverTarget = activeInnings?.target ?? null;
  const targetScore =
    inningsNumber === '2'
      ? (activeInnings?.target ?? (scorecard?.innings?.[0]?.total_runs != null ? scorecard.innings[0].total_runs + 1 : undefined))
      : undefined;

  const [actionMenuOpen, setActionMenuOpen] = useState(false);

  const actionMenuDisabledIds = useMemo(() => {
    const disabled = new Set();
    if (matchComplete || !canOperate) {
      for (const item of SCORING_ACTION_MENU_ITEMS) disabled.add(item.id);
      return disabled;
    }
    if (!isLiveInnings || inningsId == null) {
      disabled.add('end_innings');
      disabled.add('give_penalty_runs');
      disabled.add('add_additional_runs');
    }
    if (scorecardInnings?.status === 'completed') {
      disabled.add('end_innings');
    }
    if (inningsNumber !== '2' || !firstInningsComplete) {
      disabled.add('revise_target');
    }
    return disabled;
  }, [matchComplete, canOperate, isLiveInnings, inningsId, scorecardInnings?.status, inningsNumber, firstInningsComplete]);

  const handleActionMenuSelect = useCallback(
    (actionId) => {
      setActionMenuOpen(false);
      switch (actionId) {
        case 'end_innings':
          if (matchId && inningsId != null) {
            openDialog('scoringEndInnings', { matchId, inningsId: inningsId });
          }
          break;
        case 'give_penalty_runs':
          openPenaltyRunsDialog();
          break;
        case 'cancel_match':
          if (matchId) {
            openDialog('scoringEndMatch', { matchId, onEnded: onMatchEnded });
          }
          break;
        case 'declare_results':
          if (matchId && match?.homeTeam?.id != null && match?.awayTeam?.id != null) {
            openDialog('scoringDeclareResult', {
              matchId,
              teamAName: match.homeTeam.name ?? '',
              teamBName: match.awayTeam.name ?? '',
              teamALogo: match.homeTeam.logo ?? null,
              teamBLogo: match.awayTeam.logo ?? null,
              homeTeamId: match.homeTeam.id,
              awayTeamId: match.awayTeam.id,
              onDeclared: onMatchDeclared,
            });
          }
          break;
        case 'revise_target':
          if (matchId) {
            openDialog('scoringReviseTarget', {
              matchId,
              currentTarget: targetScore ?? serverTarget ?? null,
              onInningsEnded: onTargetRevisionEnded,
            });
          }
          break;
        case 'change_wicket_keeper':
          if (matchId && bowlingTeamId != null) {
            openDialog('scoringChangeWicketKeeper', {
              matchId,
              teamId: bowlingTeamId,
              players: addBowlerDialogPlayers,
            });
          }
          break;
        case 'substitute_player':
          if (matchId && inningsId != null && batsmenOnCrease.length > 0) {
            openDialog('scoringSubstitutePlayer', {
              matchId,
              inningsId: inningsId,
              batsmen: batsmenOnCrease,
              substitutePlayers: eligibleSubstitutePlayers,
              fieldingPlayers: addBowlerDialogPlayers,
            });
          }
          break;
        case 'change_squad':
          openChangeSquadWizard();
          break;
        case 'add_breaks':
          if (matchId) {
            openDialog('scoringAddBreaks', { matchId, inningsId: inningsId ?? null });
          }
          break;
        case 'match_notes':
          if (matchId) {
            openDialog('scoringMatchNotes', { matchId });
          }
          break;
        case 'match_rules':
          openDialog('scoringMatchRules', { match });
          break;
        case 'add_additional_runs':
          if (matchId && inningsId != null) {
            openDialog('scoringAdditionalRuns', { matchId, inningsId: inningsId });
          }
          break;
        default:
          toast.info('This action will be available in an upcoming update.');
      }
    },
    [
      onMatchEnded,
      onMatchDeclared,
      onTargetRevisionEnded,
      openDialog,
      openChangeSquadWizard,
      openPenaltyRunsDialog,
      match,
      matchId,
      battingTeamName,
      bowlingTeamName,
      bowlingTeamId,
      addBowlerDialogPlayers,
      batsmenOnCrease,
      eligibleSubstitutePlayers,
      activeInnings,
      targetScore,
      serverTarget,
      inningsId,
      toast,
    ],
  );

  return { actionMenuOpen, setActionMenuOpen, actionMenuDisabledIds, handleActionMenuSelect };
}
