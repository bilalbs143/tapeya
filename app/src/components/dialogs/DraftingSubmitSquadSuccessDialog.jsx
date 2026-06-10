import { DialogHeaderRow, dialogPrimaryTitleClass, DialogTitle } from '@/ui/Dialog';

import { SuccessDialogBody } from './SuccessDialogBody';

export function DraftingSubmitSquadSuccessDialog({ teamName }) {
  const description = teamName
    ? `If you need any changes for ${teamName}, please contact the organizer.`
    : 'If you need any changes please contact organizer.';

  return (
    <>
      <DialogHeaderRow>
        <DialogTitle className={dialogPrimaryTitleClass}>Squad Submitted</DialogTitle>
      </DialogHeaderRow>
      <SuccessDialogBody title="Team has been submitted" description={description} />
    </>
  );
}

export default DraftingSubmitSquadSuccessDialog;
