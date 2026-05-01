import { useState } from 'react';

import { useNavigate } from 'react-router-dom';

import { useDebounce } from '@/hooks/useDebounce';
import { CLOUDFRONT_APP_BASE } from '@/lib/constants/assets';
import { DEBOUNCE_MS, MIN_SEARCH_LENGTH } from '@/lib/constants/search';
import { formatPrice } from '@/lib/format';
import { useGetBrandsQuery, useGetProductsQuery } from '@/store/api/shopApi';
import { CloseIcon } from '@/ui/icons/CloseIcon';
import { Popover, PopoverAnchor, PopoverContent } from '@/ui/Popover';


const searchIcon = `${CLOUDFRONT_APP_BASE}/images/icons/searchicon.svg`;

const SEARCH_RESULTS_LIMIT = 8;

export function ShopSearchPopover() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm.trim(), DEBOUNCE_MS);
  const isOpen = searchTerm.trim().length >= MIN_SEARCH_LENGTH;

  const { data: brandsResponse } = useGetBrandsQuery({ all: true });
  const brands = brandsResponse?.data ?? [];

  const { data: searchResponse, isLoading: isSearching } = useGetProductsQuery(
    {
      search: debouncedSearch || undefined,
      per_page: SEARCH_RESULTS_LIMIT,
    },
    { skip: debouncedSearch.length < MIN_SEARCH_LENGTH },
  );
  const searchProducts = searchResponse?.data ?? [];

  const productsWithBrandSlug = searchProducts.map((p) => ({
    ...p,
    brandSlug: brands.find((b) => b.id === p.brand_id)?.slug ?? '',
  }));

  const handleSelectProduct = (product) => {
    if (!product.slug || !product.brandSlug) return;
    setSearchTerm('');
    setSearchTerm('');
    navigate(`/shop/${product.brandSlug}/product/${product.slug}`);
  };

  const hasResults = productsWithBrandSlug.length > 0;
  const showEmpty =
    debouncedSearch.length >= MIN_SEARCH_LENGTH && !isSearching && !hasResults;

  const handleOpenChange = (open) => {
    if (!open) setSearchTerm('');
  };

  return (
    <Popover open={isOpen} onOpenChange={handleOpenChange}>
      <PopoverAnchor asChild>
        <div className="relative [&_input::-webkit-search-cancel-button]:hidden [&_input::-webkit-search-decoration]:hidden">
          <input
            type="search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="What are you looking for?"
            className="h-12 w-full rounded-[6px] bg-[#141412] pr-20 pl-4 text-white placeholder:text-[#A2A6AB78] focus:ring-2 focus:ring-[#DA9811]/50 focus:outline-none [&::-webkit-search-cancel-button]:hidden [&::-webkit-search-decoration]:hidden"
            style={{ WebkitAppearance: 'none', appearance: 'none' }}
            aria-label="Search shop"
            aria-autocomplete="list"
            aria-controls="shop-search-results"
            id="shop-search-input"
          />
          {searchTerm.length > 0 ? (
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              className="absolute top-0 right-10 bottom-0 flex w-10 items-center justify-center text-[#A2A6AB] transition-colors hover:text-white active:opacity-80"
              aria-label="Clear search"
            >
              <CloseIcon />
            </button>
          ) : null}
          <span className="pointer-events-none absolute top-0 right-0 bottom-0 flex w-10 items-center justify-center">
            <img
              src={searchIcon}
              alt=""
              className="h-5 w-5 shrink-0"
              aria-hidden
            />
          </span>
        </div>
      </PopoverAnchor>
      <PopoverContent
        id="shop-search-results"
        role="listbox"
        side="bottom"
        align="start"
        sideOffset={6}
        className="max-h-[min(70vh,320px)] w-[var(--radix-popover-trigger-width)] overflow-hidden rounded-[6px] border border-[#252520] p-0 shadow-xl outline-none [background:#1a1a18]"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <div className="max-h-[min(70vh,320px)] overflow-y-auto rounded-[6px] py-1">
          {isSearching && (
            <div className="px-4 py-6 text-center text-[13px] text-[#A2A6AB]">
              Searching…
            </div>
          )}
          {!isSearching && showEmpty && (
            <div className="px-4 py-6 text-center text-[13px] text-[#A2A6AB]">
              No products found for &quot;{debouncedSearch}&quot;
            </div>
          )}
          {!isSearching && hasResults && (
            <ul className="list-none">
              {productsWithBrandSlug.map((product) => {
                const imageUrl = product.images?.[0]?.path;
                const hasDiscount =
                  product.sale_price != null &&
                  product.sale_price < product.price;
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
                          <img
                            src={imageUrl}
                            alt=""
                            className="h-full w-full object-contain"
                          />
                        ) : (
                          <div className="h-full w-full bg-[#141412]" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[13px] font-medium text-white">
                          {product.name}
                        </p>
                        <p className="mt-0.5 text-[12px] font-bold text-[#DA9811]">
                          {hasDiscount && (
                            <span className="mr-1.5 text-[#A2A6AB] line-through">
                              {formatPrice(product.price)}
                            </span>
                          )}
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
