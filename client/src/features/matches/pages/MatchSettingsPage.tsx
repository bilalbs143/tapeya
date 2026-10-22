import { useParams } from 'react-router-dom';

import { ScreenBar } from '@/shared/layout';
import { ErrorState, FormFieldsSkeleton, Skeleton } from '@/shared/ui/states';

import { MatchSettingsBody } from '../ui/MatchSettingsBody';
import { useMatchSettings } from '../ui/useMatchSettings';

/** Saves as you go via PATCH /matches/:id/analytics-settings. `confirmEveryWicket` is omitted — no API field. */

export default function MatchSettingsPage() {
  const params = useParams();
  const matchId = Number(params.id);
  const valid = Number.isFinite(matchId) && matchId > 0;

  const flow = useMatchSettings(matchId, valid);
  const { fixtureQuery, fixture, barSubtitle, goBack } = flow;

  const loadingHeader = <ScreenBar title="Match Settings" subtitle="Saves As You Go" onBack={goBack} />;

  if (!valid) {
    return (
      <div className="bg-surface flex min-h-full flex-col px-4 py-8">
        <ErrorState title="Match Not Found" />
      </div>
    );
  }

  if (fixtureQuery.isLoading) {
    return (
      <div className="bg-surface flex min-h-full flex-col">
        {loadingHeader}
        <div className="flex flex-col gap-4 px-4 py-6" aria-busy="true" aria-label="Loading Match Settings">
          <Skeleton className="h-2.5 w-16" />
          <div className="border-border-subtle rounded-card border p-3.5">
            <div className="flex items-center gap-2.5">
              <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                <Skeleton className="h-3 w-28" />
                <Skeleton className="h-2.5 w-48" />
              </div>
              <Skeleton className="h-6 w-10 rounded-full" />
            </div>
            <Skeleton className="mt-2.5 h-14 w-full rounded-panel" />
          </div>
          <Skeleton className="h-2.5 w-40" />
          <FormFieldsSkeleton rows={3} />
        </div>
      </div>
    );
  }

  if (fixtureQuery.isError || !fixture) {
    return (
      <div className="bg-surface flex min-h-full flex-col">
        {loadingHeader}
        <div className="px-4 py-8">
          <ErrorState title="Couldn't Load Match Settings" onRetry={() => void fixtureQuery.refetch()} />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface flex min-h-full flex-col">
      <ScreenBar title="Match Settings" subtitle={barSubtitle} onBack={goBack} />
      <MatchSettingsBody flow={flow} />
    </div>
  );
}
