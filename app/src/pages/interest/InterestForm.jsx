import { useNavigate, useParams } from 'react-router-dom';

import { AppSubpageHeader } from '@/components/AppSubpageHeader';
import { InterestFormContent } from '@/components/interest/InterestFormContent';
import { getApiErrorMessage } from '@/lib/apiErrors';
import { useGetInterestCampaignQuery } from '@/store/api/tournamentInterestApi';
import { Button } from '@/ui/Button';
import { Container } from '@/ui/Container';
import { ListEmpty, ListError } from '@/ui/ListState';
import { PageLoader } from '@/ui/Loader';

export default function InterestForm() {
  const { slug } = useParams();
  const navigate = useNavigate();

  const { data: payload, isLoading, isError, error, refetch } = useGetInterestCampaignQuery({ slug }, { skip: !slug });
  const campaign = payload?.campaign;

  if (isLoading) {
    return (
      <div className="bg-black">
        <AppSubpageHeader
          sticky
          title={<h1 className="min-w-0 truncate px-1 text-center text-[15px] leading-snug font-bold text-white/80">Interest</h1>}
        />
        <Container className="pb-8">
          <PageLoader label="Loading form" />
        </Container>
      </div>
    );
  }

  if (isError || !campaign) {
    const isNotFound = error?.status === 404;
    return (
      <div className="bg-black">
        <AppSubpageHeader
          sticky
          title={<h1 className="min-w-0 truncate px-1 text-center text-[15px] leading-snug font-bold text-white/80">Interest</h1>}
        />
        <Container className="pb-8">
          {isNotFound ? (
            <ListEmpty
              title="Interest Form Not Found."
              description="The link may be wrong or it has been removed."
              action={
                <Button
                  type="button"
                  variant="orange"
                  size="dialog"
                  className="w-full sm:w-[220px]"
                  onClick={() => navigate('/upcoming-tournaments')}
                >
                  Browse Tournaments
                </Button>
              }
            />
          ) : (
            <ListError message={getApiErrorMessage(error, 'Could not load this interest form.')} onRetry={() => refetch()} />
          )}
        </Container>
      </div>
    );
  }

  const headerTitle =
    campaign.tournament_name != null && campaign.tournament_name !== '' ? (
      <h1 className="min-w-0 truncate px-1 text-center text-[15px] leading-snug font-bold text-white">
        {campaign.tournament_name}
      </h1>
    ) : (
      <h1 className="min-w-0 truncate px-1 text-center text-[15px] leading-snug font-bold text-white/80">Interest</h1>
    );

  return (
    <div className="relative bg-black">
      <AppSubpageHeader sticky title={headerTitle} />
      {campaign.logo_url && (
        <div className="pointer-events-none fixed inset-x-0 top-16 bottom-0 z-0 flex items-center justify-center" aria-hidden>
          <img src={campaign.logo_url} alt="" className="max-h-[55vh] max-w-[70vw] object-contain opacity-[0.2]" />
        </div>
      )}
      <Container className="relative z-10 pb-8">
        <InterestFormContent slug={slug} variant="page" idPrefix="interest" payload={payload} />
      </Container>
    </div>
  );
}
