import { useMemo, useState } from 'react';

import { getApiErrorMessage } from '@/shared/api/errors';
import { APP_PATHS } from '@/shared/config/paths';
import { confirm } from '@/shared/dialogs';
import { toast } from '@/shared/ui/toast';

import {
  useGetTournamentQuery,
  useGetTournamentSquadOccupancyQuery,
  useGetTournamentTeamsQuery,
  useRemoveTeamFromTournamentMutation,
} from '../api/tournamentsApi';
import {
  buildWorkspaceStages,
  findNeediestGroup,
  groupName,
  squadCountsByTeam,
  squadsReadyCount,
  teamsInGroup,
} from '../lib/workspaceView';
import { canAddTournamentTeams, teamsComplete, type TournamentTeam } from '../model/teamSchemas';

type AttachDialog = { open: boolean; groupIndex?: number };

/** Organizer workspace — teams, squad readiness, fixtures stage. */
export function useTournamentWorkspace(tournamentId: number, validId: boolean) {
  const tournamentQuery = useGetTournamentQuery(tournamentId, { skip: !validId });
  const teamsQuery = useGetTournamentTeamsQuery(tournamentId, { skip: !validId });
  const occupancyQuery = useGetTournamentSquadOccupancyQuery(
    { tournamentId },
    { skip: !validId || !teamsQuery.data?.length }
  );
  const [removeTeam] = useRemoveTeamFromTournamentMutation();

  const [dialog, setDialog] = useState<AttachDialog>({ open: false });

  const tournament = tournamentQuery.data;
  const teams = useMemo(() => teamsQuery.data ?? [], [teamsQuery.data]);
  const squadCounts = useMemo(() => squadCountsByTeam(occupancyQuery.data ?? []), [occupancyQuery.data]);

  const groupCount = tournament?.groupCount ?? 1;
  const hasGroups = groupCount > 1;
  const teamCap = tournament?.teamCap ?? null;
  const canAdd = canAddTournamentTeams(teamCap, teams.length);
  const atCap = teamsComplete(teamCap, teams.length);
  const empty = teams.length === 0;
  const missing = teamCap != null ? Math.max(0, teamCap - teams.length) : 0;
  const ready = squadsReadyCount(teams, squadCounts);
  const shortSquads = teams.filter((t) => (squadCounts.get(t.id) ?? 0) < 11).length;
  const fixtures = tournament?.matchesCount ?? 0;
  const groupCap = hasGroups && teamCap != null ? Math.ceil(teamCap / groupCount) : (teamCap ?? teams.length);

  const neediest = useMemo(
    () => findNeediestGroup(teams, groupCount, groupCap, hasGroups, teamCap),
    [teams, groupCount, groupCap, hasGroups, teamCap]
  );

  const stages = useMemo(
    () =>
      buildWorkspaceStages({
        teamsCount: teams.length,
        teamCap,
        atCap,
        ready,
        fixtures,
      }),
    [teams.length, teamCap, atCap, ready, fixtures]
  );

  const groups = hasGroups ? Array.from({ length: groupCount }, (_, i) => i + 1) : [null];
  const fixtureHref = tournament ? `${APP_PATHS.startMatch}?tournamentId=${tournament.id}` : APP_PATHS.startMatch;

  async function handleRemove(team: TournamentTeam) {
    if (!validId) return;
    const squadSize = squadCounts.get(team.id) ?? 0;
    const groupIndex = team.groupIndex;
    const groupLabel = groupIndex != null && hasGroups ? groupName(groupIndex) : null;
    const groupDrop =
      groupLabel != null && groupIndex != null
        ? ` ${groupLabel} drops to ${Math.max(0, teamsInGroup(teams, groupIndex).length - 1)}/${groupCap}.`
        : '';
    const ok = await confirm({
      title: `Remove ${team.name}?`,
      message: `This removes the team from the tournament${
        squadSize ? ` and clears ${squadSize} squad player${squadSize === 1 ? '' : 's'}` : ''
      }.${groupDrop} A team can't be removed once one of its matches has had the toss.`,
      confirmLabel: 'Remove Team',
      cancelLabel: 'Keep Team',
      tone: 'danger',
    });
    if (!ok) return;
    try {
      await removeTeam({ tournamentId, teamId: team.id }).unwrap();
      toast({ title: 'Team Removed', tone: 'success' });
    } catch (err) {
      toast({
        title: "Couldn't Remove Team",
        description: getApiErrorMessage(err, 'Try again.'),
        tone: 'error',
      });
    }
  }

  function openAttach(groupIndex?: number) {
    setDialog({
      open: true,
      ...(groupIndex != null ? { groupIndex } : {}),
    });
  }

  return {
    tournamentQuery,
    teamsQuery,
    tournament,
    teams,
    squadCounts,
    hasGroups,
    teamCap,
    canAdd,
    atCap,
    empty,
    missing,
    shortSquads,
    fixtures,
    groupCap,
    neediest,
    stages,
    groups,
    fixtureHref,
    dialog,
    setDialog,
    openAttach,
    handleRemove,
  };
}
