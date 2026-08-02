/**
 * Lookup map for text-post background accent icons.
 * Kept separate from icon components so Fast Refresh can hot-reload the JSX file.
 */

import {
  BallIcon,
  BatIcon,
  BoltIcon,
  ConfettiIcon,
  CrownIcon,
  RibbonIcon,
  SparkleIcon,
  StadiumLightIcon,
  StarIcon,
  TrophyIcon,
  WicketsIcon,
} from '@/components/feed/cricketPatternIcons';

export const CRICKET_ICON_MAP = {
  ball: BallIcon,
  bat: BatIcon,
  bolt: BoltIcon,
  confetti: ConfettiIcon,
  crown: CrownIcon,
  ribbon: RibbonIcon,
  sparkle: SparkleIcon,
  stadiumLight: StadiumLightIcon,
  star: StarIcon,
  trophy: TrophyIcon,
  wickets: WicketsIcon,
};
