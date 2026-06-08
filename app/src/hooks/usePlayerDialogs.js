import { useCallback, useRef } from 'react';

import { useDialog } from '@/context/DialogContext';
import { useScoringMatch } from '@/context/ScoringMatchContext';
import { useCreaseSync } from '@/hooks/useCreaseSync';
import { buildPreBallCreasePatch } from '@/lib/utils/scoringUtils';
import { useGetMatchTeamSquadQuery } from '@/store/api/matchApi';

/**
 * Dialog openers for batsman/bowler pickers and squad setup wizards.
 *
 * openBatsmanDialogRef / openBowlerDialogRef are passed in so the parent (ScoringTab)
 * can assign them after this hook runs, enabling other effects to fire them via ref.
 * The assignments happen in ScoringTab's render body, not here.
 *
 * Internal ordering: openBowlingSquadWizardStep must be defined before openBatsmanDialog
 * because openBatsmanDialog references it.
 */
export function usePlayerDialogs({
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
  canAddMoreBatsmen,
  needsNewBatter = false,
  isPlayerBattingOrOut,
  getBatsmanDisplayStats,
  handleSaveBatsmanSquad,
  handleSaveBowlerSquad,
  openBatsmanDialogRef,
  battingStats = [],
  bowlingStats = [],
  dismissalTypeOptions = [],
}) {
  const { matchId } = useScoringMatch();
  const { openDialog, closeDialog } = useDialog();
  const { onCreaseChange } = useCreaseSync();

  const { data: battingTeamSquadMeta } = useGetMatchTeamSquadQuery(
    { matchId, teamId: battingTeamId },
    { skip: !matchId || battingTeamId == null },
  );
  const { data: bowlingTeamSquadMeta } = useGetMatchTeamSquadQuery(
    { matchId, teamId: bowlingTeamId },
    { skip: !matchId || bowlingTeamId == null },
  );
  const battingCaptainId = battingTeamSquadMeta?.captain_id ?? null;
  const bowlingCaptainId = bowlingTeamSquadMeta?.captain_id ?? null;
  const battingWicketKeeperId = battingTeamSquadMeta?.wicket_keeper_id ?? null;
  const bowlingWicketKeeperId = bowlingTeamSquadMeta?.wicket_keeper_id ?? null;

  const addBatsmanToCrease = useCallback(
    async (player, { afterWicket = false } = {}) => {
      const fillingVacantSlot = afterWicket || needsNewBatter;
      if (batsmenOnCrease.length >= 2 && !fillingVacantSlot) return;
      const isSecond = batsmenOnCrease.length === 1;
      const key = isSecond ? (!hasBallsBowled ? 'next_non_striker_id' : 'next_batter_id') : 'next_batter_id';
      try {
        await onCreaseChange?.({ [key]: Number(player.id) });
        closeDialog();
      } catch {
        // API layer / toasts handle errors; keep dialog open to retry.
      }
    },
    [batsmenOnCrease, hasBallsBowled, needsNewBatter, onCreaseChange, closeDialog],
  );

  const replaceStrikerWith = useCallback(
    async (player) => {
      const cur = batsmenOnCrease[strikerIndex];
      if (!cur || String(cur.id) === String(player.id)) {
        closeDialog();
        return;
      }
      try {
        await onCreaseChange?.({ next_batter_id: Number(player.id) });
        closeDialog();
      } catch {
        // API layer / toasts handle errors; keep dialog open to retry.
      }
    },
    [batsmenOnCrease, strikerIndex, closeDialog, onCreaseChange],
  );

  const selectBowlerForNextOver = useCallback(
    async (player) => {
      if (!(bowlingXiSavedOnApi || player?.role === 'playing')) return;
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
      if (!(bowlingXiSavedOnApi || player?.role === 'playing')) return;
      closeDialog();
      onCreaseChange?.({ next_bowler_id: Number(player.id) });
    },
    [bowlingXiSavedOnApi, closeDialog, onCreaseChange],
  );

  const handleStrikerIndexChange = useCallback(
    (newIndex) => {
      if (!onCreaseChange || batsmenOnCrease.length < 2) return;
      if (newIndex === strikerIndex) return;
      const patch = buildPreBallCreasePatch({ batsmenOnCrease, strikerIndex: newIndex });
      if (patch.next_batter_id && patch.next_non_striker_id) {
        onCreaseChange({ next_batter_id: patch.next_batter_id, next_non_striker_id: patch.next_non_striker_id });
      }
    },
    [onCreaseChange, batsmenOnCrease, strikerIndex],
  );

  // Must be defined before openBatsmanDialog since openBatsmanDialog references it.
  const openBowlingSquadWizardStep = useCallback(() => {
    openDialog('scoringBowler', {
      variant: 'squad',
      hideSquadSetup: false,
      declareSquadMode: true,
      squadFlowStep: 2,
      squadFlowTotal: 2,
      teamName: bowlingTeamName,
      players: bowlingSquad,
      bowlersInTable,
      onSelectBowlerForNextOver: () => {},
      initialCaptainId: bowlingCaptainId,
      initialWicketKeeperId: bowlingWicketKeeperId,
      onSaveSquad: handleSaveBowlerSquad,
      onSetRole: setBowlerRole,
      requiredPlayingCount: requiredBowling,
      onAddPlayerToSquad: addPlayerToBowlingSquad,
      onRemovePlayerFromSquad: removePlayerFromBowlingSquad,
      onSquadFlowBack: () => {
        closeDialog();
        openBatsmanDialogRef.current?.(false);
      },
    });
  }, [
    openDialog,
    closeDialog,
    bowlingTeamName,
    bowlingSquad,
    bowlingCaptainId,
    bowlingWicketKeeperId,
    bowlersInTable,
    handleSaveBowlerSquad,
    setBowlerRole,
    requiredBowling,
    addPlayerToBowlingSquad,
    removePlayerFromBowlingSquad,
    openBatsmanDialogRef,
  ]);

  const openBatsmanDialog = useCallback(
    (replaceStriker = false, { afterWicket = false } = {}) => {
      const matchInProgress = hasBallsBowled;
      const squadSetup = !matchInProgress && !battingXiSavedOnApi && !replaceStriker;
      const allowPick = afterWicket || canAddMoreBatsmen;
      openDialog('scoringBatsman', {
        variant: battingXiSavedOnApi ? 'picker' : 'squad',
        hideSquadSetup: matchInProgress,
        declareSquadMode: squadSetup,
        replaceStrikerMode: replaceStriker,
        teamName: squadSetup ? battingTeamName : undefined,
        players: squadSetup ? battingSquad : addBatsmanDialogPlayers,
        battingStats,
        dismissalTypeOptions,
        canAddMoreBatsmen: allowPick,
        isPlayerBattingOrOut,
        getBatsmanDisplayStats,
        strikerId: batsmenOnCrease[strikerIndex]?.id,
        nonStrikerId: batsmenOnCrease.length > 1 ? batsmenOnCrease[1 - strikerIndex]?.id : undefined,
        onPickBatsman: replaceStriker ? replaceStrikerWith : (player) => addBatsmanToCrease(player, { afterWicket }),
        initialCaptainId: battingCaptainId,
        initialWicketKeeperId: battingWicketKeeperId,
        onSaveSquad: handleSaveBatsmanSquad,
        onSetRole: setBatsmanRole,
        requiredPlayingCount: requiredBatting,
        onAddPlayerToSquad: addPlayerToBattingSquad,
        onRemovePlayerFromSquad: removePlayerFromBattingSquad,
        squadFlowStep: squadSetup ? 1 : null,
        squadFlowTotal: squadSetup ? 2 : null,
        onSquadFlowNext: squadSetup ? openBowlingSquadWizardStep : undefined,
      });
    },
    [
      openDialog,
      battingXiSavedOnApi,
      battingTeamName,
      addBatsmanDialogPlayers,
      battingSquad,
      battingCaptainId,
      battingWicketKeeperId,

      battingStats,
      dismissalTypeOptions,
      hasBallsBowled,
      canAddMoreBatsmen,
      isPlayerBattingOrOut,
      getBatsmanDisplayStats,
      batsmenOnCrease,
      strikerIndex,
      replaceStrikerWith,
      addBatsmanToCrease,
      handleSaveBatsmanSquad,
      setBatsmanRole,
      requiredBatting,
      addPlayerToBattingSquad,
      removePlayerFromBattingSquad,
      openBowlingSquadWizardStep,
    ],
  );

  const openBowlerDialog = useCallback(
    (replaceActive = false, { wizardStep = null } = {}) => {
      const matchInProgress = hasBallsBowled;
      const squadSetup = !matchInProgress && !bowlingXiSavedOnApi && !replaceActive;
      const inWizard = squadSetup && (wizardStep === 2 || (battingXiSavedOnApi && !bowlingXiSavedOnApi));
      openDialog('scoringBowler', {
        variant: bowlingXiSavedOnApi ? 'picker' : 'squad',
        hideSquadSetup: matchInProgress,
        declareSquadMode: inWizard,
        replaceActiveBowlerMode: replaceActive,
        teamName: squadSetup || inWizard ? bowlingTeamName : undefined,
        players: squadSetup || inWizard ? bowlingSquad : addBowlerDialogPlayers,
        bowlersInTable,
        bowlingStats,
        activeBowlerId: bowlersInTable[Math.min(Math.max(0, currentBowlerIndex), bowlersInTable.length - 1)]?.id,
        onSelectBowlerForNextOver: selectBowlerForNextOver,
        onReplaceActiveBowlerPick: handleReplaceActiveBowlerPick,
        initialCaptainId: bowlingCaptainId,
        initialWicketKeeperId: bowlingWicketKeeperId,
        onSaveSquad: handleSaveBowlerSquad,
        onSetRole: setBowlerRole,
        requiredPlayingCount: requiredBowling,
        onAddPlayerToSquad: addPlayerToBowlingSquad,
        onRemovePlayerFromSquad: removePlayerFromBowlingSquad,
        squadFlowStep: inWizard ? 2 : null,
        squadFlowTotal: inWizard ? 2 : null,
        onSquadFlowBack: inWizard
          ? () => {
            closeDialog();
            openBatsmanDialogRef.current?.(false);
          }
          : undefined,
      });
    },
    [
      openDialog,
      closeDialog,
      bowlingXiSavedOnApi,
      battingXiSavedOnApi,
      bowlingTeamName,
      addBowlerDialogPlayers,
      bowlingSquad,
      hasBallsBowled,
      bowlersInTable,
      bowlingStats,
      currentBowlerIndex,
      selectBowlerForNextOver,
      handleReplaceActiveBowlerPick,
      handleSaveBowlerSquad,
      setBowlerRole,
      requiredBowling,
      addPlayerToBowlingSquad,
      removePlayerFromBowlingSquad,
      openBatsmanDialogRef,
    ],
  );

  // Ref keeps openChangeSquadWizard stable for the bowling step's back button.
  const changeSquadWizardRef = useRef(null);

  const openChangeSquadBowlingStep = useCallback(() => {
    openDialog('scoringBowler', {
      variant: 'squad',
      hideSquadSetup: false,
      squadEditOnly: true,
      squadFlowStep: 2,
      squadFlowTotal: 2,
      teamName: bowlingTeamName,
      players: bowlingSquad,
      bowlersInTable,
      onSelectBowlerForNextOver: () => {},
      initialCaptainId: bowlingCaptainId,
      initialWicketKeeperId: bowlingWicketKeeperId,
      onSaveSquad: handleSaveBowlerSquad,
      onSetRole: setBowlerRole,
      requiredPlayingCount: requiredBowling,
      onAddPlayerToSquad: addPlayerToBowlingSquad,
      onRemovePlayerFromSquad: removePlayerFromBowlingSquad,
      onSquadFlowBack: () => {
        closeDialog();
        changeSquadWizardRef.current?.();
      },
    });
  }, [
    openDialog,
    closeDialog,
    bowlingTeamName,
    bowlingSquad,
    bowlingCaptainId,
    bowlingWicketKeeperId,
    bowlersInTable,
    handleSaveBowlerSquad,
    setBowlerRole,
    requiredBowling,
    addPlayerToBowlingSquad,
    removePlayerFromBowlingSquad,
  ]);

  const openChangeSquadWizard = useCallback(() => {
    openDialog('scoringBatsman', {
      variant: 'squad',
      hideSquadSetup: false,
      squadEditOnly: true,
      squadFlowStep: 1,
      squadFlowTotal: 2,
      teamName: battingTeamName,
      players: battingSquad,
      battingStats,
      dismissalTypeOptions,
      canAddMoreBatsmen: false,
      isPlayerBattingOrOut,
      getBatsmanDisplayStats,
      onPickBatsman: () => {},
      replaceStrikerMode: false,
      initialCaptainId: battingCaptainId,
      initialWicketKeeperId: battingWicketKeeperId,
      onSaveSquad: handleSaveBatsmanSquad,
      onSetRole: setBatsmanRole,
      requiredPlayingCount: requiredBatting,
      onAddPlayerToSquad: addPlayerToBattingSquad,
      onRemovePlayerFromSquad: removePlayerFromBattingSquad,
      onSquadFlowNext: openChangeSquadBowlingStep,
    });
  }, [
    openDialog,
    battingTeamName,
    battingSquad,
    battingCaptainId,
    battingWicketKeeperId,
    battingStats,
    dismissalTypeOptions,
    isPlayerBattingOrOut,
    getBatsmanDisplayStats,
    handleSaveBatsmanSquad,
    setBatsmanRole,
    requiredBatting,
    addPlayerToBattingSquad,
    removePlayerFromBattingSquad,
    openChangeSquadBowlingStep,
  ]);

  changeSquadWizardRef.current = openChangeSquadWizard;

  return {
    addBatsmanToCrease,
    replaceStrikerWith,
    selectBowlerForNextOver,
    handleReplaceActiveBowlerPick,
    handleStrikerIndexChange,
    openBatsmanDialog,
    openBowlerDialog,
    openBowlingSquadWizardStep,
    openChangeSquadWizard,
  };
}
