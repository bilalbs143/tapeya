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
  {
    path: 'players/:playerId/stats',
    loadComponent: () => import('./players/player-stats/player-stats.component').then((m) => m.PlayerStatsComponent),
    data: {
      title: 'Player Stats',
      urls: [
        { title: 'Dashboard', url: '/dashboard' },
        { title: 'Players Management', url: '/players-management/players' },
        { title: 'Player Stats' },
      ],
    },
  },
];
