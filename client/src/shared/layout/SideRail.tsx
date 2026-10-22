import { Link } from 'react-router-dom';

import { APP_PATHS } from '@/shared/config/paths';
import { SectionLabel } from '@/shared/layout/SectionLabel';
import { Button } from '@/shared/ui/Button';
import { Card } from '@/shared/ui/Card';
import { PlusIcon } from '@/shared/ui/icons';

/** Default desktop rail — override with `useShellRail`. */
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
