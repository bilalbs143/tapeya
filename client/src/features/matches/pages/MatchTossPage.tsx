import { useParams } from 'react-router-dom';

import { ErrorState, Skeleton } from '@/shared/ui/states';

import { MatchTossBody } from '../ui/MatchTossBody';
import { useMatchToss } from '../ui/useMatchToss';

/** Toss sheet — TossPage. PATCH /matches/:id/toss then open the pad. */

export default function MatchTossPage() {
  const params = useParams();
  const matchId = Number(params.id);
  const valid = Number.isFinite(matchId) && matchId > 0;
  const flow = useMatchToss(matchId, valid);
  const { isLoading, isError, refetch, data } = flow;

  if (!valid) {
    return (
      <div className="px-4 py-8">
        <ErrorState title="Match Not Found" />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div
        className="bg-veil-deep relative flex h-full flex-col justify-end"
        aria-busy="true"
        aria-label="Loading Toss"
      >
        <div className="border-border-subtle bg-surface relative z-10 max-h-[92%] overflow-hidden rounded-t-sheet border-t px-4 pt-2 pb-5 tab:mx-auto tab:mb-8 tab:w-full tab:max-w-[420px] tab:rounded-card tab:border">
          <span aria-hidden className="bg-border mx-auto mt-1 mb-4 block h-1 w-9 rounded-full" />
          <Skeleton className="h-7 w-20" />
          <Skeleton className="mt-2 h-2.5 w-2/3" />
          <Skeleton className="mt-5 mb-2.5 h-2.5 w-28" />
          <div className="mb-5 flex gap-2.5">
            <Skeleton className="h-20 flex-1 rounded-panel" />
            <Skeleton className="h-20 flex-1 rounded-panel" />
          </div>
          <Skeleton className="mb-2.5 h-2.5 w-24" />
          <div className="mb-4 flex gap-2.5">
            <Skeleton className="h-12 flex-1 rounded-panel" />
            <Skeleton className="h-12 flex-1 rounded-panel" />
          </div>
          <Skeleton className="min-h-14 w-full rounded-field" />
        </div>
      </div>
    );
  }

  if (isError || !data || !data.home || !data.away) {
    return (
      <div className="px-4 py-8">
        <ErrorState title="Couldn't Load This Match" onRetry={() => void refetch()} />
      </div>
    );
  }

  return <MatchTossBody flow={flow} />;
}
