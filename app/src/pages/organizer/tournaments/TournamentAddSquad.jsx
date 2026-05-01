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
import { useToast } from '@/hooks/useToast';
import { getApiErrorMessage } from '@/lib/apiErrors';
import { CLOUDFRONT_APP_BASE } from '@/lib/constants/assets';
import {
  getTournamentTitle,
  parseTournamentId,
} from '@/lib/utils/tournamentUtils';
import {
  useGetTournamentQuery,
  useGetTournamentTeamsQuery,
  useRemoveTeamFromTournamentMutation,
} from '@/store/api/tournamentApi';
import { Button } from '@/ui/Button';
import { Container } from '@/ui/Container';


const teamDeleteIcon = `${CLOUDFRONT_APP_BASE}/images/icons/team-delete-icon.svg`;

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

/**
 * TeamCard — displays team metadata with Add Squad and Remove actions.
 * CURSOR: move to src/features/teams/components/TeamCard.jsx
 */
function TeamCard({ team, index, onAddSquad, onDelete, isDeleting }) {
  const { owner, iconPlayers } = teamDisplay(team);

  return (
    <div className="rounded-[17px] bg-[#141412] p-4">
      <div className="flex items-start gap-3">
        <TeamLogoIcon logo={team.logo} teamName={team.name} />
        <div className="min-w-0 flex-1">
          {/* Fixed: was `text:white` (invalid) → `text-white` */}
          <h3 className="text-[16px] font-bold text-white">
            {team.name ?? '—'}
          </h3>
          <p className="mt-0.5 text-[14px] text-white">
            Owner: <span className="font-medium text-[#DA9811]">{owner}</span>
          </p>
          {/* Fixed: was `text:white` (invalid) → correct colour via parent `text-white` */}
          <p className="mt-0.5 text-[12px] text-white">
            Icon Players: <span className="text-[#A2A6AB]">{iconPlayers}</span>
          </p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-3">
          <div className="flex gap-1.5">
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
              className="flex h-8 w-8 shrink-0 items-center justify-end transition-opacity active:opacity-80 disabled:opacity-50"
              aria-label="Remove team from tournament"
            >
              <img src={teamDeleteIcon} alt="" className="h-5 w-5" />
            </button>
          </div>
          <span className="shrink-0 text-[28px] leading-none font-bold text-[#DA98113B]">
            {index + 1}
          </span>
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

  const stateTeams = location.state?.teams;
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

  // Skip the API fetch when teams were passed via location state.
  const { data: fetchedTeams = [], isLoading } = useGetTournamentTeamsQuery(
    tournamentIdNum,
    { skip: !isValidId || stateTeams?.length > 0 },
  );

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

  const [removeTeam, { isLoading: isRemoving }] =
    useRemoveTeamFromTournamentMutation();

  useEffect(() => {
    if (!isValidId) {
      navigate('/organizer/tournaments', { replace: true });
    }
  }, [isValidId, navigate]);

  // ------------------------------------------------------------------
  // Handlers
  // ------------------------------------------------------------------

  const handleAddSquad = (team) => {
    navigate(`/organizer/tournaments/${tournamentIdNum}/squad`, {
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

  // ------------------------------------------------------------------
  // Render
  // ------------------------------------------------------------------

  return (
    <div className="bg-black">
      <Container className="!px-4 !py-0">
        <AppSubpageHeader
          title={
            tournament
              ? `${getTournamentTitle(tournament)} - Teams`
              : 'Tournaments - Teams'
          }
          bottomSpacing="relaxed"
          className="-mx-4 -mt-6 lg:mt-0"
        />

        {/* Loading indicator only shown when teams are not available from state */}
        {!stateTeams?.length && isLoading && (
          <p className="mb-3 text-[13px] text-[#A2A6AB]">Loading teams…</p>
        )}

        <div className="mb-3">
          <h2 className="text-[13px] font-bold tracking-wide text-white uppercase">
            Teams
          </h2>
        </div>

        {isLoading && teams.length === 0 && (
          <ul className="space-y-3 pb-10">
            {[1, 2, 3].map((i) => (
              <li
                key={i}
                className="animate-pulse rounded-[17px] bg-[#141412] p-4"
              >
                <div className="flex gap-3">
                  <div className="h-12 w-12 shrink-0 rounded-lg bg-[#1c1c1a]" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-24 rounded bg-[#1c1c1a]" />
                    <div className="h-3 w-32 rounded bg-[#1c1c1a]" />
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}

        {!isLoading && teamsByGroup != null && (
          <div className="space-y-6 pb-10">
            {Array.from({ length: numberOfGroups }, (_, i) => i + 1).map(
              (groupIndex) => (
                <section key={groupIndex}>
                  <h3 className="mb-2 text-[13px] font-bold tracking-wide text-[#DA9811] uppercase">
                    Group {groupIndex}
                  </h3>
                  <ul className="space-y-3 lg:grid lg:grid-cols-2 lg:gap-3 lg:space-y-0">
                    {teamsByGroup[groupIndex].map((team, index) => (
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
                  {teamsByGroup[groupIndex].length === 0 && (
                    <p className="rounded-[17px] bg-[#141412] px-4 py-4 text-center text-[13px] text-[#A2A6AB]">
                      No teams in this group
                    </p>
                  )}
                </section>
              ),
            )}
          </div>
        )}

        {!isLoading && teamsByGroup == null && teams.length > 0 && (
          <ul className="space-y-3 pb-10 lg:grid lg:grid-cols-2 lg:gap-3 lg:space-y-0">
            {teams.map((team, index) => (
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
        )}

        {!isLoading && teams.length === 0 && (
          <p className="rounded-[17px] bg-[#141412] px-4 py-6 text-center text-[13px] text-[#A2A6AB]">
            No teams yet. Add teams from the saved teams step first.
          </p>
        )}
      </Container>
    </div>
  );
}
