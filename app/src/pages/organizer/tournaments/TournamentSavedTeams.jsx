import { useEffect, useMemo, useRef, useState } from 'react';

import { useLocation, useNavigate, useParams } from 'react-router-dom';

import { AppSubpageHeader } from '@/components/AppSubpageHeader';
import { TeamLogo } from '@/components/TeamLogo';
import { useDialog } from '@/context/DialogContext';
import {
  areTournamentTeamsComplete,
  canAddTournamentTeams,
  getTournamentNumberOfGroups,
  getTournamentTeamLimit,
  getTournamentTitle,
  mergeTournamentMeta,
  parseTournamentId,
} from '@/lib/utils/tournamentUtils';
import { useGetTournamentQuery, useGetTournamentTeamsQuery } from '@/store/api/tournamentApi';
import { Button } from '@/ui/Button';
import { Container } from '@/ui/Container';
import { ListEmpty, ListError } from '@/ui/ListState';
import { LoaderBlock } from '@/ui/Loader';

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
    <div className="bg-surface flex items-start gap-3 rounded-[17px] p-4">
      <TeamLogo team={team} variant="organizerCard" />
      <div className="min-w-0 flex-1">
        <h3 className="text-[16px] font-bold text-white">{team.name ?? '—'}</h3>
        <div className="mt-0.5 flex flex-wrap items-center gap-2">
          {team.group_index != null && <span className="text-muted text-[12px]">Group {team.group_index}</span>}
        </div>
        <p className="mt-0.5 text-[14px] text-white">
          Owner: <span className="text-brand font-medium">{owner}</span>
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
  const tournament = useMemo(
    () => mergeTournamentMeta(tournamentFromState, tournamentFromApi),
    [tournamentFromState, tournamentFromApi],
  );

  const numberOfGroups = getTournamentNumberOfGroups(tournament);
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

  const handleOpenAddTeam = (groupIndex) => {
    openDialog('manageTeam', {
      mode: 'create',
      tournamentId: tournamentIdNum,
      tournament,
      ...(groupIndex != null ? { preferredGroupIndex: groupIndex } : {}),
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
        {isLoading && <LoaderBlock label="Loading teams" className="mb-3 py-3" />}
        {isError ? <ListError message="Could not load teams." /> : null}

        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-[13px] font-bold tracking-wide text-white uppercase">
            Teams
            {teamLimit != null && (
              <span className="text-muted ml-2 font-semibold normal-case">
                ({teams.length}/{teamLimit})
              </span>
            )}
          </h2>
          {canAddTeam && (
            <button
              type="button"
              onClick={() => handleOpenAddTeam()}
              className="flex shrink-0 items-center gap-2 transition-opacity active:opacity-80"
            >
              <span className="bg-brand text-ink flex h-[22px] w-[22px] items-center justify-center rounded-full text-[15px] leading-none font-bold">
                +
              </span>
              <span className="text-muted text-[13px] font-bold">Create Team</span>
            </button>
          )}
        </div>

        {!isLoading && teamsComplete && (
          <p className="bg-surface text-muted mb-4 rounded-[17px] px-4 py-3 text-center text-[13px]">
            All {teamLimit} teams have been added. Submit teams to continue.
          </p>
        )}

        {!isLoading && isSuccess && teams.length === 0 && (
          <ListEmpty title="No Teams Yet." description="Create a team to get started." />
        )}

        {!isLoading && teamsByGroup != null && (
          <div className="space-y-6 pb-6">
            {Array.from({ length: numberOfGroups }, (_, i) => i + 1).map((groupIndex) => (
              <section key={groupIndex}>
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="text-brand text-[13px] font-bold tracking-wide uppercase">Group {groupIndex}</h3>
                  {canAddTeam ? (
                    <button
                      type="button"
                      onClick={() => handleOpenAddTeam(groupIndex)}
                      className="flex shrink-0 items-center gap-2 transition-opacity active:opacity-80"
                    >
                      <span className="bg-brand text-ink flex h-[22px] w-[22px] items-center justify-center rounded-full text-[15px] leading-none font-bold">
                        +
                      </span>
                      <span className="text-muted text-[13px] font-bold">Add Team</span>
                    </button>
                  ) : null}
                </div>
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
                {teamsByGroup[groupIndex].length === 0 && <ListEmpty title="No Teams In This Group." />}
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
            variant="orange"
            className="h-12 w-full rounded-[8px] bg-[#E4E7F4] text-[15px] font-semibold tracking-wide text-[#1A1A1A] lg:w-auto"
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
