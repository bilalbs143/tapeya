import { Routes } from '@angular/router';

/** Lazy-loaded routes for Shop Management (Brands, Categories, Products, Orders). */
export const ShopManagementRoutes: Routes = [
  {
    path: 'brands',
    loadComponent: () => import('./brands/brands.component').then((m) => m.BrandsComponent),
    data: {
      title: 'Brands',
      urls: [{ title: 'Dashboard', url: '/dashboard' }, { title: 'Shop' }, { title: 'Brands' }],
    },
  },
  {
    path: 'categories',
    loadComponent: () => import('./categories/categories.component').then((m) => m.CategoriesComponent),
    data: {
      title: 'Categories',
      urls: [{ title: 'Dashboard', url: '/dashboard' }, { title: 'Shop' }, { title: 'Categories' }],
    },
  },
  {
    path: 'products',
    loadComponent: () => import('./products/products.component').then((m) => m.ProductsComponent),
    data: {
      title: 'Products',
      urls: [{ title: 'Dashboard', url: '/dashboard' }, { title: 'Shop' }, { title: 'Products' }],
    },
  },
  {
    path: 'orders',
    loadComponent: () => import('./orders/orders.component').then((m) => m.OrdersComponent),
    data: {
      title: 'Orders',
      urls: [{ title: 'Dashboard', url: '/dashboard' }, { title: 'Shop' }, { title: 'Orders' }],
    },
  },
];
