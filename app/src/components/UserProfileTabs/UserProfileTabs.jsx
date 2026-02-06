import profileUserIcon from '@/assets/images/icons/profile-user.svg';
import userStatsIcon from '@/assets/images/icons/user-stats.svg';
import userPostsIcon from '@/assets/images/icons/user-posts.svg';
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  profileListClass,
  profileTriggerClass,
  profileTabIconClass,
  profileTabIconSize,
} from '@/ui/Tabs';
import { ProfileMetrics } from './ProfileMetrics';
import { ProfileOverview } from './ProfileOverview';
import { ProfileStats } from './ProfileStats';
import { ProfilePosts } from './ProfilePosts';

const CONTENT_WRAPPER_CLASS = 'px-4 pb-6 pt-1';

const TABS = [
  { value: 'overview', label: 'Overview', icon: profileUserIcon, Content: ProfileOverview },
  { value: 'stats', label: 'Stats', icon: userStatsIcon, Content: ProfileStats },
  { value: 'posts', label: 'Posts', icon: userPostsIcon, Content: ProfilePosts },
];

export function UserProfileTabs({ ranking, followers, likes }) {
  const metrics =
    ranking != null || followers != null || likes != null
      ? [
          { value: String(ranking ?? '—'), label: 'RANKING' },
          { value: String(followers ?? '—'), label: 'FOLLOWERS' },
          { value: String(likes ?? '—'), label: 'LIKES' },
        ]
      : undefined;

  return (
    <Tabs className="w-full" defaultValue="overview">
      <TabsList className={profileListClass}>
        {TABS.map(({ value, label, icon }) => (
          <TabsTrigger key={value} value={value} className={profileTriggerClass}>
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
