import { Routes } from '@angular/router';

/** Lazy-loaded routes for Engagement (Push Notifications, etc.). */
export const EngagementRoutes: Routes = [
  {
    path: 'push-notifications',
    loadComponent: () => import('./push-notifications/push-notifications.component').then((m) => m.PushNotificationsComponent),
    data: {
      title: 'Push Notifications',
      urls: [{ title: 'Dashboard', url: '/dashboard' }, { title: 'Engagement' }, { title: 'Push Notifications' }],
    },
  },
  {
    path: 'push-notification-templates',
    loadComponent: () =>
      import('./push-notification-templates/push-notification-templates.component').then(
        (m) => m.PushNotificationTemplatesComponent
      ),
    data: {
      title: 'Push Notification Templates',
      urls: [{ title: 'Dashboard', url: '/dashboard' }, { title: 'Engagement' }, { title: 'Push Notification Templates' }],
    },
  },
];
