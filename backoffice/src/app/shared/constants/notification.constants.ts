/**
 * Mirrors API AdminNotificationTypeEnum. Use for type-safe comparisons and filter options.
 */
export const AdminNotificationType = {
  ORDER_PLACED: 'order_placed',
  USER_REGISTERED: 'user_registered',
  TOURNAMENT_REQUEST_SUBMITTED: 'tournament_request_submitted',
  BROADCAST_CONCURRENCY_HIGH: 'broadcast_concurrency_high',
  YOUTUBE_QUOTA_HIGH: 'youtube_quota_high',
} as const;

export type AdminNotificationTypeValue = (typeof AdminNotificationType)[keyof typeof AdminNotificationType];

export const ADMIN_NOTIFICATION_TYPE_LABELS: Record<AdminNotificationTypeValue, string> = {
  [AdminNotificationType.ORDER_PLACED]: 'Order Placed',
  [AdminNotificationType.USER_REGISTERED]: 'User Registered',
  [AdminNotificationType.TOURNAMENT_REQUEST_SUBMITTED]: 'Tournament Request Submitted',
  [AdminNotificationType.BROADCAST_CONCURRENCY_HIGH]: 'Broadcast Concurrency High',
  [AdminNotificationType.YOUTUBE_QUOTA_HIGH]: 'YouTube Quota High',
};

export const ADMIN_NOTIFICATION_TYPE_OPTIONS: { value: string; label: string }[] = [
  { value: '', label: 'All' },
  ...(Object.entries(ADMIN_NOTIFICATION_TYPE_LABELS) as [AdminNotificationTypeValue, string][]).map(([value, label]) => ({
    value,
    label,
  })),
];
