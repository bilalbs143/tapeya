import { Navigate, useParams } from 'react-router-dom';

import { buildShopProductPath, buildShopVendorPath } from '@/lib/shopPaths';

/** Old `/shop/vendors/:vendorSlug` → `/shop/:vendorSlug`. */
export function RedirectShopVendorPrefix() {
  const { vendorSlug } = useParams();
  return <Navigate to={buildShopVendorPath(vendorSlug) || '/shop'} replace />;
}

/** Old `/shop/product/:vendorSlug/:productSlug` → `/shop/:vendorSlug/:productSlug`. */
export function RedirectShopProductPrefix() {
  const { vendorSlug, productSlug } = useParams();
  return <Navigate to={buildShopProductPath({ slug: productSlug, vendorSlug }) || '/shop'} replace />;
}

/** Old `/shop/:brand/product/:slug` → brand catalog. */
export function RedirectShopLegacyBrandProduct() {
  const { brandId } = useParams();
  return <Navigate to={buildShopVendorPath(brandId) || '/shop'} replace />;
}
