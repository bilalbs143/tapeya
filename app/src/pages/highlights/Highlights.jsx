import { useMemo } from 'react';

import { useNavigate } from 'react-router-dom';

import { AppSubpageHeader } from '@/components/AppSubpageHeader';
import { HighlightSearchPopover } from '@/components/highlights/HighlightSearchPopover';
import { useGetHighlightsQuery } from '@/store/api/highlightApi';
import { Container } from '@/ui/Container';
import { ListEmpty, ListError } from '@/ui/ListState';
import { LoaderBlock } from '@/ui/Loader';

import { HighlightsSection } from './components/HighlightsSection';
import { sortHighlightsByRecent, sortHighlightsByViews } from './highlightsUtils';

export default function Highlights() {
  const navigate = useNavigate();

  const { data: highlights = [], isLoading, isError, refetch } = useGetHighlightsQuery({ per_page: 50 });

  const mostRecent = useMemo(() => sortHighlightsByRecent(highlights), [highlights]);
  const mostViewed = useMemo(() => sortHighlightsByViews(highlights), [highlights]);

  const handleCardClick = (highlight) => {
    navigate(`/highlights/${highlight.id}`, { state: { highlight } });
  };

  return (
    <div>
      <AppSubpageHeader title="HIGHLIGHTS" />
      <Container>
        <div className="flex flex-col gap-6 pb-6">
          <HighlightSearchPopover />

          {isLoading ? <LoaderBlock label="Loading highlights" className="py-16" /> : null}

          {isError && !isLoading ? <ListError message="Could not load highlights." onRetry={() => refetch()} /> : null}

          {!isLoading && !isError && highlights.length === 0 ? (
            <ListEmpty title="No Highlights Yet." description="Highlights will appear here when available." />
          ) : null}

          {!isLoading && !isError && highlights.length > 0 ? (
            <>
              <HighlightsSection title="MOST RECENT" highlights={mostRecent} onCardClick={handleCardClick} />
              <HighlightsSection title="MOST VIEWED" highlights={mostViewed} onCardClick={handleCardClick} />
            </>
          ) : null}
        </div>
      </Container>
    </div>
  );
}
