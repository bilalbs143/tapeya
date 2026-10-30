import { Link } from 'react-router-dom';

import { PageDock, ScreenBar } from '@/shared/layout';
import { SearchBar } from '@/shared/ui/SearchBar';
import { EmptyState, ErrorState, SKELETON, Skeleton } from '@/shared/ui/states';

import { entertainmentEpisodesLabel, entertainmentSearchEmptyTitle } from '../lib/entertainmentPage';
import { entertainmentPaths } from '../lib/entertainmentPaths';
import type { DramaSerial } from '../model/schemas';
import type { useEntertainmentPage } from './useEntertainmentPage';

type EntertainmentFlow = ReturnType<typeof useEntertainmentPage>;

type EntertainmentPageBodyProps = {
  flow: EntertainmentFlow;
};

function SerialGrid({ serials }: { serials: DramaSerial[] }) {
  return (
    <ul className="grid grid-cols-3 gap-2">
      {serials.map((serial) => (
        <li key={serial.id}>
          <Link
            to={entertainmentPaths.detail(serial.id)}
            aria-label={serial.title}
            className="bg-surface-raised focus-visible:outline-brand aspect-show-poster block overflow-hidden rounded-field focus-visible:outline-2"
          >
            {serial.poster ? <img src={serial.poster} alt="" className="h-full w-full object-cover" /> : null}
          </Link>
        </li>
      ))}
    </ul>
  );
}

function SearchRow({ serial }: { serial: DramaSerial }) {
  return (
    <Link
      to={entertainmentPaths.detail(serial.id)}
      className="border-border-subtle bg-surface hover:border-border flex items-center gap-3 rounded-panel border p-2.5"
    >
      <span className="bg-surface-raised aspect-show-poster h-[62px] w-[46px] shrink-0 overflow-hidden rounded-icon">
        {serial.poster ? <img src={serial.poster} alt="" className="h-full w-full object-cover" /> : null}
      </span>
      <span className="min-w-0 flex-1">
        <span className="line-clamp-1 text-xs font-bold text-ink">{serial.title}</span>
        <span className="text-dim mt-0.5 block text-3xs leading-normal">
          {entertainmentEpisodesLabel(serial.episodesCount)}
        </span>
      </span>
    </Link>
  );
}

/** Search + poster grid or compact search results. */
export function EntertainmentPageBody({ flow }: EntertainmentPageBodyProps) {
  const { q, setQ, debounced, data, results, isLoading, isError, refetch, goBack } = flow;
  const showCount = SKELETON.showGrid;

  return (
    <PageDock
      header={
        <div className="bg-surface shrink-0">
          <ScreenBar title="Entertainment" subtitle="Episodes and Seasons" onBack={goBack} />
          <div className="px-4 pt-3.5 pb-3">
            <SearchBar
              value={q}
              onValueChange={setQ}
              placeholder="Search Entertainment…"
              label="Search Entertainment"
              size="md"
              className="w-full"
              inputClassName="h-11 rounded-panel"
            />
          </div>
        </div>
      }
    >
      <div className="flex flex-col gap-4 px-4 pb-8">
        {isLoading ? (
          <ul className="grid grid-cols-3 gap-2" aria-busy="true" aria-label="Loading Entertainment">
            {Array.from({ length: showCount }, (_, i) => (
              <li key={i}>
                <Skeleton className="aspect-show-poster w-full rounded-field" />
              </li>
            ))}
          </ul>
        ) : isError ? (
          <ErrorState title="Couldn’t Load Entertainment" onRetry={() => void refetch()} />
        ) : results ? (
          results.length ? (
            <ul className="flex flex-col gap-1.5">
              {results.map((serial) => (
                <li key={serial.id}>
                  <SearchRow serial={serial} />
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState title={entertainmentSearchEmptyTitle(debounced)} />
          )
        ) : !data.length ? (
          <EmptyState title="Nothing Here Yet" description="Shows and episodes will appear here when published." />
        ) : (
          <SerialGrid serials={data} />
        )}
      </div>
    </PageDock>
  );
}
