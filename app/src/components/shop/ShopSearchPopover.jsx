import { useNavigate } from 'react-router-dom';

import { useSearchPopover } from '@/hooks/useSearchPopover';
import { MIN_SEARCH_LENGTH, SEARCH_RESULTS_LIMIT } from '@/lib/constants/search';
import { formatPrice } from '@/lib/format';
import { buildShopProductPath } from '@/lib/shopPaths';
import { useGetProductsQuery } from '@/store/api/shopApi';
import { Popover, PopoverAnchor, PopoverContent } from '@/ui/Popover';
import { SearchInput } from '@/ui/SearchInput';

export function ShopSearchPopover() {
  const navigate = useNavigate();
  const { searchTerm, setSearchTerm, debouncedSearch, isOpen, clear, handleOpenChange } = useSearchPopover();

  const { data: searchResponse, isLoading: isSearching } = useGetProductsQuery(
    {
      search: debouncedSearch || undefined,
      per_page: SEARCH_RESULTS_LIMIT,
    },
    { skip: debouncedSearch.length < MIN_SEARCH_LENGTH },
  );
  const searchProducts = searchResponse?.data ?? [];

  const handleSelectProduct = (product) => {
    const detailPath = buildShopProductPath(product);
    if (!detailPath) return;
    clear();
    navigate(detailPath);
  };

  const hasResults = searchProducts.length > 0;
  const showEmpty = debouncedSearch.length >= MIN_SEARCH_LENGTH && !isSearching && !hasResults;

  return (
    <Popover open={isOpen} onOpenChange={handleOpenChange}>
      <PopoverAnchor asChild>
        <SearchInput
          id="shop-search-input"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onClear={clear}
          placeholder="What Are You Looking For?"
          aria-label="Search Shop"
          aria-controls="shop-search-results"
        />
      </PopoverAnchor>
      <PopoverContent
        id="shop-search-results"
        role="listbox"
        side="bottom"
        align="start"
        sideOffset={6}
        className="border-border bg-surface-elevated max-h-[min(70vh,320px)] w-[var(--radix-popover-trigger-width)] overflow-hidden rounded-[6px] border p-0 shadow-xl outline-none"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <div className="max-h-[min(70vh,320px)] overflow-y-auto rounded-[6px] py-1">
          {isSearching && <div className="text-muted px-4 py-6 text-center text-[13px]">Searching…</div>}
          {!isSearching && showEmpty && (
            <div className="text-muted px-4 py-6 text-center text-[13px]">
              No products found for &quot;{debouncedSearch}&quot;
            </div>
          )}
          {!isSearching && hasResults && (
            <ul className="list-none">
              {searchProducts.map((product) => {
                const imageUrl = product.images?.[0]?.path;
                const hasDiscount = product.sale_price != null && product.sale_price < product.price;
                const displayPrice = product.sale_price ?? product.price;
                return (
                  <li key={product.id} role="option" aria-selected={false}>
                    <button
                      type="button"
                      onClick={() => handleSelectProduct(product)}
                      className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-[#252520] active:bg-[#252520]"
                    >
                      <div className="h-12 w-12 shrink-0 overflow-hidden rounded-[6px] bg-white">
                        {imageUrl ? (
                          <img src={imageUrl} alt="" className="h-full w-full object-contain" />
                        ) : (
                          <div className="bg-surface h-full w-full" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[13px] font-medium text-white">{product.name}</p>
                        <p className="text-brand mt-0.5 text-[12px] font-bold">
                          {hasDiscount && <span className="text-muted mr-1.5 line-through">{formatPrice(product.price)}</span>}
                          {formatPrice(displayPrice)}
                        </p>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
