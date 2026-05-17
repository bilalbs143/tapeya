import { DialogHeaderRow, dialogPrimaryTitleClass, DialogTitle } from '@/ui/Dialog';

import { SuccessDialogBody } from './SuccessDialogBody';

export function TournamentSquadUpdatedSuccessDialog() {
  return (
    <>
      <DialogHeaderRow>
        <DialogTitle className={dialogPrimaryTitleClass}>Squad Updated</DialogTitle>
      </DialogHeaderRow>
      <SuccessDialogBody
        title="Squad has been submitted"
        description="You can edit the squad again from the team list if needed."
      />
    </>
  );
}

export default TournamentSquadUpdatedSuccessDialog;
