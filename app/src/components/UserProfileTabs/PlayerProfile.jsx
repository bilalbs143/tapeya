import { CLOUDFRONT_APP_BASE } from '@/lib/constants/assets';
import { PROFILE_OVERVIEW_ROLE, PROFILE_SHELL_CLASS } from '@/lib/constants/profile';
import { getProfileRankingParamsByPlayingRole } from '@/lib/utils/playerUtils';
import { useGetPlayerRankingPositionQuery } from '@/store/api/playerApi';
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
import { ProfileRecentMatches } from './ProfileRecentMatches';
import { ProfileReels } from './ProfileReels';
import { ProfileRoleOverview } from './ProfileRoleOverview';
import { ProfileStats } from './ProfileStats';

const profileUserIcon = `${CLOUDFRONT_APP_BASE}/images/icons/profile-user.svg`;
const userPostsIcon = `${CLOUDFRONT_APP_BASE}/images/icons/user-posts.svg`;
const userStatsIcon = `${CLOUDFRONT_APP_BASE}/images/icons/user-stats.svg`;

const CONTENT_WRAPPER_CLASS = 'pb-6 pt-1';

const TABS = [
  {
    value: 'overview',
    label: 'Overview',
    icon: profileUserIcon,
    Content: null,
  },
  {
    value: 'stats',
    label: 'Stats',
    icon: userStatsIcon,
    Content: ProfileStats,
  },
  {
    value: 'reels',
    label: 'Reels',
    icon: userPostsIcon,
    Content: ProfileReels,
  },
];

/**
 * Player profile tabs + metrics. Open-tournament rank uses category/sort from playing role (bowler → wickets, etc.).
 */
export function PlayerProfile({ user }) {
  const userId = user?.id;
  const { category, sort } = getProfileRankingParamsByPlayingRole(user?.playing_role_enum);
  const { data: rankData, isLoading: rankLoading } = useGetPlayerRankingPositionQuery(
    { userId, category, sort },
    { skip: !userId },
  );

  const rankingDisplay = !userId ? '—' : rankLoading ? '…' : (rankData?.rank ?? '—');
  const followersDisplay = user?.followers_count != null ? String(user.followers_count) : '—';
  const reelsDisplay = user?.reels_count != null ? String(user.reels_count) : '0';

  const metrics = [
    {
      value: String(rankingDisplay),
      label: 'Ranking',
    },
    { value: followersDisplay, label: 'Followers' },
    { value: reelsDisplay, label: 'Reels' },
  ];

  return (
    <div className={PROFILE_SHELL_CLASS}>
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
            <TabsContent key={value} value={value} className="focus-visible:outline-none">
              {value === 'overview' ? (
                <>
                  <ProfileRoleOverview role={PROFILE_OVERVIEW_ROLE.PLAYER} />
                  <ProfileRecentMatches userId={userId} />
                </>
              ) : value === 'reels' ? (
                <ProfileReels userId={userId} />
              ) : (
                <Content />
              )}
            </TabsContent>
          ))}
        </div>
      </Tabs>
    </div>
  );
}
