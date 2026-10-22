import type { ReactNode } from 'react';

import { cn } from '@/shared/lib/cn';

type LiveInningsStripProps = {
  crr?: string | null | undefined;
  rrr?: string | null | undefined;
  extras?: number | null | undefined;
  partnership?: { runs: number; balls: number } | null | undefined;
  lastSix?: number | null | undefined;
  chase?: boolean | undefined;
  className?: string | undefined;
};

type StripCell = { key: string; label: string; value: ReactNode; tone?: 'positive' | undefined };

/** Compact CRR / extras / partnership (and chase RRR / last-6) strip under the score. */
export function LiveInningsStrip({
  crr,
  rrr,
  extras,
  partnership,
  lastSix,
  chase = false,
  className,
}: LiveInningsStripProps) {
  const inOver = !chase && lastSix != null;

  const pshipValue: ReactNode = partnership ? (
    <>
      {partnership.runs}
      <span className="text-dim font-semibold">({partnership.balls})</span>
    </>
  ) : (
    '0(0)'
  );

  const cells: StripCell[] = [];
  if (chase) {
    cells.push(
      { key: 'crr', label: 'CRR', value: crr ?? '0.00' },
      { key: 'rrr', label: 'RRR', value: rrr ?? '—', tone: 'positive' },
      { key: 'extras', label: 'Extras', value: String(extras ?? 0) },
      { key: 'pship', label: "P'ship", value: pshipValue }
    );
  } else {
    if (!inOver) cells.push({ key: 'crr', label: 'CRR', value: crr ?? '0.00' });
    cells.push(
      { key: 'extras', label: 'Extras', value: String(extras ?? 0) },
      { key: 'pship', label: "P'ship", value: pshipValue }
    );
    if (inOver) {
      cells.push({ key: 'last6', label: 'Last 6', value: String(lastSix ?? 0), tone: 'positive' });
    }
  }

  return (
    <div className={cn('flex gap-2', className)}>
      {cells.map((cell) => (
        <div
          key={cell.key}
          className="border-border-subtle bg-surface flex min-h-13.5 min-w-0 flex-1 flex-col justify-center rounded-field border px-2.5 py-2"
        >
          <p className="font-mono text-dim text-4xs font-bold tracking-eyebrow uppercase">{cell.label}</p>
          <p
            className={cn(
              'font-mono mt-1 truncate text-body-lg leading-none font-extrabold tabular-nums',
              cell.tone === 'positive' ? 'text-positive-2' : 'text-ink'
            )}
          >
            {cell.value}
          </p>
        </div>
      ))}
    </div>
  );
}
