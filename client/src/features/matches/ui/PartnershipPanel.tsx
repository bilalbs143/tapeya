import { useState } from 'react';

import { cn } from '@/shared/lib/cn';
import { DenseTable, type DenseTableColumn, DenseTableHeader, DenseTableRow } from '@/shared/ui/DenseTable';
import { EmptyState, ErrorState, Skeleton } from '@/shared/ui/states';

import type { PartnershipBatter, PartnershipInnings, PartnershipStand } from '../lib/partnerships';

const PARTNERSHIP_COLUMNS: DenseTableColumn[] = [
  { key: 'stand', label: 'Stand', width: '72px' },
  { key: 'batters', label: 'Partnership', width: 'minmax(0,1fr)' },
  { key: 'runs', label: 'R', width: '38px', align: 'right', mono: true, emphasis: 'primary' },
  { key: 'balls', label: 'B', width: '32px', align: 'right', mono: true },
];

function standLabel(stand: PartnershipStand): string {
  return String(stand.label).toUpperCase();
}

function ContributionBar({
  batters,
  live = false,
  className,
}: {
  batters: PartnershipStand['batters'];
  live?: boolean | undefined;
  className?: string | undefined;
}) {
  const [a, b] = batters;
  const total = (a?.runs ?? 0) + (b?.runs ?? 0);
  const aPct = total ? ((a?.runs ?? 0) / total) * 100 : 50;
  return (
    <span className={cn('bg-page-deep flex h-1.5 overflow-hidden rounded-full', className)} aria-hidden>
      <span className={cn('h-full', live ? 'bg-brand' : 'bg-muted')} style={{ width: `${aPct}%` }} />
      <span className={cn('h-full', live ? 'bg-brand-cyan' : 'bg-border')} style={{ width: `${100 - aPct}%` }} />
    </span>
  );
}

function StandBatters({ stand }: { stand: PartnershipStand }) {
  const [a, b] = stand.batters;
  return (
    <span className="block min-w-0">
      {[a, b].filter(Boolean).map((p, i) => (
        <span key={i} className="flex items-baseline justify-between gap-2">
          <span className="min-w-0 truncate text-3xs font-bold text-ink">{(p as PartnershipBatter).name}</span>
          <span className="font-mono text-dim shrink-0 text-3xs font-medium tabular-nums">
            {(p as PartnershipBatter).runs} ({(p as PartnershipBatter).balls})
          </span>
        </span>
      ))}
      <ContributionBar batters={stand.batters} className="mt-1.5" />
    </span>
  );
}

function BatterRow({ batter, tone }: { batter: PartnershipBatter | null; tone: 'brand' | 'cyan' }) {
  if (!batter) return null;
  return (
    <div className="flex items-center gap-2">
      <span
        className={cn('h-1.5 w-1.5 shrink-0 rounded-full', tone === 'brand' ? 'bg-brand' : 'bg-brand-cyan')}
        aria-hidden
      />
      <span className="min-w-0 flex-1 truncate text-xs font-bold text-ink">
        {batter.name}
        {batter.onStrike ? <span className="text-positive-2"> *</span> : null}
      </span>
      <span className="font-mono text-muted shrink-0 text-2xs font-semibold tabular-nums">
        {batter.runs} ({batter.balls})
      </span>
    </div>
  );
}

function CurrentStand({ stand }: { stand: PartnershipStand }) {
  const rr = stand.balls ? ((stand.runs / stand.balls) * 6).toFixed(2) : '0.00';
  const [a, b] = stand.batters;

  return (
    <section aria-label={`At the crease, ${standLabel(stand).toLowerCase()}`}>
      <div className="mb-2.5 flex items-center gap-2">
        <span className="bg-brand h-1.5 w-1.5 shrink-0 rounded-full" aria-hidden />
        <span className="font-mono text-brand-text text-4xs font-bold tracking-eyebrow uppercase">
          At the crease · {standLabel(stand)}
        </span>
      </div>

      <div className="border-border-subtle bg-surface rounded-card border px-3.5 py-3.5">
        <div className="font-mono text-display leading-none font-extrabold text-ink tabular-nums">{stand.runs}</div>
        <p className="font-mono text-dim mt-1.5 text-4xs font-semibold tracking-eyebrow uppercase">
          Runs · {stand.balls} balls · RR {rr}
        </p>

        <ContributionBar batters={stand.batters} live className="mt-3.5" />

        <div className="mt-3 flex flex-col gap-1.5">
          <BatterRow batter={a} tone="brand" />
          {b ? <BatterRow batter={b} tone="cyan" /> : null}
        </div>
      </div>
    </section>
  );
}

type PartnershipPanelProps = {
  innings: PartnershipInnings[];
  loading?: boolean | undefined;
  error?: boolean | undefined;
  onRetry?: (() => void) | undefined;
};

export function PartnershipPanel({ innings, loading, error, onRetry }: PartnershipPanelProps) {
  const [innIndex, setInnIndex] = useState(() => Math.max(0, innings.length - 1));
  const safeIndex = Math.min(innIndex, Math.max(0, innings.length - 1));

  if (loading) {
    return (
      <div className="flex flex-col gap-3 py-3">
        <Skeleton className="h-8 w-40 rounded-icon" />
        <Skeleton className="h-36 w-full rounded-card" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-8">
        <ErrorState title="Couldn't Load Partnerships" onRetry={onRetry} />
      </div>
    );
  }

  if (!innings.length) {
    return <EmptyState title="Nothing to Show Yet" description="Partnerships appear once scoring starts." />;
  }

  const inn = innings[safeIndex] ?? innings[innings.length - 1];
  if (!inn) {
    return <EmptyState title="Nothing to Show Yet" description="Partnerships appear once scoring starts." />;
  }

  const current = inn.stands.find((s) => !s.complete) ?? null;
  const completed = inn.stands
    .filter((s) => s.complete)
    .slice()
    .sort((a, b) => (b.wicketNo ?? 0) - (a.wicketNo ?? 0));

  const chipOrder = innings.map((_, i) => i).reverse();

  return (
    <div className="flex flex-col gap-3.5 py-3">
      {innings.length > 1 ? (
        <div className="flex gap-2 overflow-x-auto">
          {chipOrder.map((i) => {
            const x = innings[i];
            if (!x) return null;
            const on = i === safeIndex;
            const label = `${x.sideShort || x.sideName?.split(' ')[0] || 'Side'} · ${x.ordinal}`;
            return (
              <button
                key={x.id}
                type="button"
                onClick={() => setInnIndex(i)}
                aria-pressed={on}
                className={cn(
                  'focus-visible:outline-brand flex min-h-8 shrink-0 items-center rounded-icon px-3 text-3xs font-bold focus-visible:outline-2 focus-visible:outline-offset-2',
                  on ? 'bg-brand text-white' : 'border-border-subtle bg-surface text-muted hover:text-ink border'
                )}
              >
                {label}
              </button>
            );
          })}
        </div>
      ) : null}

      {!inn.stands.length ? (
        <p className="text-muted py-8 text-center text-xs">No partnership yet.</p>
      ) : (
        <>
          {current ? <CurrentStand stand={current} /> : null}

          {completed.length ? (
            <section className="flex flex-col gap-2" aria-label="Completed Partnerships">
              <p className="font-mono text-dim text-4xs font-bold tracking-eyebrow uppercase">Completed</p>
              <DenseTable columns={PARTNERSHIP_COLUMNS} density="compact">
                <DenseTableHeader />
                {completed.map((s) => (
                  <DenseTableRow
                    key={s.id}
                    cells={{
                      stand: {
                        node: (
                          <span className="font-mono text-dim text-4xs font-bold tracking-eyebrow uppercase">
                            {standLabel(s)}
                          </span>
                        ),
                      },
                      batters: { node: <StandBatters stand={s} /> },
                      runs: s.runs,
                      balls: s.balls,
                    }}
                  />
                ))}
              </DenseTable>
            </section>
          ) : null}
        </>
      )}
    </div>
  );
}
