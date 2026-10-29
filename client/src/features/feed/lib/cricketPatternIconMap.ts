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
} from '../ui/cricketPatternIcons';

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
} as const;

export type CricketIconKey = keyof typeof CRICKET_ICON_MAP;
