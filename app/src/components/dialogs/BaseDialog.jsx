import { Dialog, DialogContentDark } from '@/ui/Dialog';

/**
 * Base dialog wrapper for all app dialogs.
 *
 * Provides the full structural shell — identical to UserEdit:
 *   DialogContentDark
 *     └─ div.flex.min-h-0.flex-1.flex-col   ← owned here; children must NOT add their own
 *          └─ {children}                     ← DialogHeaderRow / DialogScrollBody / DialogSaveButton
 *
 * @param {string} [height='!h-auto']      Override the panel height (e.g. '!h-[min(90vh,600px)]').
 * @param {string} [contentClassName='']   Extra classes appended to DialogContentDark (min-h, max-h, etc.).
 */
export function BaseDialog({ open, onOpenChange, children, height = '!h-auto', contentClassName = '' }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContentDark className={`${height} !max-h-[90vh] ${contentClassName}`}>
        <div className="flex min-h-0 flex-1 flex-col">{children}</div>
      </DialogContentDark>
    </Dialog>
  );
}

export default BaseDialog;
