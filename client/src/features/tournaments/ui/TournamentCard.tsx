import { Link } from 'react-router-dom';

import { cn } from '@/shared/lib/cn';
import { ChevronRightIcon, TrophyIcon } from '@/shared/ui/icons';

import { tournamentNextAction } from '../lib/nextAction';
import { type Tournament, tournamentCrest, tournamentMetaLine } from '../model/schemas';
import { tournamentRoutes } from '../tournamentPaths';

type TournamentCardProps = {
  tournament: Tournament;
  className?: string | undefined;
};

/** Hub card — active setup vs previous (direct create; no review queue). */

export function TournamentCard({ tournament, className }: TournamentCardProps) {
  if (tournament.hubSection === 'previous') {
    return <PreviousHubCard tournament={tournament} className={className} />;
  }
  return <SetupHubCard tournament={tournament} className={className} />;
}

export function SetupHubCard({ tournament, className }: { tournament: Tournament; className?: string | undefined }) {
  const crest = tournamentCrest(tournament);
  const cap = tournament.teamCap;
  const action = tournamentNextAction(tournament);
  const teamsLabel = cap != null ? `${tournament.teamsCount}/${cap}` : String(tournament.teamsCount);
  const teamsReady = cap != null && tournament.teamsCount >= cap && tournament.teamsCount > 0;

  return (
    <article className={cn('border-border-subtle bg-surface overflow-hidden rounded-card border', className)}>
      <Link to={tournamentRoutes.detail(tournament.id)} className="flex gap-3 p-3.5 pb-3">
        <Crest code={crest} className="h-14 w-14 text-sm" />
        <div className="min-w-0 flex-1">
          <h3 className="text-body-sm leading-snug font-extrabold tracking-tight text-ink">{tournament.name}</h3>
          <p className="text-dim mt-0.5 font-mono text-3xs font-medium tracking-wide uppercase">
            {tournamentMetaLine(tournament)}
          </p>
          {tournament.venueName ? <p className="text-muted mt-1 truncate text-2xs">{tournament.venueName}</p> : null}
        </div>
      </Link>

      <div className="flex gap-1.5 px-3.5 pb-3">
        <StatCell label="Teams" value={teamsLabel} tone={teamsReady ? 'ready' : undefined} />
        <StatCell label="Fixtures" value={String(tournament.matchesCount)} />
      </div>

      <Link
        to={action.to}
        className="border-border-subtle bg-brand/12 hover:bg-brand/18 focus-visible:outline-brand flex min-h-12 items-center justify-between border-t px-3.5 focus-visible:outline-2 focus-visible:-outline-offset-2"
      >
        <span className="text-brand-text text-body-sm font-bold">{action.label}</span>
        <ChevronRightIcon size="sm" className="text-brand-text size-4" strokeWidth={2.2} />
      </Link>
    </article>
  );
}

export function PreviousHubCard({ tournament, className }: { tournament: Tournament; className?: string | undefined }) {
  const crest = tournamentCrest(tournament);
  return (
    <article className={cn('border-border-subtle bg-surface rounded-card border p-3.5', className)}>
      <Link to={tournamentRoutes.public(tournament.id)} className="mb-2.5 flex gap-3">
        <Crest code={crest} className="h-12 w-12 text-sm opacity-80" />
        <div className="min-w-0 flex-1">
          <h3 className="text-body-sm leading-normal font-extrabold tracking-tight text-body">{tournament.name}</h3>
          <p className="text-dim mt-0.5 font-mono text-3xs font-medium uppercase">{tournamentMetaLine(tournament)}</p>
        </div>
      </Link>
      {tournament.champion ? (
        <div className="border-positive/30 bg-positive/12 flex min-h-11 items-center gap-2.5 rounded-panel border px-3">
          <TrophyIcon size="sm" className="text-positive-2 h-4 w-4 shrink-0" />
          <span className="text-positive-2 text-xs font-bold">{tournament.champion}</span>
          <span className="text-dim ml-auto font-mono text-3xs font-medium">CHAMPIONS</span>
        </div>
      ) : null}
    </article>
  );
}

function Crest({ code, className }: { code: string; className?: string | undefined }) {
  return (
    <div
      className={cn(
        'bg-surface-raised text-brand-text grid shrink-0 place-items-center rounded-panel font-extrabold',
        className
      )}
      aria-hidden
    >
      {code}
    </div>
  );
}

function StatCell({ label, value, tone }: { label: string; value: string; tone?: 'ready' | undefined }) {
  return (
    <div className="border-border-subtle bg-surface flex-1 rounded-panel border p-2.5">
      <div className="text-dim mb-1 font-mono text-4xs font-bold tracking-eyebrow uppercase">{label}</div>
      <div className={cn('font-mono text-sm font-extrabold', tone === 'ready' ? 'text-positive-2' : 'text-ink')}>
        {value}
      </div>
    </div>
  );
}
