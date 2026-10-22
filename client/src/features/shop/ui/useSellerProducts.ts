import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useGetVendorProductsQuery, useGetVendorStoreQuery } from '../api/vendorShopApi';
import {
  filterSellerProducts,
  sellerProductsCanEdit,
  sellerProductsIntro,
  sellerProductsNoMatchDescription,
} from '../lib/sellerProducts';
import { shopPaths } from '../lib/shopPaths';

/** Vendor catalogue list + local search for SellerProductsPage. */
export function useSellerProducts() {
  const navigate = useNavigate();
  const { data: store } = useGetVendorStoreQuery();
  const {
    data: products = [],
    isLoading,
    isError,
    refetch,
  } = useGetVendorProductsQuery({
    all: true,
  });
  const canEdit = sellerProductsCanEdit(store?.status ?? '');
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => filterSellerProducts(products, query), [products, query]);
  const intro = sellerProductsIntro(canEdit, store?.statusLabel);
  const noMatchDescription = sellerProductsNoMatchDescription(query);

  function goSeller() {
    navigate(shopPaths.seller());
  }

  return {
    canEdit,
    intro,
    query,
    setQuery,
    products,
    filtered,
    noMatchDescription,
    isLoading,
    isError,
    refetch,
    goSeller,
  };
}
