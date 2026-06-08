/**
 * useCreaseSync — single source of truth for crease PATCH operations.
 *
 * Previously onCreaseChange and syncPreBallCrease lived in useInningsLifecycle
 * and were prop-drilled through ScoringMatch → ScoringTab → useSquadPersistence
 * and usePlayerDialogs. Now any hook that needs crease operations calls this
 * directly.
 *
 * Works wherever useScoringMatch() works (i.e. inside ScoringTab's subtree).
 *
 * @param {object} [opts]
 * @param {string} [opts.inningsKey]  When this value changes the deduplication
 *   ref is reset, preventing a stale fingerprint from blocking a fresh sync
 *   after an innings transition.
 */

import { useCallback, useEffect, useRef } from 'react';

import { useScoringMatch } from '@/context/ScoringMatchContext';
import { batsmenOnCreaseFromMatchState, bowlersInTableFromMatchState } from '@/lib/utils/scoringMappers';
import { buildPreBallCreasePatch } from '@/lib/utils/scoringUtils';
import { useGetMatchStateQuery, useUpdateCreaseMutation } from '@/store/api/matchApi';

export function useCreaseSync({ inningsKey } = {}) {
  const { matchId } = useScoringMatch();
  const [updateCrease] = useUpdateCreaseMutation();
  const { data: matchState } = useGetMatchStateQuery(matchId, { skip: !matchId });

  /** Prevents sending the same crease patch twice in a row (XI save + effect). */
  const lastSyncRef = useRef(null);

  useEffect(() => {
    lastSyncRef.current = null;
  }, [matchId, inningsKey]);

  const onCreaseChange = useCallback(
    (patch = {}) => {
      if (!matchId) return Promise.resolve();
      if (!patch || typeof patch !== 'object' || Object.keys(patch).length === 0) return Promise.resolve();
      return updateCrease({ matchId, ...patch }).unwrap();
    },
    [matchId, updateCrease],
  );

  const syncPreBallCrease = useCallback(() => {
    if (!matchId) return;
    const ai = matchState?.active_innings;
    if (!ai || (ai.legal_balls ?? 0) > 0) {
      lastSyncRef.current = null;
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
    if (lastSyncRef.current === fingerprint) return;
    lastSyncRef.current = fingerprint;
    updateCrease({ matchId, ...patch }).catch(() => {});
  }, [matchId, matchState?.active_innings, updateCrease]);

  return { onCreaseChange, syncPreBallCrease };
}
