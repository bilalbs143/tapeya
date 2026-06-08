import { useCallback } from 'react';

import { useScoringMatch } from '@/context/ScoringMatchContext';
import { useCreaseSync } from '@/hooks/useCreaseSync';
import { useToast } from '@/hooks/useToast';
import {
  useStoreMatchSquadMutation,
  useStorePlayingElevenMutation,
  useUpdateCaptainMutation,
  useUpdateWicketKeeperMutation,
} from '@/store/api/matchApi';

/**
 * Handles saving batting and bowling squads to the API.
 * On success it also sets the initial crease (before the first ball).
 */
export function useSquadPersistence({
  battingTeamId,
  bowlingTeamId,
  battingSquad,
  bowlingSquad,
  requiredBatting,
  requiredBowling,
  hasBallsBowled,
}) {
  const { matchId } = useScoringMatch();
  const { onCreaseChange, syncPreBallCrease } = useCreaseSync();
  const toast = useToast();
  const [storeMatchSquad] = useStoreMatchSquadMutation();
  const [storePlayingEleven] = useStorePlayingElevenMutation();
  const [updateCaptain] = useUpdateCaptainMutation();
  const [updateWicketKeeper] = useUpdateWicketKeeperMutation();

  const handleSaveBatsmanSquad = useCallback(
    async (updatedPlayers, captainId = null, wicketKeeperId = null) => {
      if (!matchId || !battingTeamId) return;
      const squad = updatedPlayers ?? battingSquad;
      const playingIds = squad.filter((p) => p.role === 'playing' && Number.isFinite(Number(p.id))).map((p) => Number(p.id));
      if (playingIds.length !== requiredBatting) return;
      try {
        const allIds = squad.filter((p) => Number.isFinite(Number(p.id))).map((p) => Number(p.id));
        await storeMatchSquad({ matchId, teamId: battingTeamId, player_ids: allIds }).unwrap();
        await storePlayingEleven({ matchId, teamId: battingTeamId, player_ids: playingIds }).unwrap();
        if (captainId != null && updateCaptain) {
          await updateCaptain({ matchId, team_id: battingTeamId, captain_id: Number(captainId) }).unwrap();
        }
        if (wicketKeeperId != null && updateWicketKeeper) {
          await updateWicketKeeper({ matchId, team_id: battingTeamId, wicket_keeper_id: Number(wicketKeeperId) }).unwrap();
        }
        const playing = squad.filter((p) => p.role === 'playing');
        if (playing.length >= 2 && !hasBallsBowled) {
          await onCreaseChange?.({
            next_batter_id: Number(playing[0].id),
            next_non_striker_id: Number(playing[1].id),
          });
          syncPreBallCrease?.();
        }
        toast.success('Batting squad updated.');
      } catch {
        // Errors handled by API layer / toasts
      }
    },
    [
      matchId,
      battingTeamId,
      battingSquad,
      requiredBatting,
      storeMatchSquad,
      storePlayingEleven,
      updateCaptain,
      updateWicketKeeper,
      hasBallsBowled,
      onCreaseChange,
      syncPreBallCrease,
      toast,
    ],
  );

  const handleSaveBowlerSquad = useCallback(
    async (updatedPlayers, captainId = null, wicketKeeperId = null) => {
      if (!matchId || !bowlingTeamId) return;
      const squad = updatedPlayers ?? bowlingSquad;
      const playingIds = squad.filter((p) => p.role === 'playing' && Number.isFinite(Number(p.id))).map((p) => Number(p.id));
      if (playingIds.length !== requiredBowling) return;
      try {
        const allIds = squad.filter((p) => Number.isFinite(Number(p.id))).map((p) => Number(p.id));
        await storeMatchSquad({ matchId, teamId: bowlingTeamId, player_ids: allIds }).unwrap();
        await storePlayingEleven({ matchId, teamId: bowlingTeamId, player_ids: playingIds }).unwrap();
        if (captainId != null && updateCaptain) {
          await updateCaptain({ matchId, team_id: bowlingTeamId, captain_id: Number(captainId) }).unwrap();
        }
        if (wicketKeeperId != null && updateWicketKeeper) {
          await updateWicketKeeper({ matchId, team_id: bowlingTeamId, wicket_keeper_id: Number(wicketKeeperId) }).unwrap();
        }
        const playing = squad.filter((p) => p.role === 'playing');
        if (playing.length > 0 && !hasBallsBowled) {
          await onCreaseChange?.({ next_bowler_id: Number(playing[0].id) });
          syncPreBallCrease?.();
        }
        toast.success('Bowling squad updated.');
      } catch {
        // Errors handled by API layer / toasts
      }
    },
    [
      matchId,
      bowlingTeamId,
      bowlingSquad,
      requiredBowling,
      storeMatchSquad,
      storePlayingEleven,
      updateCaptain,
      updateWicketKeeper,
      hasBallsBowled,
      onCreaseChange,
      syncPreBallCrease,
      toast,
    ],
  );

  return { handleSaveBatsmanSquad, handleSaveBowlerSquad };
}
