import { Routes } from '@angular/router';

/** Lazy-loaded routes for Content Management (Hero Slider, etc.). */
export const ContentManagementRoutes: Routes = [
  {
    path: 'hero-slider',
    loadComponent: () => import('./hero-slider/hero-slider.component').then((m) => m.HeroSliderComponent),
    data: {
      title: 'Hero Slider',
      icon: 'solar:gallery-wide-line-duotone',
      hideBreadcrumb: true,
      urls: [{ title: 'Dashboard', url: '/dashboard' }, { title: 'Content Management' }, { title: 'Hero Slider' }],
    },
  },
  {
    path: 'static-pages',
    loadComponent: () => import('./static-pages/static-pages.component').then((m) => m.StaticPagesComponent),
    data: {
      title: 'Static Pages',
      icon: 'solar:document-text-line-duotone',
      hideBreadcrumb: true,
      urls: [{ title: 'Dashboard', url: '/dashboard' }, { title: 'Content Management' }, { title: 'Static Pages' }],
    },
  },
  {
    path: 'highlights',
    loadComponent: () => import('./highlights/highlights.component').then((m) => m.HighlightsComponent),
    data: {
      title: 'Highlights',
      icon: 'solar:play-circle-line-duotone',
      hideBreadcrumb: true,
      urls: [{ title: 'Dashboard', url: '/dashboard' }, { title: 'Content Management' }, { title: 'Highlights' }],
    },
  },
  {
    path: 'drama-serials',
    loadComponent: () => import('./drama-serials/drama-serials.component').then((m) => m.DramaSerialsComponent),
    data: {
      title: 'Drama Serials',
      icon: 'solar:clapperboard-play-line-duotone',
      hideBreadcrumb: true,
      urls: [{ title: 'Dashboard', url: '/dashboard' }, { title: 'Content Management' }, { title: 'Drama Serials' }],
    },
  },
  {
    path: 'drama-episodes',
    loadComponent: () => import('./drama-episodes/drama-episodes.component').then((m) => m.DramaEpisodesComponent),
    data: {
      title: 'Drama Episodes',
      icon: 'solar:playlist-minimalistic-2-line-duotone',
      hideBreadcrumb: true,
      urls: [{ title: 'Dashboard', url: '/dashboard' }, { title: 'Content Management' }, { title: 'Drama Episodes' }],
    },
  },
  {
    path: 'posts',
    loadComponent: () => import('./posts/posts.component').then((m) => m.PostsComponent),
    data: {
      title: 'Posts',
      icon: 'solar:gallery-send-line-duotone',
      hideBreadcrumb: true,
      urls: [{ title: 'Dashboard', url: '/dashboard' }, { title: 'Content Management' }, { title: 'Posts' }],
    },
  },
  {
    path: 'post-reports',
    loadComponent: () => import('./post-reports/post-reports.component').then((m) => m.PostReportsComponent),
    data: {
      title: 'Post Reports',
      icon: 'solar:flag-line-duotone',
      hideBreadcrumb: true,
      urls: [{ title: 'Dashboard', url: '/dashboard' }, { title: 'Content Management' }, { title: 'Post Reports' }],
    },
  },
];
