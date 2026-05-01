import { useEffect, useMemo, useRef, useState } from 'react';

import { useLocation, useNavigate, useParams } from 'react-router-dom';

import { AppSubpageHeader } from '@/components/AppSubpageHeader';
import { useDebounce } from '@/hooks/useDebounce';
import { useToast } from '@/hooks/useToast';
import { getApiErrorMessage } from '@/lib/apiErrors';
import { CLOUDFRONT_APP_BASE } from '@/lib/constants/assets';
import { DEBOUNCE_MS, MIN_SEARCH_LENGTH } from '@/lib/constants/search';
import { BORDER, HEADER_BG } from '@/lib/constants/tableStyles';
import { playerDisplayRole } from '@/lib/utils/playerUtils';
import {
  getTournamentTitle,
  parseTournamentId,
} from '@/lib/utils/tournamentUtils';
import { useSearchPlayersQuery } from '@/store/api/playerApi';
import {
  useGetTeamSquadQuery,
  useUpdateTeamSquadMutation,
} from '@/store/api/teamApi';
import { useGetTournamentQuery } from '@/store/api/tournamentApi';
import { Container } from '@/ui/Container';
import { CloseIcon } from '@/ui/icons/CloseIcon';

const teamDeleteIcon = `${CLOUDFRONT_APP_BASE}/images/icons/team-delete-icon.svg`;

export default function TournamentSquad() {
  const navigate = useNavigate();
  const location = useLocation();
  const { tournamentId } = useParams();
  const toast = useToast();

  const teamFromState = location.state?.team;
  const tournamentFromState = location.state?.tournament ?? null;

  const tournamentIdNum = parseTournamentId(
    tournamentId,
    tournamentFromState?.id,
  );
  const isValidId = tournamentIdNum != null;

  const { data: tournamentFromApi } = useGetTournamentQuery(
    { id: tournamentIdNum },
    { skip: !isValidId || !!tournamentFromState },
  );
  const tournament = tournamentFromState ?? tournamentFromApi ?? null;

  const team = teamFromState ?? null;
  const teamId = team?.id;

  // ------------------------------------------------------------------
  // Squad state
  // CURSOR: extract hasInitializedSquad + init effect into useSquadInit (see top).
  // ------------------------------------------------------------------

  const { data: squadFromApi = [], isLoading: isLoadingSquad } =
    useGetTeamSquadQuery(teamId, { skip: !teamId });

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

  // ------------------------------------------------------------------
  // Find-player search
  // CURSOR: move debounce effect into useDebounce hook (src/hooks/useDebounce.js)
  //         same pattern as TournamentAddTeam.jsx.
  // ------------------------------------------------------------------

  const [findPlayer, setFindPlayer] = useState('');
  const trimmedFindPlayer = findPlayer.trim();
  const debouncedFindPlayer = useDebounce(trimmedFindPlayer, DEBOUNCE_MS);

  const { data: playerSearchResults = [], isFetching: isSearchingPlayers } =
    useSearchPlayersQuery(debouncedFindPlayer, {
      skip: debouncedFindPlayer.length < MIN_SEARCH_LENGTH,
    });

  const [updateSquad] = useUpdateTeamSquadMutation();

  // ------------------------------------------------------------------
  // Navigation guard
  // ------------------------------------------------------------------

  useEffect(() => {
    if (!isValidId) {
      navigate('/organizer/tournaments', { replace: true });
    }
  }, [isValidId, navigate]);

  useEffect(() => {
    if (isValidId && !teamFromState) {
      navigate(`/organizer/tournaments/${tournamentIdNum}/add-squad`, {
        replace: true,
        state: { tournament: tournament ?? { id: tournamentIdNum } },
      });
    }
  }, [isValidId, tournamentIdNum, teamFromState, tournament, navigate]);

  // ------------------------------------------------------------------
  // Derived state
  // ------------------------------------------------------------------

  const squadIds = useMemo(() => new Set(squad.map((p) => p.id)), [squad]);

  // Players from search results that are not already in the squad.
  const playersToAdd = useMemo(
    () =>
      playerSearchResults.filter(
        (p) => p.id != null && !squadIds.has(Number(p.id)),
      ),
    [playerSearchResults, squadIds],
  );

  const showPlayerSearchResults = trimmedFindPlayer.length > 0;

  if (!isValidId || !teamFromState) {
    return null;
  }

  // ------------------------------------------------------------------
  // Handlers
  // ------------------------------------------------------------------

  const handleRemovePlayer = (playerId) => {
    const nextSquad = squad.filter((p) => p.id !== playerId);
    setSquad(nextSquad);
    saveSquad(nextSquad);
  };

  const handleAddPlayer = (player) => {
    if (!player || squadIds.has(player.id)) return;
    const newPlayer = {
      id: player.id,
      name: player.name ?? player.nickname ?? '—',
      playing_role: player.playing_role ?? null,
      playing_role_enum: player.playing_role_enum ?? null,
    };
    const nextSquad = [...squad, newPlayer];
    setSquad(nextSquad);
    setFindPlayer('');
    saveSquad(nextSquad);
  };

  const saveSquad = async (squadOverride) => {
    if (!teamId) return;
    const list = squadOverride ?? squad;
    const player_ids = list.map((p) => p.id).filter((id) => id != null);
    try {
      await updateSquad({ teamId, player_ids }).unwrap();
      toast.success('Squad updated.');
    } catch (err) {
      toast.error(getApiErrorMessage(err) ?? 'Failed to save squad.');
    }
  };

  // ------------------------------------------------------------------
  // Render
  // ------------------------------------------------------------------

  const squadEmptyMessage =
    'No players in squad. Search for players above to add them.';

  return (
    <div className="bg-black">
      <AppSubpageHeader
        title={
          tournament
            ? `${getTournamentTitle(tournament)} - Squad`
            : 'Tournaments - Squad'
        }
      />
      <Container>
        {isLoadingSquad && (
          <p className="mb-3 text-[13px] text-[#A2A6AB]">Loading squad…</p>
        )}

        {/* Team info card */}
        {team && (
          <div className="mb-5 flex items-stretch gap-3 rounded-[17px] bg-[#141412] p-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-[#0d0d0b]">
              {team?.logo ? (
                <img
                  src={team.logo}
                  alt=""
                  className="h-full w-full object-contain"
                />
              ) : (
                <span className="flex h-full w-full items-center justify-center text-[18px] font-bold text-white">
                  {(team?.name ?? 'T').charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-[16px] font-bold text-white">
                {team?.name ?? '—'}
              </h2>
              <p className="mt-0.5 text-[14px] text-[#DA9811]">
                Owner: {team?.owner ?? team?.sponsor?.name ?? '—'}
              </p>
              <p className="mt-0.5 text-[12px] text-white">
                Icon Players:{' '}
                {Array.isArray(team?.icon_players) &&
                team.icon_players.length > 0
                  ? team.icon_players
                      .map((p) => p.name)
                      .filter(Boolean)
                      .join(', ')
                  : (team?.iconPlayer ?? '—')}
              </p>
            </div>
          </div>
        )}

        {team && (
          <div className="mb-4">
            <label
              htmlFor="find-player"
              className="mb-2 block text-[14px] font-medium text-white"
            >
              Find Player
            </label>
            <div className="relative">
              <input
                id="find-player"
                type="text"
                value={findPlayer}
                onChange={(e) => setFindPlayer(e.target.value)}
                placeholder="Search by name, nickname or phone…"
                autoComplete="off"
                className="h-12 w-full rounded-[6px] bg-[#141412] py-3 pr-10 pl-4 text-white placeholder:text-base placeholder:text-[#A2A6AB78] focus:ring-2 focus:ring-[#DA9811]/50 focus:outline-none"
                aria-label="Find player"
              />
              {findPlayer && (
                <button
                  type="button"
                  onClick={() => setFindPlayer('')}
                  className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-[#A2A6AB] transition-colors hover:text-white active:opacity-80"
                  aria-label="Clear search"
                >
                  <CloseIcon className="h-4 w-4" />
                </button>
              )}
              {showPlayerSearchResults && (
                <div className="absolute top-full right-0 left-0 z-10 mt-1 max-h-60 overflow-auto rounded-[6px] border border-[#141412] bg-[#141412] shadow-lg">
                  {trimmedFindPlayer.length < MIN_SEARCH_LENGTH ? (
                    <p className="px-4 py-3 text-[13px] text-[#A2A6AB]">
                      Type at least {MIN_SEARCH_LENGTH} characters to search
                    </p>
                  ) : isSearchingPlayers ? (
                    <p className="px-4 py-3 text-[13px] text-[#A2A6AB]">
                      Searching…
                    </p>
                  ) : playersToAdd.length > 0 ? (
                    <ul className="py-1">
                      {playersToAdd.map((player) => (
                        <li key={player.id}>
                          <button
                            type="button"
                            onClick={() => handleAddPlayer(player)}
                            className="flex w-full cursor-pointer flex-col gap-0.5 px-4 py-3 text-left text-white transition-colors hover:bg-white/10"
                          >
                            <span className="font-semibold text-white">
                              {player.name ?? player.nickname ?? '—'}
                            </span>
                            {(player.playing_role ??
                              player.playing_role_enum) && (
                              <span className="text-[13px] text-[#A2A6AB]">
                                {player.playing_role ??
                                  player.playing_role_enum}
                              </span>
                            )}
                          </button>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="px-4 py-3 text-[13px] text-[#A2A6AB]">
                      {playerSearchResults.length > 0
                        ? 'All matching players are already in the squad.'
                        : 'No players found. Try a different search.'}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Squad table — CURSOR: extract into <SquadTable> (see top) */}
        {team && (
          <div className="mb-6 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <table className="w-full border-collapse text-[12px] text-white">
              <thead>
                <tr className={HEADER_BG}>
                  <th
                    className={`${HEADER_BG} border-r border-b border-l py-2.5 pl-4 text-left font-bold text-white ${BORDER}`}
                  >
                    Player
                  </th>
                  <th
                    className={`${HEADER_BG} border-r border-b py-2.5 text-center font-bold text-white ${BORDER}`}
                  >
                    Playing Role
                  </th>
                  <th
                    className={`${HEADER_BG} border-r border-b py-2.5 pr-4 text-right font-bold text-white ${BORDER}`}
                  >
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {!isLoadingSquad && squad.length === 0 && (
                  <tr>
                    <td
                      colSpan={3}
                      className={`border-r border-b border-l py-6 text-center text-[13px] text-[#A2A6AB] ${BORDER}`}
                    >
                      {squadEmptyMessage}
                    </td>
                  </tr>
                )}
                {squad.map((player, index) => (
                  <tr key={player.id}>
                    <td
                      className={`border-r border-b border-l py-3 pl-4 ${BORDER}`}
                    >
                      <p className="text-[12px] font-medium text-white">
                        {index + 1} {player.name}
                      </p>
                    </td>
                    <td
                      className={`border-r border-b py-3 text-center text-white ${BORDER}`}
                    >
                      {playerDisplayRole(player)}
                    </td>
                    <td
                      className={`border-r border-b py-3 pr-4 text-right ${BORDER}`}
                    >
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
        )}
      </Container>
    </div>
  );
}
