import { useState } from 'react';

import { SectionLabel } from '@/shared/layout';
import { cn } from '@/shared/lib/cn';
import { Chip, ChipRow } from '@/shared/ui/Chip';
import { DenseTable, DenseTableFooter, DenseTableHeader, DenseTableRow } from '@/shared/ui/DenseTable';
import { EmptyState, ErrorState, Skeleton } from '@/shared/ui/states';

import { BATTING_COLUMNS, BOWLING_COLUMNS } from '../lib/scorecardColumns';
import type { ScorecardBatter, ScorecardFace } from '../lib/scorecardFace';

function sortedBatters(inn: ScorecardFace): ScorecardBatter[] {
  const list = [...inn.bat];
  if (inn.live) {
    list.sort((a, b) => {
      const ao = !a.out ? 0 : 1;
      const bo = !b.out ? 0 : 1;
      return ao - bo;
    });
  }
  return list;
}

export function InningsScorecardFace({ inn }: { inn: ScorecardFace }) {
  const batters = sortedBatters(inn);

  return (
    <div className="flex flex-col gap-4">
      <div className="border-border-subtle bg-surface flex items-end gap-2.5 rounded-card border px-3.5 py-3">
        <div className="min-w-0 flex-1">
          <p className="font-mono text-display-sm leading-none font-extrabold text-ink">
            {inn.runs}
            <span className="text-muted text-base leading-none">/{inn.wickets}</span>
          </p>
          <p className="font-mono text-dim mt-1 text-4xs font-semibold tracking-eyebrow uppercase">
            {inn.overs} OV{inn.need ? ` · ${inn.need}` : ''}
          </p>
        </div>
        <div className="flex gap-3.5">
          {inn.crr != null ? (
            <div>
              <p className="font-mono text-dim text-4xs font-semibold tracking-eyebrow uppercase">CRR</p>
              <p className="font-mono text-body text-body-sm font-extrabold tabular-nums">{inn.crr}</p>
            </div>
          ) : null}
          <div>
            <p className="font-mono text-dim text-4xs font-semibold tracking-eyebrow uppercase">Extras</p>
            <p className="font-mono text-body text-body-sm font-extrabold tabular-nums">{inn.extras}</p>
          </div>
        </div>
      </div>

      <section className="flex flex-col gap-2">
        <SectionLabel as="h2">Batting</SectionLabel>
        <DenseTable columns={BATTING_COLUMNS}>
          <DenseTableHeader />
          {batters.length === 0 ? (
            <p className="text-muted px-3 py-4 text-center text-xs">No batters yet.</p>
          ) : (
            batters.map((b) => {
              const notOut = !b.out;
              return (
                <DenseTableRow
                  key={b.id || b.name}
                  className={cn(notOut && 'bg-positive/8')}
                  cells={{
                    batter: {
                      node: (
                        <span className="block min-w-0">
                          <span className="block truncate text-2xs font-bold text-ink">
                            {b.name}
                            {b.onStrike ? <span className="text-positive-2"> *</span> : null}
                          </span>
                          <span className={cn('block truncate text-4xs', notOut ? 'text-positive-2' : 'text-dim')}>
                            {b.how}
                          </span>
                        </span>
                      ),
                    },
                    runs: b.runs,
                    balls: b.balls,
                    fours: b.fours,
                    sixes: b.sixes,
                    sr: b.sr,
                  }}
                />
              );
            })
          )}
          <DenseTableFooter>
            <span className="font-mono text-muted text-4xs font-bold tracking-eyebrow uppercase">
              Extras{inn.extrasDetail ? ` (${inn.extrasDetail})` : ''}
            </span>
            <span className="font-mono text-xs font-bold text-ink tabular-nums">{inn.extras}</span>
          </DenseTableFooter>
        </DenseTable>
      </section>

      <section className="flex flex-col gap-2">
        <SectionLabel as="h2">Bowling</SectionLabel>
        <DenseTable columns={BOWLING_COLUMNS}>
          <DenseTableHeader />
          {inn.bowl.length === 0 ? (
            <p className="text-muted px-3 py-4 text-center text-xs">No bowling yet.</p>
          ) : (
            inn.bowl.map((b) => (
              <DenseTableRow
                key={b.id || b.name}
                className={cn(b.live && 'bg-brand/10')}
                cells={{
                  bowler: {
                    node: (
                      <span className="flex min-w-0 items-center gap-1.5">
                        <span className="truncate text-2xs font-bold text-ink">{b.name}</span>
                        {b.live ? (
                          <span className="font-mono text-brand-text shrink-0 text-4xs font-bold tracking-eyebrow">
                            BOWLING
                          </span>
                        ) : null}
                      </span>
                    ),
                  },
                  overs: b.overs,
                  maidens: b.maidens,
                  runs: b.runs,
                  wickets: b.wickets,
                  econ: b.econ,
                }}
              />
            ))
          )}
        </DenseTable>
      </section>

      {inn.fallOfWickets ? (
        <section className="flex flex-col gap-1">
          <SectionLabel as="h2">Fall of Wickets</SectionLabel>
          <p className="font-mono text-muted text-3xs leading-relaxed font-medium">{inn.fallOfWickets}</p>
        </section>
      ) : null}
    </div>
  );
}

type ScorecardPanelProps = {
  faces: ScorecardFace[];
  loading?: boolean | undefined;
  error?: boolean | undefined;
  onRetry?: (() => void) | undefined;
};

export function ScorecardPanel({ faces, loading, error, onRetry }: ScorecardPanelProps) {
  const [innIndex, setInnIndex] = useState(() => Math.max(0, faces.length - 1));
  const safeIndex = Math.min(innIndex, Math.max(0, faces.length - 1));

  if (loading) {
    return (
      <div className="flex flex-col gap-3 py-3">
        <Skeleton className="h-8 w-48 rounded-icon" />
        <Skeleton className="h-20 w-full rounded-card" />
        <Skeleton className="h-40 w-full rounded-card" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-8">
        <ErrorState title="Couldn't Load the Scorecard" onRetry={onRetry} />
      </div>
    );
  }

  if (!faces.length) {
    return <EmptyState title="Nothing Scored Yet" description="The scorecard fills in as balls are logged." />;
  }

  const inn = faces[safeIndex] ?? faces[faces.length - 1];
  if (!inn) {
    return <EmptyState title="Nothing Scored Yet" description="The scorecard fills in as balls are logged." />;
  }

  return (
    <div className="flex flex-col gap-4 py-3">
      <ChipRow className="mx-0 px-0">
        {faces.map((face, i) => {
          const short = face.sideShort || face.sideName || `Innings ${face.inningsNumber}`;
          const truncated = short.length > 12 ? short.split(' ')[0] : short;
          const label = `${truncated} · ${i === 0 ? '1st' : '2nd'}`;
          return (
            <Chip key={face.id} size="sm" selected={i === safeIndex} onClick={() => setInnIndex(i)}>
              {label}
            </Chip>
          );
        })}
      </ChipRow>

      <InningsScorecardFace inn={inn} />
    </div>
  );
}
