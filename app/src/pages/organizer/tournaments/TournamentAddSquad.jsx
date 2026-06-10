/**
 * TournamentAddSquad.jsx
 *
 * Lists teams attached to a tournament. Organizer can add squad,
 * remove a team (with confirm). Route:
 * /organizer/tournaments/:tournamentId/add-squad
 */

import { useEffect, useMemo, useState } from 'react';

import { useLocation, useNavigate, useParams } from 'react-router-dom';

import { AppSubpageHeader } from '@/components/AppSubpageHeader';
import { TeamLogo } from '@/components/TeamLogo';
import { useDialog } from '@/context/DialogContext';
import { useToast } from '@/hooks/useToast';
import { getApiErrorMessage } from '@/lib/apiErrors';
import { CLOUDFRONT_APP_BASE } from '@/lib/constants/assets';
import { getTournamentTitle, parseTournamentId } from '@/lib/utils/tournamentUtils';
import {
  useGetTournamentQuery,
  useGetTournamentTeamsQuery,
  useRemoveTeamFromTournamentMutation,
} from '@/store/api/tournamentApi';
import { Container } from '@/ui/Container';

const teamDeleteIcon = `${CLOUDFRONT_APP_BASE}/images/icons/team-delete-icon.svg`;
const teamEditIcon = `${CLOUDFRONT_APP_BASE}/images/icons/team-edit-icon.svg`;

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

/**
 * TeamCard — displays team metadata with remove action.
 */
function TeamCard({ team, index, onEdit, onDelete, isDeleting }) {
  const { owner, iconPlayers } = teamDisplay(team);

  return (
    <div className="bg-surface rounded-[17px] p-4">
      <div className="flex items-start gap-3">
        <TeamLogo team={team} variant="organizerCard" />
        <div className="min-w-0 flex-1">
          <h3 className="text-[16px] font-bold text-white">{team.name ?? '—'}</h3>
          <p className="mt-0.5 text-[14px] text-white">
            Owner: <span className="text-brand font-medium">{owner}</span>
          </p>
          <p className="mt-0.5 text-[12px] text-white">
            Icon Players: <span className="text-muted">{iconPlayers}</span>
          </p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-3">
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => onEdit?.(team)}
              disabled={isDeleting}
              className="flex h-8 w-8 shrink-0 items-center justify-center transition-opacity active:opacity-80 disabled:opacity-50"
              aria-label="Edit Team"
            >
              <img src={teamEditIcon} alt="" className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => onDelete?.(team)}
              disabled={isDeleting}
              className="flex h-8 w-8 shrink-0 items-center justify-center transition-opacity active:opacity-80 disabled:opacity-50"
              aria-label="Remove Team From Tournament"
            >
              <img src={teamDeleteIcon} alt="" className="h-5 w-5" />
            </button>
          </div>
          <span className="shrink-0 text-[28px] leading-none font-bold text-[#DA98113B]">{index + 1}</span>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------

export default function TournamentAddSquad() {
  const navigate = useNavigate();
  const location = useLocation();
  const { tournamentId } = useParams();
  const toast = useToast();
  const { openDialog } = useDialog();

  const stateTeams = location.state?.teams;
  const tournamentFromState = location.state?.tournament ?? null;

  const tournamentIdNum = parseTournamentId(tournamentId, tournamentFromState?.id);
  const isValidId = tournamentIdNum != null;

  const { data: tournamentFromApi } = useGetTournamentQuery(
    { id: tournamentIdNum },
    { skip: !isValidId || !!tournamentFromState },
  );
  const tournament = tournamentFromState ?? tournamentFromApi ?? null;

  // Skip the API fetch when teams were passed via location state.
  const {
    data: fetchedTeams = [],
    isLoading,
    refetch,
  } = useGetTournamentTeamsQuery(tournamentIdNum, {
    skip: !isValidId || stateTeams?.length > 0,
  });

  // Optimistic removal: filter out deleted teams immediately without refetch.
  const [removedTeamIds, setRemovedTeamIds] = useState([]);
  const baseTeams = stateTeams?.length > 0 ? stateTeams : fetchedTeams;
  const teams = baseTeams.filter((t) => !removedTeamIds.includes(t.id));

  const numberOfGroups = tournament?.number_of_groups ?? 1;
  const hasGroups = numberOfGroups > 1;
  const teamsByGroup = useMemo(() => {
    if (!hasGroups || numberOfGroups < 2) return null;
    const byGroup = /** @type {Record<number, typeof teams>} */ ({});
    for (let i = 1; i <= numberOfGroups; i++) {
      byGroup[i] = teams.filter((t) => Number(t.group_index) === i);
    }
    return byGroup;
  }, [hasGroups, numberOfGroups, teams]);

  const [removeTeam, { isLoading: isRemoving }] = useRemoveTeamFromTournamentMutation();

  useEffect(() => {
    if (!isValidId) {
      navigate('/organizer/tournaments', { replace: true });
    }
  }, [isValidId, navigate]);

  // ------------------------------------------------------------------
  // Handlers
  // ------------------------------------------------------------------

  const handleEdit = (team) => {
    openDialog('manageTeam', {
      mode: 'edit',
      team,
      onSuccess: () => {
        if (!stateTeams?.length) refetch();
      },
    });
  };

  const handleDelete = (teamToRemove) => {
    const teamName = teamToRemove?.name ?? 'this team';

    openDialog('confirm', {
      title: 'Remove Team',
      message: `Remove ${teamName} from the tournament? Scheduled matches involving this team will be deleted. This cannot be undone.`,
      onConfirm: async () => {
        try {
          await removeTeam({
            tournamentId: tournamentIdNum,
            teamId: teamToRemove.id,
          }).unwrap();
          setRemovedTeamIds((prev) => [...prev, teamToRemove.id]);
          toast.success('Team removed from tournament.');
        } catch (err) {
          toast.error(getApiErrorMessage(err) ?? 'Could not remove team. It may not be allowed after toss.');
          throw err;
        }
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
        {/* Loading indicator only shown when teams are not available from state */}
        {!stateTeams?.length && isLoading && <p className="text-muted mb-3 text-[13px]">Loading teams…</p>}

        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-[13px] font-bold tracking-wide text-white uppercase">Teams</h2>
          {teams.length > 0 && (
            <button
              type="button"
              onClick={() =>
                navigate(`/organizer/tournaments/${tournamentIdNum}/squad?team=${teams[0].id}`, {
                  state: { tournament: tournament ?? { id: tournamentIdNum } },
                })
              }
              className="flex shrink-0 items-center gap-2 transition-opacity active:opacity-80"
            >
              <span className="bg-brand text-ink flex h-[22px] w-[22px] items-center justify-center rounded-full text-[15px] leading-none font-bold">
                +
              </span>
              <span className="text-muted text-[13px] font-bold">Manage Squads</span>
            </button>
          )}
        </div>

        {isLoading && teams.length === 0 && (
          <ul className="space-y-3 pb-10">
            {[1, 2, 3].map((i) => (
              <li key={i} className="bg-surface animate-pulse rounded-[17px] p-4">
                <div className="flex gap-3">
                  <div className="bg-surface-raised h-12 w-12 shrink-0 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <div className="bg-surface-raised h-4 w-24 rounded" />
                    <div className="bg-surface-raised h-3 w-32 rounded" />
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}

        {!isLoading && teamsByGroup != null && (
          <div className="space-y-6 pb-10">
            {Array.from({ length: numberOfGroups }, (_, i) => i + 1).map((groupIndex) => (
              <section key={groupIndex}>
                <h3 className="text-brand mb-2 text-[13px] font-bold tracking-wide uppercase">Group {groupIndex}</h3>
                <ul className="space-y-3 lg:grid lg:grid-cols-2 lg:gap-3 lg:space-y-0">
                  {teamsByGroup[groupIndex].map((team, index) => (
                    <li key={team.id ?? index}>
                      <TeamCard team={team} index={index} onEdit={handleEdit} onDelete={handleDelete} isDeleting={isRemoving} />
                    </li>
                  ))}
                </ul>
                {teamsByGroup[groupIndex].length === 0 && (
                  <p className="bg-surface text-muted rounded-[17px] px-4 py-4 text-center text-[13px]">No teams in this group</p>
                )}
              </section>
            ))}
          </div>
        )}

        {!isLoading && teamsByGroup == null && teams.length > 0 && (
          <ul className="space-y-3 pb-10 lg:grid lg:grid-cols-2 lg:gap-3 lg:space-y-0">
            {teams.map((team, index) => (
              <li key={team.id ?? index}>
                <TeamCard team={team} index={index} onEdit={handleEdit} onDelete={handleDelete} isDeleting={isRemoving} />
              </li>
            ))}
          </ul>
        )}

        {!isLoading && teams.length === 0 && (
          <p className="bg-surface text-muted rounded-[17px] px-4 py-6 text-center text-[13px]">
            No teams yet. Add teams from the saved teams step first.
          </p>
        )}
      </Container>
    </div>
  );
}
