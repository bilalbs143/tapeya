import { Routes } from '@angular/router';

export const playersManagementRoutes: Routes = [
  {
    path: 'players',
    loadComponent: () => import('./players/players.component').then((m) => m.PlayersComponent),
    data: {
      title: 'Players Management',
      urls: [{ title: 'Dashboard', url: '/dashboard' }, { title: 'Players Management' }],
    },
  },
];
