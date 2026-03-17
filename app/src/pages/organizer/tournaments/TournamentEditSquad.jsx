import { useEffect, useMemo, useRef, useState } from 'react';

import { useLocation, useNavigate, useParams } from 'react-router-dom';

import teamDeleteIcon from '@/assets/images/icons/team-delete-icon.svg';
import { useDebounce } from '@/hooks/useDebounce';
import { useToast } from '@/hooks/useToast';
import { getApiErrorMessage } from '@/lib/apiErrors';
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
// Fixed: was `useDispatch` from 'react-redux' — use the typed hook instead.
import { useAppDispatch } from '@/store/hooks';
import { openDialog } from '@/store/slices/commonSlice';
import { Container } from '@/ui/Container';
import { CloseIcon } from '@/ui/icons/CloseIcon';

export default function TournamentEditSquad() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
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

  const [updateSquad, { isLoading: isSubmitting }] =
    useUpdateTeamSquadMutation();

  // ------------------------------------------------------------------
  // Navigation guard
  // ------------------------------------------------------------------

  useEffect(() => {
    if (!isValidId) {
      navigate('/organizer/tournaments', { replace: true });
    } else if (!teamFromState) {
      navigate(`/organizer/tournaments/${tournamentIdNum}/add-squad`, {
        replace: true,
      });
    }
  }, [isValidId, teamFromState, tournamentIdNum, navigate]);

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

  // Filter the squad table by the find-player input (searches existing squad).
  const filteredPlayers = useMemo(() => {
    if (!findPlayer.trim()) return squad;
    const q = findPlayer.trim().toLowerCase();
    return squad.filter(
      (p) =>
        (p.name && p.name.toLowerCase().includes(q)) ||
        (playerDisplayRole(p) &&
          String(playerDisplayRole(p)).toLowerCase().includes(q)),
    );
  }, [findPlayer, squad]);

  // Guard: render nothing while navigation effect fires.
  if (!isValidId || !teamFromState) {
    return null;
  }

  // ------------------------------------------------------------------
  // Handlers
  // ------------------------------------------------------------------

  const handleRemovePlayer = (playerId) => {
    setSquad((prev) => prev.filter((p) => p.id !== playerId));
  };

  const handleAddPlayer = (player) => {
    if (!player || squadIds.has(player.id)) return;
    setSquad((prev) => [
      ...prev,
      {
        id: player.id,
        name: player.name ?? player.nickname ?? '—',
        playing_role: player.playing_role ?? null,
        playing_role_enum: player.playing_role_enum ?? null,
      },
    ]);
    setFindPlayer('');
  };

  const handleSubmitSquad = async () => {
    if (!teamId) return;
    const player_ids = squad.map((p) => p.id).filter((id) => id != null);
    if (player_ids.length === 0) {
      toast.error('Add at least one player to the squad.');
      return;
    }
    try {
      await updateSquad({ teamId, player_ids }).unwrap();
      toast.success('Squad updated.');
      dispatch(openDialog({ key: 'tournamentSquadUpdatedSuccess' }));

      if (tournamentIdNum && teamId) {
        navigate(
          `/organizer/tournaments/${tournamentIdNum}/final-squad/${teamId}`,
          { replace: true, state: { team, tournament } },
        );
      }
    } catch (err) {
      toast.error(getApiErrorMessage(err) ?? 'Failed to save squad.');
    }
  };

  // ------------------------------------------------------------------
  // Render
  // ------------------------------------------------------------------

  const squadEmptyMessage =
    findPlayer.trim() && squad.length > 0
      ? 'No players match your search.'
      : 'No players in squad. Search for players above to add them.';

  return (
    <div className="bg-black">
      <Container className="!px-4 !py-0">
        <header className="-mx-4 -mt-6 flex items-center gap-3 bg-black px-4 pt-6 pb-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex h-[27px] w-[27px] shrink-0 items-center justify-center rounded-full bg-white text-[#4a4a4a] transition-opacity active:opacity-80"
            aria-label="Back"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="min-w-0 flex-1 pr-[27px] text-center text-[16px] font-bold tracking-wide text-white uppercase">
            Tournaments - Edit Squad
          </h1>
        </header>

        {(tournament || tournamentIdNum) && (
          <p className="mb-1 text-[12px] font-medium tracking-wide text-[#A2A6AB] uppercase">
            {getTournamentTitle(tournament)}
          </p>
        )}

        <p className="mb-3 text-[13px] font-medium tracking-wide text-white uppercase">
          {(team?.name ?? '').toUpperCase() || 'Team'}
        </p>

        {isLoadingSquad && (
          <p className="mb-3 text-[13px] text-[#A2A6AB]">Loading squad…</p>
        )}

        {/* Team info card */}
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
              {Array.isArray(team?.icon_players) && team.icon_players.length > 0
                ? team.icon_players
                    .map((p) => p.name)
                    .filter(Boolean)
                    .join(', ')
                : (team?.iconPlayer ?? '—')}
            </p>
          </div>
        </div>

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
                              {player.playing_role ?? player.playing_role_enum}
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

        {/* Squad table — CURSOR: extract into <SquadTable> (see top) */}
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
              {!isLoadingSquad && filteredPlayers.length === 0 && (
                <tr>
                  <td
                    colSpan={3}
                    className={`border-r border-b border-l py-6 text-center text-[13px] text-[#A2A6AB] ${BORDER}`}
                  >
                    {squadEmptyMessage}
                  </td>
                </tr>
              )}
              {filteredPlayers.map((player, index) => (
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

        <button
          type="button"
          onClick={handleSubmitSquad}
          disabled={isSubmitting || squad.length === 0}
          className="m-auto flex h-12 max-w-fit items-center justify-center rounded-[6px] border-2 border-[#DA9811] px-4 text-[16px] font-bold tracking-wide text-[#DA9811] uppercase transition-opacity active:opacity-90 disabled:opacity-50"
        >
          {isSubmitting ? 'Saving…' : 'Submit Squad'}
        </button>
      </Container>
    </div>
  );
}
