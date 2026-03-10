import { Dialog, DialogContentProfile } from '@/ui/Dialog';

/**
 * Base dialog wrapper for app dialogs.
 * Centralizes height/max-height and basic layout.
 */
export function BaseDialog({
  open,
  onOpenChange,
  children,
  contentClassName = '',
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContentProfile
        className={`!h-auto !max-h-[90vh] ${contentClassName}`}
      >
        {children}
      </DialogContentProfile>
    </Dialog>
  );
}

export default BaseDialog;
