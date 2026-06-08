import { useCallback, useMemo } from 'react';

import { useScoringMatch } from '@/context/ScoringMatchContext';
import { useToast } from '@/hooks/useToast';
import { NO_BALL_WICKET_DISMISSAL_VALUES, WIDE_WICKET_DISMISSAL_VALUES } from '@/lib/constants/combinedWicketDismissals';
import {
  appendDismissalGridShortcuts,
  injectCaughtDismissalVariants,
  isCaughtDismissalVariant,
} from '@/lib/utils/dismissalUtils';
import { dismissalRequiresFielder, filterDismissalOptions } from '@/lib/utils/scoringMappers';
import { useGetMatchTeamSquadQuery } from '@/store/api/matchApi';

/**
 * All dismissal-related dialog openers for the live scoring flow.
 * engineRef is a mutable ref whose .current is populated after useScoringEngine runs.
 */
export function useDismissalDialogs({
  // wicketKeeperId → derived from useGetMatchTeamSquadQuery internally
  // toast → useToast()
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
}) {
  const { matchId } = useScoringMatch();
  const toast = useToast();
  const { data: bowlingTeamSquadMeta } = useGetMatchTeamSquadQuery(
    { matchId, teamId: bowlingTeamId },
    { skip: !matchId || bowlingTeamId == null },
  );
  const wicketKeeperId = bowlingTeamSquadMeta?.wicket_keeper_id ?? null;
  const openRunOutDialog = useCallback(
    ({ deliveryContext = 'normal', isWide = false, isNoBall = false, onBack }) => {
      openDialog('scoringRunOut', {
        batsmen: batsmenOnCrease,
        fieldingPlayers: addBowlerDialogPlayers,
        deliveryContext,
        strikerId: batsmenOnCrease[0]?.id,
        nonStrikerId: batsmenOnCrease[1]?.id,
        bowlerId: bowlersInTable[currentBowlerIndex]?.id,
        onBack,
        onConfirm: (uiFields) => engineRef.current.handleRunOut?.({ ...uiFields, isWide, isNoBall }),
      });
    },
    [openDialog, batsmenOnCrease, addBowlerDialogPlayers, bowlersInTable, currentBowlerIndex, engineRef],
  );

  const openMankadDialog = useCallback(
    ({ onBack }) => {
      openDialog('scoringMankad', {
        batsmen: batsmenOnCrease,
        strikerId: batsmenOnCrease[0]?.id,
        nonStrikerId: batsmenOnCrease[1]?.id,
        bowlerId: bowlersInTable[currentBowlerIndex]?.id,
        onBack,
        onConfirm: (uiFields) => engineRef.current.handleSpecialDismissal?.(uiFields),
      });
    },
    [openDialog, batsmenOnCrease, bowlersInTable, currentBowlerIndex, engineRef],
  );

  const openWhoIsOutDismissalDialog = useCallback(
    (dismissalType, { onBack }) => {
      openDialog('scoringWhoIsOutDismissal', {
        dismissalType,
        players: eligibleTimedOutPlayers,
        strikerId: batsmenOnCrease[0]?.id,
        nonStrikerId: batsmenOnCrease[1]?.id,
        bowlerId: bowlersInTable[currentBowlerIndex]?.id,
        onBack,
        onConfirm: (uiFields) => engineRef.current.handleSpecialDismissal?.(uiFields),
      });
    },
    [openDialog, batsmenOnCrease, eligibleTimedOutPlayers, bowlersInTable, currentBowlerIndex, engineRef],
  );

  const openRetiredOutDialog = useCallback(
    ({ onBack }) => {
      openDialog('scoringRetiredOut', {
        batsmen: batsmenOnCrease,
        strikerId: batsmenOnCrease[0]?.id,
        nonStrikerId: batsmenOnCrease[1]?.id,
        bowlerId: bowlersInTable[currentBowlerIndex]?.id,
        onBack,
        onConfirm: (uiFields) => engineRef.current.handleRetiredOut?.(uiFields),
      });
    },
    [openDialog, batsmenOnCrease, bowlersInTable, currentBowlerIndex, engineRef],
  );

  const openObstructTheFieldDialog = useCallback(
    ({ isWide = false, isNoBall = false, onBack }) => {
      openDialog('scoringObstructTheField', {
        batsmen: batsmenOnCrease,
        fieldingPlayers: addBowlerDialogPlayers,
        strikerId: batsmenOnCrease[0]?.id,
        nonStrikerId: batsmenOnCrease[1]?.id,
        bowlerId: bowlersInTable[currentBowlerIndex]?.id,
        isWide,
        isNoBall,
        onBack,
        onConfirm: (uiFields) => engineRef.current.handleObstructTheField?.(uiFields),
      });
    },
    [openDialog, batsmenOnCrease, addBowlerDialogPlayers, bowlersInTable, currentBowlerIndex, engineRef],
  );

  const openCaughtOutDialog = useCallback(
    ({ isWide = false, isNoBall = false, onBack, presetFielderId = null, lockFielder = false } = {}) => {
      openDialog('scoringCaughtOut', {
        batsmen: batsmenOnCrease,
        fieldingPlayers: addBowlerDialogPlayers,
        strikerId: batsmenOnCrease[0]?.id,
        nonStrikerId: batsmenOnCrease[1]?.id,
        bowlerId: bowlersInTable[currentBowlerIndex]?.id,
        presetFielderId,
        lockFielder,
        isWide,
        isNoBall,
        onBack,
        onConfirm: (uiFields) => engineRef.current.handleCaughtOut?.(uiFields),
      });
    },
    [openDialog, batsmenOnCrease, addBowlerDialogPlayers, bowlersInTable, currentBowlerIndex, engineRef],
  );

  const openFielderPickerDialog = useCallback(
    (ball) => {
      openDialog('scoringFielderPicker', {
        message: 'Who was the fielder?',
        players: addBowlerDialogPlayers,
        onSelectFielder: (playerId) => engineRef.current.handleOutWithFielder?.(ball, playerId),
      });
    },
    [openDialog, addBowlerDialogPlayers, engineRef],
  );

  const handleDismissalOptionSelect = useCallback(
    (opt, { isWide = false, isNoBall = false, onBack } = {}) => {
      if (isCaughtDismissalVariant(opt) || opt.value === 'caught') {
        if (opt.caughtVariant === 'bowled') {
          const bowlerId = bowlersInTable[currentBowlerIndex]?.id;
          if (bowlerId == null) {
            toast.error('Select a bowler before recording Caught Bowled.');
            return;
          }
          openCaughtOutDialog({ isWide, isNoBall, onBack, presetFielderId: bowlerId, lockFielder: true });
          return;
        }
        if (opt.caughtVariant === 'behind') {
          openCaughtOutDialog({ isWide, isNoBall, onBack, presetFielderId: wicketKeeperId, lockFielder: wicketKeeperId != null });
          return;
        }
        openCaughtOutDialog({ isWide, isNoBall, onBack });
        return;
      }
      if (opt.value === 'run_out') {
        openRunOutDialog({ deliveryContext: isNoBall ? 'no_ball' : 'normal', isWide, isNoBall, onBack });
        return;
      }
      if (opt.value === 'obstructing_the_field') {
        openObstructTheFieldDialog({ isWide, isNoBall, onBack });
        return;
      }
      if (opt.value === 'retired') {
        openRetiredOutDialog({ onBack });
        return;
      }
      if (opt.value === 'mankad') {
        openMankadDialog({ onBack });
        return;
      }
      if (opt.value === 'timed_out') {
        openWhoIsOutDismissalDialog('timed_out', { onBack });
        return;
      }
      engineRef.current.handleOut?.({
        dismissalType: opt.value,
        requiresFielder: dismissalRequiresFielder(opt),
        isWide,
        isNoBall,
      });
    },
    [
      openRunOutDialog,
      openObstructTheFieldDialog,
      openCaughtOutDialog,
      openRetiredOutDialog,
      openMankadDialog,
      openWhoIsOutDismissalDialog,
      bowlersInTable,
      currentBowlerIndex,
      wicketKeeperId,
      engineRef,
      toast,
    ],
  );

  const caughtDismissalVariants = useMemo(() => injectCaughtDismissalVariants(activeDismissalOptions), [activeDismissalOptions]);

  const openCombinedWicketDialog = useCallback(
    (kind) => {
      const isWide = kind === 'wide';
      const isNoBall = kind === 'no_ball';
      const options = filterDismissalOptions(
        caughtDismissalVariants,
        isWide ? WIDE_WICKET_DISMISSAL_VALUES : NO_BALL_WICKET_DISMISSAL_VALUES,
      );
      const title = isWide ? 'Wide + Wicket' : 'No Ball + Wicket';
      const reopen = () => openCombinedWicketDialog(kind);
      openDialog('scoringOutReason', {
        title,
        subtitle: 'Select Out Action',
        dismissalOptions: options,
        onSelectOption: (opt) => handleDismissalOptionSelect(opt, { isWide, isNoBall, onBack: reopen }),
      });
    },
    [openDialog, caughtDismissalVariants, handleDismissalOptionSelect],
  );

  const selectDismissalFromGrid = useCallback(
    (opt, ctx) => {
      if (opt.gridShortcut === 'wide') {
        openCombinedWicketDialog('wide');
        return;
      }
      if (opt.gridShortcut === 'no_ball') {
        openCombinedWicketDialog('no_ball');
        return;
      }
      handleDismissalOptionSelect(opt, ctx);
    },
    [handleDismissalOptionSelect, openCombinedWicketDialog],
  );

  const outReasonDialogOptions = useMemo(
    () => appendDismissalGridShortcuts(caughtDismissalVariants, { includeShortcuts: !pendingFreeHit }),
    [caughtDismissalVariants, pendingFreeHit],
  );

  const openOutReasonDialog = useCallback(() => {
    openDialog('scoringOutReason', {
      dismissalOptions: outReasonDialogOptions,
      onSelectOption: (opt) => selectDismissalFromGrid(opt),
    });
  }, [openDialog, outReasonDialogOptions, selectDismissalFromGrid]);

  return {
    openRunOutDialog,
    openMankadDialog,
    openWhoIsOutDismissalDialog,
    openRetiredOutDialog,
    openObstructTheFieldDialog,
    openCaughtOutDialog,
    handleDismissalOptionSelect,
    openCombinedWicketDialog,
    selectDismissalFromGrid,
    outReasonDialogOptions,
    openOutReasonDialog,
    openFielderPickerDialog,
  };
}
