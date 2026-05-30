import { useMemo, useState } from 'react';

import { useNavigate } from 'react-router-dom';

import { AppSubpageHeader } from '@/components/AppSubpageHeader';
import { useDebounce } from '@/hooks/useDebounce';
import { CLOUDFRONT_APP_BASE } from '@/lib/constants/assets';
import { DEBOUNCE_MS } from '@/lib/constants/search';
import { HighlightsSection } from '@/pages/highlights/components/HighlightsSection';
import { HIGHLIGHTS } from '@/pages/highlights/highlightsData';
import { filterHighlights, sortHighlightsByRecent, sortHighlightsByViews } from '@/pages/highlights/highlightsUtils';
import { Container } from '@/ui/Container';

const searchIcon = `${CLOUDFRONT_APP_BASE}/images/icons/searchicon.svg`;

export default function Highlights() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query.trim(), DEBOUNCE_MS);

  const filteredHighlights = useMemo(() => filterHighlights(HIGHLIGHTS, debouncedQuery), [debouncedQuery]);
  const mostRecent = useMemo(() => sortHighlightsByRecent(filteredHighlights), [filteredHighlights]);
  const mostViewed = useMemo(() => sortHighlightsByViews(filteredHighlights), [filteredHighlights]);

  const hasSearchQuery = debouncedQuery.length > 0;
  const isEmpty = filteredHighlights.length === 0;

  const handleCardClick = (highlight) => {
    if (highlight.id == null) return;
    navigate(`/highlights/${highlight.id}`, { state: { highlight } });
  };

  return (
    <div className="min-h-screen bg-black">
      <AppSubpageHeader title="HIGHLIGHTS" />
      <Container>
        <div className="flex flex-col gap-6 pb-6">
          <div className="relative">
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search highlights..."
              className="h-12 w-full rounded-[6px] bg-[#141412] pr-14 pl-4 text-white placeholder:text-[#A2A6AB78] focus:ring-2 focus:ring-[#DA9811]/50 focus:outline-none"
              aria-label="Search highlights"
            />
            <span className="pointer-events-none absolute top-0 right-5 bottom-0 flex items-center">
              <img src={searchIcon} alt="" className="h-5 w-5 shrink-0" aria-hidden />
            </span>
          </div>

          {hasSearchQuery && isEmpty ? (
            <p className="py-2 text-center text-[13px] text-[#A2A6AB]">No highlights match your search.</p>
          ) : null}

          {!isEmpty ? (
            <>
              <HighlightsSection title="MOST RECENT" highlights={mostRecent} onCardClick={handleCardClick} />
              <HighlightsSection title="MOST VIEWED" highlights={mostViewed} onCardClick={handleCardClick} />
            </>
          ) : null}

          {!hasSearchQuery && isEmpty ? (
            <p className="py-2 text-center text-[13px] text-[#A2A6AB]">No highlights available yet.</p>
          ) : null}
        </div>
      </Container>
    </div>
  );
}
