import { useCallback, useEffect, useRef, useState } from 'react';

import { useScoringMatch } from '@/context/ScoringMatchContext';
import { buildWicketSummaryModel, isCountableWicketBall, resolveOutBatterStats } from '@/lib/utils/wicketSummaryUtils';
import { useGetMatchTeamSquadQuery } from '@/store/api/matchApi';

/**
 * Manages the wicket summary screen shown after a dismissal.
 *
 * Gate pattern:
 *   - handleWicketBallStored opens the summary and sets wicketSummaryGateRef=true.
 *   - While the gate is open, the normal "needs_new_batter" auto-open is suppressed.
 *   - handleWicketSummaryProceed clears the gate and then fires the batter dialog.
 *   - handleWicketSummaryUndo undoes the last ball and clears the gate.
 *
 * NOTE: useScoringEngine must be called before this hook so handleUndo is available.
 */
export function useWicketSummaryFlow({
  // wicketKeeperId → derived from useGetMatchTeamSquadQuery internally
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
}) {
  const { matchId } = useScoringMatch();
  const { data: bowlingTeamSquadMeta } = useGetMatchTeamSquadQuery(
    { matchId, teamId: bowlingTeamId },
    { skip: !matchId || bowlingTeamId == null },
  );
  const wicketKeeperId = bowlingTeamSquadMeta?.wicket_keeper_id ?? null;
  const [wicketSummaryModel, setWicketSummaryModel] = useState(null);
  const [wicketSummaryUndoing, setWicketSummaryUndoing] = useState(false);
  const wicketSummaryGateRef = useRef(false);
  const postWicketMatchStateRef = useRef(null);
  /** Set on Proceed; cleared when the summary has unmounted and the batter dialog opens. */
  const pendingBatsmanPickRef = useRef(false);

  /** Stable setter so ScoringTab can set/clear the gate before this hook is wired. */
  const setWicketGate = useCallback((val) => {
    wicketSummaryGateRef.current = val;
  }, []);

  const handleWicketBallStored = useCallback(
    ({ ball, matchState: ms }) => {
      if (!isCountableWicketBall(ball)) {
        // Gate was set by onWicketPending — clear it since no summary will show.
        wicketSummaryGateRef.current = false;
        return;
      }
      const resolvedMs = ms ?? matchState;

      if (resolvedMs?.innings_just_completed != null) {
        wicketSummaryGateRef.current = false;
        postWicketMatchStateRef.current = null;
        return;
      }

      postWicketMatchStateRef.current = resolvedMs;
      wicketSummaryGateRef.current = true;
      const outId = ball.out_player_id;
      const fallbackStats = outId != null ? getBatsmanDisplayStats(outId) : null;
      const batterStats = resolveOutBatterStats(ball, fallbackStats);
      setWicketSummaryModel(
        buildWicketSummaryModel({
          apiBall: ball,
          matchState: resolvedMs,
          battingSquad,
          bowlingSquad,
          battingTeamName: displayTeamName,
          bowlingTeamName: bowlingTeamName ?? '',
          inningsNumber,
          playersPerSide: playersPerSide ?? 11,
          batterStats,
          wicketKeeperId,
        }),
      );
    },
    [
      battingSquad,
      bowlingSquad,
      displayTeamName,
      bowlingTeamName,
      inningsNumber,
      playersPerSide,
      getBatsmanDisplayStats,
      wicketKeeperId,
      matchState,
    ], // wicketKeeperId from internal query
  );

  const handleWicketSummaryProceed = useCallback(() => {
    const ms = postWicketMatchStateRef.current ?? matchState;
    const needsBatter = Boolean(ms?.needs_new_batter);
    postWicketMatchStateRef.current = null;
    wicketSummaryGateRef.current = false;
    pendingBatsmanPickRef.current = needsBatter;
    setWicketSummaryModel(null);
  }, [matchState]);

  // Open the batter picker only after the wicket summary has unmounted (post-commit).
  useEffect(() => {
    if (wicketSummaryModel != null || !pendingBatsmanPickRef.current) return;
    pendingBatsmanPickRef.current = false;
    openBatsmanDialogRef.current?.(false, { afterWicket: true });
  }, [wicketSummaryModel]);

  const handleWicketSummaryUndo = useCallback(async () => {
    setWicketSummaryUndoing(true);
    try {
      await handleUndo();
      setWicketSummaryModel(null);
      wicketSummaryGateRef.current = false;
      postWicketMatchStateRef.current = null;
      pendingBatsmanPickRef.current = false;
    } finally {
      setWicketSummaryUndoing(false);
    }
  }, [handleUndo]);

  return {
    wicketSummaryModel,
    wicketSummaryUndoing,
    handleWicketBallStored,
    handleWicketSummaryProceed,
    handleWicketSummaryUndo,
    wicketSummaryGateRef,
    postWicketMatchStateRef,
    setWicketGate,
  };
}
