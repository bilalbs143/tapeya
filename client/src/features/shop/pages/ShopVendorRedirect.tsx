import { Navigate, useParams } from 'react-router-dom';

import { shopPaths } from '../lib/shopPaths';

/** Old `/shop/vendors/:slug` → `/shop/:slug`. */

export default function ShopVendorRedirect() {
  const { slug } = useParams<{ slug: string }>();
  const value = slug?.trim();
  return <Navigate to={value ? shopPaths.vendor(value) : shopPaths.home()} replace />;
}
