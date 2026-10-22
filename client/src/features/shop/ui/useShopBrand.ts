import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useGetShopBrandsQuery, useGetShopCategoriesQuery, useGetShopProductsQuery } from '../api/shopApi';
import {
  resolveShopBrand,
  SHOP_SEARCH_DEBOUNCE_MS,
  shopBrandChipCategories,
  shopBrandGridStatus,
} from '../lib/shopBrand';
import { shopPaths } from '../lib/shopPaths';

/** Resolve brand by slug/id, search/category filter, products for ShopBrandPage. */
export function useShopBrand(brandSlug: string) {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [debounced, setDebounced] = useState('');
  const [categoryId, setCategoryId] = useState<number | null>(null);

  useEffect(() => {
    const t = window.setTimeout(() => setDebounced(query.trim()), SHOP_SEARCH_DEBOUNCE_MS);
    return () => window.clearTimeout(t);
  }, [query]);

  const {
    data: brands = [],
    isLoading: brandsLoading,
    isError: brandsError,
    refetch: refetchBrands,
  } = useGetShopBrandsQuery({ all: true }, { skip: !brandSlug });

  const brand = useMemo(() => resolveShopBrand(brands, brandSlug), [brands, brandSlug]);

  const { data: categories = [] } = useGetShopCategoriesQuery({ all: true }, { skip: !brand });

  const {
    data: products = [],
    isLoading: productsLoading,
    isError: productsError,
    refetch: refetchProducts,
  } = useGetShopProductsQuery(
    {
      brandId: brand?.id,
      categoryId: categoryId ?? undefined,
      search: debounced || undefined,
      all: true,
      perPage: 50,
    },
    { skip: !brand?.id }
  );

  const chipCategories = useMemo(() => shopBrandChipCategories(categories, products), [categories, products]);

  const gridStatus = shopBrandGridStatus(productsLoading, productsError);

  function goHome() {
    navigate(shopPaths.home());
  }

  return {
    brand,
    brandsLoading,
    brandsError,
    refetchBrands,
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
  };
}
