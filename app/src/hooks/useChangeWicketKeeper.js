import { useCallback } from 'react';

import { useGetMatchTeamSquadQuery, useUpdateWicketKeeperMutation } from '@/store/api/matchApi';

/**
 * Wicket keeper squad fetch + update mutation.
 *
 * @param {object} params
 * @param {string} params.matchId
 * @param {string|number} params.teamId  The bowling team whose keeper is being set
 */
export function useChangeWicketKeeper({ matchId, teamId }) {
  const { data: squad, isFetching: isLoadingSquad } = useGetMatchTeamSquadQuery(
    { matchId, teamId },
    { skip: !matchId || !teamId },
  );

  const [updateWicketKeeperMutation, { isLoading: isSaving }] = useUpdateWicketKeeperMutation();

  const updateWicketKeeper = useCallback(
    async ({ wicket_keeper_id }) => {
      if (!matchId || !teamId) {
        throw new Error('Match and team are required to change the wicket keeper.');
      }
      return updateWicketKeeperMutation({
        matchId,
        team_id: teamId,
        wicket_keeper_id: Number(wicket_keeper_id),
      }).unwrap();
    },
    [matchId, teamId, updateWicketKeeperMutation],
  );

  return {
    squad,
    isLoadingSquad,
    updateWicketKeeper,
    isSaving,
  };
}
