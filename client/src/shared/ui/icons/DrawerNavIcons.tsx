import { DrawerIcon } from './DrawerIcon';
import { QuickMatchIcon } from './QuickMatchIcon';

/** Drawer nav glyphs — shared stroke/size pairing via `DrawerIcon`. */
export const NAV_ICONS = {
  home: (
    <DrawerIcon strokeWidth={2.1}>
      <path d="M4 11 12 4l8 7v8a1 1 0 0 1-1 1h-4v-6H9v6H5a1 1 0 0 1-1-1z" />
    </DrawerIcon>
  ),
  score: (
    <DrawerIcon>
      <rect x="3" y="5" width="18" height="14" rx="2.5" />
      <path d="M8 9v6M12 9v6M16 9v6" />
    </DrawerIcon>
  ),
  quick: <QuickMatchIcon size="md" className="h-[19px] w-[19px]" strokeWidth={1.9} />,
  matches: (
    <DrawerIcon>
      <rect x="4" y="4" width="16" height="16" rx="3" />
      <path d="M8 9h6M8 13h8M8 17h4" />
    </DrawerIcon>
  ),
  tournaments: (
    <DrawerIcon>
      <path d="M8 4h8v5a4 4 0 0 1-8 0zM8 6H5v1a3 3 0 0 0 3 3M16 6h3v1a3 3 0 0 1-3 3M10 17h4M9 20h6" />
    </DrawerIcon>
  ),
  create: (
    <DrawerIcon>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8v8M8 12h8" />
    </DrawerIcon>
  ),
  stats: (
    <DrawerIcon>
      <rect x="4" y="4" width="16" height="16" rx="3" />
      <path d="M9 16v-4M13 16V9M17 16v-2" />
    </DrawerIcon>
  ),
  players: (
    <DrawerIcon>
      <circle cx="9" cy="8" r="3" />
      <path d="M3 20c0-3.3 2.7-5 6-5s6 1.7 6 5" />
      <path d="M16 6.5a3 3 0 0 1 0 5.8M18 20c0-2.4-1-4-2.5-4.6" />
    </DrawerIcon>
  ),
  orders: (
    <DrawerIcon>
      <path d="M7 3.5h10a1 1 0 0 1 1 1V20l-2.5-1.4L12 20l-3.5-1.4L6 20V4.5a1 1 0 0 1 1-1z" />
      <path d="M9.5 8.5h5M9.5 12h5M9.5 15.5h3" />
    </DrawerIcon>
  ),
  seller: (
    <DrawerIcon>
      <path d="M4 9h16v10a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1zM4 9l2-4h12l2 4M12 13v4M10 15h4" />
    </DrawerIcon>
  ),
  support: (
    <DrawerIcon>
      <path d="M4 13a8 8 0 0 1 16 0" />
      <rect x="3" y="13" width="4" height="6" rx="2" />
      <rect x="17" y="13" width="4" height="6" rx="2" />
    </DrawerIcon>
  ),
  logout: (
    <DrawerIcon className="text-danger-text">
      <path d="M15 5H7a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h8M12 12h8M17 9l3 3-3 3" />
    </DrawerIcon>
  ),
  live: (
    <DrawerIcon strokeWidth={2.1} className="h-[15px] w-[15px]">
      <circle cx="12" cy="12" r="2.4" fill="currentColor" stroke="none" />
      <path d="M8.15 7.7a5.5 5.5 0 0 0 0 8.6M15.85 7.7a5.5 5.5 0 0 1 0 8.6" />
      <path d="M5.2 4.9a9.5 9.5 0 0 0 0 14.2M18.8 4.9a9.5 9.5 0 0 1 0 14.2" />
    </DrawerIcon>
  ),
  /** Same bag mark as bottom-nav `ShopGlyph` — inherits row/CTA `currentColor`. */
  shop: (
    <DrawerIcon>
      <path d="M4 9h16l-1.2 11H5.2L4 9z" />
      <path d="M8 9V7a4 4 0 0 1 8 0v2" />
    </DrawerIcon>
  ),
} as const;

export type NavIconKey = keyof typeof NAV_ICONS;
