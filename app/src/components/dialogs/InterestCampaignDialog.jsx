import { useState } from 'react';

import { INTEREST_CAMPAIGN_FORM_ID, InterestFormContent } from '@/components/interest/InterestFormContent';
import { useDialog } from '@/context/DialogContext';
import { useGetInterestCampaignQuery } from '@/store/api/tournamentInterestApi';
import { DialogHeaderRow, dialogPrimaryTitleClass, DialogSaveButton, DialogScrollBody, DialogTitle } from '@/ui/Dialog';

export function InterestCampaignDialog({ slug, tournamentName }) {
  const { closeDialog } = useDialog();
  const { data: payload } = useGetInterestCampaignQuery({ slug }, { skip: !slug });
  const logoUrl = payload?.campaign?.logo_url ?? null;
  const [submitUi, setSubmitUi] = useState({
    visible: false,
    disabled: true,
    label: "I'm Interested",
  });

  return (
    <>
      <DialogHeaderRow>
        <DialogTitle className={dialogPrimaryTitleClass}>{tournamentName?.trim() || 'Interest'}</DialogTitle>
      </DialogHeaderRow>

      <div className="relative flex min-h-0 flex-1 flex-col">
        {logoUrl && (
          <div className="pointer-events-none absolute inset-0 z-0 flex items-center justify-center" aria-hidden>
            <img src={logoUrl} alt="" className="max-h-[55%] max-w-[70%] object-contain opacity-[0.2]" />
          </div>
        )}

        <DialogScrollBody className="relative z-10">
          <InterestFormContent
            slug={slug}
            variant="dialog"
            idPrefix="interest-dialog"
            payload={payload}
            formId={INTEREST_CAMPAIGN_FORM_ID}
            onSubmitUiChange={setSubmitUi}
            onSubmitted={closeDialog}
          />
        </DialogScrollBody>
      </div>

      {submitUi.visible && (
        <DialogSaveButton form={INTEREST_CAMPAIGN_FORM_ID} type="submit" disabled={submitUi.disabled}>
          {submitUi.label}
        </DialogSaveButton>
      )}
    </>
  );
}

export default InterestCampaignDialog;
