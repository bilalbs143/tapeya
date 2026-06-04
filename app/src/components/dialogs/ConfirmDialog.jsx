/**
 * Generic confirmation dialog — reusable across the app via DialogContext.
 *
 * Usage:
 *   openDialog('confirm', {
 *     title: 'Remove Team',
 *     message: 'This action cannot be undone.',
 *     onConfirm: async () => { await doSomething(); },
 *   });
 */

import { useState } from 'react';

import { useDialog } from '@/context/DialogContext';
import {
  DialogHeaderClose,
  DialogHeaderRow,
  dialogPrimaryTitleClass,
  DialogSaveButton,
  DialogScrollBody,
  DialogTitle,
} from '@/ui/Dialog';

export function ConfirmDialog({ title = 'Confirm', message, children, confirmLabel = 'Confirm', onConfirm }) {
  const { closeDialog } = useDialog();
  const [isConfirming, setIsConfirming] = useState(false);

  const body = message ?? children;

  const handleConfirm = async () => {
    if (isConfirming) return;

    try {
      setIsConfirming(true);
      await onConfirm?.();
      closeDialog();
    } catch {
      // Caller handles errors (e.g. toast); keep dialog open for retry or dismiss via ×.
    } finally {
      setIsConfirming(false);
    }
  };

  return (
    <>
      <DialogHeaderRow
        closeSlot={
          isConfirming ? (
            <span className="inline-flex size-9 shrink-0 items-center justify-center text-[#A2A6AB]/25" aria-hidden>
              <svg width="20" height="20" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M11.7816 4.03157C12.0062 3.80702 12.0062 3.44295 11.7816 3.2184C11.5571 2.99385 11.193 2.99385 10.9685 3.2184L7.50005 6.68682L4.03164 3.2184C3.80708 2.99385 3.44301 2.99385 3.21846 3.2184C2.99391 3.44295 2.99391 3.80702 3.21846 4.03157L6.68688 7.49999L3.21846 10.9684C2.99391 11.193 2.99391 11.557 3.21846 11.7816C3.44301 12.0061 3.80708 12.0061 4.03164 11.7816L7.50005 8.31316L10.9685 11.7816C11.193 12.0061 11.5571 12.0061 11.7816 11.7816C12.0062 11.557 12.0062 11.193 11.7816 10.9684L8.31322 7.49999L11.7816 4.03157Z" />
              </svg>
            </span>
          ) : (
            <DialogHeaderClose aria-label="Close" />
          )
        }
      >
        <DialogTitle className={dialogPrimaryTitleClass}>{title}</DialogTitle>
      </DialogHeaderRow>

      <DialogScrollBody className="flex flex-col">
        {typeof body === 'string' ? <p className="text-center text-[13px] leading-relaxed text-[#A2A6AB]">{body}</p> : body}
      </DialogScrollBody>

      <DialogSaveButton disabled={isConfirming} onClick={handleConfirm}>
        {isConfirming ? 'Confirming…' : confirmLabel}
      </DialogSaveButton>
    </>
  );
}

export default ConfirmDialog;
