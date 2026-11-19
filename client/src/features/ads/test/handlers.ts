import { http, HttpResponse } from 'msw';

import { env } from '@/shared/config/env';

const base = env.VITE_API_URL.replace(/\/$/, '');

export const adsHandlers = [
  http.post(`${base}/ads/events`, async ({ request }) => {
    const body = (await request.json()) as { events?: unknown[] };
    const count = Array.isArray(body.events) ? body.events.length : 0;
    return HttpResponse.json({
      success: true,
      message: 'Ad events processed.',
      data: { accepted: count, duplicates: 0, rejected: 0 },
    });
  }),
];
