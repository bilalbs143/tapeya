import { baseApi } from '@/shared/api/baseApi';
import { unwrapMessage } from '@/shared/api/unwrap';

export const deviceTokenApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    registerDeviceToken: builder.mutation<
      string | undefined,
      { token: string; platform: 'ios' | 'android'; appVersion?: string | undefined }
    >({
      query: ({ token, platform, appVersion }) => ({
        url: '/device-tokens',
        method: 'POST',
        body: {
          token,
          platform,
          ...(appVersion ? { app_version: appVersion } : {}),
        },
      }),
      transformResponse: (raw: unknown) => unwrapMessage()(raw),
    }),
  }),
});

export const { useRegisterDeviceTokenMutation } = deviceTokenApi;
