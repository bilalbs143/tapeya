import { Link, useNavigate, useParams } from 'react-router-dom';

import { DockScreen } from '@/shared/layout';
import { Button } from '@/shared/ui/Button';
import { EmptyState, ErrorState, HighlightRowSkeleton, SKELETON, Skeleton } from '@/shared/ui/states';

import { useGetHighlightQuery, useGetHighlightsQuery } from '../api/highlightsApi';
import { relatedHighlights } from '../model/schemas';
import { highlightRoutes } from '../routes';
import { HighlightDetailBody } from '../ui/HighlightDetailBody';

/** Highlight player — poster/play, reactions, related list, landscape stage. */
export default function HighlightDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const highlightId = Number(id);
  const validId = Number.isFinite(highlightId) && highlightId > 0;

  const { data: clip, isLoading, isError, refetch } = useGetHighlightQuery(highlightId, { skip: !validId });
  const { data: catalog = [] } = useGetHighlightsQuery({ perPage: 50 });

  const goList = () => navigate(highlightRoutes.list());
  const relatedCount = SKELETON.relatedRows;

  if (validId && !isLoading && !isError && clip) {
    return <HighlightDetailBody key={clip.id} clip={clip} related={relatedHighlights(catalog, clip.id)} />;
  }

  return (
    <DockScreen title="Highlight" subtitle="Match Clip" onBack={goList}>
      {!validId ? (
        <div className="px-4 py-8">
          <EmptyState
            title="Highlight Not Found"
            description="The clip may have been removed since this link was shared."
            action={
              <Button asChild variant="secondary">
                <Link to={highlightRoutes.list()}>Back to Highlights</Link>
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
          <div className="flex flex-col gap-1.5 px-4 pt-4 pb-6" aria-busy="true" aria-label="Loading Related">
            <Skeleton className="mb-1 h-2.5 w-24" />
            {Array.from({ length: relatedCount }, (_, i) => (
              <HighlightRowSkeleton key={i} />
            ))}
          </div>
        </>
      ) : (
        <div className="px-4 py-8">
          <ErrorState
            title="Highlight Not Found"
            description="The clip may have been removed since this link was shared."
            onRetry={() => void refetch()}
          />
        </div>
      )}
    </DockScreen>
  );
}
