import { useNavigate } from 'react-router-dom';

import { useSearchPopover } from '@/hooks/useSearchPopover';
import { FIXTURE_BG_IMAGE } from '@/lib/constants/assets';
import { MIN_SEARCH_LENGTH, SEARCH_RESULTS_LIMIT } from '@/lib/constants/search';
import { useGetEntertainmentsQuery } from '@/store/api/entertainmentApi';
import { LoaderBlock } from '@/ui/Loader';
import { Popover, PopoverAnchor, PopoverContent } from '@/ui/Popover';
import { SearchInput } from '@/ui/SearchInput';

export function EntertainmentSearchPopover() {
  const navigate = useNavigate();
  const { searchTerm, setSearchTerm, debouncedSearch, isOpen, clear, handleOpenChange } = useSearchPopover();

  const { data: results = [], isLoading } = useGetEntertainmentsQuery(
    { search: debouncedSearch, per_page: SEARCH_RESULTS_LIMIT },
    { skip: debouncedSearch.length < MIN_SEARCH_LENGTH },
  );

  const hasResults = results.length > 0;
  const showEmpty = debouncedSearch.length >= MIN_SEARCH_LENGTH && !isLoading && !hasResults;

  const handleSelect = (item) => {
    clear();
    navigate(`/entertainment/${item.id}`);
  };

  return (
    <Popover open={isOpen} onOpenChange={handleOpenChange}>
      <PopoverAnchor asChild>
        <SearchInput
          id="entertainment-search-input"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onClear={clear}
          placeholder="Search Entertainment…"
          aria-label="Search Entertainment"
          aria-controls="entertainment-search-results"
        />
      </PopoverAnchor>
      <PopoverContent
        id="entertainment-search-results"
        role="listbox"
        side="bottom"
        align="start"
        sideOffset={6}
        className="border-border bg-surface-elevated max-h-[min(70vh,320px)] w-[var(--radix-popover-trigger-width)] overflow-hidden rounded-[6px] border p-0 shadow-xl outline-none"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <div className="max-h-[min(70vh,320px)] overflow-y-auto rounded-[6px] py-1">
          {isLoading && <LoaderBlock label="Searching" size="xs" className="px-4 py-6" />}
          {!isLoading && showEmpty && (
            <div className="text-muted px-4 py-6 text-center text-[13px]">
              No entertainment found for &quot;{debouncedSearch}&quot;
            </div>
          )}
          {!isLoading && hasResults && (
            <ul className="list-none">
              {results.map((item) => (
                <li key={item.id} role="option" aria-selected={false}>
                  <button
                    type="button"
                    onClick={() => handleSelect(item)}
                    className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-[#252520] active:bg-[#252520]"
                  >
                    <div className="bg-surface aspect-[2/3] h-14 shrink-0 overflow-hidden rounded-[6px]">
                      <img
                        src={item.poster || FIXTURE_BG_IMAGE}
                        alt=""
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          if (e.currentTarget.src !== FIXTURE_BG_IMAGE) e.currentTarget.src = FIXTURE_BG_IMAGE;
                        }}
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13px] font-medium text-white">{item.title}</p>
                      <p className="text-muted mt-0.5 text-[12px]">
                        {item.episodesCount} {item.episodesCount === 1 ? 'episode' : 'episodes'}
                      </p>
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
