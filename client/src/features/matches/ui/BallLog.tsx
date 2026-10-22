import { cn } from '@/shared/lib/cn';
import { IconButton } from '@/shared/ui/IconButton';
import { CloseIcon, PencilIcon, TrashIcon } from '@/shared/ui/icons';
import { EmptyState, ErrorState, Skeleton } from '@/shared/ui/states';

import type { BallLogEntry, BallLogInnings, BallLogOver } from '../lib/ballLog';

type BallLogProps = {
  innings: BallLogInnings[];
  innIndex: number;
  onInnIndexChange: (index: number) => void;
  canOperate: boolean;
  loading?: boolean | undefined;
  error?: boolean | undefined;
  onRetry?: (() => void) | undefined;
  /** Required only when `canOperate` — fan/read-only views may omit. */
  onEdit?: ((inningsId: number, entry: BallLogEntry, overNo: number) => void) | undefined;
  onDelete?: ((inningsId: number, entry: BallLogEntry, overNo: number) => void) | undefined;
};

function chipLabel(inn: BallLogInnings, index: number): string {
  const short = inn.sideShort || inn.battingTeamName || `Innings ${inn.inningsNumber}`;
  const truncated = short.length > 12 ? short.split(' ')[0] : short;
  return `${truncated} · ${index === 0 ? '1st' : '2nd'}`;
}

function LogBallChip({ entry }: { entry: BallLogEntry }) {
  if (entry.kind === 'wicket' || entry.token === 'W' || entry.token.endsWith('+W')) {
    return (
      <span className="bg-danger/20 text-danger-soft grid h-8.5 w-8.5 shrink-0 place-items-center rounded-icon">
        <CloseIcon size="xs" className="h-4 w-4" strokeWidth={2.2} />
      </span>
    );
  }
  const boundary = entry.token === '4' || entry.token === '6';
  return (
    <span
      className={cn(
        'font-mono grid h-8.5 w-8.5 shrink-0 place-items-center rounded-icon text-2xs font-extrabold',
        boundary ? 'bg-brand/18 text-brand-text' : 'bg-page-deep text-body'
      )}
    >
      {entry.token === '0' ? '•' : entry.token}
    </span>
  );
}

function BallRow({
  overNo,
  entry,
  last,
  editable,
  onEdit,
  onDelete,
}: {
  overNo: number;
  entry: BallLogEntry;
  last: boolean;
  editable: boolean;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const ballRef = entry.ballInOver != null ? `${overNo}.${entry.ballInOver}` : `${overNo}`;

  return (
    <li className={cn('flex min-h-13 items-center gap-2.5 px-3', !last && 'border-border-subtle border-b')}>
      <LogBallChip entry={entry} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-bold text-ink">
          {ballRef} · {entry.label}
        </p>
        {entry.detail ? <p className="text-dim mt-px line-clamp-2 text-3xs">{entry.detail}</p> : null}
      </div>
      {editable ? (
        <div className="flex shrink-0 items-center gap-1">
          {entry.editable ? (
            <IconButton
              label={`Edit ball ${ballRef}`}
              size="lg"
              variant="subtle"
              onClick={onEdit}
              className="bg-page-deep text-muted hover:text-ink"
            >
              <PencilIcon size="xs" className="h-3.5 w-3.5" strokeWidth={1.9} />
            </IconButton>
          ) : (
            <span className="w-11" aria-hidden />
          )}
          <IconButton
            label={`Delete ball ${ballRef}`}
            size="lg"
            variant="subtle"
            onClick={onDelete}
            className="bg-page-deep text-danger-soft hover:text-danger"
          >
            <TrashIcon size="xs" className="h-3.5 w-3.5" strokeWidth={1.9} />
          </IconButton>
        </div>
      ) : null}
    </li>
  );
}

function OverSection({
  over,
  innEditable,
  onEdit,
  onDelete,
}: {
  over: BallLogOver;
  innEditable: boolean;
  onEdit: (entry: BallLogEntry, overNo: number) => void;
  onDelete: (entry: BallLogEntry, overNo: number) => void;
}) {
  const summary = [
    `${over.runs} RUN${over.runs === 1 ? '' : 'S'}`,
    over.wickets ? `${over.wickets} WKT${over.wickets === 1 ? '' : 'S'}` : null,
  ]
    .filter(Boolean)
    .join(' · ');
  const meta = [over.bowler, over.inProgress ? 'In Progress' : null].filter(Boolean).join(' · ').toUpperCase();

  return (
    <section
      aria-label={`Over ${over.n}${meta ? `, ${meta.toLowerCase()}` : ''}, ${summary.toLowerCase()}`}
      className="flex flex-col gap-1.5"
    >
      <div className="flex min-h-6 items-center gap-2" aria-hidden>
        <span className="font-mono text-3xs font-bold tracking-eyebrow text-ink uppercase">Over {over.n}</span>
        {meta ? <span className="font-mono text-dim truncate text-4xs font-semibold">{meta}</span> : null}
        <span
          className={cn(
            'font-mono ml-auto shrink-0 text-2xs font-extrabold uppercase',
            over.inProgress ? 'text-positive' : 'text-muted'
          )}
        >
          {summary}
        </span>
      </div>

      <ul className="border-border-subtle bg-surface overflow-hidden rounded-panel border">
        {[...over.entries]
          .slice()
          .reverse()
          .map((entry, i, arr) => (
            <BallRow
              key={entry.id}
              overNo={over.n}
              entry={entry}
              last={i === arr.length - 1}
              editable={innEditable}
              onEdit={() => onEdit(entry, over.n)}
              onDelete={() => onDelete(entry, over.n)}
            />
          ))}
      </ul>
    </section>
  );
}

/** Edit/delete only when the selected innings is still in progress (API gate). */

export function BallLog({
  innings,
  innIndex,
  onInnIndexChange,
  canOperate,
  loading,
  error,
  onRetry,
  onEdit,
  onDelete,
}: BallLogProps) {
  if (loading) {
    return (
      <div className="flex flex-col gap-3 py-3">
        <Skeleton className="h-8 w-40 rounded-icon" />
        <Skeleton className="h-24 w-full rounded-panel" />
        <Skeleton className="h-24 w-full rounded-panel" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-8">
        <ErrorState title="Couldn't Load the Ball Log" onRetry={onRetry} />
      </div>
    );
  }

  if (!innings.length) {
    return <EmptyState title="Nothing Scored Yet" description="Balls will show here as you score." />;
  }

  const inn = innings[innIndex] ?? innings[innings.length - 1];
  if (!inn) {
    return <EmptyState title="Nothing Scored Yet" description="Balls will show here as you score." />;
  }

  const innEditable = canOperate && inn.canEdit;
  const showClosed = canOperate && !inn.canEdit;

  return (
    <div className="flex flex-col gap-4 py-1">
      <div className="flex items-center gap-2">
        {[...innings]
          .map((x, i) => ({ x, i }))
          .reverse()
          .map(({ x, i }) => {
            const on = i === innIndex;
            return (
              <button
                key={x.id}
                type="button"
                onClick={() => onInnIndexChange(i)}
                aria-pressed={on}
                className={cn(
                  'focus-visible:outline-brand flex min-h-8 shrink-0 items-center rounded-icon px-3 text-3xs font-bold focus-visible:outline-2 focus-visible:outline-offset-2',
                  on ? 'bg-brand text-white' : 'border-border-subtle bg-surface text-muted hover:text-ink border'
                )}
              >
                {chipLabel(x, i)}
              </button>
            );
          })}
        {innEditable ? (
          <span className="bg-positive/14 text-positive font-mono ml-auto flex min-h-8 items-center rounded-icon px-2.5 text-4xs font-bold tracking-eyebrow uppercase">
            Editable
          </span>
        ) : null}
        {showClosed ? (
          <span className="bg-page-deep text-dim border-border-subtle font-mono ml-auto flex min-h-8 items-center rounded-icon border px-2.5 text-4xs font-bold tracking-eyebrow uppercase">
            Closed
          </span>
        ) : null}
      </div>

      {!inn.overs.length ? (
        <p className="text-muted py-8 text-center text-xs">No balls bowled yet.</p>
      ) : (
        [...inn.overs]
          .slice()
          .reverse()
          .map((over) => (
            <OverSection
              key={over.n}
              over={over}
              innEditable={innEditable}
              onEdit={(entry, overNo) => onEdit?.(inn.id, entry, overNo)}
              onDelete={(entry, overNo) => onDelete?.(inn.id, entry, overNo)}
            />
          ))
      )}

      {showClosed ? (
        <p className="text-dim text-2xs leading-relaxed">
          A finished innings can&apos;t be re-scored. Edit and delete disappear rather than sitting there greyed out.
        </p>
      ) : null}
    </div>
  );
}
