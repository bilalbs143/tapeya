import { useCallback } from 'react';

import { useStoreMatchSubstituteMutation } from '@/store/api/matchApi';

/**
 * Player substitution mutation.
 *
 * @param {object} params
 * @param {string} params.matchId
 * @param {string|number} params.inningsId
 */
export function useSubstitutePlayer({ matchId, inningsId }) {
  const [storeSubstituteMutation, { isLoading }] = useStoreMatchSubstituteMutation();

  const storeSubstitute = useCallback(
    async ({ replaced_player_id, substitute_player_id, fielder_id }) => {
      if (!matchId || inningsId == null) {
        throw new Error('Match and innings are required to record a substitution.');
      }
      return storeSubstituteMutation({
        matchId,
        innings_id: inningsId,
        replaced_player_id: Number(replaced_player_id),
        substitute_player_id: Number(substitute_player_id),
        fielder_id: fielder_id != null ? Number(fielder_id) : null,
      }).unwrap();
    },
    [matchId, inningsId, storeSubstituteMutation],
  );

  return { storeSubstitute, isLoading };
}
