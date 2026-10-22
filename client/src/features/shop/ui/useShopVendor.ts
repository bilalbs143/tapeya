import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useGetShopCategoriesQuery, useGetShopProductsQuery, useGetShopVendorBySlugQuery } from '../api/shopApi';
import { shopPaths } from '../lib/shopPaths';
import {
  resolveShopVendorProducts,
  SHOP_SEARCH_DEBOUNCE_MS,
  shopVendorCatalogFiltered,
  shopVendorChipCategories,
  shopVendorGridStatus,
} from '../lib/shopVendor';

/** Vendor by slug, search/category filter, and product grid for ShopVendorPage. */
export function useShopVendor(vendorSlug: string) {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [debounced, setDebounced] = useState('');
  const [categoryId, setCategoryId] = useState<number | null>(null);

  useEffect(() => {
    const t = window.setTimeout(() => setDebounced(query.trim()), SHOP_SEARCH_DEBOUNCE_MS);
    return () => window.clearTimeout(t);
  }, [query]);

  const {
    data: vendor,
    isLoading: vendorLoading,
    isError: vendorError,
    refetch: refetchVendor,
  } = useGetShopVendorBySlugQuery(vendorSlug, { skip: !vendorSlug });

  const { data: categories = [] } = useGetShopCategoriesQuery({ all: true }, { skip: !vendor });

  const filtered = shopVendorCatalogFiltered(debounced, categoryId);

  const {
    data: productsFromQuery = [],
    isLoading: productsLoading,
    isError: productsError,
    refetch: refetchProducts,
  } = useGetShopProductsQuery(
    {
      vendorId: vendor?.id,
      categoryId: categoryId ?? undefined,
      search: debounced || undefined,
      all: true,
      perPage: 50,
    },
    { skip: !vendor?.id }
  );

  const products = useMemo(
    () =>
      resolveShopVendorProducts({
        filtered,
        fromQuery: productsFromQuery,
        embedded: vendor?.products,
      }),
    [filtered, productsFromQuery, vendor?.products]
  );

  const chipCategories = useMemo(() => shopVendorChipCategories(categories, products), [categories, products]);

  const gridStatus = shopVendorGridStatus(productsLoading, productsError, products.length > 0);

  function goHome() {
    navigate(shopPaths.home());
  }

  function onMissingStoreAction() {
    if (vendorError) void refetchVendor();
    else navigate(shopPaths.home());
  }

  return {
    vendor,
    vendorLoading,
    vendorError,
    query,
    setQuery,
    debounced,
    categoryId,
    setCategoryId,
    products,
    chipCategories,
    gridStatus,
    refetchProducts,
    goHome,
    onMissingStoreAction,
  };
}
