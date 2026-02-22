/**
 * Mirrors API AdminNotificationTypeEnum. Use for type-safe comparisons and filter options.
 */
export const AdminNotificationType = {
  ORDER_PLACED: 'order_placed',
  USER_REGISTERED: 'user_registered',
  EVENT_CREATED: 'event_created',
} as const;

export type AdminNotificationTypeValue = (typeof AdminNotificationType)[keyof typeof AdminNotificationType];

export const ADMIN_NOTIFICATION_TYPE_LABELS: Record<AdminNotificationTypeValue, string> = {
  [AdminNotificationType.ORDER_PLACED]: 'Order Placed',
  [AdminNotificationType.USER_REGISTERED]: 'User Registered',
  [AdminNotificationType.EVENT_CREATED]: 'Event Created',
};

export const ADMIN_NOTIFICATION_TYPE_OPTIONS: { value: string; label: string }[] = [
  { value: '', label: 'All' },
  ...(Object.entries(ADMIN_NOTIFICATION_TYPE_LABELS) as [AdminNotificationTypeValue, string][]).map(
    ([value, label]) => ({ value, label })
  ),
];
