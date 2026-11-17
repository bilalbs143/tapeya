import { baseApi } from '@/shared/api/baseApi';
import { unwrapMessage } from '@/shared/api/unwrap';
import type { Platform } from '@/shared/platform/platform';

export const activePlatformApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    updateActivePlatform: builder.mutation<string | undefined, Platform>({
      query: (platform) => ({
        url: '/active-platform',
        method: 'PUT',
        body: { platform },
      }),
      transformResponse: (raw: unknown) => unwrapMessage()(raw),
    }),
  }),
});

export const { useUpdateActivePlatformMutation } = activePlatformApi;
