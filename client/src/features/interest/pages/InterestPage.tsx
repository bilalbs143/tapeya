import { Link, useNavigate, useParams } from 'react-router-dom';

import { getApiErrorMessage, isNotFoundError } from '@/shared/api/errors';
import { APP_PATHS } from '@/shared/config/paths';
import { DockScreen } from '@/shared/layout';
import { Button } from '@/shared/ui/Button';
import { EmptyState, ErrorState, FormFieldsSkeleton, Skeleton } from '@/shared/ui/states';

import { useGetInterestCampaignQuery } from '../api/interestApi';
import type { InterestShowPayload } from '../model/schemas';
import { InterestCampaignBrandHeader, InterestCampaignStage } from '../ui/InterestCampaignBrand';
import { InterestFormBody, InterestFormFooter } from '../ui/InterestFormBody';
import { InterestStatusView } from '../ui/InterestStatusView';
import { useInterestForm } from '../ui/useInterestForm';

/** Submit scalars via POST, then media via `/media/interest-submission/...`. */
export default function InterestPage() {
  const { slug = '' } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const { data, isLoading, isError, error, refetch } = useGetInterestCampaignQuery(slug, {
    skip: !slug,
  });

  if (slug && !isLoading && !isError && data) {
    return (
      <InterestScreen
        key={`${data.campaign.slug}-${data.mySubmission?.id ?? 'new'}-${data.mySubmission?.status ?? 'none'}`}
        slug={slug}
        payload={data}
      />
    );
  }

  return (
    <DockScreen title="Interest" subtitle="Register Your Interest" onBack={() => navigate(-1)}>
      {!slug ? (
        <EmptyState
          size="lg"
          title="Interest Form Not Found"
          description="This campaign may have finished, or the link is out of date."
          action={
            <Button asChild variant="secondary">
              <Link to={APP_PATHS.upcomingTournaments}>Browse Tournaments</Link>
            </Button>
          }
        />
      ) : isLoading ? (
        <div className="flex flex-col gap-4 px-4 pt-4" aria-busy="true" aria-label="Loading Interest Form">
          <Skeleton className="h-36 w-full rounded-panel" />
          <Skeleton className="h-24 w-full rounded-panel" />
          <FormFieldsSkeleton rows={4} />
          <Skeleton className="h-12 w-full rounded-field" />
        </div>
      ) : isNotFoundError(error) ? (
        <EmptyState
          size="lg"
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
          page
          title="Could Not Load This Interest Form"
          description={getApiErrorMessage(error, 'Please try again.')}
          onRetry={() => void refetch()}
        />
      )}
    </DockScreen>
  );
}

function InterestScreen({ slug, payload }: { slug: string; payload: InterestShowPayload }) {
  const navigate = useNavigate();
  const { campaign, mySubmission } = payload;

  if (mySubmission) {
    return (
      <DockScreen title="Interest" subtitle="Your Status" onBack={() => navigate(-1)} body="fill">
        <InterestCampaignStage logoUrl={campaign.logoUrl} pageScroll>
          <InterestStatusView campaign={campaign} submission={mySubmission} onDone={() => navigate(-1)} />
        </InterestCampaignStage>
      </DockScreen>
    );
  }

  return <InterestFormDock slug={slug} payload={payload} />;
}

function InterestFormDock({ slug, payload }: { slug: string; payload: InterestShowPayload }) {
  const flow = useInterestForm(slug, payload);
  const { campaign, goBack } = flow;

  return (
    <DockScreen
      title="Interest"
      subtitle="Register Your Interest"
      onBack={goBack}
      footer={<InterestFormFooter flow={flow} />}
      body="fill"
    >
      <InterestCampaignStage logoUrl={campaign.logoUrl} pageScroll>
        <div className="flex flex-col gap-4 px-4 pt-3.5 pb-4">
          <InterestCampaignBrandHeader
            title={campaign.tournamentName}
            description={campaign.description}
            logoUrl={campaign.logoUrl}
            status={campaign.status}
          />
          <InterestFormBody flow={flow} />
        </div>
      </InterestCampaignStage>
    </DockScreen>
  );
}
