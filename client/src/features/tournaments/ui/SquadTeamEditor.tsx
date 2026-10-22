import { ScreenBar } from '@/shared/layout';
import { cn } from '@/shared/lib/cn';
import { Alert } from '@/shared/ui/Alert';
import { Avatar } from '@/shared/ui/Avatar';
import { Button } from '@/shared/ui/Button';
import { CloseIcon } from '@/shared/ui/icons';
import { SearchBar } from '@/shared/ui/SearchBar';
import { Skeleton } from '@/shared/ui/states';

import type { SquadEditorSaveState } from '../lib/squadEditor';
import type { Tournament } from '../model/schemas';
import { playerDisplayName, playerInitials, shortTeamLabel, SQUAD_XI } from '../model/squadSchemas';
import { teamCrest, type TournamentTeam } from '../model/teamSchemas';
import { useSquadTeamEditor } from './useSquadTeamEditor';

type SquadTeamEditorProps = {
  tournamentId: number;
  tournament: Tournament;
  teams: TournamentTeam[];
  selectedTeam: TournamentTeam;
  onSelectTeam: (id: number) => void;
  onBack: () => void;
};

/** Team chips + search + autosave body for SquadEditorPage. */
export function SquadTeamEditor({
  tournamentId,
  tournament,
  teams,
  selectedTeam,
  onSelectTeam,
  onBack,
}: SquadTeamEditorProps) {
  const {
    squad,
    query,
    setQuery,
    saveState,
    saveError,
    occupiedByPlayerId,
    searching,
    lookupFetching,
    searchResults,
    addPlayer,
    removePlayer,
    retrySave,
    short,
    fillPct,
    groupLabel,
    subtitle,
    squadCap,
    showSquadSkeleton,
  } = useSquadTeamEditor({ tournamentId, tournament, teams, selectedTeam });

  return (
    <div className="bg-surface flex min-h-full flex-col">
      <ScreenBar title="Squads" subtitle={subtitle} onBack={onBack} action={<SavePill state={saveState} />} />

      <div className="flex flex-1 flex-col gap-4 px-4 pt-3.5 pb-6">
        <div className="flex gap-1.5 overflow-x-auto scrollbar-none">
          {teams.map((tm) => {
            const on = tm.id === selectedTeam.id;
            const count = on ? squad.length : null;
            return (
              <button
                key={tm.id}
                type="button"
                onClick={() => onSelectTeam(tm.id)}
                className={cn(
                  'inline-flex min-h-9 shrink-0 items-center gap-1.5 rounded-chip px-3 text-xs leading-normal font-bold whitespace-nowrap',
                  on ? 'bg-brand text-white' : 'border-border-subtle bg-surface-raised text-muted border'
                )}
              >
                <span>{shortTeamLabel(tm.name)}</span>
                {count != null ? (
                  <span
                    className={cn(
                      'font-mono text-4xs font-bold',
                      on ? 'text-white/85' : count >= SQUAD_XI ? 'text-positive-2' : count ? 'text-body' : 'text-dim'
                    )}
                  >
                    {count}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>

        <div data-surface="navy" className="border-border bg-surface-navy rounded-card border px-3.5 py-3.5">
          <div className="flex items-center gap-2.5">
            <Avatar
              crest
              name={teamCrest(selectedTeam)}
              size="lg"
              className="bg-surface-raised text-body-sm font-extrabold"
            />
            <div className="min-w-0 flex-1">
              <h2 className="truncate text-body-sm font-extrabold tracking-tight text-ink">{selectedTeam.name}</h2>
              <p className="font-mono text-dim mt-0.5 text-3xs leading-normal font-normal uppercase">
                {groupLabel ?? 'Squad'}
              </p>
            </div>
            <div className="text-right">
              <p className="font-mono text-base leading-none font-extrabold text-muted">
                {squad.length}
                <span className="text-dim text-2xs font-bold"> / {SQUAD_XI}</span>
              </p>
              <p className="font-mono text-dim mt-0.5 text-4xs font-semibold tracking-eyebrow uppercase">Min XI</p>
            </div>
          </div>
          <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-black/35">
            <div
              className={cn('h-full rounded-full', short ? 'bg-brand' : 'bg-positive')}
              style={{ width: `${fillPct}%` }}
            />
          </div>
        </div>

        <section className="flex flex-col gap-2">
          <SearchBar value={query} onValueChange={setQuery} label="Search Players" placeholder="Search Players…" />

          {searching ? (
            lookupFetching ? (
              <Skeleton className="h-16 w-full rounded-card" />
            ) : searchResults.length ? (
              <>
                <p className="font-mono text-dim text-4xs font-bold tracking-eyebrow uppercase">
                  {searchResults.length} player{searchResults.length === 1 ? '' : 's'} found
                </p>
                <ul className="border-border-subtle bg-surface divide-border-subtle divide-y overflow-hidden rounded-card border">
                  {searchResults.map((p) => {
                    const clash = occupiedByPlayerId.get(p.id);
                    const label = playerDisplayName(p);
                    return (
                      <li key={p.id} className="flex min-h-14 items-center gap-2.5 px-3.5 py-2.5">
                        <span className="bg-surface-raised text-muted grid h-9 w-9 shrink-0 place-items-center rounded-full font-mono text-3xs font-extrabold">
                          {playerInitials(label)}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-xs font-bold text-ink">{label}</span>
                          <span
                            className={cn(
                              'font-mono mt-0.5 block text-4xs font-medium uppercase',
                              clash ? 'text-danger-soft' : 'text-dim'
                            )}
                          >
                            {clash ? `Already in ${clash.teamName}` : p.playingRole?.trim() || p.nickname || 'Player'}
                          </span>
                        </span>
                        <button
                          type="button"
                          disabled={Boolean(clash) || squad.length >= squadCap}
                          onClick={() => addPlayer(p)}
                          className={cn(
                            'inline-flex min-h-9 shrink-0 items-center rounded-chip px-3.5 text-2xs leading-normal font-semibold',
                            clash
                              ? 'border-border-subtle text-muted border border-dashed'
                              : 'bg-brand/14 text-brand-text font-bold'
                          )}
                        >
                          {clash ? 'Taken' : 'Add'}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </>
            ) : (
              <div className="border-border-subtle rounded-card border border-dashed px-3.5 py-4 text-center">
                <p className="text-body-sm leading-normal font-bold text-ink">No Player by That Name</p>
                <p className="text-muted mt-1.5 text-xs leading-relaxed">
                  Players must have a Tapeya account to join a squad. They&apos;ll appear here once they sign up.
                </p>
              </div>
            )
          ) : null}
        </section>

        <section className="flex flex-col gap-2">
          <div className="flex items-baseline justify-between">
            <h2 className="font-mono text-4xs font-bold tracking-eyebrow text-muted uppercase">
              Squad · {squad.length}
            </h2>
            {squad.length > 0 && saveState === 'saved' ? (
              <span className="text-dim font-mono text-4xs font-semibold uppercase">Saves as You Go</span>
            ) : null}
          </div>

          {showSquadSkeleton ? (
            <Skeleton className="h-32 w-full rounded-card" />
          ) : squad.length ? (
            <ul className="border-border-subtle bg-surface divide-border-subtle divide-y overflow-hidden rounded-card border">
              {squad.map((p, i) => (
                <li key={p.id} className="flex items-center gap-2.5 p-2.5">
                  <span className="text-dim font-mono w-6 shrink-0 text-2xs font-extrabold tabular-nums">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="truncate text-body-sm leading-normal font-bold text-ink">{p.name}</span>
                    <span className="text-dim font-mono mt-0.5 block text-4xs font-medium uppercase">
                      {p.role?.trim() || 'Player'}
                    </span>
                  </span>
                  <button
                    type="button"
                    aria-label={`Remove ${p.name}`}
                    onClick={() => removePlayer(p.id)}
                    className="text-dim hover:text-danger-soft grid h-8 w-8 place-items-center"
                  >
                    <CloseIcon className="h-4 w-4" strokeWidth={2.2} />
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="border-border-subtle bg-page-deep rounded-card border border-dashed px-5 py-6">
              <p className="text-center text-body-sm leading-normal font-bold text-body">Squad Is Empty</p>
              <p className="text-dim mt-1.5 text-center text-2xs leading-relaxed">
                That&apos;s allowed — you can schedule matches now and declare the XI at the toss. The workspace will
                keep flagging this team as{' '}
                <span className="font-mono font-bold tracking-wide text-body uppercase">No Squad</span>.
              </p>
            </div>
          )}
        </section>
      </div>

      {saveState === 'error' ? (
        <Alert
          tone="danger"
          className="sticky bottom-0 z-20 mx-4 mb-4"
          title="Couldn't save — player put back"
          description={saveError ?? 'Network dropped mid-save. Nothing was half-written.'}
          action={
            <Button size="sm" variant="secondary" onClick={retrySave}>
              Retry
            </Button>
          }
        />
      ) : null}
    </div>
  );
}

function SavePill({ state }: { state: SquadEditorSaveState }) {
  if (state === 'saving') {
    return (
      <span className="text-dim font-mono shrink-0 rounded-chip bg-surface-raised px-2.5 py-1 text-4xs leading-normal font-bold tracking-wide uppercase">
        Saving…
      </span>
    );
  }
  if (state === 'error') {
    return (
      <span className="bg-danger/14 text-danger-soft font-mono shrink-0 rounded-chip px-2.5 py-1 text-4xs leading-normal font-bold tracking-wide uppercase">
        Not saved
      </span>
    );
  }
  return (
    <span className="bg-positive/14 text-positive-2 font-mono inline-flex shrink-0 items-center gap-1 rounded-chip px-2.5 py-1 text-4xs leading-normal font-bold uppercase">
      Saved
    </span>
  );
}
