import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useGetShopBrandsQuery, useGetShopProductsQuery } from '../api/shopApi';
import { SHOP_SEARCH_DEBOUNCE_MS, shopHomeRailsBare, shopSearchResultsHeading } from '../lib/shopHome';

/** Search debounce, brands, and popular/offer rails for ShopHomePage. */
export function useShopHome() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [debounced, setDebounced] = useState('');

  useEffect(() => {
    const t = window.setTimeout(() => setDebounced(query.trim()), SHOP_SEARCH_DEBOUNCE_MS);
    return () => window.clearTimeout(t);
  }, [query]);

  const searching = debounced.length > 0;

  const {
    data: searchResults = [],
    isLoading: searchLoading,
    isError: searchError,
    refetch: refetchSearch,
  } = useGetShopProductsQuery({ search: debounced, perPage: 30 }, { skip: !searching });

  const {
    data: popular = [],
    isLoading: popularLoading,
    isError: popularError,
    refetch: refetchPopular,
  } = useGetShopProductsQuery({ isPopular: true, perPage: 12 }, { skip: searching });

  const {
    data: offers = [],
    isLoading: offersLoading,
    isError: offersError,
    refetch: refetchOffers,
  } = useGetShopProductsQuery({ isSpecialOffer: true, perPage: 12 }, { skip: searching });

  const {
    data: brands = [],
    isLoading: brandsLoading,
    isError: brandsError,
    refetch: refetchBrands,
  } = useGetShopBrandsQuery({ perPage: 30 });

  const railsLoading = popularLoading || offersLoading;
  const railsError = popularError || offersError;
  const bare = shopHomeRailsBare(popular.length, offers.length);
  const searchHeading = shopSearchResultsHeading(searchResults.length);

  function goBack() {
    navigate(-1);
  }

  function retryRails() {
    void refetchPopular();
    void refetchOffers();
  }

  return {
    query,
    setQuery,
    debounced,
    searching,
    searchResults,
    searchLoading,
    searchError,
    refetchSearch,
    searchHeading,
    popular,
    offers,
    brands,
    brandsLoading,
    brandsError,
    refetchBrands,
    railsLoading,
    railsError,
    bare,
    goBack,
    retryRails,
  };
}
