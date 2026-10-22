import { http, HttpResponse } from 'msw';

import { env } from '@/shared/config/env';

const countriesFixture = [
  { id: 1, name: 'Pakistan', country_code: 'PK' },
  { id: 2, name: 'United Arab Emirates', country_code: 'AE' },
  { id: 3, name: 'United Kingdom', country_code: 'GB' },
];

const citiesByCode: Record<string, Array<{ id: number; name: string }>> = {
  PK: [
    { id: 1, name: 'Karachi' },
    { id: 2, name: 'Lahore' },
    { id: 3, name: 'Islamabad' },
  ],
  AE: [
    { id: 4, name: 'Dubai' },
    { id: 5, name: 'Abu Dhabi' },
  ],
  GB: [
    { id: 6, name: 'London' },
    { id: 7, name: 'Manchester' },
  ],
};

export const locationHandlers = [
  http.get(`${env.VITE_API_URL}/countries`, () =>
    HttpResponse.json({ type: 'SUCCESS', message: null, data: countriesFixture })
  ),
  http.get(`${env.VITE_API_URL}/countries/cities`, ({ request }) => {
    const code = new URL(request.url).searchParams.get('country_code') ?? '';
    const data = citiesByCode[code] ?? [];
    return HttpResponse.json({ type: 'SUCCESS', message: null, data });
  }),
];
