import { useCallback, useMemo } from 'react';

import { useSearchParams } from 'react-router-dom';

import { ProfileHeader } from '@/components/ProfileHeader';
import { OrganizerProfileTabs } from '@/components/UserProfileTabs/OrganizerProfileTabs';
import { PlayerProfile } from '@/components/UserProfileTabs/PlayerProfile';
import { SponsorProfileTabs } from '@/components/UserProfileTabs/SponsorProfileTabs';
import { useDialog } from '@/context/DialogContext';
import { useToast } from '@/hooks/useToast';
import { buildHttpsDeepLink } from '@/lib/deepLinks/deepLinkUtils';
import { shareLink } from '@/lib/share';
import { useGetMeQuery } from '@/store/api/authApi';
import { useAppSelector } from '@/store/hooks';
import { selectUser } from '@/store/selectors';
import { profileListClass, profileTriggerClass, Tabs, TabsList, TabsTrigger } from '@/ui/Tabs';

const PROFILE_VIEWS = [
  { value: 'player', label: 'As a Player' },
  { value: 'organizer', label: 'As an Organizer' },
  { value: 'sponsor', label: 'As a Sponsor' },
];

const PROFILE_VIEW_VALUES = PROFILE_VIEWS.map((v) => v.value);

function ProfileContent({ activeRole, user }) {
  switch (activeRole) {
    case 'organizer':
      return <OrganizerProfileTabs />;
    case 'sponsor':
      return <SponsorProfileTabs />;
    case 'player':
      return <PlayerProfile user={user} />;
    default:
      return <p className="text-muted text-[13px]">Unknown profile view. Select a tab above or go back.</p>;
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

  const activeRole = useMemo(() => {
    const fromUrl = searchParams.get('role');
    if (fromUrl && PROFILE_VIEW_VALUES.includes(fromUrl)) return fromUrl;
    return 'player';
  }, [searchParams]);

  // TODO: replace with a public profile URL (e.g. /players/:id) once that route exists.
  const handleShare = useCallback(async () => {
    const path = `${window.location.pathname}${window.location.search}`;
    const channel = await shareLink({ url: buildHttpsDeepLink(path) });
    if (channel === 'copy_link') toast.success('Link copied');
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

      <Tabs className="w-full" value={activeRole} onValueChange={setActiveRole}>
        <div className="px-4 pt-10">
          <TabsList className={profileListClass}>
            {PROFILE_VIEWS.map(({ value, label }) => (
              <TabsTrigger key={value} value={value} className={profileTriggerClass}>
                {label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>
      </Tabs>

      <div className="px-4 pt-6 pb-6">
        <ProfileContent activeRole={activeRole} user={user} />
      </div>

      <section className="border-t border-white/10 px-4 pt-8 pb-10" aria-labelledby="account-danger-heading">
        <h2 id="account-danger-heading" className="text-xs font-semibold tracking-wide text-white/50 uppercase">
          Account
        </h2>
        <p className="text-muted mt-2 text-[13px] leading-relaxed">
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
