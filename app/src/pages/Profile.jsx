import { useCallback } from 'react';

import { ProfileHeader } from '@/components/ProfileHeader';
import { ProfileRoleOverview } from '@/components/UserProfileTabs/ProfileRoleOverview';
import { useDialog } from '@/context/DialogContext';
import { useToast } from '@/hooks/useToast';
import { PROFILE_SHELL_CLASS } from '@/lib/constants/profile';
import { buildHttpsDeepLink } from '@/lib/deepLinks/deepLinkUtils';
import { shareLink } from '@/lib/share';
import { useGetMeQuery } from '@/store/api/authApi';
import { useAppSelector } from '@/store/hooks';
import { selectUser } from '@/store/selectors';
import { Button } from '@/ui/Button';

/**
 * Single account profile for every user — header and details.
 * Career stats live at `/stats`; reels at `/reels`.
 */
export default function Profile() {
  const { openDialog } = useDialog();
  const toast = useToast();
  const userFromStore = useAppSelector(selectUser);
  const { data: meResponse } = useGetMeQuery(undefined, {
    skip: !userFromStore?.id,
  });
  const user = meResponse?.data ?? userFromStore;

  // TODO: replace with a public profile URL (e.g. /players/:id) once that route exists.
  const handleShare = useCallback(async () => {
    const path = window.location.pathname;
    const channel = await shareLink({ url: buildHttpsDeepLink(path) });
    if (channel === 'copy_link') toast.success('Link copied');
  }, [toast]);

  return (
    <div className="min-h-full bg-black pb-4">
      <ProfileHeader user={user} onShare={handleShare} />

      <div className={`${PROFILE_SHELL_CLASS} flex flex-col gap-4 px-4 pt-5 pb-2`}>
        <ProfileRoleOverview />

        <section
          className="rounded-[17px] border border-red-500/25 bg-red-950/20 px-4 py-5 sm:px-5"
          aria-labelledby="account-danger-heading"
        >
          <h2 id="account-danger-heading" className="text-[15px] font-bold text-white">
            Account
          </h2>
          <p className="text-muted mt-2 text-[13px] leading-relaxed">
            Permanently delete your Tapeya account and associated profile data. This cannot be undone.
          </p>
          <Button
            type="button"
            variant="danger"
            className="mt-4 w-full py-3 text-sm sm:w-auto sm:min-w-[180px]"
            onClick={() => openDialog('deleteAccount')}
          >
            Delete Account
          </Button>
        </section>
      </div>
    </div>
  );
}
