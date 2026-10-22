import { cn } from '@/shared/lib/cn';
import { EmptyState } from '@/shared/ui/states';

import type { CommentaryItem } from '../lib/commentary';
import type { CreaseBatterView } from '../lib/fanMatchView';
import type { BowlerLine } from '../model/scoringSession';
import { CommentaryFeed } from './CommentaryFeed';

type FanLivePanelProps = {
  batters: CreaseBatterView[];
  bowler: BowlerLine | null;
  commentary?: CommentaryItem[] | undefined;
};

/** Not the scorer DenseTable crease; not the pad. */

export function FanLivePanel({ batters, bowler, commentary = [] }: FanLivePanelProps) {
  if (!batters.length && !bowler && !commentary.length) {
    return <EmptyState title="Waiting for the Crease" description="Batters and bowler appear once scoring starts." />;
  }

  const rows = batters.length
    ? batters
    : [{ id: 0, name: '—', runs: 0, balls: 0, fours: 0, sixes: 0, sr: '—', onStrike: false }];

  return (
    <div className="flex flex-col">
      <div className="border-border-subtle bg-surface mb-3.5 overflow-hidden rounded-panel border">
        <div className="bg-page-deep font-mono text-dim flex min-h-8 items-center px-3 text-4xs font-bold tracking-eyebrow uppercase">
          <span className="min-w-0 flex-1">Batting</span>
          <span className="w-8 text-right">R</span>
          <span className="w-7 text-right">B</span>
          <span className="w-10 text-right">SR</span>
        </div>
        {rows.map((b, i) => (
          <div
            key={b.id || b.name}
            className={cn('flex min-h-10 items-center px-3', i < rows.length - 1 && 'border-border-subtle border-b')}
          >
            <span
              className={cn(
                'min-w-0 flex-1 truncate text-2xs',
                b.onStrike ? 'font-bold text-ink' : 'font-semibold text-body'
              )}
            >
              {b.name}
              {b.onStrike ? <span className="text-positive ml-1">*</span> : null}
            </span>
            <span className="font-mono w-8 text-right text-xs font-extrabold text-ink tabular-nums">{b.runs}</span>
            <span className="font-mono text-muted w-7 text-right text-3xs font-semibold tabular-nums">{b.balls}</span>
            <span className="font-mono text-muted w-10 text-right text-3xs font-semibold tabular-nums">{b.sr}</span>
          </div>
        ))}
      </div>

      <div className="border-border-subtle bg-surface mb-4 overflow-hidden rounded-panel border">
        <div className="bg-page-deep font-mono text-dim flex min-h-8 items-center px-3 text-4xs font-bold tracking-eyebrow uppercase">
          <span className="min-w-0 flex-1">Bowling</span>
          <span className="w-8 text-right">O</span>
          <span className="w-7 text-right">R</span>
          <span className="w-6 text-right">W</span>
        </div>
        <div className="flex min-h-10 items-center px-3">
          <span className="min-w-0 flex-1 truncate text-2xs font-bold text-ink">{bowler?.name ?? '—'}</span>
          <span className="font-mono text-body w-8 text-right text-3xs font-semibold tabular-nums">
            {bowler?.overs ?? '—'}
          </span>
          <span className="font-mono text-body w-7 text-right text-3xs font-semibold tabular-nums">
            {bowler?.runs ?? '—'}
          </span>
          <span className="font-mono w-6 text-right text-xs font-extrabold text-ink tabular-nums">
            {bowler?.wickets ?? '—'}
          </span>
        </div>
      </div>

      {commentary.length ? <CommentaryFeed items={commentary} newestFirst labelled limit={12} /> : null}
    </div>
  );
}
