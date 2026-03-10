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

function getRoleSlugs(user) {
  const roles = user?.roles;
  if (!roles || !Array.isArray(roles)) return ['player'];
  const slugs = roles.map((r) => r?.slug).filter(Boolean);
  return slugs.length ? slugs : ['player'];
}

function ProfileContent({ activeRole }) {
  switch (activeRole) {
    case 'organizer':
      return <OrganizerProfileTabs />;
    case 'sponsor':
      return <SponsorProfileTabs />;
    default:
      return <PlayerProfile />;
  }
}

export default function Profile() {
  const user = useAppSelector(selectUser);
  const [searchParams, setSearchParams] = useSearchParams();

  const userRoleSlugs = useMemo(() => getRoleSlugs(user), [user]);
  const hasMultipleRoles = userRoleSlugs.length > 1;

  const activeRole = useMemo(() => {
    const fromUrl = searchParams.get('role');
    if (fromUrl && PROFILE_ROLES.some((r) => r.value === fromUrl))
      return fromUrl;
    return userRoleSlugs[0] ?? 'player';
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

      {hasMultipleRoles ? (
        <Tabs
          className="w-full"
          value={activeRole}
          onValueChange={setActiveRole}
        >
          <div className="px-4 pt-6">
            <p className="mb-2 text-xs font-semibold tracking-wide text-white/60 uppercase">
              Switch profile
            </p>
            <TabsList className={profileListClass}>
              {PROFILE_ROLES.map(({ value, label }) => (
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
          <div className="px-4 pt-10 pb-6">
            <ProfileContent activeRole={activeRole} />
          </div>
        </Tabs>
      ) : (
        <div className="px-4 pt-10 pb-6">
          <ProfileContent activeRole={activeRole} />
        </div>
      )}
    </div>
  );
}
