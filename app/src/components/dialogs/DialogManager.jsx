import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { selectDialogKey, selectDialogProps } from '@/store/selectors';
import { closeDialog } from '@/store/slices/commonSlice';

import BaseDialog from './BaseDialog';
import DeleteAccountDialog from './DeleteAccountDialog';
import DraftingSubmitSquadSuccessDialog from './DraftingSubmitSquadSuccessDialog';
import PricingSuccessDialog from './PricingSuccessDialog';
import ProfileStrengthReminderDialog from './ProfileStrengthReminderDialog';
import TournamentSquadUpdatedSuccessDialog from './TournamentSquadUpdatedSuccessDialog';

const DIALOG_COMPONENTS = {
  pricingSuccess: PricingSuccessDialog,
  draftingSubmitSquadSuccess: DraftingSubmitSquadSuccessDialog,
  tournamentSquadUpdatedSuccess: TournamentSquadUpdatedSuccessDialog,
  profileStrengthReminder: ProfileStrengthReminderDialog,
  deleteAccount: DeleteAccountDialog,
};

/** Extra Tailwind classes merged onto BaseDialog content (defaults for short modals). */
const DIALOG_CONTENT_CLASS_BY_KEY = {
  deleteAccount: '!min-h-[300px]',
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

  const contentClassName =
    DIALOG_CONTENT_CLASS_BY_KEY[dialogKey] ?? '!h-[250px]';

  return (
    <BaseDialog
      open
      onOpenChange={handleOpenChange}
      contentClassName={contentClassName}
    >
      <DialogBody {...dialogProps} />
    </BaseDialog>
  );
}

export default DialogManager;
