import { z } from 'zod';

import { paginationMetaSchema } from '@/shared/api/envelope';
import { APP_PATHS } from '@/shared/config/paths';
import { resolveNotificationHref } from '@/shared/lib/deepLinks';

export { resolveNotificationHref } from '@/shared/lib/deepLinks';

/** Wire — `NotificationResource`. */

export const notificationWireSchema = z.object({
  id: z.string(),
  type: z.string().nullable().optional(),
  data: z.record(z.string(), z.unknown()).nullable().optional(),
  read_at: z.string().nullable().optional(),
  created_at: z.string().nullable().optional(),
});
export type NotificationWire = z.infer<typeof notificationWireSchema>;

export const notificationListMetaSchema = paginationMetaSchema.extend({
  unread_count: z.number().optional(),
});

export type NotificationDayGroup = 'Today' | 'Yesterday' | 'Earlier';

export type AppNotification = {
  id: string;
  type: string | null;
  message: string;
  kind: string | null;
  actorName: string | null;
  avatarUrl: string | null;
  initials: string;
  createdAt: string | null;
  age: string;
  unread: boolean;
  href: string | null;
  dayGroup: NotificationDayGroup;
};

export type NotificationPage = {
  items: AppNotification[];
  meta: {
    currentPage: number;
    lastPage: number;
    perPage: number;
    total: number;
    unreadCount: number;
  };
};

function startOfLocalDay(isoOrDate: string | Date): number {
  const d = new Date(isoOrDate);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

export function dayGroupLabel(createdAt: string | null | undefined): NotificationDayGroup {
  if (!createdAt) return 'Earlier';
  const t = startOfLocalDay(createdAt);
  if (Number.isNaN(t)) return 'Earlier';
  const today = startOfLocalDay(new Date());
  const yesterday = today - 24 * 60 * 60 * 1000;
  if (t === today) return 'Today';
  if (t === yesterday) return 'Yesterday';
  return 'Earlier';
}

export function formatNotificationAge(iso: string | null | undefined): string {
  if (!iso) return '';
  const then = Date.parse(iso);
  if (Number.isNaN(then)) return '';
  const seconds = Math.max(0, Math.floor((Date.now() - then) / 1000));
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d`;
  return new Date(then).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function initialsFrom(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0]?.charAt(0) ?? ''}${parts[1]?.charAt(0) ?? ''}`.toUpperCase();
  }
  return name.trim().slice(0, 2).toUpperCase() || 'N';
}

function asString(value: unknown): string | null {
  return typeof value === 'string' && value.trim() ? value.trim() : null;
}

function asNumberId(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && /^\d+$/.test(value)) return Number(value);
  return null;
}

export function toAppNotification(wire: NotificationWire): AppNotification {
  const data = (wire.data ?? {}) as Record<string, unknown>;
  const rawMessage = asString(data.message) ?? 'Notification';
  const type = wire.type ?? asString(data.type);

  let message = rawMessage;
  let kind: string | null = null;
  const colon = rawMessage.indexOf(':');
  if (colon > 0) {
    kind = rawMessage.slice(0, colon).trim() || null;
    const detail = rawMessage.slice(colon + 1).trim();
    if (detail) message = detail;
  }

  const actorName =
    asString(data.actor_name) ||
    asString(data.customer_name) ||
    asString(data.user_name) ||
    asString(data.tournament_name);

  const avatarUrl = asString(data.actor_avatar_url) || asString(data.avatar_url);

  let href = resolveNotificationHref(asString(data.deep_link));
  if (!href) {
    const vendorOrderId = asNumberId(data.vendor_order_id);
    const orderId = asNumberId(data.order_id);
    const actorId = asNumberId(data.actor_id);
    if (vendorOrderId != null) href = `/seller/orders/${vendorOrderId}`;
    else if (orderId != null) href = `/shop/orders/${orderId}`;
    else if (actorId != null && (type === 'user_followed' || type?.includes('follow'))) {
      href = `${APP_PATHS.user}/${actorId}`;
    }
  }

  const createdAt = wire.created_at ?? null;

  return {
    id: wire.id,
    type,
    message,
    kind,
    actorName,
    avatarUrl,
    initials: initialsFrom(actorName ?? 'N'),
    createdAt,
    age: formatNotificationAge(createdAt),
    unread: !wire.read_at,
    href,
    dayGroup: dayGroupLabel(createdAt),
  };
}

export function parseNotificationPage(raw: unknown): NotificationPage {
  const body = z
    .object({
      data: z.array(notificationWireSchema),
      meta: notificationListMetaSchema,
    })
    .parse(raw);

  return {
    items: body.data.map(toAppNotification),
    meta: {
      currentPage: body.meta.current_page,
      lastPage: body.meta.last_page,
      perPage: body.meta.per_page,
      total: body.meta.total,
      unreadCount: body.meta.unread_count ?? 0,
    },
  };
}
