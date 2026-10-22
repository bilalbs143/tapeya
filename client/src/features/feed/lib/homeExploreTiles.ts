import { APP_PATHS } from '@/shared/config/paths';
import { BarChartIcon, FilmIcon, QuickMatchIcon, TrophyIcon, VideoIcon } from '@/shared/ui/icons';

export const HOME_EXPLORE_TILES = [
  {
    label: 'Entertainment',
    href: APP_PATHS.entertainment,
    icon: FilmIcon,
  },
  {
    label: 'Rankings',
    href: APP_PATHS.ranking,
    icon: BarChartIcon,
  },
  {
    label: 'Upcoming',
    href: APP_PATHS.upcomingTournaments,
    icon: TrophyIcon,
  },
  {
    label: 'Quick Match',
    href: APP_PATHS.quickMatch,
    icon: QuickMatchIcon,
  },
  {
    label: 'Highlights',
    href: APP_PATHS.highlights,
    icon: VideoIcon,
  },
] as const;
