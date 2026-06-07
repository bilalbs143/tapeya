import { useEffect, useMemo, useRef, useState } from 'react';

import { useLocation, useNavigate, useParams } from 'react-router-dom';

import { AppSubpageHeader } from '@/components/AppSubpageHeader';
import { TeamLogo } from '@/components/TeamLogo';
import { useDialog } from '@/context/DialogContext';
import {
  areTournamentTeamsComplete,
  canAddTournamentTeams,
  getTournamentTeamLimit,
  getTournamentTitle,
  parseTournamentId,
} from '@/lib/utils/tournamentUtils';
import { useGetTournamentQuery, useGetTournamentTeamsQuery } from '@/store/api/tournamentApi';
import { Button } from '@/ui/Button';
import { Container } from '@/ui/Container';

function teamDisplay(team) {
  const owner = team.sponsor?.name ?? (team.owner != null ? String(team.owner) : '—');
  const iconPlayers =
    Array.isArray(team.icon_players) && team.icon_players.length > 0
      ? team.icon_players
          .map((p) => p.name)
          .filter(Boolean)
          .join(', ')
      : '—';
  return { owner, iconPlayers };
}

function TeamCard({ team, index }) {
  const { owner, iconPlayers } = teamDisplay(team);

  return (
    <div className="flex items-start gap-3 rounded-[17px] bg-surface p-4">
      <TeamLogo team={team} variant="organizerCard" />
      <div className="min-w-0 flex-1">
        <h3 className="text-[16px] font-bold text-white">{team.name ?? '—'}</h3>
        <div className="mt-0.5 flex flex-wrap items-center gap-2">
          {team.group_index != null && <span className="text-[12px] text-muted">Group {team.group_index}</span>}
        </div>
        <p className="mt-0.5 text-[14px] text-white">
          Owner: <span className="font-medium text-brand">{owner}</span>
        </p>
        <p className="mt-0.5 text-[12px] text-white">
          Icon Players: <span className="text-muted">{iconPlayers}</span>
        </p>
      </div>
      <span className="shrink-0 text-[28px] font-bold text-[#DA98113B]">{index + 1}</span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------

export default function TournamentSavedTeams() {
  const navigate = useNavigate();
  const location = useLocation();
  const { tournamentId } = useParams();
  const { openDialog } = useDialog();

  const tournamentFromState = location.state?.tournament ?? null;
  const [highlightTeamId, setHighlightTeamId] = useState(null);
  const newTeamListRef = useRef(null);

  const tournamentIdNum = parseTournamentId(tournamentId, tournamentFromState?.id);
  const isValidId = tournamentIdNum != null;

  const { data: tournamentFromApi } = useGetTournamentQuery({ id: tournamentIdNum }, { skip: !isValidId });
  const tournament = tournamentFromApi ?? tournamentFromState ?? null;

  const numberOfGroups = tournament?.number_of_groups ?? 1;
  const hasGroups = numberOfGroups > 1;

  const { data: teams = [], isLoading, isError, isSuccess } = useGetTournamentTeamsQuery(tournamentIdNum, { skip: !isValidId });

  const teamLimit = getTournamentTeamLimit(tournament);
  const canAddTeam = canAddTournamentTeams(tournament, teams.length);
  const teamsComplete = areTournamentTeamsComplete(tournament, teams.length);

  const teamsByGroup = useMemo(() => {
    if (!hasGroups || numberOfGroups < 2) return null;
    const byGroup = /** @type {Record<number, typeof teams>} */ ({});
    for (let i = 1; i <= numberOfGroups; i++) {
      byGroup[i] = teams.filter((t) => Number(t.group_index) === i);
    }
    return byGroup;
  }, [hasGroups, numberOfGroups, teams]);

  useEffect(() => {
    if (!isValidId) {
      navigate('/organizer/tournaments', { replace: true });
    }
  }, [isValidId, navigate]);

  useEffect(() => {
    if (highlightTeamId && !isLoading && newTeamListRef.current) {
      newTeamListRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
    }
  }, [highlightTeamId, isLoading]);

  // ------------------------------------------------------------------
  // Handlers
  // ------------------------------------------------------------------

  const handleSubmitTeams = () => {
    navigate(`/organizer/tournaments/${tournamentIdNum}/add-squad`, {
      state: { tournament: tournament ?? { id: tournamentIdNum } },
    });
  };

  const handleOpenAddTeam = () => {
    openDialog('manageTeam', {
      mode: 'create',
      tournamentId: tournamentIdNum,
      tournament,
      onSuccess: (team) => {
        if (team?.id != null) setHighlightTeamId(team.id);
      },
    });
  };

  // ------------------------------------------------------------------
  // Render
  // ------------------------------------------------------------------

  return (
    <div className="bg-black">
      <AppSubpageHeader title={tournament ? `${getTournamentTitle(tournament)} - Teams` : 'Tournaments - Teams'} />
      <Container>
        {isLoading && <p className="mb-3 text-[13px] text-muted">Loading teams…</p>}
        {isError && <p className="mb-3 text-[13px] text-red-400">Failed to load teams.</p>}

        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-[13px] font-bold tracking-wide text-white uppercase">
            Teams
            {teamLimit != null && (
              <span className="ml-2 font-semibold text-muted normal-case">
                ({teams.length}/{teamLimit})
              </span>
            )}
          </h2>
          {canAddTeam && (
            <button
              type="button"
              onClick={handleOpenAddTeam}
              className="flex shrink-0 items-center gap-2 transition-opacity active:opacity-80"
            >
              <span className="flex h-[22px] w-[22px] items-center justify-center rounded-full bg-brand text-[15px] leading-none font-bold text-ink">
                +
              </span>
              <span className="text-[13px] font-bold text-muted">Create Team</span>
            </button>
          )}
        </div>

        {!isLoading && teamsComplete && (
          <p className="mb-4 rounded-[17px] bg-surface px-4 py-3 text-center text-[13px] text-muted">
            All {teamLimit} teams have been added. Submit teams to continue.
          </p>
        )}

        {!isLoading && isSuccess && teams.length === 0 && (
          <p className="mb-6 rounded-[17px] bg-surface px-4 py-6 text-center text-[13px] text-muted">
            No teams added yet. Create a team to get started.
          </p>
        )}

        {!isLoading && teamsByGroup != null && (
          <div className="space-y-6 pb-6">
            {Array.from({ length: numberOfGroups }, (_, i) => i + 1).map((groupIndex) => (
              <section key={groupIndex}>
                <h3 className="mb-2 text-[13px] font-bold tracking-wide text-brand uppercase">Group {groupIndex}</h3>
                <ul className="space-y-3 lg:grid lg:grid-cols-2 lg:gap-3 lg:space-y-0">
                  {teamsByGroup[groupIndex].map((team, index) => (
                    <li
                      key={team.id ?? index}
                      ref={highlightTeamId != null && team.id === highlightTeamId ? newTeamListRef : undefined}
                    >
                      <TeamCard team={team} index={index} />
                    </li>
                  ))}
                </ul>
                {teamsByGroup[groupIndex].length === 0 && (
                  <p className="rounded-[17px] bg-surface px-4 py-4 text-center text-[13px] text-muted">
                    No teams in this group
                  </p>
                )}
              </section>
            ))}
          </div>
        )}

        {!isLoading && teamsByGroup == null && teams.length > 0 && (
          <ul className="space-y-3 pb-6 lg:grid lg:grid-cols-2 lg:gap-3 lg:space-y-0">
            {teams.map((team, index) => (
              <li
                key={team.id ?? index}
                ref={highlightTeamId != null && team.id === highlightTeamId ? newTeamListRef : undefined}
              >
                <TeamCard team={team} index={index} />
              </li>
            ))}
          </ul>
        )}

        <div className="flex justify-start pt-2">
          <Button
            type="button"
            variant="auth"
            className="h-12 w-full rounded-[8px] bg-[#E4E7F4] text-[15px] font-semibold tracking-wide text-[#1A1A1A] uppercase lg:w-auto"
            onClick={handleSubmitTeams}
            disabled={isLoading || teams.length === 0 || !teamsComplete}
          >
            Submit Teams
          </Button>
        </div>
      </Container>
    </div>
  );
}
