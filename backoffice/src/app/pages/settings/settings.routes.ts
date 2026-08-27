import { Routes } from '@angular/router';

export const SettingsRoutes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'system-settings',
  },
  {
    path: 'system-settings',
    loadComponent: () => import('./system-settings/system-settings.component').then((m) => m.SystemSettingsComponent),
    data: {
      title: 'System Settings',
      icon: 'solar:settings-line-duotone',
      hideBreadcrumb: true,
      urls: [{ title: 'Dashboard', url: '/dashboard' }, { title: 'Settings' }, { title: 'System Settings' }],
    },
  },
];
