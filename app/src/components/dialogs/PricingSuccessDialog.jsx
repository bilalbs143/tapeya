import { DialogHeaderRow, dialogPrimaryTitleClass, DialogTitle } from '@/ui/Dialog';

import { SuccessDialogBody } from './SuccessDialogBody';

export function PricingSuccessDialog({ planName }) {
  const description = planName ? `Our team will contact you soon about the ${planName} plan.` : 'Our team will contact you soon.';

  return (
    <>
      <DialogHeaderRow>
        <DialogTitle className={dialogPrimaryTitleClass}>Pricing Request</DialogTitle>
      </DialogHeaderRow>
      <SuccessDialogBody title="Thank you for your request" description={description} />
    </>
  );
}

export default PricingSuccessDialog;
