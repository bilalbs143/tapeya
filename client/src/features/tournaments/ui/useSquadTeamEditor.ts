import { useMemo, useState } from 'react';

import { type TeamSquadPlayer, useGetTeamSquadQuery, useUpdateTeamSquadMutation } from '@/features/matches';
import { useLookupUsersQuery } from '@/features/profile';

import { getApiErrorMessage } from '@/shared/api/errors';
import { toast } from '@/shared/ui/toast';

import { useGetTournamentSquadOccupancyQuery } from '../api/tournamentsApi';
import {
  squadEditorFillPct,
  type SquadEditorSaveState,
  squadEditorShortCount,
  squadEditorSubtitle,
} from '../lib/squadEditor';
import type { Tournament } from '../model/schemas';
import { playerDisplayName, SQUAD_CAP, SQUAD_XI } from '../model/squadSchemas';
import type { TournamentTeam } from '../model/teamSchemas';

type UseSquadTeamEditorArgs = {
  tournamentId: number;
  tournament: Tournament;
  teams: TournamentTeam[];
  selectedTeam: TournamentTeam;
};

/** Autosave squad draft for one team; occupancy blocks cross-team adds. */
export function useSquadTeamEditor({ tournamentId, tournament, teams, selectedTeam }: UseSquadTeamEditorArgs) {
  const teamId = selectedTeam.id;
  const squadQuery = useGetTeamSquadQuery(teamId);
  const occupancyQuery = useGetTournamentSquadOccupancyQuery({
    tournamentId,
    excludeTeamId: teamId,
  });
  const [updateSquad] = useUpdateTeamSquadMutation();

  const seeded = squadQuery.data;
  const [draft, setDraft] = useState<TeamSquadPlayer[] | null>(null);
  const squad = useMemo(() => draft ?? seeded ?? [], [draft, seeded]);

  const [query, setQuery] = useState('');
  const [saveState, setSaveState] = useState<SquadEditorSaveState>('saved');
  const [saveError, setSaveError] = useState<string | null>(null);

  const occupiedByPlayerId = useMemo(() => {
    const map = new Map<number, { teamName: string; playerName: string }>();
    for (const row of occupancyQuery.data ?? []) {
      map.set(row.playerId, { teamName: row.teamName, playerName: row.playerName });
    }
    return map;
  }, [occupancyQuery.data]);

  const trimmedQuery = query.trim();
  const searching = trimmedQuery.length >= 2;
  const lookup = useLookupUsersQuery(trimmedQuery, { skip: !searching });

  const squadIds = useMemo(() => new Set(squad.map((p) => p.id)), [squad]);

  const searchResults = useMemo(() => {
    if (!searching) return [];
    return (lookup.data ?? []).filter((p) => !squadIds.has(p.id));
  }, [searching, lookup.data, squadIds]);

  const readyCount = squad.length >= SQUAD_XI ? 1 : 0;

  async function persist(next: TeamSquadPlayer[], previous: TeamSquadPlayer[]) {
    setSaveState('saving');
    setSaveError(null);
    try {
      await updateSquad({
        teamId,
        playerIds: next.map((p) => p.id),
        tournamentId,
      }).unwrap();
      setSaveState('saved');
    } catch (err) {
      setDraft(previous);
      setSaveState('error');
      setSaveError(getApiErrorMessage(err, "Couldn't save squad."));
    }
  }

  function addPlayer(player: { id: number; name: string | null; nickname: string | null; playingRole: string | null }) {
    if (squadIds.has(player.id) || squad.length >= SQUAD_CAP) return;
    const clash = occupiedByPlayerId.get(player.id);
    if (clash) {
      toast({
        title: 'Already on Another Team',
        description: `${playerDisplayName(player)} is on ${clash.teamName} in this tournament.`,
        tone: 'error',
      });
      return;
    }
    const previous = squad;
    const next: TeamSquadPlayer[] = [
      ...squad,
      {
        id: player.id,
        name: playerDisplayName(player),
        role: player.playingRole,
        hand: null,
      },
    ];
    setDraft(next);
    setQuery('');
    void persist(next, previous);
  }

  function removePlayer(playerId: number) {
    const previous = squad;
    const next = squad.filter((p) => p.id !== playerId);
    setDraft(next);
    void persist(next, previous);
  }

  function retrySave() {
    void persist(squad, squad);
  }

  const emptySquad = squad.length === 0;
  const short = squadEditorShortCount(squad.length);
  const fillPct = squadEditorFillPct(squad.length);
  const groupLabel =
    selectedTeam.groupIndex != null && (tournament.groupCount ?? 0) > 1 ? `Group ${selectedTeam.groupIndex}` : null;
  const subtitle = squadEditorSubtitle({
    emptySquad,
    teamName: selectedTeam.name,
    tournamentName: tournament.name,
    readyCount,
    teamsCount: teams.length,
  });

  return {
    squad,
    query,
    setQuery,
    saveState,
    saveError,
    occupiedByPlayerId,
    searching,
    lookupFetching: lookup.isFetching,
    searchResults,
    addPlayer,
    removePlayer,
    retrySave,
    short,
    fillPct,
    groupLabel,
    subtitle,
    squadCap: SQUAD_CAP,
    squadXi: SQUAD_XI,
    showSquadSkeleton: squadQuery.isLoading && draft == null && seeded == null,
  };
}
