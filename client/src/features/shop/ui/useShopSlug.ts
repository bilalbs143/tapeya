import { useNavigate } from 'react-router-dom';

import { useGetShopBrandsQuery, useGetShopVendorBySlugQuery } from '../api/shopApi';
import { isShopReservedSlug, shopPaths } from '../lib/shopPaths';
import { normalizeShopSlug, resolveShopSlugBrand } from '../lib/shopSlug';

/** Resolve `/shop/:slug` to vendor, brand, or not found. */
export function useShopSlug(rawSlug: string | undefined) {
  const navigate = useNavigate();
  const value = normalizeShopSlug(rawSlug);
  const reserved = isShopReservedSlug(value);

  const {
    data: vendor,
    isLoading: vendorLoading,
    isError: vendorError,
  } = useGetShopVendorBySlugQuery(value, { skip: !value || reserved });

  const { data: brands = [], isLoading: brandsLoading } = useGetShopBrandsQuery(
    { all: true },
    { skip: !value || reserved || Boolean(vendor) }
  );

  const brand = resolveShopSlugBrand(brands, value, Boolean(vendor));
  const resolving = vendorLoading || brandsLoading;

  function goHome() {
    navigate(shopPaths.home());
  }

  return {
    value,
    reserved,
    vendor,
    brand,
    resolving,
    vendorError,
    goHome,
  };
}
