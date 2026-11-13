import { PageDock, ScreenBar, SectionLabel } from '@/shared/layout';
import { Button } from '@/shared/ui/Button';
import { SearchBar } from '@/shared/ui/SearchBar';
import { EmptyState, ErrorState, SKELETON, UserRowSkeleton } from '@/shared/ui/states';

import { DISCOVER_SEARCH_SECTION_LABEL, DISCOVER_SECTION_LABEL } from '../lib/discoverPage';
import { SuggestedUserRow } from './SuggestedUserRow';
import type { useDiscoverPage } from './useDiscoverPage';

type DiscoverPageFlow = ReturnType<typeof useDiscoverPage>;

type DiscoverPageBodyProps = {
  flow: DiscoverPageFlow;
};

function UserListSkeleton({ label }: { label: string }) {
  const rowCount = SKELETON.userRows;
  return (
    <div className="flex flex-col pb-6">
      <div className="px-4 pt-3.5">
        <SectionLabel as="h2">{label}</SectionLabel>
      </div>
      <ul className="flex flex-col" aria-busy="true" aria-label="Loading Players">
        {Array.from({ length: rowCount }, (_, i) => (
          <li key={i} className="border-border-subtle border-b px-4 py-3">
            <UserRowSkeleton />
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Suggested / search player list — SearchBar pinned like shop; results filter the list below. */
export function DiscoverPageBody({ flow }: DiscoverPageBodyProps) {
  const { query, setQuery, searching, users, isLoading, isError, refetch, searchHeading, goHome } = flow;
  const sectionLabel = searching ? DISCOVER_SEARCH_SECTION_LABEL : DISCOVER_SECTION_LABEL;

  return (
    <PageDock
      header={
        <div className="bg-surface shrink-0">
          <ScreenBar title="Suggested for You" subtitle="People Who Post the Cricket You Follow" onBack={goHome} />
          <div className="px-4 pt-3.5 pb-3">
            <SearchBar
              value={query}
              onValueChange={setQuery}
              placeholder="Search Player"
              label="Search Player"
              size="md"
              className="w-full"
              count={searching && !isLoading && !isError ? searchHeading : undefined}
            />
          </div>
        </div>
      }
    >
      {isLoading ? <UserListSkeleton label={sectionLabel} /> : null}

      {isError ? (
        <div className="px-4 py-8">
          <ErrorState
            title={searching ? "Couldn't Search Players" : "Couldn't Load Suggestions"}
            description="Check your connection and try again."
            onRetry={() => void refetch()}
          />
        </div>
      ) : null}

      {!isLoading && !isError && users.length === 0 ? (
        <div className="px-4 py-8">
          {searching ? (
            <EmptyState title="No Players Found" description="Try another name or nickname — spelling can be picky." />
          ) : (
            <EmptyState
              title="No Suggestions Right Now"
              description="Follow people from Explore posts — they will show up here next time."
              action={
                <Button size="sm" onClick={goHome}>
                  Back to Explore
                </Button>
              }
            />
          )}
        </div>
      ) : null}

      {!isLoading && !isError && users.length > 0 ? (
        <div className="flex flex-col pb-6">
          <div className="px-4 pt-3.5">
            <SectionLabel as="h2">{sectionLabel}</SectionLabel>
          </div>
          <ul className="flex flex-col desk:grid desk:grid-cols-2 desk:gap-x-3">
            {users.map((user) => (
              <SuggestedUserRow key={user.id} user={user} className="border-border-subtle border-b px-4 py-3" />
            ))}
          </ul>
        </div>
      ) : null}
    </PageDock>
  );
}
