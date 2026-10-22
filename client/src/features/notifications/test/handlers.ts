import { http, HttpResponse } from 'msw';

import { env } from '@/shared/config/env';

const now = new Date();
const yesterday = new Date(now);
yesterday.setDate(yesterday.getDate() - 1);
const earlier = new Date(now);
earlier.setDate(earlier.getDate() - 5);

const fixtures = [
  {
    id: 'n1',
    type: 'post_liked',
    data: {
      message: 'Like: Sara liked your post.',
      actor_name: 'Sara Ali',
      deep_link: '/feed/8',
    },
    read_at: null,
    created_at: now.toISOString(),
  },
  {
    id: 'n2',
    type: 'user_followed',
    data: {
      message: 'Follow: Ahmed started following you.',
      actor_name: 'Ahmed Khan',
      actor_id: 11,
      deep_link: '/notification-center',
    },
    read_at: null,
    created_at: yesterday.toISOString(),
  },
  {
    id: 'n3',
    type: 'order_status',
    data: {
      message: 'Order: Your order has been shipped.',
      order_id: 9,
      deep_link: '/shop/orders/9',
    },
    read_at: earlier.toISOString(),
    created_at: earlier.toISOString(),
  },
];

export const notificationsHandlers = [
  http.get(`${env.VITE_API_URL}/notifications`, ({ request }) => {
    const url = new URL(request.url);
    const page = Number(url.searchParams.get('page') ?? 1);
    const perPage = Number(url.searchParams.get('per_page') ?? 10);
    const start = (page - 1) * perPage;
    const slice = fixtures.slice(start, start + perPage);
    const unread = fixtures.filter((n) => !n.read_at).length;
    return HttpResponse.json({
      data: slice,
      meta: {
        current_page: page,
        last_page: Math.max(1, Math.ceil(fixtures.length / perPage)),
        per_page: perPage,
        total: fixtures.length,
        unread_count: unread,
      },
    });
  }),

  http.patch(`${env.VITE_API_URL}/notifications/read-all`, () => {
    for (const n of fixtures) {
      if (!n.read_at) n.read_at = new Date().toISOString();
    }
    return HttpResponse.json({ message: 'All notifications marked as read.', type: 'SUCCESS' });
  }),

  http.patch(`${env.VITE_API_URL}/notifications/:id/read`, ({ params }) => {
    const row = fixtures.find((n) => n.id === params.id);
    if (row && !row.read_at) row.read_at = new Date().toISOString();
    return HttpResponse.json({
      data: row ?? null,
      message: 'Notification marked as read.',
      type: 'SUCCESS',
    });
  }),
];
