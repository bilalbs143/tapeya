export { useRegisterDeviceTokenMutation } from './api/deviceTokenApi';
export {
  useGetNotificationsQuery,
  useGetNotificationUnreadCountQuery,
  useMarkAllNotificationsReadMutation,
  useMarkNotificationReadMutation,
} from './api/notificationsApi';
export { useAppDeepLink } from './lib/useAppDeepLink';
export { usePushNotifications } from './lib/usePushNotifications';
export type { AppNotification } from './model/schemas';
export { resolveNotificationHref } from './model/schemas';
export { notificationRouteObjects, notificationRoutes } from './routes';
