import { Routes } from '@angular/router';

/** Lazy-loaded routes for Content Management (Hero Slider, etc.). */
export const ContentManagementRoutes: Routes = [
  {
    path: 'hero-slider',
    loadComponent: () => import('./hero-slider/hero-slider.component').then((m) => m.HeroSliderComponent),
    data: {
      title: 'Hero Slider',
      urls: [{ title: 'Dashboard', url: '/starter' }, { title: 'Content Management' }, { title: 'Hero Slider' }],
    },
  },
];
