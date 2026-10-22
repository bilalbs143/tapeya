import type { AppNotification, NotificationDayGroup } from '../model/schemas';

export const NOTIFICATIONS_PAGE_SIZE = 10;

export const NOTIFICATION_DAY_GROUPS: NotificationDayGroup[] = ['Today', 'Yesterday', 'Earlier'];

export function mergeNotifications(
  page1Items: AppNotification[],
  older: AppNotification[],
  optimisticRead: Set<string>
): AppNotification[] {
  const seen = new Set<string>();
  const merged: AppNotification[] = [];
  for (const n of [...page1Items, ...older]) {
    if (seen.has(n.id)) continue;
    seen.add(n.id);
    merged.push({
      ...n,
      unread: optimisticRead.has(n.id) ? false : n.unread,
    });
  }
  return merged.sort((a, b) => {
    const aTime = a.createdAt ? Date.parse(a.createdAt) : 0;
    const bTime = b.createdAt ? Date.parse(b.createdAt) : 0;
    return bTime - aTime;
  });
}

export function groupNotificationsByDay(
  items: AppNotification[]
): Array<{ label: NotificationDayGroup; items: AppNotification[] }> {
  return NOTIFICATION_DAY_GROUPS.map((label) => ({
    label,
    items: items.filter((n) => n.dayGroup === label),
  })).filter((g) => g.items.length > 0);
}

export function notificationsSubtitle(args: {
  loading: boolean;
  itemCount: number;
  unreadCount: number;
}): string | undefined {
  if (args.loading && args.itemCount === 0) return 'Loading…';
  if (args.unreadCount > 0) return `${args.unreadCount} unread`;
  if (args.itemCount > 0) return "You're all caught up";
  return undefined;
}

export function isOrderNotification(n: Pick<AppNotification, 'type' | 'kind'>): boolean {
  return Boolean(n.type?.includes('order') || n.kind?.toLowerCase() === 'order');
}
