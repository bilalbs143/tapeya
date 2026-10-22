import { Link } from 'react-router-dom';

import { cn } from '@/shared/lib/cn';
import { BoltIcon, TrophyIcon } from '@/shared/ui/icons';

type CreateMatchTilesProps = {
  startMatchTo: string;
  quickMatchTo: string;
  className?: string | undefined;
};

export function CreateMatchTiles({ startMatchTo, quickMatchTo, className }: CreateMatchTilesProps) {
  return (
    <div className={cn('grid grid-cols-2 gap-2.5', className)}>
      <Link
        to={startMatchTo}
        className="bg-brand flex min-h-[94px] flex-col justify-between rounded-panel px-3.5 py-3 text-white"
      >
        <span className="text-white" aria-hidden>
          <TrophyIcon size="sm" />
        </span>
        <span>
          <span className="block text-body-sm font-extrabold tracking-tight">Start A Match</span>
          <span className="font-mono mt-0.5 block text-4xs font-medium tracking-wide text-white/72 uppercase">
            Tournament fixture
          </span>
        </span>
      </Link>

      <Link
        to={quickMatchTo}
        className="border-border-subtle bg-surface text-ink focus-visible:outline-brand flex min-h-[94px] flex-col justify-between rounded-panel border px-3.5 py-3 text-left focus-visible:outline-2"
      >
        <span className="text-positive" aria-hidden>
          <BoltIcon size="lg" className="h-5 w-5" strokeWidth={1.9} />
        </span>
        <span>
          <span className="block text-body-sm font-extrabold tracking-tight">Quick Match</span>
          <span className="font-mono text-dim mt-0.5 block text-4xs font-medium tracking-wide uppercase">
            Two sides, no tournament
          </span>
        </span>
      </Link>
    </div>
  );
}
