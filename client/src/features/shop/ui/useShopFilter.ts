import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useGetShopProductsQuery } from '../api/shopApi';
import {
  resolveShopFilterKind,
  SHOP_SEARCH_DEBOUNCE_MS,
  shopFilterGridStatus,
  shopFilterShowsFeatured,
  shopFilterTitle,
} from '../lib/shopFilter';
import { shopPaths } from '../lib/shopPaths';
import { filterParamsForKind } from '../model/schemas';

/** Collection filter query + local search for ShopFilterPage. */
export function useShopFilter(rawKind: string | undefined) {
  const navigate = useNavigate();
  const kind = resolveShopFilterKind(rawKind);
  const [query, setQuery] = useState('');
  const [debounced, setDebounced] = useState('');

  useEffect(() => {
    const t = window.setTimeout(() => setDebounced(query.trim()), SHOP_SEARCH_DEBOUNCE_MS);
    return () => window.clearTimeout(t);
  }, [query]);

  const filterParams = kind ? filterParamsForKind(kind) : {};
  const {
    data = [],
    isLoading,
    isError,
    refetch,
  } = useGetShopProductsQuery(
    {
      ...filterParams,
      search: debounced || undefined,
      perPage: 30,
    },
    { skip: !kind }
  );

  const title = kind ? shopFilterTitle(kind) : null;
  const showFeatured = kind ? shopFilterShowsFeatured(kind) : false;
  const status = shopFilterGridStatus(isLoading, isError);

  function goHome() {
    navigate(shopPaths.home());
  }

  return {
    kind,
    title,
    query,
    setQuery,
    debounced,
    products: data,
    status,
    showFeatured,
    refetch,
    goHome,
  };
}
