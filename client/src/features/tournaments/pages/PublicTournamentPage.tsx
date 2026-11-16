import { useNavigate, useParams } from 'react-router-dom';

import { PageDock, ScreenBar } from '@/shared/layout';
import { Button } from '@/shared/ui/Button';
import { IconButton } from '@/shared/ui/IconButton';
import { ShareIcon } from '@/shared/ui/icons';
import { EmptyState, ErrorState, Skeleton } from '@/shared/ui/states';
import { Tabs } from '@/shared/ui/Tabs';

import { useGetTournamentQuery } from '../api/tournamentsApi';
import type { PublicTournamentTab } from '../lib/publicTournament';
import type { Tournament } from '../model/schemas';
import { PublicTournamentBody, PublicTournamentHeader } from '../ui/PublicTournamentBody';
import { usePublicTournament } from '../ui/usePublicTournament';

/** Canonical public tournament hub — `/tournaments/:id`. Live · Schedule · Table · Teams · Squads · Stats. */
export default function PublicTournamentPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const tournamentId = Number(id);
  const validId = Number.isFinite(tournamentId) && tournamentId > 0;

  const { data: tournament, isLoading, isError, refetch } = useGetTournamentQuery(tournamentId, { skip: !validId });

  if (validId && !isLoading && !isError && tournament) {
    return <PublicTournamentLoaded tournament={tournament} />;
  }

  return (
    <PageDock header={<ScreenBar title="Tournament" onBack={() => navigate(-1)} />}>
      {!validId ? (
        <EmptyState
          size="lg"
          title="Tournament Not Found"
          description="That link doesn’t look right."
          action={
            <Button variant="secondary" size="sm" onClick={() => navigate(-1)}>
              Go Back
            </Button>
          }
        />
      ) : isLoading ? (
        <>
          <Skeleton className="h-[196px] w-full rounded-none" />
          <div className="flex flex-col gap-3 px-4 py-4">
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-[34px] w-40 rounded-full" />
          </div>
        </>
      ) : (
        <ErrorState
          page
          title="Tournament Not Found"
          description="It may have been removed, or you don’t have access."
          onRetry={() => void refetch()}
        />
      )}
    </PageDock>
  );
}

function PublicTournamentLoaded({ tournament }: { tournament: Tournament }) {
  const navigate = useNavigate();
  const flow = usePublicTournament(tournament);
  const { tab, setTab, place, handleShare } = flow;

  return (
    <Tabs value={tab} onValueChange={(v) => setTab(v as PublicTournamentTab)} className="flex min-h-0 flex-col">
      <PageDock
        header={
          <ScreenBar
            title={tournament.name}
            subtitle={place}
            onBack={() => navigate(-1)}
            slideTitle
            action={
              <IconButton
                label="Share"
                variant="outline"
                size="sm"
                className="h-8 w-8 rounded-icon"
                onClick={() => void handleShare()}
              >
                <ShareIcon className="text-muted h-3.5 w-3.5" strokeWidth={1.9} />
              </IconButton>
            }
          />
        }
      >
        <PublicTournamentHeader tournament={tournament} flow={flow} />
        <PublicTournamentBody key={tournament.id} tournament={tournament} flow={flow} />
      </PageDock>
    </Tabs>
  );
}
