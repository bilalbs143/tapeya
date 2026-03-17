import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { selectDialogKey, selectDialogProps } from '@/store/selectors';
import { closeDialog } from '@/store/slices/commonSlice';

import BaseDialog from './BaseDialog';
import DraftingSubmitSquadSuccessDialog from './DraftingSubmitSquadSuccessDialog';
import PricingSuccessDialog from './PricingSuccessDialog';
import TournamentSquadUpdatedSuccessDialog from './TournamentSquadUpdatedSuccessDialog';

const DIALOG_COMPONENTS = {
  pricingSuccess: PricingSuccessDialog,
  draftingSubmitSquadSuccess: DraftingSubmitSquadSuccessDialog,
  tournamentSquadUpdatedSuccess: TournamentSquadUpdatedSuccessDialog,
};

export function DialogManager() {
  const dispatch = useAppDispatch();
  const dialogKey = useAppSelector(selectDialogKey);
  const dialogProps = useAppSelector(selectDialogProps);

  if (!dialogKey || !DIALOG_COMPONENTS[dialogKey]) {
    return null;
  }

  const DialogBody = DIALOG_COMPONENTS[dialogKey];

  const handleOpenChange = (open) => {
    if (!open) {
      dispatch(closeDialog());
    }
  };

  return (
    <BaseDialog
      open
      onOpenChange={handleOpenChange}
      contentClassName="!h-[250px]"
    >
      <DialogBody {...dialogProps} />
    </BaseDialog>
  );
}

export default DialogManager;
