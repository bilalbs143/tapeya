import profileUserIcon from '@/assets/images/icons/profile-user.svg';
import teamIcon from '@/assets/images/icons/team-icon.svg';
import userStatsIcon from '@/assets/images/icons/user-stats.svg';
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

import { ProfileMetrics } from './ProfileMetrics';
import { SponsorOverview } from './SponsorOverview';
import { SponsorStats } from './SponsorStats';
import { SponsorTeams } from './SponsorTeams';

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
    Content: SponsorOverview,
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

export function SponsorProfileTabs({ teams, partnerships, reach }) {
  const metrics =
    teams != null || partnerships != null || reach != null
      ? [
          { value: String(teams ?? '—'), label: 'TEAMS' },
          { value: String(partnerships ?? '—'), label: 'PARTNERSHIPS' },
          { value: String(reach ?? '—'), label: 'REACH' },
        ]
      : SPONSOR_METRICS;

  return (
    <Tabs className="w-full" defaultValue="overview">
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
            <Content />
          </TabsContent>
        ))}
      </div>
    </Tabs>
  );
}
