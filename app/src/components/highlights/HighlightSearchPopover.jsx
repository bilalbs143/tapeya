import { useNavigate } from 'react-router-dom';

import { useSearchPopover } from '@/hooks/useSearchPopover';
import { FIXTURE_BG_IMAGE } from '@/lib/constants/assets';
import { MIN_SEARCH_LENGTH } from '@/lib/constants/search';
import { formatHighlightDate } from '@/pages/highlights/highlightsUtils';
import { useGetHighlightsQuery } from '@/store/api/highlightApi';
import { Popover, PopoverAnchor, PopoverContent } from '@/ui/Popover';
import { SearchInput } from '@/ui/SearchInput';

const SEARCH_RESULTS_LIMIT = 8;

export function HighlightSearchPopover() {
  const navigate = useNavigate();
  const { searchTerm, setSearchTerm, debouncedSearch, isOpen, clear, handleOpenChange } = useSearchPopover();

  const { data: results = [], isLoading } = useGetHighlightsQuery(
    { search: debouncedSearch, per_page: SEARCH_RESULTS_LIMIT },
    { skip: debouncedSearch.length < MIN_SEARCH_LENGTH },
  );

  const hasResults = results.length > 0;
  const showEmpty = debouncedSearch.length >= MIN_SEARCH_LENGTH && !isLoading && !hasResults;

  const handleSelect = (highlight) => {
    clear();
    navigate(`/highlights/${highlight.id}`, { state: { highlight } });
  };

  return (
    <Popover open={isOpen} onOpenChange={handleOpenChange}>
      <PopoverAnchor asChild>
        <SearchInput
          id="highlight-search-input"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onClear={clear}
          placeholder="Search Highlights…"
          aria-label="Search Highlights"
          aria-controls="highlight-search-results"
        />
      </PopoverAnchor>
      <PopoverContent
        id="highlight-search-results"
        role="listbox"
        side="bottom"
        align="start"
        sideOffset={6}
        className="max-h-[min(70vh,320px)] w-[var(--radix-popover-trigger-width)] overflow-hidden rounded-[6px] border border-[#252520] p-0 shadow-xl outline-none [background:#1a1a18]"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <div className="max-h-[min(70vh,320px)] overflow-y-auto rounded-[6px] py-1">
          {isLoading && <div className="px-4 py-6 text-center text-[13px] text-[#A2A6AB]">Searching…</div>}
          {!isLoading && showEmpty && (
            <div className="px-4 py-6 text-center text-[13px] text-[#A2A6AB]">
              No highlights found for &quot;{debouncedSearch}&quot;
            </div>
          )}
          {!isLoading && hasResults && (
            <ul className="list-none">
              {results.map((highlight) => (
                <li key={highlight.id} role="option" aria-selected={false}>
                  <button
                    type="button"
                    onClick={() => handleSelect(highlight)}
                    className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-[#252520] active:bg-[#252520]"
                  >
                    <div className="h-12 w-12 shrink-0 overflow-hidden rounded-[6px] bg-[#141412]">
                      <img
                        src={highlight.thumbnailUrl || FIXTURE_BG_IMAGE}
                        alt=""
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = FIXTURE_BG_IMAGE;
                        }}
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13px] font-medium text-white">{highlight.title}</p>
                      {highlight.publishedAt ? (
                        <p className="mt-0.5 text-[12px] text-[#A2A6AB]">{formatHighlightDate(highlight.publishedAt)}</p>
                      ) : null}
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
