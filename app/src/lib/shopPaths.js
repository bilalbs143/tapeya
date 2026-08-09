/**
 * Buyer shop paths.
 *
 *   /shop/:slug              brand catalog or vendor store (vendor wins on collision)
 *   /shop/:vendor/:product   product detail (unique per vendor)
 *   /shop/brands/:slug       brand catalog when a vendor owns the same slug
 *
 * Reserved first segments: filter, cart, checkout, orders, brands, product, vendors.
 */

export function buildShopVendorPath(vendorSlug) {
  if (!vendorSlug) return null;
  return `/shop/${vendorSlug}`;
}

export function buildShopBrandPath(brandSlug) {
  if (!brandSlug) return null;
  return `/shop/brands/${brandSlug}`;
}

/**
 * @param {{ slug?: string, vendor?: { slug?: string }, vendorSlug?: string }} product
 * @returns {string|null}
 */
export function buildShopProductPath(product) {
  const slug = product?.slug;
  const vendor = product?.vendor?.slug || product?.vendorSlug;
  if (!slug || !vendor) return null;
  return `/shop/${vendor}/${slug}`;
}
