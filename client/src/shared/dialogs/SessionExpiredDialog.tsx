import { Button } from '@/shared/ui/Button';

import { DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './BaseDialog';

export type SessionExpiredDialogProps = {
  onLogIn: () => void;
};

/** Opened from `baseApi` 401 handler — cross-cutting, no owning feature. §13 */
export function SessionExpiredDialog({ onLogIn }: SessionExpiredDialogProps) {
  return (
    <>
      <DialogHeader>
        <DialogTitle>Session Expired</DialogTitle>
        <DialogDescription>Please log in again to continue.</DialogDescription>
      </DialogHeader>
      <DialogFooter>
        <Button onClick={onLogIn}>Log In</Button>
      </DialogFooter>
    </>
  );
}
