import { useMemo } from 'react';

import { useSearchParams } from 'react-router-dom';

import { ProfileHeader } from '@/components/ProfileHeader';
import { OrganizerProfileTabs } from '@/components/UserProfileTabs/OrganizerProfileTabs';
import { PlayerProfile } from '@/components/UserProfileTabs/PlayerProfile';
import { SponsorProfileTabs } from '@/components/UserProfileTabs/SponsorProfileTabs';
import { useAppSelector } from '@/store/hooks';
import { selectUser } from '@/store/selectors';
import {
  profileListClass,
  profileTriggerClass,
  Tabs,
  TabsList,
  TabsTrigger,
} from '@/ui/Tabs';

const PROFILE_ROLES = [
  { value: 'player', label: 'Player Profile' },
  { value: 'organizer', label: 'Organizer Profile' },
  { value: 'sponsor', label: 'Sponsor Profile' },
];

/** Role slugs the user holds. Returns [] when user has no roles; ['player'] when user not yet loaded. */
function getRoleSlugs(user) {
  if (user == null) return ['player'];
  const roles = user.roles;
  if (!roles || !Array.isArray(roles)) return [];
  const slugs = roles.map((r) => r?.slug).filter(Boolean);
  return slugs;
}

function ProfileContent({ activeRole }) {
  switch (activeRole) {
    case 'organizer':
      return <OrganizerProfileTabs />;
    case 'sponsor':
      return <SponsorProfileTabs />;
    case 'player':
      return <PlayerProfile />;
    default:
      return (
        <p className="text-[13px] text-[#A2A6AB]">
          Unknown profile role. Select a tab above or go back.
        </p>
      );
  }
}

export default function Profile() {
  const user = useAppSelector(selectUser);
  const [searchParams, setSearchParams] = useSearchParams();

  const userRoleSlugs = useMemo(() => getRoleSlugs(user), [user]);

  const visibleRoleTabs = useMemo(
    () => PROFILE_ROLES.filter(({ value }) => userRoleSlugs.includes(value)),
    [userRoleSlugs],
  );

  const hasMultipleRoles = userRoleSlugs.length > 1;

  const activeRole = useMemo(() => {
    const fromUrl = searchParams.get('role');
    if (fromUrl && userRoleSlugs.includes(fromUrl)) return fromUrl;
    return userRoleSlugs[0] ?? null;
  }, [searchParams, userRoleSlugs]);

  const setActiveRole = (value) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set('role', value);
      return next;
    });
  };

  return (
    <div className="bg-black">
      <ProfileHeader />

      {hasMultipleRoles && (
        <Tabs
          className="w-full"
          value={activeRole ?? ''}
          onValueChange={setActiveRole}
        >
          <div className="px-4 pt-6">
            <p className="mb-2 text-xs font-semibold tracking-wide text-white/60 uppercase">
              Switch profile
            </p>
            <TabsList className={profileListClass}>
              {visibleRoleTabs.map(({ value, label }) => (
                <TabsTrigger
                  key={value}
                  value={value}
                  className={profileTriggerClass}
                >
                  {label}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
        </Tabs>
      )}

      <div className="px-4 pt-10 pb-6">
        {userRoleSlugs.length === 0 ? (
          <p className="text-[13px] text-[#A2A6AB]">
            You don&apos;t have any profile roles yet.
          </p>
        ) : (
          <ProfileContent activeRole={activeRole ?? 'player'} />
        )}
      </div>
    </div>
  );
}
