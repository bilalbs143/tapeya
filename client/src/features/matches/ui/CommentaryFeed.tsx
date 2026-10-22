import { cn } from '@/shared/lib/cn';
import { BallChip } from '@/shared/ui/BallChip';
import { EmptyState } from '@/shared/ui/states';

import type { CommentaryItem } from '../lib/commentary';

type CommentaryFeedProps = {
  items: CommentaryItem[];
  /** Live pane: newest first. Overs tab: oldest → newest. */
  newestFirst?: boolean | undefined;
  className?: string | undefined;
  limit?: number | undefined;
  /** Show the COMMENTARY eyebrow (Live pane). */
  labelled?: boolean | undefined;
};

/** Same presentation on Live and Overs; only sort order changes. */

export function CommentaryFeed({
  items,
  newestFirst = false,
  className,
  limit,
  labelled = false,
}: CommentaryFeedProps) {
  const sorted = [...items].sort((a, b) =>
    newestFirst
      ? String(b.ball).localeCompare(String(a.ball), undefined, { numeric: true })
      : String(a.ball).localeCompare(String(b.ball), undefined, { numeric: true })
  );
  const rows = limit != null ? sorted.slice(0, limit) : sorted;

  if (!rows.length) {
    return (
      <EmptyState
        title="No Balls Yet"
        description="Commentary appears as soon as scoring starts."
        className={className}
      />
    );
  }

  return (
    <section className={cn('flex flex-col', className)}>
      {labelled ? (
        <p className="font-mono text-dim mb-2.5 text-4xs font-bold tracking-[.16em] uppercase">Commentary</p>
      ) : null}

      <ul className="flex flex-col">
        {rows.map((row, i) => (
          <li
            key={row.id}
            className={cn('flex gap-2.5', i < rows.length - 1 && 'border-border-subtle mb-3 border-b pb-3')}
          >
            <span className="font-mono text-dim w-8 shrink-0 pt-0.5 text-3xs font-bold tabular-nums">{row.ball}</span>
            <BallChip
              value={row.chip}
              className={cn(
                'h-6.5 w-6.5 min-w-0 shrink-0 !rounded-icon px-0 text-3xs font-extrabold',
                String(row.chip) === '4' && 'bg-brand/20 text-brand-text border-0'
              )}
            />
            <p className="text-body min-w-0 flex-1 text-2xs leading-relaxed">
              {row.text}
              {row.score ? <span className="text-dim"> {row.score}</span> : null}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
