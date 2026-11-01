import { PageDock, ScreenBar, SectionLabel } from '@/shared/layout';
import { Button } from '@/shared/ui/Button';
import { EmptyState, ErrorState, SKELETON, UserRowSkeleton } from '@/shared/ui/states';

import { DISCOVER_SECTION_LABEL } from '../lib/discoverPage';
import { SuggestedUserRow } from './SuggestedUserRow';
import type { useDiscoverPage } from './useDiscoverPage';

type DiscoverPageFlow = ReturnType<typeof useDiscoverPage>;

type DiscoverPageBodyProps = {
  flow: DiscoverPageFlow;
};

/** Suggested players list with loading / empty gates — edge-to-edge rows, no card chrome. */
export function DiscoverPageBody({ flow }: DiscoverPageBodyProps) {
  const { users, isLoading, isError, refetch, goHome } = flow;
  const rowCount = SKELETON.userRows;

  return (
    <PageDock
      header={<ScreenBar title="Suggested for You" subtitle="People Who Post the Cricket You Follow" onBack={goHome} />}
    >
      {isLoading ? (
        <div className="flex flex-col pb-6">
          <div className="px-4 pt-3.5">
            <SectionLabel as="h2">{DISCOVER_SECTION_LABEL}</SectionLabel>
          </div>
          <ul className="flex flex-col" aria-busy="true" aria-label="Loading Suggestions">
            {Array.from({ length: rowCount }, (_, i) => (
              <li key={i} className="border-border-subtle border-b px-4 py-3">
                <UserRowSkeleton />
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {isError ? (
        <div className="px-4 py-8">
          <ErrorState
            title="Couldn't Load Suggestions"
            description="Check your connection and try again."
            onRetry={() => void refetch()}
          />
        </div>
      ) : null}

      {!isLoading && !isError && users.length === 0 ? (
        <div className="px-4 py-8">
          <EmptyState
            title="No Suggestions Right Now"
            description="Follow people from Explore posts — they will show up here next time."
            action={
              <Button size="sm" onClick={goHome}>
                Back to Explore
              </Button>
            }
          />
        </div>
      ) : null}

      {!isLoading && !isError && users.length > 0 ? (
        <div className="flex flex-col pb-6">
          <div className="px-4 pt-3.5">
            <SectionLabel as="h2">{DISCOVER_SECTION_LABEL}</SectionLabel>
          </div>
          <ul className="flex flex-col">
            {users.map((user) => (
              <SuggestedUserRow key={user.id} user={user} className="border-border-subtle border-b px-4 py-3" />
            ))}
          </ul>
        </div>
      ) : null}
    </PageDock>
  );
}
