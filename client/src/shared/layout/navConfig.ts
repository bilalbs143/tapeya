import type { ComponentType } from 'react';

import { APP_PATHS } from '@/shared/config/paths';
import { HomeGlyph, LiveGlyph, MatchesGlyph, ReelsGlyph, ShopGlyph, YouGlyph } from '@/shared/ui/icons/NavGlyphs';

export type NavGlyphProps = { className?: string; active?: boolean };

export type PrimaryNavItem = {
  id: string;
  to: string;
  label: string;
  Glyph: ComponentType<NavGlyphProps>;
  /** Live tab red dot — auth BottomNav/SideNav. */
  dot?: boolean;
  /** Exact match only (Home). */
  end?: boolean;
  /** SideNav-only (Matches) — not in BottomNav. */
  railOnly?: boolean;
  isActive: (pathname: string) => boolean;
};

/** Primary nav items — BottomNav omits `railOnly` (Matches). */
export const PRIMARY_NAV: readonly PrimaryNavItem[] = [
  {
    id: 'home',
    to: APP_PATHS.home,
    label: 'Home',
    Glyph: HomeGlyph,
    end: true,
    isActive: (pathname) =>
      pathname === APP_PATHS.home ||
      pathname.startsWith('/feed/') ||
      pathname === APP_PATHS.discover ||
      pathname.startsWith(APP_PATHS.create),
  },
  {
    id: 'shop',
    to: APP_PATHS.shop,
    label: 'Shop',
    Glyph: ShopGlyph,
    isActive: (pathname) => pathname.startsWith(APP_PATHS.shop),
  },
  {
    id: 'reels',
    to: APP_PATHS.reels,
    label: 'Reels',
    Glyph: ReelsGlyph,
    isActive: (pathname) => pathname.startsWith(APP_PATHS.reels),
  },
  {
    id: 'live',
    to: APP_PATHS.live,
    label: 'Live',
    Glyph: LiveGlyph,
    dot: true,
    isActive: (pathname) => pathname.startsWith(APP_PATHS.live),
  },
  {
    id: 'matches',
    to: APP_PATHS.matches,
    label: 'Matches',
    Glyph: MatchesGlyph,
    railOnly: true,
    isActive: (pathname) => pathname.startsWith(APP_PATHS.matches),
  },
  {
    id: 'you',
    to: APP_PATHS.you,
    label: 'You',
    Glyph: YouGlyph,
    isActive: (pathname) => pathname.startsWith(APP_PATHS.you) || pathname.startsWith(APP_PATHS.profile),
  },
] as const;

export const CREATE_NAV = {
  id: 'create',
  to: APP_PATHS.tournamentCreate,
  label: 'Create',
} as const;

export const BOTTOM_NAV = PRIMARY_NAV.filter((item) => !item.railOnly);
export const SIDE_NAV = PRIMARY_NAV;
