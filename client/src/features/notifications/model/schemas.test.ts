import { describe, expect, it } from 'vitest';

import { dayGroupLabel, parseNotificationPage, resolveNotificationHref, toAppNotification } from './schemas';

describe('notification schemas', () => {
  it('allowlists known deep links and rewrites legacy aliases', () => {
    expect(resolveNotificationHref('/feed/42')).toBe('/feed/42');
    expect(resolveNotificationHref('/reels/9')).toBe('/reels/9');
    expect(resolveNotificationHref('/match/3')).toBe('/match/3');
    expect(resolveNotificationHref('/scorecard/match/3')).toBe('/match/3');
    expect(resolveNotificationHref('/reels/u/11')).toBe('/users/11');
    expect(resolveNotificationHref('/entertainment/4')).toBe('/entertainment/4');
    expect(resolveNotificationHref('/entertainment/4/e/2')).toBe('/entertainment/4/e/2');
    expect(resolveNotificationHref('/serials/4/e/2')).toBe('/entertainment/4/e/2');
    expect(resolveNotificationHref('/notification-center')).toBeNull();
    expect(resolveNotificationHref('/shop')).toBeNull();
  });

  it('parses list page and card fields', () => {
    const page = parseNotificationPage({
      data: [
        {
          id: 'abc',
          type: 'post_liked',
          data: {
            message: 'Like: Sara liked your post.',
            actor_name: 'Sara Ali',
            deep_link: '/feed/8',
          },
          read_at: null,
          created_at: new Date().toISOString(),
        },
      ],
      meta: {
        current_page: 1,
        last_page: 2,
        per_page: 10,
        total: 11,
        unread_count: 3,
      },
    });

    expect(page.meta.unreadCount).toBe(3);
    expect(page.meta.lastPage).toBe(2);
    expect(page.items[0]).toMatchObject({
      id: 'abc',
      kind: 'Like',
      message: 'Sara liked your post.',
      href: '/feed/8',
      unread: true,
      dayGroup: 'Today',
    });
  });

  it('labels day groups', () => {
    const now = new Date();
    expect(dayGroupLabel(now.toISOString())).toBe('Today');
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    expect(dayGroupLabel(yesterday.toISOString())).toBe('Yesterday');
    expect(dayGroupLabel('2020-01-01T12:00:00.000Z')).toBe('Earlier');
  });

  it('falls back href from order ids', () => {
    const n = toAppNotification({
      id: '1',
      type: 'order',
      data: { message: 'Order: shipped', order_id: 9 },
      read_at: '2026-01-01T00:00:00.000Z',
      created_at: '2026-01-01T00:00:00.000Z',
    });
    expect(n.href).toBe('/shop/orders/9');
    expect(n.unread).toBe(false);
  });

  it('opens follower profile instead of inbox self-link', () => {
    const n = toAppNotification({
      id: '2',
      type: 'user_followed',
      data: {
        message: 'Follow: Ahmed started following you.',
        actor_id: 11,
        deep_link: '/notification-center',
      },
      read_at: null,
      created_at: new Date().toISOString(),
    });
    expect(n.href).toBe('/users/11');
  });
});
