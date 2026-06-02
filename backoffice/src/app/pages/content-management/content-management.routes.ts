import { Routes } from '@angular/router';

/** Lazy-loaded routes for Content Management (Hero Slider, etc.). */
export const ContentManagementRoutes: Routes = [
  {
    path: 'hero-slider',
    loadComponent: () => import('./hero-slider/hero-slider.component').then((m) => m.HeroSliderComponent),
    data: {
      title: 'Hero Slider',
      urls: [{ title: 'Dashboard', url: '/dashboard' }, { title: 'Content Management' }, { title: 'Hero Slider' }],
    },
  },
  {
    path: 'static-pages',
    loadComponent: () => import('./static-pages/static-pages.component').then((m) => m.StaticPagesComponent),
    data: {
      title: 'Static Pages',
      urls: [{ title: 'Dashboard', url: '/dashboard' }, { title: 'Content Management' }, { title: 'Static Pages' }],
    },
  },
  {
    path: 'highlights',
    loadComponent: () => import('./highlights/highlights.component').then((m) => m.HighlightsComponent),
    data: {
      title: 'Highlights',
      urls: [{ title: 'Dashboard', url: '/dashboard' }, { title: 'Content Management' }, { title: 'Highlights' }],
    },
  },
];
