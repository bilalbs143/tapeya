import { useParams } from 'react-router-dom';

import { ScreenBar } from '@/shared/layout';
import { EmptyState, EpisodeRowSkeleton, ErrorState, Skeleton } from '@/shared/ui/states';

import { parseEntertainmentSerialId } from '../lib/entertainmentDetail';
import { EntertainmentDetailBody } from '../ui/EntertainmentDetailBody';
import { useEntertainmentDetail } from '../ui/useEntertainmentDetail';

/** Show detail + episode list — `/entertainment/:id`. */

export default function EntertainmentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const serialId = parseEntertainmentSerialId(id);
  const flow = useEntertainmentDetail(serialId);
  const { serial, isLoading, isError, refetch, goList } = flow;

  if (serialId == null) {
    return (
      <div className="bg-surface flex min-h-full flex-col">
        <ScreenBar title="Show" subtitle="Episodes" onBack={goList} />
        <div className="px-4 py-8">
          <EmptyState title="Show Not Found" description="That link looks wrong." />
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="bg-surface flex min-h-full flex-col">
        <ScreenBar title="Show" subtitle="Episodes" onBack={goList} />
        <div className="flex flex-col gap-5 px-4 pt-3.5 pb-8" aria-busy="true" aria-label="Loading Show">
          <div className="flex flex-col gap-1.5">
            <Skeleton className="h-2.5 w-full" />
            <Skeleton className="h-2.5 w-4/5" />
            <Skeleton className="h-2.5 w-2/3" />
          </div>
          <section className="flex flex-col gap-2.5">
            <Skeleton className="h-2.5 w-16" />
            {[0, 1, 2, 3, 4].map((i) => (
              <EpisodeRowSkeleton key={i} />
            ))}
          </section>
        </div>
      </div>
    );
  }

  if (isError || !serial) {
    return (
      <div className="bg-surface flex min-h-full flex-col">
        <ScreenBar title="Show" subtitle="Episodes" onBack={goList} />
        <div className="px-4 py-8">
          <ErrorState title="Couldn’t Load This Show" onRetry={() => void refetch()} />
        </div>
      </div>
    );
  }

  return <EntertainmentDetailBody key={serial.id} serial={serial} onBack={goList} />;
}
