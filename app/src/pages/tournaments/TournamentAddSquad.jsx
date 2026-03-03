import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

import teamDeleteIcon from '@/assets/images/icons/team-delete-icon.svg';
import { useToast } from '@/hooks/useToast';
import { getApiErrorMessage } from '@/lib/apiErrors';
import {
  useGetTournamentQuery,
  useGetTournamentTeamsQuery,
  useRemoveTeamFromTournamentMutation,
} from '@/store/api/tournamentApi';
import { Button } from '@/ui/Button';
import { Container } from '@/ui/Container';

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
    team.sponsor?.name ?? (team.owner != null ? String(team.owner) : '—');
  const iconPlayers =
    Array.isArray(team.icon_players) && team.icon_players.length > 0
      ? team.icon_players
          .map((p) => p.name)
          .filter(Boolean)
          .join(', ')
      : '—';
  return { owner, iconPlayers };
}

function TeamCard({ team, index, onAddSquad, onDelete, isDeleting }) {
  const { owner, iconPlayers } = teamDisplay(team);
  return (
    <div className="rounded-[17px] bg-[#141412] p-4">
      <div className="flex justify-end gap-1.5">
        <Button
          type="button"
          variant="file"
          size="sm"
          className="h-8 rounded-full border border-[#DA9811] bg-transparent px-3 text-[12px] font-semibold text-[#DA9811]"
          onClick={() => onAddSquad?.(team)}
          disabled={isDeleting}
        >
          Add Squad
        </Button>
        <button
          type="button"
          onClick={() => onDelete?.(team)}
          disabled={isDeleting}
          className="flex h-8 w-8 shrink-0 items-center justify-center transition-opacity active:opacity-80 disabled:opacity-50"
          aria-label="Remove team from tournament"
        >
          <img src={teamDeleteIcon} alt="" className="h-5 w-5" />
        </button>
      </div>
      <div className="mt-3 flex items-start gap-3">
        <TeamLogoIcon logo={team.logo} teamName={team.name} />
        <div className="min-w-0 flex-1">
          <h3 className="text-[16px] font-bold text-white">
            {team.name ?? '—'}
          </h3>
          <p className="mt-0.5 text-[14px] text-white">
            Owner: <span className="font-medium text-[#DA9811]">{owner}</span>
          </p>
          <p className="mt-0.5 text-[12px] text-white">
            Icon Players: <span className="text-[#A2A6AB]">{iconPlayers}</span>
          </p>
        </div>
        <span className="shrink-0 self-center text-[28px] leading-none font-bold text-[#DA98113B]">
          {index + 1}
        </span>
      </div>
    </div>
  );
}

export default function TournamentAddSquad() {
  const navigate = useNavigate();
  const location = useLocation();
  const { tournamentId } = useParams();
  const stateTeams = location.state?.teams;
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

  const { data: fetchedTeams = [], isLoading } = useGetTournamentTeamsQuery(
    tournamentIdNum,
    { skip: !isValidId || stateTeams?.length > 0 },
  );

  const [removedTeamIds, setRemovedTeamIds] = useState([]);
  const baseTeams = stateTeams?.length > 0 ? stateTeams : fetchedTeams;
  const teams = baseTeams.filter((t) => !removedTeamIds.includes(t.id));
  const toast = useToast();
  const [removeTeam, { isLoading: isRemoving }] =
    useRemoveTeamFromTournamentMutation();

  useEffect(() => {
    if (!isValidId) {
      navigate('/tournaments', { replace: true });
    }
  }, [isValidId, navigate]);

  const handleAddSquad = (team) => {
    navigate(`/tournaments/${tournamentIdNum}/edit-squad`, {
      state: { team, tournament: tournament ?? { id: tournamentIdNum } },
    });
  };

  const handleDelete = async (teamToRemove) => {
    const teamName = teamToRemove?.name ?? 'this team';
    if (
      !window.confirm(
        `Remove ${teamName} from the tournament? Scheduled matches involving this team will be deleted. This cannot be undone.`,
      )
    ) {
      return;
    }
    try {
      await removeTeam({
        tournamentId: tournamentIdNum,
        teamId: teamToRemove.id,
      }).unwrap();
      setRemovedTeamIds((prev) => [...prev, teamToRemove.id]);
      toast.success('Team removed from tournament.');
    } catch (err) {
      toast.error(
        getApiErrorMessage(err) ??
          'Could not remove team. It may not be allowed after toss.',
      );
    }
  };

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
            Tournaments - Teams
          </h1>
        </header>

        {tournament && (
          <p className="mb-2 text-[13px] font-medium tracking-wide text-white uppercase">
            {tournament.tournament_name ?? tournament.name ?? 'Tournament'}
          </p>
        )}

        {!stateTeams?.length && tournament?.id && isLoading && (
          <p className="mb-3 text-[13px] text-[#A2A6AB]">Loading teams…</p>
        )}

        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-[13px] font-bold tracking-wide text-white uppercase">
            Teams
          </h2>
          <button
            type="button"
            onClick={() =>
              navigate(`/tournaments/${tournamentIdNum}/add-team`, {
                state: { tournament: tournament ?? { id: tournamentIdNum } },
              })
            }
            className="flex shrink-0 items-center gap-2 transition-opacity active:opacity-80"
          >
            <span className="flex h-[27px] w-[27px] items-center justify-center rounded-full bg-[#DA9811] text-[18px] font-bold text-[#080807]">
              +
            </span>
            <span className="text-[13px] font-bold text-[#A2A6AB]">
              Create Team
            </span>
          </button>
        </div>

        <ul className="space-y-3 pb-10">
          {!isLoading &&
            teams.map((team, index) => (
              <li key={team.id ?? index}>
                <TeamCard
                  team={team}
                  index={index}
                  onAddSquad={handleAddSquad}
                  onDelete={handleDelete}
                  isDeleting={isRemoving}
                />
              </li>
            ))}
        </ul>

        {!isLoading && teams.length === 0 && (
          <p className="rounded-[17px] bg-[#141412] px-4 py-6 text-center text-[13px] text-[#A2A6AB]">
            No teams yet. Add teams from the saved teams step first.
          </p>
        )}
      </Container>
    </div>
  );
}
