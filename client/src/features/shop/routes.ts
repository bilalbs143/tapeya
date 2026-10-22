import { lazy } from 'react';
import type { RouteObject } from 'react-router-dom';

import { APP_PATHS } from '@/shared/config/paths';

import { shopPaths } from './lib/shopPaths';

export { shopPaths };
export type { ShopFilterKind } from './lib/shopPaths';

const ShopHomePage = lazy(() => import('./pages/ShopHomePage'));
const ShopFilterPage = lazy(() => import('./pages/ShopFilterPage'));
const ProductDetailPage = lazy(() => import('./pages/ProductDetailPage'));
const CartPage = lazy(() => import('./pages/CartPage'));
const CheckoutPage = lazy(() => import('./pages/CheckoutPage'));
const OrdersPage = lazy(() => import('./pages/OrdersPage'));
const OrderDetailPage = lazy(() => import('./pages/OrderDetailPage'));
const OrderSuccessPage = lazy(() => import('./pages/OrderSuccessPage'));
const SellerHubPage = lazy(() => import('./pages/SellerHubPage'));
const SellerApplyPage = lazy(() => import('./pages/SellerApplyPage'));
const SellerStorePage = lazy(() => import('./pages/SellerStorePage'));
const SellerBrandsPage = lazy(() => import('./pages/SellerBrandsPage'));
const SellerCategoriesPage = lazy(() => import('./pages/SellerCategoriesPage'));
const SellerProductsPage = lazy(() => import('./pages/SellerProductsPage'));
const SellerProductFormPage = lazy(() => import('./pages/SellerProductFormPage'));
const SellerOrdersPage = lazy(() => import('./pages/SellerOrdersPage'));
const SellerOrderDetailPage = lazy(() => import('./pages/SellerOrderDetailPage'));
const ShopBrandPage = lazy(() => import('./pages/ShopBrandPage'));
const ShopSlugPage = lazy(() => import('./pages/ShopSlugPage'));
const ShopVendorRedirect = lazy(() => import('./pages/ShopVendorRedirect'));

export const shopRouteObjects: RouteObject[] = [
  { path: APP_PATHS.shop, Component: ShopHomePage },
  { path: `${APP_PATHS.shopFilter}/:kind`, Component: ShopFilterPage },
  { path: `${APP_PATHS.shopProduct}/:slug`, Component: ProductDetailPage },
  { path: `${APP_PATHS.shopBrand}/:slug`, Component: ShopBrandPage },
  { path: `${APP_PATHS.shop}/vendors/:slug`, Component: ShopVendorRedirect },
  { path: APP_PATHS.shopCart, Component: CartPage },
  { path: APP_PATHS.shopCheckout, Component: CheckoutPage },
  { path: APP_PATHS.shopOrders, Component: OrdersPage },
  { path: `${APP_PATHS.shopOrders}/:id`, Component: OrderDetailPage },
  { path: APP_PATHS.shopOrderSuccess, Component: OrderSuccessPage },
  { path: APP_PATHS.seller, Component: SellerHubPage },
  { path: APP_PATHS.sellerApply, Component: SellerApplyPage },
  { path: APP_PATHS.sellerStore, Component: SellerStorePage },
  { path: APP_PATHS.sellerBrands, Component: SellerBrandsPage },
  { path: APP_PATHS.sellerCategories, Component: SellerCategoriesPage },
  { path: APP_PATHS.sellerProducts, Component: SellerProductsPage },
  { path: APP_PATHS.sellerProductNew, Component: SellerProductFormPage },
  { path: `${APP_PATHS.sellerProductEdit}/:id/edit`, Component: SellerProductFormPage },
  { path: APP_PATHS.sellerOrders, Component: SellerOrdersPage },
  { path: `${APP_PATHS.sellerOrder}/:id`, Component: SellerOrderDetailPage },
  /** Catch-all store/brand slug — keep after every reserved `/shop/...` route. */
  { path: `${APP_PATHS.shopSlug}/:slug`, Component: ShopSlugPage },
];
