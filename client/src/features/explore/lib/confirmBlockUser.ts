import { getApiErrorMessage } from '@/shared/api/errors';
import { confirm } from '@/shared/dialogs';
import { toast } from '@/shared/ui/toast';

import { exploreApi } from '../api/exploreApi';

type ConfirmBlockArgs = {
  userId: number;
  userName?: string | undefined;
  isBlocked?: boolean | undefined;
  /** Called after a successful block (not unblock). */
  onBlocked?: (() => void) | undefined;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- RTK dispatch
  dispatch: any;
};

/** Confirm dialog + block/unblock mutation (posts, reels, profiles). */
export async function confirmBlockUser({
  userId,
  userName = 'this user',
  isBlocked = false,
  onBlocked,
  dispatch,
}: ConfirmBlockArgs): Promise<boolean> {
  const ok = await confirm({
    title: isBlocked ? 'Unblock User' : 'Block User',
    message: isBlocked
      ? `Unblock ${userName}? Their posts may appear in your feed again.`
      : `Block ${userName}? Their content will be removed from your feed immediately. Tapeya is also notified so we can review for Terms violations (zero tolerance for objectionable content and abuse).`,
    confirmLabel: isBlocked ? 'Unblock' : 'Block',
    tone: 'danger',
  });
  if (!ok) return false;

  try {
    if (isBlocked) {
      await dispatch(exploreApi.endpoints.unblockUser.initiate(userId)).unwrap();
      toast({ title: 'User Unblocked', tone: 'success' });
    } else {
      await dispatch(exploreApi.endpoints.blockUser.initiate({ userId, reason: 'other' })).unwrap();
      toast({ title: 'User Blocked', tone: 'success' });
      onBlocked?.();
    }
    return true;
  } catch (err) {
    toast({ title: getApiErrorMessage(err, 'Could not update block status.'), tone: 'error' });
    return false;
  }
}
