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

import { useScoringMatch } from '@/context/ScoringMatchContext';
import { useToast } from '@/hooks/useToast';
import { uiBallToStoreBallPayload } from '@/lib/utils/scoringMappers';
import { useDeleteLastBallMutation, useStoreBallMutation } from '@/store/api/matchApi';

export function useScoringEngine({
  // matchId → useScoringMatch(); storeBall/deleteLastBall → owned internally
  inningsId,
  striker,
  nonStriker,
  currentBowler,
  /** Called when the OUT button is tapped — caller is responsible for opening the dismissal dialog. */
  onDismissalRequired,
  /** Called with the pending ball when a fielder must be chosen — caller opens the fielder dialog. */
  onFielderRequired,
  /** Called after a ball is stored successfully — e.g. to show wicket summary. */
  onBallStored,
  /**
   * Called SYNCHRONOUSLY before a wicket ball is dispatched to the API.
   * Fired before the HTTP request is sent, so the gate is guaranteed to be
   * set before any WebSocket broadcast from the server can arrive.
   * Use this to set the wicket-summary gate and force-close any open dialog.
   */
  onWicketPending,
  /**
   * Called SYNCHRONOUSLY if a wicket dispatch fails (API error).
   * Use this to reset the gate so normal dialog auto-open resumes.
   */
  onWicketFailed,
  matchComplete = false,
}) {
  const { matchId } = useScoringMatch();
  const [storeBall] = useStoreBallMutation();
  const [deleteLastBall] = useDeleteLastBallMutation();

  const isSubmittingRef = useRef(false);
  // ref: synchronous gate; state: UI feedback
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useToast();

  // POST a ball → extract { ball, match_state } → notify parent.
  const dispatch = useCallback(
    async (uiBall, fielderIdOverride) => {
      if (isSubmittingRef.current) return;
      isSubmittingRef.current = true;

      // Wicket balls need the summary gate set BEFORE the HTTP request is sent.
      // The server cannot broadcast a WebSocket event until it receives the request,
      // so setting the gate here makes the race condition structurally impossible.
      const isWicketBall = uiBall?.type === 'out';
      if (isWicketBall) onWicketPending?.();

      setIsSubmitting(true);
      try {
        if (!striker?.id || !nonStriker?.id) {
          throw new Error('Both batters must be on crease — cannot submit ball. Please select striker and non-striker first.');
        }
        const payload = uiBallToStoreBallPayload({
          ball: uiBall,
          nonStrikerId: nonStriker.id,
          fielderId: fielderIdOverride ?? uiBall.fielderId,
        });
        const result = await storeBall({
          matchId,
          inningsId,
          payload,
        }).unwrap();
        onBallStored?.({ ball: result?.ball, matchState: result?.match_state, uiBall, payload });
        return result;
      } catch (err) {
        if (isWicketBall) onWicketFailed?.();
        const message =
          err instanceof Error && err.message && !err.message.includes('fetch')
            ? err.message
            : 'Ball not saved — check your connection and try again.';
        toast.error(message, 'Scoring Error');
      } finally {
        isSubmittingRef.current = false;
        setIsSubmitting(false);
      }
    },
    [matchId, inningsId, striker, nonStriker, storeBall, toast, onBallStored, onWicketPending, onWicketFailed],
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
    (opts = {}) => {
      if (matchComplete) return;
      const { type, runs = 0, penaltyRuns = 0 } = opts;

      if (opts.type === 'nb' && opts.noBallType != null) {
        return dispatch({
          ...opts,
          strikerId: striker?.id,
          bowlerId: currentBowler?.id,
          penaltyRuns,
        });
      }

      if (opts.type === 'wd' && opts.extraRuns != null) {
        return dispatch({
          type: 'wd',
          extraRuns: opts.extraRuns,
          strikerId: striker?.id,
          bowlerId: currentBowler?.id,
          penaltyRuns,
        });
      }

      if (opts.type === 'overthrow' && opts.overthrowDeliveryType != null) {
        return dispatch({
          type: 'overthrow',
          overthrowDeliveryType: opts.overthrowDeliveryType,
          overthrowRuns: opts.overthrowRuns ?? 0,
          strikerId: striker?.id,
          bowlerId: currentBowler?.id,
          penaltyRuns,
        });
      }

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
    (opts = {}) => {
      if (matchComplete) return;
      const { penaltyRuns, penaltyTeam, penaltyReason } = opts;
      return dispatch({
        type: 'penalty',
        penaltyRuns: penaltyRuns ?? 0,
        penaltyTeam: penaltyTeam ?? 'batting',
        penaltyReason,
        strikerId: striker?.id,
        bowlerId: currentBowler?.id,
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
    ({ dismissalType, requiresFielder, penaltyRuns = 0, isWide = false, isNoBall = false, fielderId = null }) => {
      if (matchComplete) return;
      const ball = {
        type: 'out',
        runs: 0,
        strikerId: striker?.id,
        bowlerId: currentBowler?.id,
        dismissalType,
        penaltyRuns,
        isWide,
        isNoBall,
        striker,
      };
      if (requiresFielder && fielderId == null) {
        onFielderRequired?.(ball);
        return;
      }
      if (fielderId != null) {
        return dispatch({ ...ball, fielderId }, fielderId);
      }
      return dispatch(ball);
    },
    [matchComplete, dispatch, striker, currentBowler, onFielderRequired],
  );

  /** Called once the fielder is chosen for caught / stumped (not run-out — use handleRunOut). */
  const handleOutWithFielder = useCallback(
    (pendingBall, fielderId) => {
      if (matchComplete) return;
      return dispatch({ ...pendingBall, fielderId }, fielderId);
    },
    [matchComplete, dispatch],
  );

  /** Obstructing the field from {@link ObstructTheFieldDialog}. */
  const handleObstructTheField = useCallback(
    (uiFields) => {
      if (matchComplete) return;
      return dispatch(
        {
          ...uiFields,
          strikerId: uiFields.strikerId ?? striker?.id,
          nonStrikerId: uiFields.nonStrikerId ?? nonStriker?.id,
          bowlerId: uiFields.bowlerId ?? currentBowler?.id,
        },
        uiFields.fielderId,
      );
    },
    [matchComplete, dispatch, striker, nonStriker, currentBowler],
  );

  /** Run-out with full metadata from {@link RunOutDialog}. */
  const handleRunOut = useCallback(
    (uiFields) => {
      if (matchComplete) return;
      return dispatch(
        {
          ...uiFields,
          type: 'out',
          dismissalType: 'run_out',
          strikerId: uiFields.strikerId ?? striker?.id,
          nonStrikerId: uiFields.nonStrikerId ?? nonStriker?.id,
          bowlerId: uiFields.bowlerId ?? currentBowler?.id,
          fielderId: uiFields.fielderId,
        },
        uiFields.fielderId,
      );
    },
    [matchComplete, dispatch, striker, nonStriker, currentBowler],
  );

  /** Caught out from {@link CaughtOutDialog}. */
  const handleCaughtOut = useCallback(
    (uiFields) => {
      if (matchComplete) return;
      return dispatch(
        {
          ...uiFields,
          type: 'out',
          runs: 0,
          dismissalType: 'caught',
          strikerId: uiFields.strikerId ?? striker?.id,
          nonStrikerId: uiFields.nonStrikerId ?? nonStriker?.id,
          bowlerId: uiFields.bowlerId ?? currentBowler?.id,
          fielderId: uiFields.fielderId,
          outPlayerId: uiFields.outPlayerId,
        },
        uiFields.fielderId,
      );
    },
    [matchComplete, dispatch, striker, nonStriker, currentBowler],
  );

  const handleSpecialDismissal = useCallback(
    (uiFields) => {
      if (matchComplete) return;
      return dispatch(
        {
          ...uiFields,
          type: 'out',
          runs: 0,
          strikerId: uiFields.strikerId ?? striker?.id,
          nonStrikerId: uiFields.nonStrikerId ?? nonStriker?.id,
          bowlerId: uiFields.bowlerId ?? currentBowler?.id,
        },
        uiFields.fielderId,
      );
    },
    [matchComplete, dispatch, striker, nonStriker, currentBowler],
  );

  const handleRetiredOut = useCallback(
    (uiFields) => {
      if (matchComplete) return;
      return dispatch({
        ...uiFields,
        type: 'out',
        runs: 0,
        dismissalType: 'retired',
        strikerId: uiFields.strikerId ?? striker?.id,
        nonStrikerId: uiFields.nonStrikerId ?? nonStriker?.id,
        bowlerId: uiFields.bowlerId ?? currentBowler?.id,
      });
    },
    [matchComplete, dispatch, striker, nonStriker, currentBowler],
  );

  const handleRetiredHurt = useCallback(
    (uiFields) => {
      if (matchComplete) return;
      return dispatch({
        type: 'retired_hurt',
        runs: 0,
        ...uiFields,
        dismissalType: 'retired_hurt',
        strikerId: uiFields.strikerId ?? striker?.id,
        nonStrikerId: uiFields.nonStrikerId ?? nonStriker?.id,
        bowlerId: uiFields.bowlerId ?? currentBowler?.id,
      });
    },
    [matchComplete, dispatch, striker, nonStriker, currentBowler],
  );

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
    handleObstructTheField,
    handleSpecialDismissal,
    handleRunOut,
    handleCaughtOut,
    handleRetiredOut,
    handleRetiredHurt,
    handleUndo,
    isSubmitting,
  };
}
