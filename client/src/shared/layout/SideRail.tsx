import { Link } from 'react-router-dom';

import { APP_PATHS } from '@/shared/config/paths';
import { SectionLabel } from '@/shared/layout/SectionLabel';
import { Card } from '@/shared/ui/Card';
import { FilmIcon, LiveIcon, TrophyIcon, VideoIcon } from '@/shared/ui/icons';

/** Explore-style links — Quick Match omitted (DesktopTopBar already owns Score). */
const START_SOMETHING_LINKS = [
  { label: 'Live Streaming', href: APP_PATHS.live, icon: LiveIcon },
  { label: 'Entertainment', href: APP_PATHS.entertainment, icon: FilmIcon },
  { label: 'Highlights', href: APP_PATHS.highlights, icon: VideoIcon },
  { label: 'Upcoming Tournaments', href: APP_PATHS.upcomingTournaments, icon: TrophyIcon },
] as const;

/** Desktop “Start Something” card — always shown; pages may add more via `useShellRail`. */
export function SideRail() {
  return (
    <Card className="p-3.5">
      <SectionLabel>Start Something</SectionLabel>
      <ul className="mt-2 flex flex-col gap-0.5">
        {START_SOMETHING_LINKS.map((item) => (
          <li key={item.href}>
            <Link
              to={item.href}
              className="text-body hover:bg-page-deep flex items-center gap-2.5 rounded-field px-2 py-2 text-2xs font-semibold"
            >
              <span className="border-border-subtle bg-surface grid h-8 w-8 shrink-0 place-items-center rounded-panel border">
                <item.icon className="text-ink h-4 w-4" />
              </span>
              <span className="min-w-0 flex-1 truncate text-ink">{item.label}</span>
            </Link>
          </li>
        ))}
      </ul>
    </Card>
  );
}

/** Pinned to the bottom of the desk rail. */
export function SideRailFooter() {
  return (
    <p className="text-dim shrink-0 px-1 pt-3 text-3xs leading-relaxed">
      <Link to={APP_PATHS.support} className="hover:text-ink">
        Help & Support
      </Link>
      <br />
      <span className="font-mono mt-1 inline-block text-4xs tracking-[.04em]">© 2026 Tapeya</span>
    </p>
  );
}
