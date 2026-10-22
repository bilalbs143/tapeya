import { useNavigate, useParams } from 'react-router-dom';

import { Button } from '@/shared/ui/Button';
import { ErrorState, Skeleton } from '@/shared/ui/states';

import { useGetTournamentQuery } from '../api/tournamentsApi';
import { PublicTournamentBody } from '../ui/PublicTournamentBody';

/** Canonical public tournament hub — `/tournaments/:id`. Live · Schedule · Table · Teams · Squads · Stats. */
export default function PublicTournamentPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const tournamentId = Number(id);
  const validId = Number.isFinite(tournamentId) && tournamentId > 0;

  const { data: tournament, isLoading, isError, refetch } = useGetTournamentQuery(tournamentId, { skip: !validId });

  if (!validId) {
    return (
      <div className="bg-surface flex min-h-full flex-col">
        <div className="px-4 py-8">
          <ErrorState title="Tournament Not Found" description="That link doesn’t look right." />
        </div>
        <div className="px-4">
          <Button variant="secondary" size="sm" onClick={() => navigate(-1)}>
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="bg-surface flex min-h-full flex-col">
        <Skeleton className="h-[196px] w-full rounded-none" />
        <div className="flex flex-col gap-3 px-4 py-4">
          <Skeleton className="h-7 w-2/3" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
    );
  }

  if (isError || !tournament) {
    return (
      <div className="bg-surface flex min-h-full flex-col">
        <div className="px-4 py-8">
          <ErrorState
            title="Tournament Not Found"
            description="It may have been removed, or you don’t have access."
            onRetry={() => void refetch()}
          />
        </div>
      </div>
    );
  }

  return <PublicTournamentBody key={tournament.id} tournament={tournament} />;
}
