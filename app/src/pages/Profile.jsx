import { ProfileHeader } from '@/components/ProfileHeader';
import { UserEdit } from '@/components/UserProfileTabs/UserEdit';
import { useDialog } from '@/context/DialogContext';
import { PROFILE_SHELL_CLASS } from '@/lib/constants/profile';
import { useGetMeQuery } from '@/store/api/authApi';
import { useAppSelector } from '@/store/hooks';
import { selectUser } from '@/store/selectors';
import { Button } from '@/ui/Button';

/**
 * Account edit screen (`/profile`).
 * Public main profile lives at `/reels/u/:userId` (bottom-nav Profile tab).
 */
export default function Profile() {
  const { openDialog } = useDialog();
  const userFromStore = useAppSelector(selectUser);
  const { data: meResponse } = useGetMeQuery(undefined, {
    skip: !userFromStore?.id,
  });
  const user = meResponse?.data ?? userFromStore;

  return (
    <div className="min-h-full bg-black pb-4">
      <ProfileHeader user={user} />

      <div className={`${PROFILE_SHELL_CLASS} flex flex-col gap-4 px-4 pt-5 pb-2`}>
        <UserEdit />

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
