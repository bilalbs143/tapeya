/**
 * Shared constants for the Upcoming Tournaments feature.
 * Centralizes placeholder content, defaults, and config.
 */

export const PLACEHOLDER_BANNER =
  'https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=800&h=320&fit=crop';

export const PLACEHOLDER_CARD_IMAGE =
  'https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=400&h=240&fit=crop';

export const DEFAULT_DESCRIPTION =
  'Relive passion and excitement of Rawalpindi Royal vs Karachi Kids only on Tapeya';

export const DEFAULT_TOURNAMENT_FALLBACK = {
  name: 'TPL season 5 2026',
  tournament_name: 'TPL season 5 2026',
  start_date: '2026-06-10',
  end_date: '2026-06-15',
  description: DEFAULT_DESCRIPTION,
  likes_count: 5000,
  dislikes_count: 10,
  shares_count: 68,
};

/** Tab values for detail page */
export const DETAIL_TABS = {
  FIXTURES: 'fixtures',
  TEAMS: 'teams',
  SQUADS: 'squads',
};

export const DETAIL_TAB_VALUES = Object.values(DETAIL_TABS);

/** Placeholder card titles when no API data for the month */
export const PLACEHOLDER_TITLES = [
  'TPL season 5 2026',
  'SPL 2025 Tape Ball Cricket',
  'Jazz Tapeball Clash',
  'Tapeball Premier League',
  'Cricket Superpower League',
  'Tape Ball Championship',
];

/** Number of month tabs to show in the list */
export const MONTH_TABS_COUNT = 6;

/** Banner height on detail page (px) */
export const BANNER_HEIGHT_PX = 200;
