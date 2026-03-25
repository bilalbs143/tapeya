import profileUserIcon from '@/assets/images/icons/profile-user.svg';
import starMatchIcon from '@/assets/images/icons/star-match.svg';
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

import { PROFILE_OVERVIEW_ROLE } from './constants';
import { OrganizerEvents } from './OrganizerEvents';
import { OrganizerStats } from './OrganizerStats';
import { ProfileMetrics } from './ProfileMetrics';
import { ProfileRoleOverview } from './ProfileRoleOverview';

const CONTENT_WRAPPER_CLASS = 'px-4 pb-6 pt-1';

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
              <ProfileRoleOverview
                role={PROFILE_OVERVIEW_ROLE.ORGANIZER}
                tournaments={tournaments}
                events={events}
              />
            ) : (
              <Content tournaments={tournaments} events={events} teams={teams} />
            )}
          </TabsContent>
        ))}
      </div>
    </Tabs>
  );
}
