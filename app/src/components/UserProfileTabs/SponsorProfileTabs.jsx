import { useMemo } from 'react';

import { useSearchParams } from 'react-router-dom';

import {
  profileListClass,
  profileTabIconClass,
  profileTabIconSize,
  profileTriggerClass,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/ui/Tabs';

import { PROFILE_OVERVIEW_ROLE } from './constants';
import { ProfileMetrics } from './ProfileMetrics';
import { ProfileRoleOverview } from './ProfileRoleOverview';
import { SponsorStats } from './SponsorStats';
import { SponsorTeams } from './SponsorTeams';

const CLOUDFRONT_APP_BASE = 'https://d1nmw2vhka3zp0.cloudfront.net/app';

const profileUserIcon = `${CLOUDFRONT_APP_BASE}/images/icons/profile-user.svg`;
const teamIcon = `${CLOUDFRONT_APP_BASE}/images/icons/teams-white.svg`;
const userStatsIcon = `${CLOUDFRONT_APP_BASE}/images/icons/user-stats.svg`;

const CONTENT_WRAPPER_CLASS = 'px-4 pb-6 pt-1';

const SPONSOR_METRICS = [
  { value: '—', label: 'TEAMS' },
  { value: '—', label: 'PARTNERSHIPS' },
  { value: '—', label: 'REACH' },
];

const TABS = [
  {
    value: 'overview',
    label: 'Overview',
    icon: profileUserIcon,
    Content: null,
  },
  {
    value: 'teams',
    label: 'Teams',
    icon: teamIcon,
    Content: SponsorTeams,
  },
  {
    value: 'stats',
    label: 'Stats',
    icon: userStatsIcon,
    Content: SponsorStats,
  },
];

const VALID_SPONSOR_TABS = new Set(TABS.map((t) => t.value));

function sponsorTabFromSearchParams(searchParams) {
  const t = searchParams.get('tab');
  return t && VALID_SPONSOR_TABS.has(t) ? t : 'overview';
}

export function SponsorProfileTabs({ teams, partnerships, reach }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = useMemo(
    () => sponsorTabFromSearchParams(searchParams),
    [searchParams],
  );

  const handleSubTabChange = (value) => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.set('tab', value);
        return next;
      },
      { replace: true },
    );
  };

  const metrics =
    teams != null || partnerships != null || reach != null
      ? [
          { value: String(teams ?? '—'), label: 'TEAMS' },
          { value: String(partnerships ?? '—'), label: 'PARTNERSHIPS' },
          { value: String(reach ?? '—'), label: 'REACH' },
        ]
      : SPONSOR_METRICS;

  return (
    <Tabs
      className="w-full"
      value={activeTab}
      onValueChange={handleSubTabChange}
    >
      <TabsList className={profileListClass}>
        {TABS.map(({ value, label, icon }) => (
          <TabsTrigger
            key={value}
            value={value}
            className={profileTriggerClass}
          >
            <img
              src={icon}
              alt=""
              width={profileTabIconSize}
              height={profileTabIconSize}
              className={profileTabIconClass}
            />
            {label}
          </TabsTrigger>
        ))}
      </TabsList>
      <ProfileMetrics metrics={metrics} />
      <div className={CONTENT_WRAPPER_CLASS}>
        {TABS.map(({ value, Content }) => (
          <TabsContent key={value} value={value} className="focus:outline-none">
            {value === 'overview' ? (
              <ProfileRoleOverview role={PROFILE_OVERVIEW_ROLE.SPONSOR} />
            ) : (
              <Content />
            )}
          </TabsContent>
        ))}
      </div>
    </Tabs>
  );
}
