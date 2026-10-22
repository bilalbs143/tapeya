import { Link, useNavigate, useParams } from 'react-router-dom';

import { getApiErrorMessage, isNotFoundError } from '@/shared/api/errors';
import { APP_PATHS } from '@/shared/config/paths';
import { ScreenBar } from '@/shared/layout';
import { Button } from '@/shared/ui/Button';
import { EmptyState, ErrorState, FormFieldsSkeleton, Skeleton } from '@/shared/ui/states';

import { useGetInterestCampaignQuery } from '../api/interestApi';
import { InterestFormBody } from '../ui/InterestFormBody';

/** Submit scalars via POST, then media via `/media/interest-submission/...`. */
export default function InterestPage() {
  const { slug = '' } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const { data, isLoading, isError, error, refetch } = useGetInterestCampaignQuery(slug, {
    skip: !slug,
  });

  const header = <ScreenBar title="Interest" subtitle="Register Your Interest" onBack={() => navigate(-1)} />;

  if (!slug) {
    return (
      <div className="bg-surface flex min-h-full flex-col">
        {header}
        <div className="px-4 py-8">
          <EmptyState
            title="Interest Form Not Found"
            description="This campaign may have finished, or the link is out of date."
            action={
              <Button asChild variant="secondary">
                <Link to={APP_PATHS.upcomingTournaments}>Browse Tournaments</Link>
              </Button>
            }
          />
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="bg-surface flex min-h-full flex-col">
        {header}
        <div className="flex flex-col gap-4 px-4 pt-4" aria-busy="true" aria-label="Loading Interest Form">
          <Skeleton className="h-3 w-2/3" />
          <div className="flex items-center gap-3">
            <Skeleton className="h-16 w-16 rounded-full" />
            <Skeleton className="h-10 flex-1 rounded-panel" />
          </div>
          <FormFieldsSkeleton rows={4} />
          <Skeleton className="h-12 w-full rounded-field" />
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="bg-surface flex min-h-full flex-col">
        {header}
        <div className="px-4 py-8">
          {isNotFoundError(error) ? (
            <EmptyState
              title="Interest Form Not Found"
              description="This campaign may have finished, or the link is out of date."
              action={
                <Button asChild variant="secondary">
                  <Link to={APP_PATHS.upcomingTournaments}>Browse Tournaments</Link>
                </Button>
              }
            />
          ) : (
            <ErrorState
              title="Could Not Load This Interest Form"
              description={getApiErrorMessage(error, 'Please try again.')}
              onRetry={() => void refetch()}
            />
          )}
        </div>
      </div>
    );
  }

  return (
    <InterestFormBody
      key={`${data.campaign.slug}-${data.mySubmission?.id ?? 'new'}-${data.mySubmission?.status ?? 'none'}`}
      slug={slug}
      payload={data}
    />
  );
}
