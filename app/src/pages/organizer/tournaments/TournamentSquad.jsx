import { useEffect, useMemo, useRef, useState } from 'react';

import { useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';

import { AppSubpageHeader } from '@/components/AppSubpageHeader';
import { TeamLogo } from '@/components/TeamLogo';
import { useDebounce } from '@/hooks/useDebounce';
import { useToast } from '@/hooks/useToast';
import { getApiErrorMessage } from '@/lib/apiErrors';
import { CLOUDFRONT_APP_BASE } from '@/lib/constants/assets';
import { DEBOUNCE_MS, MIN_SEARCH_LENGTH } from '@/lib/constants/search';
import { BORDER, HEADER_BG } from '@/lib/constants/tableStyles';
import { formatListIndex } from '@/lib/format';
import { playerDisplayRole } from '@/lib/utils/playerUtils';
import { getTournamentTitle, parseTournamentId } from '@/lib/utils/tournamentUtils';
import { useSearchSquadMembersQuery } from '@/store/api/playerApi';
import { useGetTeamSquadQuery, useUpdateTeamSquadMutation } from '@/store/api/teamApi';
import {
  useGetTournamentQuery,
  useGetTournamentSquadOccupancyQuery,
  useGetTournamentTeamsQuery,
} from '@/store/api/tournamentApi';
import { Container } from '@/ui/Container';
import { FormField } from '@/ui/FormField';
import { CloseIcon } from '@/ui/icons/CloseIcon';
import {
  Select,
  SelectContent,
  selectContentInputClass,
  SelectGroup,
  SelectItem,
  selectItemIndicatorInputClass,
  selectItemInputClass,
  selectItemTextInputClass,
  SelectLabel,
  SelectTrigger,
  selectTriggerInputClass,
  SelectValue,
  selectViewportInputClass,
} from '@/ui/Select';

const teamDeleteIcon = `${CLOUDFRONT_APP_BASE}/images/icons/team-delete-icon.svg`;

function teamDisplayMeta(team) {
  const owner = team?.sponsor?.name ?? (team?.owner != null ? String(team.owner) : '—');
  const iconPlayers =
    Array.isArray(team?.icon_players) && team.icon_players.length > 0
      ? team.icon_players
          .map((p) => p.name)
          .filter(Boolean)
          .join(', ')
      : (team?.iconPlayer ?? '—');
  return { owner, iconPlayers };
}

function TeamSelectItem({ team, hasGroups }) {
  const label = team.name ?? `Team ${team.id}`;
  const groupSuffix = hasGroups && team.group_index != null && team.group_index !== '' ? ` · Group ${team.group_index}` : '';

  return (
    <SelectItem
      value={String(team.id)}
      className={selectItemInputClass}
      textClassName={selectItemTextInputClass}
      indicatorClassName={selectItemIndicatorInputClass}
    >
      <span className="flex min-w-0 items-center gap-2">
        <TeamLogo team={team} variant="dialogSelect" />
        <span className="truncate">
          {label}
          {groupSuffix}
        </span>
      </span>
    </SelectItem>
  );
}

export default function TournamentSquad() {
  const navigate = useNavigate();
  const location = useLocation();
  const { tournamentId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const toast = useToast();

  const teamFromState = location.state?.team;
  const tournamentFromState = location.state?.tournament ?? null;

  const tournamentIdNum = parseTournamentId(tournamentId, tournamentFromState?.id);
  const isValidId = tournamentIdNum != null;

  const { data: tournamentFromApi } = useGetTournamentQuery({ id: tournamentIdNum }, { skip: !isValidId });
  const tournament = tournamentFromApi ?? tournamentFromState ?? null;

  const { data: teams = [], isLoading: isLoadingTeams } = useGetTournamentTeamsQuery(tournamentIdNum, {
    skip: !isValidId,
  });

  const numberOfGroups = tournament?.number_of_groups ?? 1;
  const hasGroups = numberOfGroups > 1;

  const teamIdFromUrl = searchParams.get('team');

  const selectedTeam = useMemo(() => {
    if (!teams.length) return null;
    if (teamIdFromUrl) {
      const fromUrl = teams.find((t) => String(t.id) === teamIdFromUrl);
      if (fromUrl) return fromUrl;
    }
    if (teamFromState?.id != null) {
      const fromState = teams.find((t) => String(t.id) === String(teamFromState.id));
      if (fromState) return fromState;
    }
    return teams[0];
  }, [teams, teamIdFromUrl, teamFromState]);

  const teamId = selectedTeam?.id ?? null;
  const selectedTeamId = teamId != null ? String(teamId) : '';

  // Keep ?team= in the URL so refresh and back/forward preserve the active team.
  useEffect(() => {
    if (!isValidId || isLoadingTeams || !selectedTeam) return;
    const nextId = String(selectedTeam.id);
    if (teamIdFromUrl === nextId) return;
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.set('team', nextId);
        return next;
      },
      { replace: true },
    );
  }, [isValidId, isLoadingTeams, selectedTeam, teamIdFromUrl, setSearchParams]);

  const { data: squadFromApi = [], isLoading: isLoadingSquad } = useGetTeamSquadQuery(teamId, { skip: !teamId });

  const { data: squadOccupancy = [] } = useGetTournamentSquadOccupancyQuery(
    { tournamentId: tournamentIdNum, excludeTeamId: teamId },
    { skip: !isValidId || !teamId },
  );

  const occupiedByPlayerId = useMemo(() => {
    const map = new Map();
    for (const row of squadOccupancy) {
      map.set(Number(row.player_id), row);
    }
    return map;
  }, [squadOccupancy]);

  const [squad, setSquad] = useState([]);
  const hasInitializedSquad = useRef(false);

  useEffect(() => {
    if (!teamId || isLoadingSquad) return;
    if (!hasInitializedSquad.current) {
      hasInitializedSquad.current = true;
      setSquad(
        (squadFromApi ?? []).map((p) => ({
          id: p.id,
          name: p.name ?? p.nickname ?? '—',
          playing_role: p.playing_role,
          playing_role_enum: p.playing_role_enum,
        })),
      );
    }
  }, [teamId, isLoadingSquad, squadFromApi]);

  useEffect(() => {
    hasInitializedSquad.current = false;
  }, [teamId]);

  const [findPlayer, setFindPlayer] = useState('');
  const trimmedFindPlayer = findPlayer.trim();
  const debouncedFindPlayer = useDebounce(trimmedFindPlayer, DEBOUNCE_MS);

  useEffect(() => {
    setFindPlayer('');
  }, [selectedTeamId]);

  const { data: playerSearchResults = [], isFetching: isSearchingPlayers } = useSearchSquadMembersQuery(debouncedFindPlayer, {
    skip: debouncedFindPlayer.length < MIN_SEARCH_LENGTH,
  });

  const [updateSquad] = useUpdateTeamSquadMutation();

  useEffect(() => {
    if (!isValidId) {
      navigate('/organizer/tournaments', { replace: true });
    }
  }, [isValidId, navigate]);

  useEffect(() => {
    if (!isValidId || isLoadingTeams) return;
    if (teams.length === 0) {
      navigate(`/organizer/tournaments/${tournamentIdNum}/add-squad`, {
        replace: true,
        state: { tournament: tournament ?? { id: tournamentIdNum } },
      });
    }
  }, [isValidId, isLoadingTeams, teams.length, tournamentIdNum, tournament, navigate]);

  const squadIds = useMemo(() => new Set(squad.map((p) => p.id)), [squad]);

  const getSquadConflictMessage = (player) => {
    const row = occupiedByPlayerId.get(Number(player.id));
    if (!row) return null;
    const playerName = player.name ?? player.nickname ?? row.player_name ?? 'This player';
    return `${playerName} is already on ${row.team_name} in this tournament. A player can only be on one team per tournament.`;
  };

  const playersToAdd = useMemo(
    () => playerSearchResults.filter((p) => p.id != null && !squadIds.has(Number(p.id)) && !occupiedByPlayerId.has(Number(p.id))),
    [playerSearchResults, squadIds, occupiedByPlayerId],
  );

  const occupiedSearchMatches = useMemo(
    () => playerSearchResults.filter((p) => p.id != null && !squadIds.has(Number(p.id)) && occupiedByPlayerId.has(Number(p.id))),
    [playerSearchResults, squadIds, occupiedByPlayerId],
  );

  const showPlayerSearchResults = trimmedFindPlayer.length > 0;

  const { owner, iconPlayers } = teamDisplayMeta(selectedTeam);

  const handleTeamChange = (nextTeamId) => {
    if (!nextTeamId || nextTeamId === selectedTeamId) return;
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.set('team', nextTeamId);
        return next;
      },
      { replace: true },
    );
  };

  const handleRemovePlayer = (playerId) => {
    const nextSquad = squad.filter((p) => p.id !== playerId);
    setSquad(nextSquad);
    saveSquad(nextSquad, squad);
  };

  const handleAddPlayer = (player) => {
    if (!player || squadIds.has(player.id)) return;

    const conflictMessage = getSquadConflictMessage(player);
    if (conflictMessage) {
      toast.error(conflictMessage);
      return;
    }

    const newPlayer = {
      id: player.id,
      name: player.name ?? player.nickname ?? '—',
      playing_role: player.playing_role ?? null,
      playing_role_enum: player.playing_role_enum ?? null,
    };
    const nextSquad = [...squad, newPlayer];
    setSquad(nextSquad);
    setFindPlayer('');
    saveSquad(nextSquad, squad);
  };

  const saveSquad = async (squadOverride, previousSquad) => {
    if (!teamId) return;
    const list = squadOverride ?? squad;
    const player_ids = list.map((p) => p.id).filter((id) => id != null);
    try {
      await updateSquad({ teamId, player_ids, tournamentId: tournamentIdNum }).unwrap();
      toast.success(player_ids.length === 0 ? 'Squad cleared.' : 'Squad updated.');
    } catch (err) {
      if (previousSquad) {
        setSquad(previousSquad);
      }
      toast.error(getApiErrorMessage(err, 'Failed to save squad.'));
    }
  };

  if (!isValidId || (isLoadingTeams && teams.length === 0)) {
    return (
      <div className="bg-black">
        <AppSubpageHeader title={tournament ? `${getTournamentTitle(tournament)} - Squad` : 'Tournaments - Squad'} />
        <Container>
          <p className="text-muted py-6 text-center text-[13px]">Loading teams…</p>
        </Container>
      </div>
    );
  }

  if (!selectedTeam) {
    return null;
  }

  const squadEmptyMessage = 'No players in squad. Search for players above to add them.';

  const teamSelectOptions =
    hasGroups && numberOfGroups > 1
      ? Array.from({ length: numberOfGroups }, (_, i) => i + 1).map((groupIndex) => {
          const groupTeams = teams.filter((t) => Number(t.group_index) === groupIndex);
          if (groupTeams.length === 0) return null;
          return (
            <SelectGroup key={groupIndex}>
              <SelectLabel className="text-brand px-3 py-1.5 text-[11px] font-bold tracking-wide uppercase">
                Group {groupIndex}
              </SelectLabel>
              {groupTeams.map((t) => (
                <TeamSelectItem key={t.id} team={t} hasGroups={hasGroups} />
              ))}
            </SelectGroup>
          );
        })
      : teams.map((t) => <TeamSelectItem key={t.id} team={t} hasGroups={false} />);

  return (
    <div className="bg-black">
      <AppSubpageHeader title={tournament ? `${getTournamentTitle(tournament)} - Squad` : 'Tournaments - Squad'} />
      <Container>
        <div className="mb-5">
          <FormField label="Team" htmlFor="squad-team-select" className="mb-0">
            <Select value={selectedTeamId} onValueChange={handleTeamChange} disabled={teams.length <= 1}>
              <SelectTrigger id="squad-team-select" className={selectTriggerInputClass} aria-label="Select Team">
                <SelectValue placeholder="Select Team" />
              </SelectTrigger>
              <SelectContent className={selectContentInputClass} viewportClassName={selectViewportInputClass} position="popper">
                {teamSelectOptions}
              </SelectContent>
            </Select>
          </FormField>
        </div>

        {isLoadingSquad && <p className="text-muted mb-3 text-[13px]">Loading squad…</p>}

        <div className="bg-surface mb-5 flex items-stretch gap-3 rounded-[17px] p-4">
          <TeamLogo team={selectedTeam} variant="organizerCard" />
          <div className="min-w-0 flex-1">
            <h2 className="text-[16px] font-bold text-white">{selectedTeam.name ?? '—'}</h2>
            <p className="text-brand mt-0.5 text-[14px]">Owner: {owner}</p>
            <p className="mt-0.5 text-[12px] text-white">
              Icon Players: <span className="text-muted">{iconPlayers}</span>
            </p>
          </div>
        </div>

        <FormField label="Find Squad Member" htmlFor="find-player" className="mb-4">
          <div className="relative">
            <input
              id="find-player"
              type="text"
              value={findPlayer}
              onChange={(e) => setFindPlayer(e.target.value)}
              placeholder="Search by Name, Nickname, or Phone…"
              autoComplete="off"
              className="bg-surface placeholder:text-muted/47 focus:ring-brand/50 h-12 w-full rounded-[6px] py-3 pr-10 pl-4 text-white placeholder:text-base focus:ring-2 focus:outline-none"
              aria-label="Find Player"
            />
            {findPlayer && (
              <button
                type="button"
                onClick={() => setFindPlayer('')}
                className="text-muted absolute inset-y-0 right-0 flex w-10 items-center justify-center transition-colors hover:text-white active:opacity-80"
                aria-label="Clear Search"
              >
                <CloseIcon className="h-4 w-4" />
              </button>
            )}
            {showPlayerSearchResults && (
              <div className="bg-surface absolute top-full right-0 left-0 z-10 mt-1 max-h-60 overflow-auto rounded-[6px] border border-[#141412] shadow-lg">
                {trimmedFindPlayer.length < MIN_SEARCH_LENGTH ? (
                  <p className="text-muted px-4 py-3 text-[13px]">Type at least {MIN_SEARCH_LENGTH} characters to search</p>
                ) : isSearchingPlayers ? (
                  <p className="text-muted px-4 py-3 text-[13px]">Searching…</p>
                ) : playersToAdd.length > 0 ? (
                  <ul className="py-1">
                    {playersToAdd.map((player) => (
                      <li key={player.id}>
                        <button
                          type="button"
                          onClick={() => handleAddPlayer(player)}
                          className="flex w-full cursor-pointer flex-col gap-0.5 px-4 py-3 text-left text-white transition-colors hover:bg-white/10"
                        >
                          <span className="font-semibold text-white">{player.name ?? player.nickname ?? '—'}</span>
                          {(player.playing_role ?? player.playing_role_enum) && (
                            <span className="text-muted text-[13px]">{player.playing_role ?? player.playing_role_enum}</span>
                          )}
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-muted px-4 py-3 text-[13px]">
                    {occupiedSearchMatches.length > 0
                      ? `${occupiedSearchMatches[0].name ?? occupiedSearchMatches[0].nickname ?? 'This player'} is already on another team in this tournament.`
                      : playerSearchResults.length > 0
                        ? 'All matching players are already in the squad.'
                        : 'No players found. Try a different search.'}
                  </p>
                )}
              </div>
            )}
          </div>
        </FormField>

        <div className="mb-6 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <table className="w-full border-collapse text-[12px] text-white">
            <thead>
              <tr className={HEADER_BG}>
                <th className={`${HEADER_BG} border-r border-b border-l py-2.5 pl-4 text-left font-bold text-white ${BORDER}`}>
                  Player
                </th>
                <th className={`${HEADER_BG} border-r border-b py-2.5 text-center font-bold text-white ${BORDER}`}>
                  Playing Role
                </th>
                <th className={`${HEADER_BG} border-r border-b py-2.5 pr-4 text-right font-bold text-white ${BORDER}`}>Action</th>
              </tr>
            </thead>
            <tbody>
              {!isLoadingSquad && squad.length === 0 && (
                <tr>
                  <td colSpan={3} className={`text-muted border-r border-b border-l py-6 text-center text-[13px] ${BORDER}`}>
                    {squadEmptyMessage}
                  </td>
                </tr>
              )}
              {squad.map((player, index) => (
                <tr key={player.id}>
                  <td className={`border-r border-b border-l py-3 pl-4 ${BORDER}`}>
                    <p className="text-[12px] font-medium text-white">
                      {formatListIndex(index + 1)} {player.name}
                    </p>
                  </td>
                  <td className={`border-r border-b py-3 text-center text-white ${BORDER}`}>{playerDisplayRole(player)}</td>
                  <td className={`border-r border-b py-3 pr-4 text-right ${BORDER}`}>
                    <button
                      type="button"
                      onClick={() => handleRemovePlayer(player.id)}
                      className="inline-flex items-center justify-center transition-opacity active:opacity-80"
                      aria-label={`Remove ${player.name}`}
                    >
                      <img src={teamDeleteIcon} alt="" className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Container>
    </div>
  );
}
