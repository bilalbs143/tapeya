import { Link } from 'react-router-dom';

import { profileRoutes } from '@/features/profile';

import { cn } from '@/shared/lib/cn';
import { Avatar } from '@/shared/ui/Avatar';
import { EmptyState, ErrorState, Skeleton } from '@/shared/ui/states';

import type { RankingCard } from '../model/schemas';

type RankingPlayerCardProps = {
  player: RankingCard;
  rank: number;
  className?: string | undefined;
};

export function RankingPlayerCard({ player, rank, className }: RankingPlayerCardProps) {
  return (
    <Link
      to={profileRoutes.user(player.playerId)}
      className={cn(
        'bg-page flex items-center gap-3 rounded-panel p-3 transition-opacity active:opacity-90',
        className
      )}
    >
      <Avatar name={player.name} size="lg" className="shrink-0" />
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2">
          <span className="truncate text-body-lg font-bold text-ink">{player.name}</span>
          <span className="text-muted shrink-0 text-3xs font-medium">{player.role}</span>
        </div>
        <p className="text-brand-text mt-0.5 font-mono text-title-sm font-bold tabular-nums">{player.primary}</p>
        <p className="text-muted text-3xs font-medium">{player.detail}</p>
      </div>
      <span className="text-brand/40 font-mono text-display font-bold leading-none" aria-hidden>
        {rank}
      </span>
    </Link>
  );
}

type RankingSectionProps = {
  title: string;
  viewMoreTo: string;
  rows: RankingCard[];
  loading: boolean;
  error: boolean;
  onRetry: () => void;
  emptyMessage: string;
};

export function RankingSection({
  title,
  viewMoreTo,
  rows,
  loading,
  error,
  onRetry,
  emptyMessage,
}: RankingSectionProps) {
  return (
    <section>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-muted text-3xs font-bold tracking-eyebrow uppercase">{title}</h2>
        <Link
          to={viewMoreTo}
          className="text-brand-text text-3xs font-bold tracking-eyebrow uppercase transition-opacity active:opacity-80"
        >
          View More
        </Link>
      </div>

      {loading ? (
        <div className="flex flex-col gap-3" aria-busy="true" aria-label="Loading Rankings">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-page flex items-center gap-3 rounded-panel p-3">
              <Skeleton className="h-12 w-12 shrink-0 rounded-full" />
              <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                <Skeleton className="h-3 w-32" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-2.5 w-24" />
              </div>
              <Skeleton className="h-8 w-6" />
            </div>
          ))}
        </div>
      ) : null}

      {error && !loading ? <ErrorState title="Couldn't Load Rankings" onRetry={onRetry} /> : null}

      {!loading && !error && rows.length === 0 ? <EmptyState title={emptyMessage} /> : null}

      {!loading && !error && rows.length > 0 ? (
        <ul className="flex flex-col gap-3">
          {rows.map((player, index) => (
            <li key={player.playerId}>
              <RankingPlayerCard player={player} rank={index + 1} />
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
