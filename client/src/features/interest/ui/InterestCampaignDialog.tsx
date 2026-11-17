import { dialogStore } from '@/shared/dialogs';
import { DialogBody, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/shared/dialogs/BaseDialog';
import { cn } from '@/shared/lib/cn';
import { FormFieldsSkeleton } from '@/shared/ui/states';

import { useGetInterestCampaignQuery } from '../api/interestApi';
import type { InterestShowPayload } from '../model/schemas';
import { InterestCampaignBrandHeader, InterestCampaignWatermark } from './InterestCampaignBrand';
import { InterestFormActions, InterestFormBody } from './InterestFormBody';
import { InterestStatusView } from './InterestStatusView';
import { useInterestForm } from './useInterestForm';

const FORM_ID = 'interest-dialog-form';

/** Same scroll contract as SellerCategory / ManageTeam — DialogBody is the flex scroller. */
const SCROLL_BODY = 'relative min-h-0 flex-1 overflow-y-auto overscroll-y-contain';

export type InterestCampaignDialogProps = {
  slug: string;
  tournamentName?: string | undefined;
  /** Invoked by DialogHost when the user dismisses (X / backdrop / Escape). */
  onDismiss?: (() => void) | undefined;
};

/** Global interest dialog — show a light skeleton until the campaign payload is ready. */
export function InterestCampaignDialog({ slug, tournamentName }: InterestCampaignDialogProps) {
  const title = tournamentName?.trim() || 'Interest';
  const { data, isError } = useGetInterestCampaignQuery(slug, {
    skip: !slug,
    // Prefetch warms cache; refetch if older than 30s so admin edits still show.
    refetchOnMountOrArgChange: 30,
  });

  if (!slug || isError) {
    return (
      <DialogHeader>
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>This interest form is unavailable right now.</DialogDescription>
      </DialogHeader>
    );
  }

  if (!data) {
    return (
      <>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <DialogBody className={SCROLL_BODY} aria-busy="true" aria-label="Loading interest form">
          <FormFieldsSkeleton rows={5} />
        </DialogBody>
      </>
    );
  }

  return (
    <InterestCampaignDialogBody
      key={`${data.campaign.slug}-${data.mySubmission?.id ?? 'new'}-${data.mySubmission?.status ?? 'none'}`}
      slug={slug}
      title={tournamentName?.trim() || data.campaign.tournamentName}
      payload={data}
    />
  );
}

function InterestCampaignDialogBody({
  slug,
  title,
  payload,
}: {
  slug: string;
  title: string;
  payload: InterestShowPayload;
}) {
  if (payload.mySubmission) {
    return (
      <>
        <DialogHeader className="shrink-0 pb-2">
          <DialogTitle className="sr-only">{title}</DialogTitle>
        </DialogHeader>
        <DialogBody className={cn(SCROLL_BODY, 'pt-0 pb-6')}>
          <InterestCampaignWatermark logoUrl={payload.campaign.logoUrl} />
          <div className="relative z-10">
            <InterestStatusView
              campaign={payload.campaign}
              submission={payload.mySubmission}
              onDone={() => dialogStore.close()}
            />
          </div>
        </DialogBody>
      </>
    );
  }

  return <InterestCampaignDialogForm slug={slug} title={title} payload={payload} />;
}

function InterestCampaignDialogForm({
  slug,
  title,
  payload,
}: {
  slug: string;
  title: string;
  payload: InterestShowPayload;
}) {
  // Stay open — tag invalidation remounts into InterestStatusView.
  const flow = useInterestForm(slug, payload);
  const { actions, campaign } = flow;

  return (
    <>
      {/* Keep DialogHeader chrome so the absolute close sits above the banner, not on it. */}
      <DialogHeader className="shrink-0 pb-2">
        <DialogTitle className="sr-only">{title}</DialogTitle>
      </DialogHeader>

      <DialogBody className={cn(SCROLL_BODY, 'pt-0 pb-6')}>
        <InterestCampaignWatermark logoUrl={campaign.logoUrl} />
        <div className="relative z-10 flex flex-col gap-4">
          <InterestCampaignBrandHeader
            title={title}
            description={campaign.description}
            logoUrl={campaign.logoUrl}
            status={campaign.status}
            titleAs="h2"
          />
          <InterestFormBody flow={flow} formId={FORM_ID} />
        </div>
      </DialogBody>

      {actions.showSubmit ? (
        <DialogFooter className="shrink-0">
          <InterestFormActions flow={flow} formId={FORM_ID} />
        </DialogFooter>
      ) : null}
    </>
  );
}
