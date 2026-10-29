import { Link, useNavigate, useParams } from 'react-router-dom';

import { DockScreen } from '@/shared/layout';
import { Button } from '@/shared/ui/Button';
import { EmptyState, ErrorState, Skeleton } from '@/shared/ui/states';

import { useGetDramaEpisodeQuery } from '../api/entertainmentApi';
import { entertainmentPaths } from '../lib/entertainmentPaths';
import { EntertainmentEpisodeDetail } from '../ui/EntertainmentEpisodeDetail';

/** Drama episode player — poster/play, reactions, comments, landscape stage. */
export default function EntertainmentEpisodePage() {
  const { serialId, episodeId } = useParams<{ serialId: string; episodeId: string }>();
  const navigate = useNavigate();
  const id = Number(episodeId);
  const sid = Number(serialId);
  const valid = Number.isFinite(id) && id > 0;

  const {
    data: episode,
    isLoading,
    isError,
    refetch,
  } = useGetDramaEpisodeQuery(id, {
    skip: !valid,
  });

  const episodeBack = () => navigate(Number.isFinite(sid) ? entertainmentPaths.detail(sid) : entertainmentPaths.list());

  if (valid && !isLoading && !isError && episode) {
    return <EntertainmentEpisodeDetail key={episode.id} episode={episode} routeSerialId={sid} />;
  }

  return (
    <DockScreen title="Episode" subtitle="Entertainment" onBack={episodeBack}>
      {!valid ? (
        <div className="px-4 py-8">
          <EmptyState
            title="Episode Not Found"
            description="That link looks wrong."
            action={
              <Button asChild variant="secondary">
                <Link to={entertainmentPaths.list()}>Back to Entertainment</Link>
              </Button>
            }
          />
        </div>
      ) : isLoading ? (
        <>
          <Skeleton className="aspect-video w-full rounded-none" />
          <div className="flex flex-col gap-3 px-4 pt-4">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-11 w-full" />
          </div>
        </>
      ) : (
        <div className="px-4 py-8">
          <ErrorState title="Couldn’t Load This Episode" onRetry={() => void refetch()} />
        </div>
      )}
    </DockScreen>
  );
}
