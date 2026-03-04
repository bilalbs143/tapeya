import { useLocation, useNavigate, useParams } from 'react-router-dom';

import { useGetTeamSquadQuery } from '@/store/api/teamApi';
import {
  useGetTournamentQuery,
  useGetTournamentTeamsQuery,
} from '@/store/api/tournamentApi';
import { Container } from '@/ui/Container';

const BORDER = 'border-[#1C1C1A]';
const HEADER_BG = 'bg-[#141412]';

function TeamLogoIcon({ logo, teamName }) {
  return (
    <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-[#0d0d0b]">
      {logo ? (
        <img src={logo} alt="" className="h-full w-full object-contain" />
      ) : (
        <span className="flex h-full w-full items-center justify-center text-[18px] font-bold text-white">
          {(teamName ?? 'T').charAt(0).toUpperCase()}
        </span>
      )}
    </div>
  );
}

function teamDisplay(team) {
  const owner =
    team?.sponsor?.name ?? (team?.owner != null ? String(team.owner) : '—');
  const iconPlayer =
    Array.isArray(team?.icon_players) && team.icon_players.length > 0
      ? team.icon_players
          .map((p) => p.name)
          .filter(Boolean)
          .join(', ')
      : '—';
  return { owner, iconPlayer };
}

function playerDisplayRole(player) {
  return (
    player?.playing_role ??
    player?.playing_role_enum ??
    (player?.role != null ? String(player.role) : '—')
  );
}

export default function TournamentFinalSquad() {
  const navigate = useNavigate();
  const { tournamentId, teamId: teamIdParam } = useParams();
  const location = useLocation();
  const teamFromState = location.state?.team;
  const tournamentFromState = location.state?.tournament ?? null;

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

  const { data: tournamentTeams = [] } = useGetTournamentTeamsQuery(
    tournamentIdNum,
    { skip: !isValidId },
  );

  const teamIdNum =
    teamFromState?.id != null
      ? Number(teamFromState.id)
      : teamIdParam != null && teamIdParam !== ''
        ? Number(teamIdParam)
        : null;
  const hasValidTeamId =
    teamIdNum != null && Number.isInteger(teamIdNum) && teamIdNum > 0;

  const { data: squadFromApi = [], isLoading: isLoadingSquad } =
    useGetTeamSquadQuery(teamIdNum, { skip: !hasValidTeamId });
  const squad = squadFromApi;
  const isLoading = isLoadingSquad;

  const resolvedTeam =
    teamFromState ??
    (hasValidTeamId
      ? tournamentTeams.find((t) => Number(t.id) === teamIdNum)
      : tournamentTeams[0]) ??
    null;

  const team = resolvedTeam ?? teamFromState ?? null;
  const { owner, iconPlayer } = teamDisplay(team);

  if (!isValidId || !hasValidTeamId) {
    navigate('/organizer/tournaments', { replace: true });
    return null;
  }

  return (
    <div className="bg-black">
      <Container className="!px-4 !py-0">
        <header className="-mx-4 -mt-6 flex items-center gap-3 bg-black px-4 pt-6 pb-6">
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
            Final Squad
          </h1>
        </header>

        {tournament && (
          <p className="mb-1 text-[12px] font-medium tracking-wide text-[#A2A6AB] uppercase">
            {tournament.tournament_name ?? tournament.name ?? 'Tournament'}
          </p>
        )}
        <p className="mb-3 text-[13px] font-bold tracking-wide text-[#A2A6AB] uppercase">
          {team?.name ?? 'Team'}
        </p>

        <div className="mb-5 flex items-start gap-3 rounded-[17px] bg-[#141412] p-4">
          <TeamLogoIcon logo={team.logo} teamName={team.name} />
          <div className="min-w-0 flex-1">
            <h2 className="text-[16px] font-bold text-white">
              {team?.name ?? '—'}
            </h2>
            <p className="mt-0.5 text-[14px] text-white">
              <span className="font-medium text-[#DA9811]">Owner: {owner}</span>
            </p>
            <p className="mt-0.5 text-[12px] text-[#A2A6AB]">
              Icon Player: <span className="text-white">{iconPlayer}</span>
            </p>
          </div>
        </div>

        <div className="overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <table className="w-full border-collapse text-[12px] text-white">
            <thead>
              <tr className={HEADER_BG}>
                <th
                  className={`${HEADER_BG} border-r border-b border-l py-2.5 pl-4 text-left font-bold text-white ${BORDER}`}
                >
                  Player
                </th>
                <th
                  className={`${HEADER_BG} border-r border-b py-2.5 pr-4 text-right font-bold text-white ${BORDER}`}
                >
                  Playing Role
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr>
                  <td
                    colSpan={2}
                    className={`border-r border-b border-l py-6 text-center text-[13px] text-[#A2A6AB] ${BORDER}`}
                  >
                    Loading squad…
                  </td>
                </tr>
              )}
              {!isLoading && squad.length === 0 && (
                <tr>
                  <td
                    colSpan={2}
                    className={`border-r border-b border-l py-6 text-center text-[13px] text-[#A2A6AB] ${BORDER}`}
                  >
                    No players in squad.
                  </td>
                </tr>
              )}
              {!isLoading &&
                squad.map((player, index) => (
                  <tr key={player.id ?? index}>
                    <td
                      className={`border-r border-b border-l py-3 pl-4 ${BORDER}`}
                    >
                      <span className="text-[12px] font-medium text-white">
                        {index + 1} {player.name ?? player.nickname ?? '—'}
                      </span>
                    </td>
                    <td
                      className={`border-r border-b py-3 pr-4 text-right text-white ${BORDER}`}
                    >
                      {playerDisplayRole(player)}
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
