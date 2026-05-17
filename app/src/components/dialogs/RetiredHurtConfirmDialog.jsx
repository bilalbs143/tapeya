/**
 * RetiredHurtConfirmDialog
 *
 * Confirms that the current striker will leave the crease as "Retired Hurt".
 * This does NOT count as a wicket; the batsman may return later in the innings.
 */

import { useDialog } from '@/context/DialogContext';
import { DialogHeaderRow, dialogPrimaryTitleClass, DialogSaveButton, DialogScrollBody, DialogTitle } from '@/ui/Dialog';

export function RetiredHurtConfirmDialog({ batsmanName, onConfirm }) {
  const { closeDialog } = useDialog();
  return (
    <>
      <DialogHeaderRow>
        <DialogTitle className={dialogPrimaryTitleClass}>Retired Hurt?</DialogTitle>
      </DialogHeaderRow>
      <DialogScrollBody className="pb-2">
        <p className="text-center text-[13px] text-white/60">
          <span className="font-semibold text-white">{batsmanName || 'Batsman'}</span> will leave the crease. This does NOT count
          as a wicket and they may return later.
        </p>
      </DialogScrollBody>
      <DialogSaveButton
        onClick={() => {
          onConfirm?.();
          closeDialog();
        }}
      >
        Confirm
      </DialogSaveButton>
    </>
  );
}

export default RetiredHurtConfirmDialog;
