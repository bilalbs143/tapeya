import { useCallback, useMemo } from 'react';

import { useSearchParams } from 'react-router-dom';

import { ProfileHeader } from '@/components/ProfileHeader';
import { OrganizerProfileTabs } from '@/components/UserProfileTabs/OrganizerProfileTabs';
import { PlayerProfile } from '@/components/UserProfileTabs/PlayerProfile';
import { SponsorProfileTabs } from '@/components/UserProfileTabs/SponsorProfileTabs';
import { useDialog } from '@/context/DialogContext';
import { useToast } from '@/hooks/useToast';
import { useGetMeQuery } from '@/store/api/authApi';
import { useAppSelector } from '@/store/hooks';
import { selectUser } from '@/store/selectors';
import { profileListClass, profileTriggerClass, Tabs, TabsList, TabsTrigger } from '@/ui/Tabs';

const PROFILE_ROLES = [
  { value: 'player', label: 'As a Player' },
  { value: 'organizer', label: 'As an Organizer' },
  { value: 'sponsor', label: 'As a Sponsor' },
];

/** Role slugs the user holds. Returns [] when user has no roles; ['player'] when user not yet loaded. */
function getRoleSlugs(user) {
  if (user == null) return ['player'];
  const roles = user.roles;
  if (!roles || !Array.isArray(roles)) return [];
  const slugs = roles.map((r) => r?.slug).filter(Boolean);
  return slugs;
}

function ProfileContent({ activeRole, user }) {
  switch (activeRole) {
    case 'organizer':
      return <OrganizerProfileTabs />;
    case 'sponsor':
      return <SponsorProfileTabs />;
    case 'player':
      return <PlayerProfile user={user} />;
    default:
      return <p className="text-[13px] text-[#A2A6AB]">Unknown profile role. Select a tab above or go back.</p>;
  }
}

export default function Profile() {
  const { openDialog } = useDialog();
  const toast = useToast();
  const userFromStore = useAppSelector(selectUser);
  const { data: meResponse } = useGetMeQuery(undefined, {
    skip: !userFromStore?.id,
  });
  const user = meResponse?.data ?? userFromStore;
  const [searchParams, setSearchParams] = useSearchParams();

  const userRoleSlugs = useMemo(() => getRoleSlugs(user), [user]);

  const visibleRoleTabs = useMemo(() => PROFILE_ROLES.filter(({ value }) => userRoleSlugs.includes(value)), [userRoleSlugs]);

  const hasMultipleRoles = userRoleSlugs.length > 1;

  const activeRole = useMemo(() => {
    const fromUrl = searchParams.get('role');
    if (fromUrl && userRoleSlugs.includes(fromUrl)) return fromUrl;
    return userRoleSlugs[0] ?? null;
  }, [searchParams, userRoleSlugs]);

  // TODO: replace window.location.href with a public profile URL (e.g. /players/:id)
  // once a public profile route exists.
  const handleShare = useCallback(async () => {
    const url = window.location.href;

    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({ url });
      } catch {
        // User cancelled native share — no-op
      }
      return;
    }

    // No Web Share API (desktop) — copy link to clipboard
    try {
      await navigator.clipboard.writeText(url);
      toast.success('Link copied');
    } catch {
      // Clipboard blocked — silent
    }
  }, [toast]);

  const setActiveRole = (value) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set('role', value);
      next.delete('tab');
      return next;
    });
  };

  return (
    <div className="bg-black">
      <ProfileHeader user={user} onShare={handleShare} />

      {hasMultipleRoles && (
        <Tabs className="w-full" value={activeRole ?? ''} onValueChange={setActiveRole}>
          <div className="px-4 pt-10">
            <TabsList className={profileListClass}>
              {visibleRoleTabs.map(({ value, label }) => (
                <TabsTrigger key={value} value={value} className={profileTriggerClass}>
                  {label}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
        </Tabs>
      )}

      <div className="px-4 pt-6 pb-6">
        {userRoleSlugs.length === 0 ? (
          <p className="text-[13px] text-[#A2A6AB]">You don&apos;t have any profile roles yet.</p>
        ) : (
          <ProfileContent activeRole={activeRole ?? 'player'} user={user} />
        )}
      </div>

      <section className="border-t border-white/10 px-4 pt-8 pb-10" aria-labelledby="account-danger-heading">
        <h2 id="account-danger-heading" className="text-xs font-semibold tracking-wide text-white/50 uppercase">
          Account
        </h2>
        <p className="mt-2 text-[13px] leading-relaxed text-[#A2A6AB]">
          Permanently delete your Tapeya account and associated profile data. This action cannot be undone.
        </p>
        <button
          type="button"
          onClick={() => openDialog('deleteAccount')}
          className="mt-4 w-full rounded-lg border border-red-500/40 bg-red-950/30 py-3 text-sm font-semibold text-red-300 transition hover:bg-red-950/50"
        >
          Delete Account
        </button>
      </section>
    </div>
  );
}
