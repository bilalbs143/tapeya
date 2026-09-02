/**
 * Mirrors API AdminNotificationTypeEnum for active notification types.
 */
export const AdminNotificationType = {
  ORDER_PLACED: 'order_placed',
  USER_REGISTERED: 'user_registered',
  VENDOR_APPLICATION_SUBMITTED: 'vendor_application_submitted',
  BROADCAST_CONCURRENCY_HIGH: 'broadcast_concurrency_high',
  YOUTUBE_QUOTA_HIGH: 'youtube_quota_high',
  SUPPORT_MESSAGE_SUBMITTED: 'support_message_submitted',
} as const;

export type AdminNotificationTypeValue = (typeof AdminNotificationType)[keyof typeof AdminNotificationType];

export const ADMIN_NOTIFICATION_TYPE_LABELS: Record<AdminNotificationTypeValue, string> = {
  [AdminNotificationType.ORDER_PLACED]: 'Order Placed',
  [AdminNotificationType.USER_REGISTERED]: 'User Registered',
  [AdminNotificationType.VENDOR_APPLICATION_SUBMITTED]: 'Vendor Application Submitted',
  [AdminNotificationType.BROADCAST_CONCURRENCY_HIGH]: 'Broadcast Concurrency High',
  [AdminNotificationType.YOUTUBE_QUOTA_HIGH]: 'YouTube Quota High',
  [AdminNotificationType.SUPPORT_MESSAGE_SUBMITTED]: 'Support Message Submitted',
};

export function adminNotificationTypeLabel(type: string | null | undefined): string {
  if (!type) {
    return '';
  }
  return ADMIN_NOTIFICATION_TYPE_LABELS[type as AdminNotificationTypeValue] ?? type;
}

export const ADMIN_NOTIFICATION_TYPE_OPTIONS: { value: string; label: string }[] = [
  { value: '', label: 'All' },
  ...(Object.entries(ADMIN_NOTIFICATION_TYPE_LABELS) as [AdminNotificationTypeValue, string][]).map(([value, label]) => ({
    value,
    label,
  })),
];
