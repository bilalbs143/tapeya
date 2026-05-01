import { Dialog, DialogContentDark } from '@/ui/Dialog';

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
      <DialogContentDark
        className={`!h-auto !max-h-[90vh] ${contentClassName}`}
      >
        {children}
      </DialogContentDark>
    </Dialog>
  );
}

export default BaseDialog;
