import { Link } from 'react-router-dom';

import { APP_PATHS } from '@/shared/config/paths';
import { SectionLabel } from '@/shared/layout/SectionLabel';
import { Button } from '@/shared/ui/Button';
import { Card } from '@/shared/ui/Card';
import { PlusIcon } from '@/shared/ui/icons';

/** Desktop “Start Something” card — always shown; pages may add more via `useShellRail`. */
export function SideRail() {
  return (
    <Card className="p-3.5">
      <SectionLabel>Start Something</SectionLabel>
      <div className="mt-2 flex flex-col gap-1.5">
        <Button asChild variant="positive" className="w-full justify-start">
          <Link to={APP_PATHS.quickMatch}>
            <PlusIcon className="h-3.5 w-3.5 shrink-0" strokeWidth={2.4} />
            Score a Match
          </Link>
        </Button>
        <Button asChild variant="secondary" className="w-full justify-start">
          <Link to={APP_PATHS.tournamentCreate}>Create a Tournament</Link>
        </Button>
        <Button asChild variant="ghost" className="w-full justify-start">
          <Link to={APP_PATHS.ranking}>Top Players</Link>
        </Button>
      </div>
    </Card>
  );
}

/** Pinned to the bottom of the desk rail. */
export function SideRailFooter() {
  return (
    <p className="text-dim shrink-0 px-1 pt-3 text-3xs leading-relaxed">
      <Link to={APP_PATHS.support} className="hover:text-ink">
        Help
      </Link>
      {' · '}
      <Link to={APP_PATHS.support} className="hover:text-ink">
        Support
      </Link>
      <br />
      <span className="font-mono mt-1 inline-block text-4xs tracking-[.04em]">© 2026 Tapeya</span>
    </p>
  );
}
