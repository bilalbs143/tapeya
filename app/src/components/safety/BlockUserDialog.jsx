/**
 * Confirm block — removes the user from the blocker’s feed immediately and notifies Tapeya.
 */

import { useState } from 'react';

import { useBlockUserMutation, useUnblockUserMutation } from '@/store/api/userApi';
import { BottomSheet } from '@/ui/BottomSheet';
import { Button } from '@/ui/Button';

/**
 * @param {{
 *   open: boolean,
 *   onClose: () => void,
 *   userId: number|string,
 *   userName?: string,
 *   isBlocked?: boolean,
 *   onBlocked?: () => void,
 * }} props
 */
export default function BlockUserDialog({ open, onClose, userId, userName = 'this user', isBlocked = false, onBlocked }) {
  const [error, setError] = useState('');
  const [blockUser, { isLoading: blocking }] = useBlockUserMutation();
  const [unblockUser, { isLoading: unblocking }] = useUnblockUserMutation();
  const busy = blocking || unblocking;

  const handleOpenChange = (next) => {
    if (!next) {
      setError('');
      onClose?.();
    }
  };

  const handleConfirm = async () => {
    setError('');
    try {
      if (isBlocked) {
        await unblockUser(userId).unwrap();
      } else {
        await blockUser({ userId, reason: 'other' }).unwrap();
        onBlocked?.();
      }
      handleOpenChange(false);
    } catch (err) {
      setError(err?.data?.message || 'Could not update block status.');
    }
  };

  return (
    <BottomSheet
      open={open}
      onOpenChange={handleOpenChange}
      title={isBlocked ? 'Unblock User' : 'Block User'}
      footer={
        <div className="flex gap-2">
          <Button
            type="button"
            variant="secondary"
            onClick={() => handleOpenChange(false)}
            className="flex-1 rounded-full px-4 py-3 text-sm"
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="orange"
            loading={busy}
            disabled={busy}
            onClick={handleConfirm}
            className="flex-1 rounded-full px-4 py-3 text-sm"
          >
            {isBlocked ? 'Unblock' : 'Block'}
          </Button>
        </div>
      }
    >
      <div className="space-y-3 py-2">
        {isBlocked ? (
          <p className="text-[14px] leading-relaxed text-white/85">
            Unblock <span className="font-semibold text-white">{userName}</span>? Their posts may appear in your feed again.
          </p>
        ) : (
          <>
            <p className="text-[14px] leading-relaxed text-white/85">
              Block <span className="font-semibold text-white">{userName}</span>? Their content will be removed from your feed
              immediately.
            </p>
            <p className="text-muted text-[13px] leading-relaxed">
              Tapeya is also notified so we can review for Terms violations (zero tolerance for objectionable content and abuse).
            </p>
          </>
        )}
        {error ? <p className="text-sm text-red-400">{error}</p> : null}
      </div>
    </BottomSheet>
  );
}
