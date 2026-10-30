import { Link } from 'react-router-dom';

import { PageDock, ScreenBar } from '@/shared/layout';
import { SearchBar } from '@/shared/ui/SearchBar';
import {
  EmptyState,
  ErrorState,
  HighlightGridSkeleton,
  HighlightRowSkeleton,
  SKELETON,
} from '@/shared/ui/states';

import { highlightsSearchEmptyTitle } from '../lib/highlightsPage';
import { formatHighlightDate, type Highlight } from '../model/schemas';
import { highlightRoutes } from '../routes';
import { HighlightThumb } from './HighlightThumb';
import type { useHighlightsPage } from './useHighlightsPage';

type HighlightsFlow = ReturnType<typeof useHighlightsPage>;

type HighlightsPageBodyProps = {
  flow: HighlightsFlow;
};

function HighlightGrid({ clips }: { clips: Highlight[] }) {
  return (
    <div className="grid grid-cols-2 gap-x-3 gap-y-4 tab:grid-cols-3">
      {clips.map((c) => (
        <Link key={c.id} to={highlightRoutes.detail(c.id)} className="group flex flex-col gap-2">
          <HighlightThumb src={c.thumbnailUrl} className="aspect-video w-full rounded-field" />
          <span className="flex flex-col">
            <span className="group-hover:text-brand-text line-clamp-2 text-xs leading-snug font-bold text-ink">
              {c.title}
            </span>
            <span className="text-dim mt-0.5 text-3xs leading-normal">{formatHighlightDate(c.createdAt)}</span>
          </span>
        </Link>
      ))}
    </div>
  );
}

function SearchRow({ clip }: { clip: Highlight }) {
  return (
    <Link
      to={highlightRoutes.detail(clip.id)}
      className="border-border-subtle bg-surface hover:border-border flex items-center gap-3 rounded-panel border p-2.5"
    >
      <HighlightThumb src={clip.thumbnailUrl} className="h-[46px] w-[78px] shrink-0 rounded-icon" />
      <span className="min-w-0 flex-1">
        <span className="line-clamp-1 text-xs font-bold text-ink">{clip.title}</span>
        <span className="text-dim mt-0.5 block text-3xs leading-normal">{formatHighlightDate(clip.createdAt)}</span>
      </span>
    </Link>
  );
}

/** Search + grid or compact search results. */
export function HighlightsPageBody({ flow }: HighlightsPageBodyProps) {
  const { q, setQ, debounced, results, clips, isLoading, isError, refetch, goBack } = flow;
  const gridCount = SKELETON.highlightGrid;
  const searchRowCount = SKELETON.relatedRows;

  return (
    <PageDock
      header={
        <div className="bg-surface shrink-0">
          <ScreenBar title="Highlights" subtitle="Clips From the Pitch" onBack={goBack} />
          <div className="px-4 pt-3.5 pb-3">
            <SearchBar
              value={q}
              onValueChange={setQ}
              placeholder="Search Highlights…"
              label="Search Highlights"
              size="md"
              className="w-full"
              inputClassName="h-[46px] rounded-panel"
            />
          </div>
        </div>
      }
    >
      <div className="flex flex-col gap-4 px-4 pb-6">
        {isLoading ? (
          debounced.trim() ? (
            <ul className="flex flex-col gap-1.5" aria-busy="true" aria-label="Loading Highlights">
              {Array.from({ length: searchRowCount }, (_, i) => (
                <li key={i}>
                  <HighlightRowSkeleton />
                </li>
              ))}
            </ul>
          ) : (
            <HighlightGridSkeleton count={gridCount} />
          )
        ) : isError ? (
          <ErrorState
            title="Could Not Load Highlights"
            description="The clip library didn't answer. Usually a moment's connection trouble."
            onRetry={() => void refetch()}
          />
        ) : results ? (
          results.length ? (
            <ul className="flex flex-col gap-1.5">
              {results.map((c) => (
                <li key={c.id}>
                  <SearchRow clip={c} />
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState title={highlightsSearchEmptyTitle(debounced)} />
          )
        ) : !clips.length ? (
          <EmptyState title="No Highlights Yet" description="Highlights will appear here when available." />
        ) : (
          <HighlightGrid clips={clips} />
        )}
      </div>
    </PageDock>
  );
}
