import { describe, expect, it } from 'vitest';

import type { AppNotification } from '../model/schemas';
import {
  groupNotificationsByDay,
  isOrderNotification,
  mergeNotifications,
  notificationsSubtitle,
} from './notificationsPage';

function note(partial: Partial<AppNotification> & Pick<AppNotification, 'id'>): AppNotification {
  return {
    type: null,
    kind: null,
    message: 'hi',
    actorName: null,
    avatarUrl: null,
    initials: 'A',
    href: null,
    unread: true,
    createdAt: '2026-01-02T00:00:00.000Z',
    age: '1h',
    dayGroup: 'Today',
    ...partial,
  };
}

describe('mergeNotifications', () => {
  it('dedupes, applies optimistic read, and sorts newest first', () => {
    const merged = mergeNotifications(
      [note({ id: '1', createdAt: '2026-01-01T00:00:00.000Z' })],
      [
        note({ id: '1', createdAt: '2026-01-01T00:00:00.000Z' }),
        note({ id: '2', createdAt: '2026-01-03T00:00:00.000Z', unread: true }),
      ],
      new Set(['2'])
    );
    expect(merged.map((n) => n.id)).toEqual(['2', '1']);
    expect(merged[0]?.unread).toBe(false);
  });
});

describe('groupNotificationsByDay', () => {
  it('omits empty day buckets', () => {
    const groups = groupNotificationsByDay([
      note({ id: '1', dayGroup: 'Today' }),
      note({ id: '2', dayGroup: 'Earlier' }),
    ]);
    expect(groups.map((g) => g.label)).toEqual(['Today', 'Earlier']);
  });
});

describe('notificationsSubtitle', () => {
  it('prefers unread count then caught-up', () => {
    expect(notificationsSubtitle({ loading: true, itemCount: 0, unreadCount: 0 })).toBe('Loading…');
    expect(notificationsSubtitle({ loading: false, itemCount: 3, unreadCount: 2 })).toBe('2 unread');
    expect(notificationsSubtitle({ loading: false, itemCount: 3, unreadCount: 0 })).toBe("You're all caught up");
  });
});

describe('isOrderNotification', () => {
  it('matches order type or kind', () => {
    expect(isOrderNotification({ type: 'shop.order', kind: null })).toBe(true);
    expect(isOrderNotification({ type: null, kind: 'Order' })).toBe(true);
    expect(isOrderNotification({ type: 'like', kind: 'Social' })).toBe(false);
  });
});
