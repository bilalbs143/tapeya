/**
 * useScoringEngine — thin API dispatcher.
 *
 * Builds ball payloads from UI state and calls the scoring API.
 * RTK invalidation + WebSocket patch refresh match_state/scorecard caches.
 * All cricket logic is owned by the backend; the app is a pure consumer.
 *
 * Handlers:
 *   handleRuns(runs, opts)            – legal delivery
 *   handleSpecial(opts)               – extras: wd / nb / bye / lb
 *   handlePenaltyRuns(runs)           – penalty-only award (no delivery)
 *   initiateOut()                     – signals UI to open dismissal picker
 *   handleOut(opts)                   – submits wicket (after modal confirmation)
 *   handleOutWithFielder(ball, id)    – submits wicket once fielder is chosen
 *   handleRetiredHurt()               – retired-hurt (not a wicket)
 *   handleUndo()                      – deletes last ball, applies returned match_state
 *
 * Dialog coupling removed:
 *   Instead of receiving setOutReasonModalOpen / setPendingDismissal /
 *   setFielderPickerOpen, the engine accepts two callbacks:
 *     onDismissalRequired()           – called when OUT is tapped; caller opens dialog
 *     onFielderRequired(pendingBall)  – called when fielder pick is needed; caller opens dialog
 */

import { useCallback, useRef, useState } from 'react';

import { useToast } from '@/hooks/useToast';
import { uiBallToStoreBallPayload } from '@/lib/utils/scoringMappers';

export function useScoringEngine({
  matchId,
  inningsId,
  striker,
  nonStriker,
  currentBowler,
  storeBall,
  deleteLastBall,
  /** Called when the OUT button is tapped — caller is responsible for opening the dismissal dialog. */
  onDismissalRequired,
  /** Called with the pending ball when a fielder must be chosen — caller opens the fielder dialog. */
  onFielderRequired,
  matchComplete = false,
}) {
  const isSubmittingRef = useRef(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useToast();

  // POST a ball → extract { ball, match_state } → notify parent.
  const dispatch = useCallback(
    async (uiBall, fielderIdOverride) => {
      if (isSubmittingRef.current) return;
      isSubmittingRef.current = true;
      setIsSubmitting(true);
      try {
        const payload = uiBallToStoreBallPayload({
          ball: uiBall,
          nonStrikerId: nonStriker?.id,
          fielderId: fielderIdOverride ?? uiBall.fielderId,
        });
        await storeBall({
          matchId,
          inningsId,
          payload,
        }).unwrap();
      } catch {
        toast.error('Ball not saved — check your connection and try again.', 'Sync Failed');
      } finally {
        isSubmittingRef.current = false;
        setIsSubmitting(false);
      }
    },
    [matchId, inningsId, nonStriker, storeBall, toast],
  );

  const handleRuns = useCallback(
    (runs, { shotDirection, penaltyRuns } = {}) => {
      if (matchComplete) return;
      return dispatch({
        type: 'runs',
        runs,
        strikerId: striker?.id,
        bowlerId: currentBowler?.id,
        shotDirection: shotDirection ?? null,
        penaltyRuns: penaltyRuns ?? 0,
      });
    },
    [matchComplete, dispatch, striker, currentBowler],
  );

  const handleSpecial = useCallback(
    ({ type, runs = 0, penaltyRuns = 0 } = {}) => {
      if (matchComplete) return;
      const ball = {
        type,
        runs,
        strikerId: striker?.id,
        bowlerId: currentBowler?.id,
        penaltyRuns,
      };
      if (type === 'nb') ball.runsOffBat = runs;
      else if (type === 'wd') ball.extraRuns = runs;
      return dispatch(ball);
    },
    [matchComplete, dispatch, striker, currentBowler],
  );

  const handlePenaltyRuns = useCallback(
    (runs) => {
      if (matchComplete) return;
      return dispatch({
        type: 'runs',
        runs: 0,
        strikerId: striker?.id,
        bowlerId: currentBowler?.id,
        penaltyRuns: runs,
      });
    },
    [matchComplete, dispatch, striker, currentBowler],
  );

  /**
   * Open the dismissal-type picker — called when the wicket button is tapped.
   * The caller (ScoringTab) is responsible for opening the OutReasonDialog.
   */
  const initiateOut = useCallback(() => {
    if (matchComplete) return;
    onDismissalRequired?.();
  }, [matchComplete, onDismissalRequired]);

  /**
   * Called once the user confirms a dismissal type.
   * If the dismissal requires a fielder, emits onFielderRequired with the
   * pending ball instead of firing immediately.
   */
  const handleOut = useCallback(
    ({ dismissalType, requiresFielder, penaltyRuns = 0 }) => {
      if (matchComplete) return;
      const ball = {
        type: 'out',
        runs: 0,
        strikerId: striker?.id,
        bowlerId: currentBowler?.id,
        dismissalType,
        penaltyRuns,
        striker,
      };
      if (requiresFielder) {
        onFielderRequired?.(ball);
        return;
      }
      return dispatch(ball);
    },
    [matchComplete, dispatch, striker, currentBowler, onFielderRequired],
  );

  /** Called once the fielder is chosen for caught / run-out / stumped. */
  const handleOutWithFielder = useCallback(
    (pendingBall, fielderId) => {
      if (matchComplete) return;
      return dispatch({ ...pendingBall, fielderId }, fielderId);
    },
    [matchComplete, dispatch],
  );

  const handleRetiredHurt = useCallback(() => {
    if (matchComplete) return;
    return dispatch({
      type: 'retired_hurt',
      runs: 0,
      strikerId: striker?.id,
      bowlerId: currentBowler?.id,
      dismissalType: 'retired_hurt',
      striker,
    });
  }, [matchComplete, dispatch, striker, currentBowler]);

  const handleUndo = useCallback(async () => {
    if (!inningsId) return;
    if (isSubmittingRef.current) return;
    isSubmittingRef.current = true;
    setIsSubmitting(true);
    try {
      await deleteLastBall({ matchId, inningsId }).unwrap();
    } catch {
      toast.error('Undo failed — check your connection and try again.', 'Sync Failed');
    } finally {
      isSubmittingRef.current = false;
      setIsSubmitting(false);
    }
  }, [matchId, inningsId, deleteLastBall, toast]);

  return {
    handleRuns,
    handleSpecial,
    handlePenaltyRuns,
    initiateOut,
    handleOut,
    handleOutWithFielder,
    handleRetiredHurt,
    handleUndo,
    isSubmitting,
  };
}
