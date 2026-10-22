import { Link, useNavigate, useParams } from 'react-router-dom';

import { ScreenBar } from '@/shared/layout';
import { Button } from '@/shared/ui/Button';
import { EmptyState, ErrorState, Skeleton } from '@/shared/ui/states';

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

  const header = <ScreenBar title="Highlight" subtitle="Match Clip" onBack={() => navigate(highlightRoutes.list())} />;

  if (!validId) {
    return (
      <div className="bg-surface flex min-h-full flex-col">
        {header}
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
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="bg-surface flex min-h-full flex-col">
        {header}
        <Skeleton className="aspect-video w-full rounded-none" />
        <div className="flex flex-col gap-3 px-4 pt-4">
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-11 w-full" />
        </div>
      </div>
    );
  }

  if (isError || !clip) {
    return (
      <div className="bg-surface flex min-h-full flex-col">
        {header}
        <div className="px-4 py-8">
          <ErrorState
            title="Highlight Not Found"
            description="The clip may have been removed since this link was shared."
            onRetry={() => void refetch()}
          />
        </div>
      </div>
    );
  }

  return <HighlightDetailBody key={clip.id} clip={clip} related={relatedHighlights(catalog, clip.id)} />;
}
