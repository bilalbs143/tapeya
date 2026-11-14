import { dialogStore } from '@/shared/dialogs';
import { DialogBody, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/shared/dialogs/BaseDialog';
import { FormFieldsSkeleton } from '@/shared/ui/states';

import { useGetInterestCampaignQuery } from '../api/interestApi';
import type { InterestShowPayload } from '../model/schemas';
import { InterestCampaignBrandHeader, InterestCampaignStage } from './InterestCampaignBrand';
import { InterestFormActions, InterestFormBody } from './InterestFormBody';
import { useInterestForm } from './useInterestForm';

const FORM_ID = 'interest-dialog-form';

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
        <DialogBody aria-busy="true" aria-label="Loading interest form">
          <FormFieldsSkeleton rows={5} />
        </DialogBody>
      </>
    );
  }

  return (
    <InterestCampaignDialogForm
      key={`${data.campaign.slug}-${data.mySubmission?.id ?? 'new'}-${data.mySubmission?.status ?? 'none'}`}
      slug={slug}
      title={tournamentName?.trim() || data.campaign.tournamentName}
      payload={data}
    />
  );
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
  const flow = useInterestForm(slug, payload, {
    onSubmitted: () => dialogStore.close(),
  });
  const { actions, campaign } = flow;
  const showFooter = actions.showSubmit || actions.showWithdraw;

  return (
    <>
      <DialogHeader></DialogHeader>

      <InterestCampaignStage logoUrl={campaign.logoUrl}>
        <DialogBody className="pt-0 pb-6">
          <InterestCampaignBrandHeader
            title={title}
            description={campaign.description}
            logoUrl={campaign.logoUrl}
            status={campaign.status}
            titleAs="h2"
          />
          <InterestFormBody flow={flow} formId={FORM_ID} />
        </DialogBody>
      </InterestCampaignStage>

      {showFooter ? (
        <DialogFooter className="shrink-0">
          <InterestFormActions flow={flow} formId={FORM_ID} />
        </DialogFooter>
      ) : null}
    </>
  );
}
