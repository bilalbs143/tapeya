import { useEffect, useMemo, useRef, useState } from 'react';

import { useLocation, useNavigate, useParams } from 'react-router-dom';

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
import { useSearchSquadMembersQuery } from '@/store/api/playerApi';
import { useGetTeamSquadQuery, useSearchTeamsQuery, useUpdateTeamSquadMutation } from '@/store/api/teamApi';
import { Container } from '@/ui/Container';
import { formFieldLabelCheckoutClass } from '@/ui/FormField';
import { CloseIcon } from '@/ui/icons/CloseIcon';
import { Label } from '@/ui/Label';

const searchIcon = `${CLOUDFRONT_APP_BASE}/images/icons/searchicon.svg`;
const teamDeleteIcon = `${CLOUDFRONT_APP_BASE}/images/icons/team-delete-icon.svg`;

function teamDisplayMeta(team) {
  const owner = team?.sponsor?.name ?? '—';
  const iconPlayers =
    Array.isArray(team?.icon_players) && team.icon_players.length > 0
      ? team.icon_players
        .map((p) => p.name)
        .filter(Boolean)
        .join(', ')
      : '—';
  return { owner, iconPlayers };
}

export default function TeamDetail() {
  const navigate = useNavigate();
  const location = useLocation();
  const { teamId: teamIdParam } = useParams();
  const toast = useToast();

  const teamId = teamIdParam != null && teamIdParam !== '' ? Number(teamIdParam) : null;
  const hasValidTeamId = teamId != null && Number.isFinite(teamId) && teamId > 0;

  const teamFromState = location.state?.team;

  const { data: teams = [], isLoading: isLoadingTeams } = useSearchTeamsQuery('', {
    skip: !hasValidTeamId,
  });

  const team = useMemo(() => {
    if (!hasValidTeamId) return null;
    if (teamFromState && Number(teamFromState.id) === teamId) return teamFromState;
    return teams.find((t) => Number(t.id) === teamId) ?? null;
  }, [hasValidTeamId, teamId, teamFromState, teams]);

  const { data: squadFromApi = [], isLoading: isLoadingSquad } = useGetTeamSquadQuery(teamId, {
    skip: !hasValidTeamId,
  });

  const [squad, setSquad] = useState([]);
  const hasInitializedSquad = useRef(false);

  useEffect(() => {
    if (!hasValidTeamId || isLoadingSquad) return;
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
  }, [hasValidTeamId, isLoadingSquad, squadFromApi]);

  useEffect(() => {
    hasInitializedSquad.current = false;
  }, [teamId]);

  const [findPlayer, setFindPlayer] = useState('');
  const trimmedFindPlayer = findPlayer.trim();
  const debouncedFindPlayer = useDebounce(trimmedFindPlayer, DEBOUNCE_MS);

  const { data: playerSearchResults = [], isFetching: isSearchingPlayers } = useSearchSquadMembersQuery(debouncedFindPlayer, {
    skip: debouncedFindPlayer.length < MIN_SEARCH_LENGTH,
  });

  const [updateSquad, { isLoading: isSavingSquad }] = useUpdateTeamSquadMutation();

  const squadIds = useMemo(() => new Set(squad.map((p) => Number(p.id))), [squad]);

  const playersToAdd = useMemo(
    () => playerSearchResults.filter((p) => p.id != null && !squadIds.has(Number(p.id))),
    [playerSearchResults, squadIds],
  );

  const showPlayerSearchResults = trimmedFindPlayer.length > 0;

  const saveSquad = async (squadOverride, previousSquad) => {
    if (!hasValidTeamId) return;
    const list = squadOverride ?? squad;
    const player_ids = list.map((p) => p.id).filter((id) => id != null);
    try {
      await updateSquad({ teamId, player_ids }).unwrap();
      toast.success(player_ids.length === 0 ? 'Squad cleared.' : 'Squad updated.');
    } catch (err) {
      if (previousSquad) {
        setSquad(previousSquad);
      }
      toast.error(getApiErrorMessage(err, 'Failed to save squad.'));
    }
  };

  const handleAddPlayer = (player) => {
    if (!player || squadIds.has(Number(player.id))) return;

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

  const handleRemovePlayer = (playerId) => {
    const nextSquad = squad.filter((p) => p.id !== playerId);
    setSquad(nextSquad);
    saveSquad(nextSquad, squad);
  };

  if (!hasValidTeamId) {
    return (
      <div className="bg-black">
        <AppSubpageHeader title="Drafting" />
        <Container>
          <p className="py-6 text-center text-[13px] text-[#A2A6AB]">Invalid team.</p>
        </Container>
      </div>
    );
  }

  if (isLoadingTeams && !team) {
    return (
      <div className="bg-black">
        <AppSubpageHeader title="Drafting" />
        <Container>
          <p className="py-6 text-center text-[13px] text-[#A2A6AB]">Loading team…</p>
        </Container>
      </div>
    );
  }

  if (!team) {
    return (
      <div className="bg-black">
        <AppSubpageHeader title="Drafting" />
        <Container>
          <p className="py-6 text-center text-[13px] text-[#A2A6AB]">Team not found.</p>
          <button
            type="button"
            onClick={() => navigate('/drafting/teams')}
            className="mx-auto mt-2 block text-[13px] font-semibold text-[#DA9811]"
          >
            Back to Teams
          </button>
        </Container>
      </div>
    );
  }

  const { owner, iconPlayers } = teamDisplayMeta(team);
  const squadEmptyMessage = 'No players in squad. Search for players above to add them.';

  return (
    <div className="bg-black">
      <AppSubpageHeader title="Drafting" />
      <Container>
        <div className="lg:grid lg:grid-cols-2 lg:gap-6">
          <div>
            <p className="mb-3 text-[13px] font-medium tracking-wide text-[#A2A6AB] uppercase">{team.name?.toUpperCase()}</p>

            <div className="mb-5 flex items-stretch gap-3 rounded-[17px] bg-[#141412] p-4">
              <TeamLogo team={team} variant="draft" />
              <div className="min-w-0 flex-1">
                <h2 className="text-[16px] font-bold text-white">{team.name ?? '—'}</h2>
                <p className="mt-0.5 text-[14px] text-[#DA9811]">Owner: {owner}</p>
                <p className="mt-0.5 text-[12px] text-white">
                  Icon Players: <span className="text-[#A2A6AB]">{iconPlayers}</span>
                </p>
              </div>
            </div>

            <div className="mb-4 flex flex-col gap-1">
              <Label htmlFor="find-player" className={formFieldLabelCheckoutClass}>
                Find Squad Member
              </Label>
              <div className="relative">
                <input
                  id="find-player"
                  type="search"
                  value={findPlayer}
                  onChange={(e) => setFindPlayer(e.target.value)}
                  placeholder="Search by Name, Nickname, or Phone…"
                  autoComplete="off"
                  disabled={isSavingSquad}
                  className="h-12 w-full rounded-[6px] bg-[#141412] py-3 pr-12 pl-4 text-white placeholder:text-base placeholder:text-[#A2A6AB78] focus:ring-2 focus:ring-[#DA9811]/50 focus:outline-none disabled:opacity-60"
                  aria-label="Find Player"
                />
                <img src={searchIcon} alt="" className="absolute top-1/2 right-4 h-[19px] w-[19px] -translate-y-1/2 opacity-70" />
                {findPlayer && (
                  <button
                    type="button"
                    onClick={() => setFindPlayer('')}
                    className="absolute inset-y-0 right-10 flex w-8 items-center justify-center text-[#A2A6AB] hover:text-white"
                    aria-label="Clear Search"
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
                      <p className="px-4 py-3 text-[13px] text-[#A2A6AB]">Searching…</p>
                    ) : playersToAdd.length > 0 ? (
                      <ul className="py-1">
                        {playersToAdd.map((player) => (
                          <li key={player.id}>
                            <button
                              type="button"
                              onClick={() => handleAddPlayer(player)}
                              disabled={isSavingSquad}
                              className="flex w-full cursor-pointer flex-col gap-0.5 px-4 py-3 text-left text-white transition-colors hover:bg-white/10 disabled:opacity-60"
                            >
                              <span className="font-semibold text-white">{player.name ?? player.nickname ?? '—'}</span>
                              {(player.playing_role ?? player.playing_role_enum) && (
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
          </div>

          <div className="mb-6 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {isLoadingSquad && <p className="mb-3 text-[13px] text-[#A2A6AB]">Loading squad…</p>}
            <table className="w-full border-collapse text-[12px] text-white">
              <thead>
                <tr className={HEADER_BG}>
                  <th className={`${HEADER_BG} border-r border-b border-l py-2.5 pl-4 text-left font-bold text-white ${BORDER}`}>
                    Player
                  </th>
                  <th className={`${HEADER_BG} border-r border-b py-2.5 text-center font-bold text-white ${BORDER}`}>
                    Playing Role
                  </th>
                  <th className={`${HEADER_BG} border-r border-b py-2.5 pr-4 text-right font-bold text-white ${BORDER}`}>
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
                        disabled={isSavingSquad}
                        className="inline-flex items-center justify-center transition-opacity active:opacity-80 disabled:opacity-60"
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
        </div>

        <button
          type="button"
          onClick={() => navigate('/drafting/teams')}
          className="m-auto flex h-12 max-w-fit items-center justify-center rounded-[6px] border border-[#DA9811] px-4 text-center text-[16px] font-bold tracking-wide text-[#DA9811] uppercase transition-opacity active:opacity-90 lg:m-0"
        >
          Back to Teams
        </button>
      </Container>
    </div>
  );
}
