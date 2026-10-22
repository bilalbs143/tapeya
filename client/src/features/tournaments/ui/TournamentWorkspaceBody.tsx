import { Link } from 'react-router-dom';

import { APP_PATHS } from '@/shared/config/paths';
import { cn } from '@/shared/lib/cn';
import { Alert } from '@/shared/ui/Alert';
import { Avatar } from '@/shared/ui/Avatar';
import { Button } from '@/shared/ui/Button';
import { CloseIcon, PlusIcon, UsersIcon } from '@/shared/ui/icons';
import { StickyActionBar } from '@/shared/ui/StickyActionBar';

import { groupName, iconPlayerCount, squadState, teamsInGroup, type WorkspaceStageTone } from '../lib/workspaceView';
import type { Tournament } from '../model/schemas';
import { teamCrest, type TournamentTeam } from '../model/teamSchemas';
import { tournamentRoutes } from '../tournamentPaths';
import { ManageTeamDialog } from './ManageTeamDialog';
import type { useTournamentWorkspace } from './useTournamentWorkspace';

type WorkspaceFlow = ReturnType<typeof useTournamentWorkspace>;

type TournamentWorkspaceBodyProps = {
  flow: WorkspaceFlow;
  tournament: Tournament;
};

/** Stages, team lists, sticky bar, and attach dialog for TournamentWorkspacePage. */
export function TournamentWorkspaceBody({ flow, tournament }: TournamentWorkspaceBodyProps) {
  const {
    teamsQuery,
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
  } = flow;

  return (
    <>
      <div className="border-border-subtle flex shrink-0 gap-2 border-b px-4 py-3.5">
        {stages.map((s) => (
          <StageCard key={s.key} label={s.label} value={s.value} tone={s.tone} />
        ))}
      </div>

      {empty ? (
        <div className="flex flex-1 flex-col items-center justify-center px-4 py-8 text-center">
          <div className="border-border-subtle bg-surface-raised mb-5 grid h-20 w-20 place-items-center rounded-panel border">
            <UsersIcon className="text-brand-text h-8 w-8" />
          </div>
          <h2 className="text-title-sm leading-normal font-extrabold tracking-tight text-ink">
            Add your {teamCap ?? ''} teams
          </h2>
          <p className="text-muted mt-2 max-w-[34ch] text-body-sm leading-relaxed text-pretty">
            Create a new team or pull one you&apos;ve run before — logo, owner and icon players carry over. Squads come
            after; you don&apos;t need a full XI to add a team.
          </p>
        </div>
      ) : (
        <div className="flex flex-1 flex-col gap-4 px-4 pt-3.5 pb-6">
          {atCap && !fixtures ? (
            <Alert
              tone="info"
              title={
                <>
                  <span className="text-brand-text font-mono mb-1 block text-4xs font-bold tracking-eyebrow uppercase">
                    Next best action
                  </span>
                  Roster is full — schedule match day
                </>
              }
              description={
                shortSquads
                  ? `${shortSquads} squad${shortSquads > 1 ? 's are' : ' is'} still short of 11. You can schedule anyway; Tapeya will ask you to declare the XI at the first ball.`
                  : 'All squads are ready. Add the first fixture to unlock match day.'
              }
              action={
                <div className="flex flex-wrap gap-2">
                  <Button asChild size="sm">
                    <Link to={fixtureHref}>Add Fixture</Link>
                  </Button>
                  <Button asChild size="sm" variant="secondary">
                    <Link to={tournamentRoutes.squad(tournament.id)}>Finish Squads</Link>
                  </Button>
                </div>
              }
            />
          ) : missing > 0 ? (
            <Alert
              tone="info"
              description={`${missing} team${missing > 1 ? 's' : ''} left${
                neediest
                  ? ` — ${groupName(neediest.g)} needs ${neediest.left} more before fixtures unlock.`
                  : ` — Add ${missing} more to unlock fixtures.`
              }`}
            />
          ) : fixtures > 0 ? (
            <Link
              to={APP_PATHS.matches}
              className="border-brand/40 bg-brand/12 hover:bg-brand/18 flex min-h-12 items-center gap-3 rounded-card border px-3.5"
            >
              <span className="text-brand-text text-body-sm font-bold">Score Match Day</span>
            </Link>
          ) : null}

          {atCap ? (
            <p className="text-dim text-xs leading-relaxed">
              All {teamCap} slots filled — remove a team to add a different one.
            </p>
          ) : null}

          {groups.map((g) => {
            const rows = g === null ? teams : teamsInGroup(teams, g);
            const cap = g === null ? (teamCap ?? rows.length) : groupCap;
            const full = teamCap != null && rows.length >= cap;
            return (
              <section key={String(g)} className="flex flex-col gap-2">
                <div className="flex items-baseline justify-between gap-2">
                  <h2 className="font-mono text-4xs font-bold tracking-eyebrow text-muted uppercase">
                    {g === null ? 'Teams' : groupName(g)}
                  </h2>
                  {teamCap != null ? (
                    <span className={cn('font-mono text-4xs font-bold', full ? 'text-positive-2' : 'text-dim')}>
                      {rows.length} / {cap}
                      {full ? ' full' : ''}
                    </span>
                  ) : null}
                </div>
                {rows.length ? (
                  <div className="border-border-subtle bg-surface divide-y divide-border overflow-hidden rounded-card border">
                    {rows.map((team) => (
                      <TeamRow
                        key={team.id}
                        team={team}
                        tournamentId={tournament.id}
                        squadSize={squadCounts.get(team.id) ?? 0}
                        onRemove={() => void handleRemove(team)}
                      />
                    ))}
                  </div>
                ) : null}
                {!full && canAdd ? (
                  <button
                    type="button"
                    onClick={() => openAttach(g ?? undefined)}
                    className="border-border-subtle text-muted hover:text-ink flex min-h-12 items-center justify-center gap-2 rounded-card border border-dashed text-xs font-semibold"
                  >
                    <PlusIcon className="h-3.5 w-3.5" strokeWidth={2.2} />
                    {g === null ? 'Add Team' : `Add Team to ${groupName(g)}`}
                  </button>
                ) : null}
              </section>
            );
          })}

          <Button variant="secondary" asChild className="font-semibold">
            <Link to={tournamentRoutes.public(tournament.id)}>Public Page</Link>
          </Button>
        </div>
      )}

      {empty ? (
        <StickyActionBar>
          <Button
            className="min-h-12 w-full rounded-field text-body-sm leading-normal font-bold"
            onClick={() => openAttach(hasGroups ? 1 : undefined)}
          >
            Add first team
          </Button>
        </StickyActionBar>
      ) : (
        <StickyActionBar>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              className="min-h-12 flex-1 rounded-field"
              disabled={!canAdd}
              onClick={() => openAttach(neediest != null ? neediest.g : hasGroups ? 1 : undefined)}
            >
              Add team
            </Button>
            <Button asChild className="min-h-12 flex-1 rounded-field">
              <Link to={tournamentRoutes.squad(tournament.id)}>Squads</Link>
            </Button>
          </div>
        </StickyActionBar>
      )}

      {dialog.open ? (
        <ManageTeamDialog
          key={`attach-${dialog.groupIndex ?? 'any'}`}
          open={dialog.open}
          onOpenChange={(open) => setDialog((d) => ({ ...d, open }))}
          tournament={tournament}
          attachedTeamIds={teams.map((t) => t.id)}
          attachedCount={teams.length}
          preferredGroupIndex={dialog.groupIndex}
          onAttached={() => void teamsQuery.refetch()}
        />
      ) : null}
    </>
  );
}

function StageCard({ label, value, tone }: { label: string; value: string; tone: WorkspaceStageTone }) {
  return (
    <div
      className={cn(
        'flex-1 rounded-card border px-2.5 py-2.5',
        tone === 'active' && 'border-brand bg-brand/12',
        tone === 'progress' && 'border-brand/40 bg-brand/12',
        tone === 'done' && 'border-positive/35 bg-positive/10',
        tone === 'locked' && 'border-border-subtle bg-surface-raised opacity-50'
      )}
    >
      <div
        className={cn(
          'font-mono text-4xs font-bold tracking-eyebrow uppercase',
          tone === 'active' || tone === 'progress'
            ? 'text-brand-text'
            : tone === 'done'
              ? 'text-positive-2'
              : 'text-dim'
        )}
      >
        {label}
      </div>
      <div
        className={cn(
          'font-mono mt-1 text-body-sm leading-normal font-extrabold',
          tone === 'locked' ? 'text-dim' : 'text-ink'
        )}
      >
        {value}
      </div>
    </div>
  );
}

function TeamRow({
  team,
  tournamentId,
  squadSize,
  onRemove,
}: {
  team: TournamentTeam;
  tournamentId: number;
  squadSize: number;
  onRemove: () => void;
}) {
  const s = squadState(squadSize);
  const icons = iconPlayerCount(team.iconPlayers);
  const tone =
    s.tone === 'ready'
      ? 'bg-positive/14 text-positive-2'
      : s.tone === 'short'
        ? 'bg-warning/16 text-warning-soft'
        : 'bg-surface-raised text-dim';

  const metaParts = [
    team.sponsor ? `Sponsor: ${team.sponsor}` : team.city || null,
    `${icons} icon${icons === 1 ? '' : 's'}`,
  ].filter(Boolean);

  return (
    <div className="flex items-center gap-2.5 p-2.5">
      <Avatar crest src={team.logo ?? undefined} name={teamCrest(team)} size="md" className="text-2xs font-extrabold" />
      <Link to={tournamentRoutes.squad(tournamentId, team.id)} className="min-w-0 flex-1 text-left">
        <p className="truncate text-xs font-bold text-ink">{team.name}</p>
        <p className="text-dim mt-0.5 truncate font-mono text-3xs font-medium uppercase">{metaParts.join(' · ')}</p>
      </Link>
      <Link
        to={tournamentRoutes.squad(tournamentId, team.id)}
        className={cn(
          'shrink-0 rounded-full px-2.5 py-1 font-mono text-3xs font-bold tracking-[.04em] uppercase',
          tone
        )}
      >
        {s.label}
      </Link>
      <button
        type="button"
        aria-label={`Remove ${team.name}`}
        onClick={onRemove}
        className="text-dim hover:text-danger-soft grid h-8 w-8 shrink-0 place-items-center"
      >
        <CloseIcon className="h-4 w-4" strokeWidth={2} />
      </button>
    </div>
  );
}
