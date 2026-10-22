import { useParams } from 'react-router-dom';

import { SHOP_SLUG_NOT_FOUND_DESCRIPTION } from '../lib/shopSlug';
import { ShopSlugBody } from '../ui/ShopSlugBody';
import { useShopSlug } from '../ui/useShopSlug';
import ShopBrandPage from './ShopBrandPage';
import ShopVendorPage from './ShopVendorPage';

/** `/shop/:slug` — vendor store wins; otherwise brand catalog (app ShopSlugPage). */

export default function ShopSlugPage() {
  const { slug } = useParams<{ slug: string }>();
  const { value, reserved, vendor, brand, resolving, goHome } = useShopSlug(slug);

  if (!value || reserved) {
    return <ShopSlugBody mode="not-found" description="That shop link isn’t valid." onBack={goHome} />;
  }

  if (vendor) {
    return <ShopVendorPage />;
  }

  if (resolving) {
    return <ShopSlugBody mode="loading" onBack={goHome} />;
  }

  if (brand) {
    return <ShopBrandPage />;
  }

  return <ShopSlugBody mode="not-found" emptySize="lg" description={SHOP_SLUG_NOT_FOUND_DESCRIPTION} onBack={goHome} />;
}
