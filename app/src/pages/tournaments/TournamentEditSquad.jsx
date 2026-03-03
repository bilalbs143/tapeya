import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

import teamDeleteIcon from '@/assets/images/icons/team-delete-icon.svg';
import { useToast } from '@/hooks/useToast';
import { getApiErrorMessage } from '@/lib/apiErrors';
import { useSearchPlayersQuery } from '@/store/api/playerApi';
import {
  useGetTeamSquadQuery,
  useUpdateTeamSquadMutation,
} from '@/store/api/teamApi';
import { useGetTournamentQuery } from '@/store/api/tournamentApi';
import { Container } from '@/ui/Container';
import {
  Dialog,
  DialogClose,
  DialogContentProfile,
  DialogDescription,
  DialogScrollBody,
  DialogTitle,
} from '@/ui/Dialog';

const BORDER = 'border-[#1C1C1A]';
const HEADER_BG = 'bg-[#141412]';
const DEBOUNCE_MS = 300;
const MIN_SEARCH_LENGTH = 2;

function CloseIcon({ className = 'h-5 w-5' }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6 18L18 6M6 6l12 12"
      />
    </svg>
  );
}

function playerDisplayRole(player) {
  return (
    player?.playing_role ??
    player?.playing_role_enum ??
    (player?.role != null ? String(player.role) : '—')
  );
}

export default function TournamentEditSquad() {
  const navigate = useNavigate();
  const location = useLocation();
  const { tournamentId } = useParams();
  const teamFromState = location.state?.team;
  const tournamentFromState = location.state?.tournament ?? null;
  const toast = useToast();

  const tournamentIdNum =
    tournamentId != null && tournamentId !== ''
      ? Number(tournamentId)
      : tournamentFromState?.id;
  const isValidId = Number.isInteger(tournamentIdNum) && tournamentIdNum > 0;

  const { data: tournamentFromApi } = useGetTournamentQuery(
    { id: tournamentIdNum },
    { skip: !isValidId || !!tournamentFromState },
  );
  const tournament = tournamentFromState ?? tournamentFromApi ?? null;

  const team = teamFromState ?? null;
  const teamId = team?.id;

  const { data: squadFromApi = [], isLoading: isLoadingSquad } =
    useGetTeamSquadQuery(teamId, { skip: !teamId });
  const [squad, setSquad] = useState([]);
  const [findPlayer, setFindPlayer] = useState('');
  const [debouncedFindPlayer, setDebouncedFindPlayer] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const hasInitializedSquad = useRef(false);

  const trimmedFindPlayer = findPlayer.trim();

  useEffect(() => {
    const t = setTimeout(
      () => setDebouncedFindPlayer(trimmedFindPlayer),
      DEBOUNCE_MS,
    );
    return () => clearTimeout(t);
  }, [trimmedFindPlayer]);

  const { data: playerSearchResults = [], isFetching: isSearchingPlayers } =
    useSearchPlayersQuery(debouncedFindPlayer, {
      skip: debouncedFindPlayer.length < MIN_SEARCH_LENGTH,
    });
  const [updateSquad, { isLoading: isSubmitting }] =
    useUpdateTeamSquadMutation();

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
    if (!isValidId) {
      navigate('/tournaments', { replace: true });
    } else if (!teamFromState) {
      navigate(`/tournaments/${tournamentIdNum}/add-squad`, { replace: true });
    }
  }, [isValidId, teamFromState, tournamentIdNum, navigate]);

  const squadIds = useMemo(() => new Set(squad.map((p) => p.id)), [squad]);
  const playersToAdd = useMemo(
    () =>
      playerSearchResults.filter(
        (p) => p.id != null && !squadIds.has(Number(p.id)),
      ),
    [playerSearchResults, squadIds],
  );
  const showPlayerSearchResults = trimmedFindPlayer.length > 0;

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

  if (!isValidId || !teamFromState) {
    return null;
  }

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
      setShowSuccessModal(true);
      toast.success('Squad updated.');
    } catch (err) {
      toast.error(getApiErrorMessage(err) ?? 'Failed to save squad.');
    }
  };

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
            {tournament?.tournament_name ?? tournament?.name ?? 'Tournament'}
          </p>
        )}
        <p className="mb-3 text-[13px] font-medium tracking-wide text-white uppercase">
          {(team?.name ?? '').toUpperCase() || 'Team'}
        </p>

        {isLoadingSquad && (
          <p className="mb-3 text-[13px] text-[#A2A6AB]">Loading squad…</p>
        )}

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
              type="search"
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
                          className="hover:bg.white/10 flex w-full cursor-pointer flex-col gap-0.5 px-4 py-3 text-left transition-colors hover:bg-white/10"
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
                    No players in squad. Search for players above to add them.
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

      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContentProfile className="!h-[250px]">
          <div className="flex min-h-0 flex-1 flex-col">
            <div className="flex shrink-0 items-center justify-between px-4 py-3">
              <span aria-hidden className="w-5" />
              <DialogClose
                className="rounded p-1 text-white/60 transition-colors hover:text-white focus:ring-2 focus:ring-[#FFB703] focus:outline-none"
                aria-label="Close"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 15 15"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M11.7816 4.03157C12.0062 3.80702 12.0062 3.44295 11.7816 3.2184C11.5571 2.99385 11.193 2.99385 10.9685 3.2184L7.50005 6.68682L4.03164 3.2184C3.80708 2.99385 3.44301 2.99385 3.21846 3.2184C2.99391 3.44295 2.99391 3.80702 3.21846 4.03157L6.68688 7.49999L3.21846 10.9684C2.99391 11.193 2.99391 11.557 3.21846 11.7816C3.44301 12.0061 3.80708 12.0061 4.03164 11.7816L7.50005 8.31316L10.9685 11.7816C11.193 12.0061 11.5571 12.0061 11.7816 11.7816C12.0062 11.557 12.0062 11.193 11.7816 10.9684L8.31322 7.49999L11.7816 4.03157Z" />
                </svg>
              </DialogClose>
            </div>

            <DialogScrollBody className="flex flex-col items-center justify-center py-2 text-center">
              <div className="relative mb-3 flex h-14 w-14 shrink-0 items-center justify-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white">
                  <svg
                    className="h-7 w-7 text-[#E8A857]"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    aria-hidden
                  >
                    <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 11V4a3 3 0 0 1 3-3h2v10z" />
                  </svg>
                </div>
                <div
                  className="absolute -top-0.5 -right-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-[#22C55E]"
                  aria-hidden
                >
                  <svg
                    className="h-3 w-3 text-white"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={3}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                </div>
              </div>

              <DialogTitle className="mb-1.5 text-[14px] font-bold text-white">
                Squad has been submitted
              </DialogTitle>
              <DialogDescription className="text-[13px] leading-snug text-[#A2A6AB]">
                You can edit the squad again from the team list if needed.
              </DialogDescription>
            </DialogScrollBody>
          </div>
        </DialogContentProfile>
      </Dialog>
    </div>
  );
}
