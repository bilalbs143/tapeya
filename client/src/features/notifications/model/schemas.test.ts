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
            message: 'liked your post.',
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
      kind: null,
      actorName: 'Sara Ali',
      message: 'liked your post.',
      href: '/feed/8',
      unread: true,
      dayGroup: 'Today',
    });
  });

  it('keeps kind prefix and verb phrase without embedding actor name', () => {
    const comment = toAppNotification({
      id: 'c1',
      type: 'post_commented',
      data: {
        message: 'New comment: commented on your post',
        actor_name: 'Muhammad naeem',
      },
      created_at: new Date().toISOString(),
    });
    expect(comment).toMatchObject({
      kind: 'New comment',
      actorName: 'Muhammad naeem',
      message: 'commented on your post',
    });

    const follow = toAppNotification({
      id: 'f1',
      type: 'user_followed',
      data: {
        message: 'New follower: started following you',
        actor_name: 'Moynul Haque',
        actor_id: 11,
      },
      created_at: new Date().toISOString(),
    });
    expect(follow).toMatchObject({
      kind: 'New follower',
      actorName: 'Moynul Haque',
      message: 'started following you',
      href: '/users/11',
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
        message: 'New follower: started following you',
        actor_name: 'Ahmed',
        actor_id: 11,
        deep_link: '/notification-center',
      },
      read_at: null,
      created_at: new Date().toISOString(),
    });
    expect(n.href).toBe('/users/11');
  });
});
