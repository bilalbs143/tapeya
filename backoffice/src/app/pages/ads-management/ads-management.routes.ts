import { Routes } from '@angular/router';

/** Lazy-loaded routes for Ads Management (Brand Partners, Campaigns, Creatives, Live Takes). */
export const AdsManagementRoutes: Routes = [
  {
    path: 'brand-partners',
    loadComponent: () => import('./brand-partners/brand-partners.component').then((m) => m.BrandPartnersComponent),
    data: {
      title: 'Brand Partners',
      icon: 'solar:tag-line-duotone',
      hideBreadcrumb: true,
      urls: [{ title: 'Dashboard', url: '/dashboard' }, { title: 'Ads' }, { title: 'Brand Partners' }],
    },
  },
  {
    path: 'campaigns',
    loadComponent: () => import('./campaigns/campaigns.component').then((m) => m.AdCampaignsComponent),
    data: {
      title: 'Ad Campaigns',
      icon: 'solar:chart-square-line-duotone',
      hideBreadcrumb: true,
      urls: [{ title: 'Dashboard', url: '/dashboard' }, { title: 'Ads' }, { title: 'Campaigns' }],
    },
  },
  {
    path: 'creatives',
    loadComponent: () => import('./creatives/creatives.component').then((m) => m.AdCreativesComponent),
    data: {
      title: 'Ad Creatives',
      icon: 'solar:gallery-wide-line-duotone',
      hideBreadcrumb: true,
      urls: [{ title: 'Dashboard', url: '/dashboard' }, { title: 'Ads' }, { title: 'Creatives' }],
    },
  },
  {
    path: 'live-takes',
    loadComponent: () => import('./live-takes/live-takes.component').then((m) => m.LiveAdTakesComponent),
    data: {
      title: 'Live Ad Takes',
      icon: 'solar:videocamera-record-line-duotone',
      hideBreadcrumb: true,
      urls: [{ title: 'Dashboard', url: '/dashboard' }, { title: 'Ads' }, { title: 'Live Takes' }],
    },
  },
];
