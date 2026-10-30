import { PageDock, ScreenBar, SectionLabel } from '@/shared/layout';
import { Button } from '@/shared/ui/Button';
import { Card } from '@/shared/ui/Card';
import { EmptyState, ErrorState, SKELETON, UserRowSkeleton } from '@/shared/ui/states';

import { DISCOVER_SECTION_LABEL } from '../lib/discoverPage';
import { SuggestedUserRow } from './SuggestedUserRow';
import type { useDiscoverPage } from './useDiscoverPage';

type DiscoverPageFlow = ReturnType<typeof useDiscoverPage>;

type DiscoverPageBodyProps = {
  flow: DiscoverPageFlow;
};

/** Suggested players list with loading / empty gates. */
export function DiscoverPageBody({ flow }: DiscoverPageBodyProps) {
  const { users, isLoading, isError, refetch, goHome } = flow;
  const rowCount = SKELETON.userRows;

  return (
    <PageDock
      header={<ScreenBar title="Suggested for You" subtitle="People Who Post the Cricket You Follow" onBack={goHome} />}
    >
      <div className="flex flex-col gap-3 px-4 py-3.5">
        {isLoading ? (
          <Card className="p-3.5">
            <SectionLabel as="h2">{DISCOVER_SECTION_LABEL}</SectionLabel>
            <ul className="flex flex-col gap-2.5" aria-busy="true" aria-label="Loading Suggestions">
              {Array.from({ length: rowCount }, (_, i) => (
                <li key={i}>
                  <UserRowSkeleton />
                </li>
              ))}
            </ul>
          </Card>
        ) : null}

        {isError ? (
          <ErrorState
            title="Couldn't Load Suggestions"
            description="Check your connection and try again."
            onRetry={() => void refetch()}
          />
        ) : null}

        {!isLoading && !isError && users.length === 0 ? (
          <EmptyState
            title="No Suggestions Right Now"
            description="Follow people from Explore posts — they will show up here next time."
            action={
              <Button size="sm" onClick={goHome}>
                Back to Explore
              </Button>
            }
          />
        ) : null}

        {!isLoading && !isError && users.length > 0 ? (
          <Card className="p-3.5">
            <SectionLabel as="h2">{DISCOVER_SECTION_LABEL}</SectionLabel>
            <ul className="flex flex-col gap-2.5">
              {users.map((user) => (
                <SuggestedUserRow key={user.id} user={user} />
              ))}
            </ul>
          </Card>
        ) : null}
      </div>
    </PageDock>
  );
}
