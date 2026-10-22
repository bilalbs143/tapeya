import { baseApi } from '@/shared/api/baseApi';
import { unwrapMessage } from '@/shared/api/unwrap';

import { type NotificationPage, parseNotificationPage } from '../model/schemas';

type ListArg = { page?: number; perPage?: number };

export const notificationsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    /** Badge — same list tag so read mutations keep the bell in sync. */
    // eslint-disable-next-line @typescript-eslint/no-invalid-void-type -- RTK Query no-arg query
    getNotificationUnreadCount: builder.query<{ unreadCount: number }, void>({
      query: () => ({
        url: '/notifications',
        params: { per_page: 1, page: 1 },
      }),
      transformResponse: (raw: unknown) => {
        const page = parseNotificationPage(raw);
        return { unreadCount: page.meta.unreadCount };
      },
      providesTags: [{ type: 'Notification', id: 'LIST' }],
    }),

    getNotifications: builder.query<NotificationPage, ListArg>({
      query: (arg = {}) => ({
        url: '/notifications',
        params: {
          page: arg.page ?? 1,
          per_page: arg.perPage ?? 10,
        },
      }),
      transformResponse: (raw: unknown) => parseNotificationPage(raw),
      providesTags: (result) =>
        result
          ? [
              ...result.items.map((n) => ({ type: 'Notification' as const, id: n.id })),
              { type: 'Notification', id: 'LIST' },
            ]
          : [{ type: 'Notification', id: 'LIST' }],
    }),

    // eslint-disable-next-line @typescript-eslint/no-invalid-void-type -- RTK Query no-arg mutation
    markAllNotificationsRead: builder.mutation<string | undefined, void>({
      query: () => ({
        url: '/notifications/read-all',
        method: 'PATCH',
      }),
      transformResponse: (raw: unknown) => unwrapMessage()(raw),
      invalidatesTags: [{ type: 'Notification', id: 'LIST' }],
    }),

    markNotificationRead: builder.mutation<string | undefined, string>({
      query: (id) => ({
        url: `/notifications/${id}/read`,
        method: 'PATCH',
      }),
      transformResponse: (raw: unknown) => unwrapMessage()(raw),
      invalidatesTags: (_r, _e, id) => [
        { type: 'Notification', id },
        { type: 'Notification', id: 'LIST' },
      ],
    }),
  }),
});

export const {
  useGetNotificationUnreadCountQuery,
  useGetNotificationsQuery,
  useLazyGetNotificationsQuery,
  useMarkAllNotificationsReadMutation,
  useMarkNotificationReadMutation,
} = notificationsApi;
