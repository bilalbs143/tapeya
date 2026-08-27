import { Routes } from '@angular/router';

/** Lazy-loaded routes for Shop Management (Brands, Categories, Vendors, Products, Orders). */
export const ShopManagementRoutes: Routes = [
  {
    path: 'brands',
    loadComponent: () => import('./brands/brands.component').then((m) => m.BrandsComponent),
    data: {
      title: 'Brands',
      icon: 'solar:tag-line-duotone',
      hideBreadcrumb: true,
      urls: [{ title: 'Dashboard', url: '/dashboard' }, { title: 'Shop' }, { title: 'Brands' }],
    },
  },
  {
    path: 'categories',
    loadComponent: () => import('./categories/categories.component').then((m) => m.CategoriesComponent),
    data: {
      title: 'Categories',
      icon: 'solar:widget-2-line-duotone',
      hideBreadcrumb: true,
      urls: [{ title: 'Dashboard', url: '/dashboard' }, { title: 'Shop' }, { title: 'Categories' }],
    },
  },
  {
    path: 'vendors',
    loadComponent: () => import('./vendors/vendors.component').then((m) => m.VendorsComponent),
    data: {
      title: 'Vendors',
      icon: 'solar:buildings-2-line-duotone',
      hideBreadcrumb: true,
      urls: [{ title: 'Dashboard', url: '/dashboard' }, { title: 'Shop' }, { title: 'Vendors' }],
    },
  },
  {
    path: 'products',
    loadComponent: () => import('./products/products.component').then((m) => m.ProductsComponent),
    data: {
      title: 'Products',
      icon: 'solar:box-line-duotone',
      hideBreadcrumb: true,
      urls: [{ title: 'Dashboard', url: '/dashboard' }, { title: 'Shop' }, { title: 'Products' }],
    },
  },
  {
    path: 'orders',
    loadComponent: () => import('./orders/orders.component').then((m) => m.OrdersComponent),
    data: {
      title: 'Orders',
      icon: 'solar:bill-list-line-duotone',
      hideBreadcrumb: true,
      urls: [{ title: 'Dashboard', url: '/dashboard' }, { title: 'Shop' }, { title: 'Orders' }],
    },
  },
];
