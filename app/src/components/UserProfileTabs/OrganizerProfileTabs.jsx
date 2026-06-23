import { CLOUDFRONT_APP_BASE } from '@/lib/constants/assets';
import { PROFILE_OVERVIEW_ROLE } from '@/lib/constants/profile';
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

import { OrganizerEvents } from './OrganizerEvents';
import { OrganizerStats } from './OrganizerStats';
import { ProfileMetrics } from './ProfileMetrics';
import { ProfileRoleOverview } from './ProfileRoleOverview';

const profileUserIcon = `${CLOUDFRONT_APP_BASE}/images/icons/profile-user.svg`;
const starMatchIcon = `${CLOUDFRONT_APP_BASE}/images/icons/star-match.svg`;
const userStatsIcon = `${CLOUDFRONT_APP_BASE}/images/icons/user-stats.svg`;

const CONTENT_WRAPPER_CLASS = 'pb-6 pt-1';

const ORGANIZER_METRICS = [
  { value: '—', label: 'TOURNAMENTS' },
  { value: '—', label: 'EVENTS' },
  { value: '—', label: 'TEAMS' },
];

const TABS = [
  {
    value: 'overview',
    label: 'Overview',
    icon: profileUserIcon,
    Content: null,
  },
  {
    value: 'events',
    label: 'Events',
    icon: starMatchIcon,
    Content: OrganizerEvents,
  },
  {
    value: 'stats',
    label: 'Stats',
    icon: userStatsIcon,
    Content: OrganizerStats,
  },
];

export function OrganizerProfileTabs({ tournaments, events, teams }) {
  const metrics =
    tournaments != null || events != null || teams != null
      ? [
          { value: String(tournaments ?? '—'), label: 'TOURNAMENTS' },
          { value: String(events ?? '—'), label: 'EVENTS' },
          { value: String(teams ?? '—'), label: 'TEAMS' },
        ]
      : ORGANIZER_METRICS;

  return (
    <Tabs className="w-full" defaultValue="overview">
      <TabsList className={profileListClass}>
        {TABS.map(({ value, label, icon }) => (
          <TabsTrigger key={value} value={value} className={profileTriggerClass}>
            <img src={icon} alt="" width={profileTabIconSize} height={profileTabIconSize} className={profileTabIconClass} />
            {label}
          </TabsTrigger>
        ))}
      </TabsList>
      <ProfileMetrics metrics={metrics} />
      <div className={CONTENT_WRAPPER_CLASS}>
        {TABS.map(({ value, Content }) => (
          <TabsContent key={value} value={value} className="focus:outline-none">
            {value === 'overview' ? (
              <ProfileRoleOverview role={PROFILE_OVERVIEW_ROLE.ORGANIZER} tournaments={tournaments} events={events} />
            ) : Content ? (
              <Content tournaments={tournaments} events={events} teams={teams} />
            ) : null}
          </TabsContent>
        ))}
      </div>
    </Tabs>
  );
}
