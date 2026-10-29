import { Link } from 'react-router-dom';

import { profileRoutes } from '@/features/profile';

import { PageDock, ScreenBar } from '@/shared/layout';
import { EmptyState, ErrorState, Skeleton } from '@/shared/ui/states';

import { formatRankIndex } from '../model/schemas';
import type { useRankingStats } from './useRankingStats';

type RankingStatsFlow = ReturnType<typeof useRankingStats>;

type RankingStatsBodyProps = {
  flow: RankingStatsFlow;
};

/** Full ranking table (or loading / error / empty). */
export function RankingStatsBody({ flow }: RankingStatsBodyProps) {
  const { subtitle, rows, columns, isLoading, isError, refetch, goList } = flow;

  return (
    <PageDock header={<ScreenBar title="Stats" subtitle={subtitle} onBack={goList} />}>
      <div className="px-4 pt-4 pb-8">
        {isLoading ? (
          <div
            className="border-border-subtle no-scrollbar mt-3 overflow-hidden rounded-panel border"
            aria-busy="true"
            aria-label="Loading Stats"
          >
            <div className="bg-page border-border-subtle flex gap-3 border-b px-3 py-3">
              <Skeleton className="h-2.5 w-8" />
              <Skeleton className="h-2.5 w-20" />
              <Skeleton className="ml-auto h-2.5 w-10" />
              <Skeleton className="h-2.5 w-10" />
            </div>
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="border-border-subtle flex items-center gap-3 border-b px-3 py-3 last:border-b-0">
                <Skeleton className="h-2.5 w-6" />
                <Skeleton className="h-7 w-7 rounded-full" />
                <Skeleton className="h-2.5 w-24" />
                <Skeleton className="ml-auto h-2.5 w-8" />
                <Skeleton className="h-2.5 w-8" />
              </div>
            ))}
          </div>
        ) : null}

        {isError && !isLoading ? (
          <div className="mt-4">
            <ErrorState title="Couldn't Load Rankings" onRetry={() => void refetch()} />
          </div>
        ) : null}

        {!isLoading && !isError && rows.length === 0 ? (
          <EmptyState className="mt-6" title="No Rankings Yet" description="Open-tournament stats will show up here." />
        ) : null}

        {!isLoading && !isError && rows.length > 0 ? (
          <div className="border-border-subtle no-scrollbar mt-3 overflow-x-auto rounded-panel border">
            <table className="w-full min-w-max border-collapse text-left text-3xs text-ink">
              <thead>
                <tr className="bg-page">
                  {columns.map((col) => (
                    <th
                      key={col.key}
                      className={`border-border-subtle border-b px-3 py-3 font-bold tracking-eyebrow uppercase ${col.width ?? ''}`}
                    >
                      {col.header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.playerId} className="border-border-subtle border-b last:border-b-0">
                    {columns.map((col) => (
                      <td key={col.key} className="px-3 py-3 font-mono tabular-nums">
                        {col.key === 'player' ? (
                          <Link
                            to={profileRoutes.user(row.playerId)}
                            className="font-sans font-semibold text-ink hover:underline"
                          >
                            {formatRankIndex(row.rank)} {row.playerName}
                          </Link>
                        ) : (
                          row[col.key]
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </div>
    </PageDock>
  );
}
