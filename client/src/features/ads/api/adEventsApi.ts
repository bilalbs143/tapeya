import { z } from 'zod';

import { baseApi } from '@/shared/api/baseApi';
import { unwrapData } from '@/shared/api/unwrap';

import type { AdClientEvent } from '../model/schemas';

const sendResultSchema = z.object({
  accepted: z.number(),
  duplicates: z.number(),
  rejected: z.number(),
});

export type SendAdEventsResult = z.infer<typeof sendResultSchema>;

export const adEventsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    sendAdEvents: build.mutation<SendAdEventsResult, { events: AdClientEvent[] }>({
      query: ({ events }) => ({
        url: '/ads/events',
        method: 'POST',
        body: { events },
      }),
      transformResponse: (raw: unknown) => unwrapData(sendResultSchema)(raw),
    }),
  }),
});

export const { useSendAdEventsMutation } = adEventsApi;
