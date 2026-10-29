import { Link } from 'react-router-dom';

import { APP_PATHS } from '@/shared/config/paths';
import { DockScreen } from '@/shared/layout';
import { Button } from '@/shared/ui/Button';
import { ErrorState, Skeleton } from '@/shared/ui/states';

import { matchRoutes } from '../routes';
import { StartMatchFormBody, StartMatchFormFooter } from '../ui/StartMatchFormBody';
import { useStartMatchForm } from '../ui/useStartMatchForm';

/** POST tournament match → toss page (or save fixture). */
export default function StartMatchPage() {
  const flow = useStartMatchForm();
  const { navigate, tournaments, tournamentsLoading, tournamentsError, refetchTournaments, selected } = flow;

  const listBack = () => navigate(matchRoutes.list());
  const formBack = () => navigate(selected ? `${APP_PATHS.tournaments}/${selected.id}` : matchRoutes.list());

  const ready = !tournamentsLoading && !tournamentsError && tournaments.length > 0;
  const emptyTournaments = !tournamentsLoading && !tournamentsError && tournaments.length === 0;

  return (
    <DockScreen
      title="Start a Match"
      subtitle={
        ready
          ? 'Everything here is fixed once ball 1 is scored'
          : emptyTournaments
            ? 'No Tournament Ready'
            : 'Pick Tournament and Sides'
      }
      onBack={ready ? formBack : listBack}
      footer={ready ? <StartMatchFormFooter flow={flow} /> : undefined}
    >
      {tournamentsLoading && tournaments.length === 0 ? (
        <div className="flex flex-col gap-3 px-4 pt-4">
          <Skeleton className="h-12 w-full rounded-field" aria-label="Loading Tournaments" />
          <Skeleton className="h-24 w-full rounded-field" />
        </div>
      ) : tournamentsError ? (
        <div className="px-4 py-8">
          <ErrorState
            title="Couldn’t Load Tournaments"
            description="Organizer tournaments come from the server."
            onRetry={() => void refetchTournaments()}
          />
        </div>
      ) : emptyTournaments ? (
        <div className="flex flex-col gap-3 px-4 py-8 text-center">
          <h1 className="text-title-sm leading-normal font-extrabold tracking-[-.02em] text-ink">
            No tournament is ready for a fixture
          </h1>
          <p className="text-body text-xs leading-relaxed text-muted">
            A fixture needs a tournament with at least two teams attached. You can still score a one-off game without
            any of that.
          </p>
          <div className="mt-2 flex flex-col gap-2">
            <Button asChild>
              <Link to={APP_PATHS.quickMatch}>Score a Quick Match</Link>
            </Button>
            <Button asChild variant="secondary">
              <Link to={APP_PATHS.tournaments}>My Tournaments</Link>
            </Button>
          </div>
        </div>
      ) : (
        <StartMatchFormBody flow={flow} />
      )}
    </DockScreen>
  );
}
