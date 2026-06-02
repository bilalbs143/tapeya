import { useMemo } from 'react';

import { useNavigate } from 'react-router-dom';

import { AppSubpageHeader } from '@/components/AppSubpageHeader';
import { HighlightSearchPopover } from '@/components/highlights/HighlightSearchPopover';
import { useGetHighlightsQuery } from '@/store/api/highlightApi';
import { Container } from '@/ui/Container';

import { HighlightsSection } from './components/HighlightsSection';
import { sortHighlightsByRecent, sortHighlightsByViews } from './highlightsUtils';

export default function Highlights() {
  const navigate = useNavigate();

  const { data: highlights = [], isLoading, isError } = useGetHighlightsQuery({ per_page: 50 });

  const mostRecent = useMemo(() => sortHighlightsByRecent(highlights), [highlights]);
  const mostViewed = useMemo(() => sortHighlightsByViews(highlights), [highlights]);

  const handleCardClick = (highlight) => {
    navigate(`/highlights/${highlight.id}`, { state: { highlight } });
  };

  return (
    <div className="min-h-screen bg-black">
      <AppSubpageHeader title="HIGHLIGHTS" />
      <Container>
        <div className="flex flex-col gap-6 pb-6">
          <HighlightSearchPopover />

          {/* Loading skeleton */}
          {isLoading ? (
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-[200px] animate-pulse rounded-[17px] bg-[#141412]" />
              ))}
            </div>
          ) : null}

          {/* Error */}
          {isError && !isLoading ? (
            <p className="py-4 text-center text-[13px] text-[#A2A6AB]">Failed to load highlights. Please try again later.</p>
          ) : null}

          {/* Sections */}
          {!isLoading && !isError ? (
            <>
              <HighlightsSection title="MOST RECENT" highlights={mostRecent} onCardClick={handleCardClick} />
              <HighlightsSection title="MOST VIEWED" highlights={mostViewed} onCardClick={handleCardClick} />
            </>
          ) : null}

          {/* Empty state */}
          {!isLoading && !isError && highlights.length === 0 ? (
            <p className="py-2 text-center text-[13px] text-[#A2A6AB]">No highlights available yet.</p>
          ) : null}
        </div>
      </Container>
    </div>
  );
}
