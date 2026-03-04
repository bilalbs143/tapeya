import { baseApi } from './baseApi';

/**
 * User notifications API – per-user notifications for the mobile app.
 * Backed by Laravel's DatabaseNotification + User\NotificationResource.
 *
 * GET /notifications
 * PATCH /notifications/read-all
 * PATCH /notifications/{id}/read
 */
export const notificationApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getNotifications: builder.query({
      query: (params = {}) => ({
        url: '/notifications',
        params: {
          per_page: params.per_page ?? 10,
          page: params.page ?? 1,
        },
      }),
      transformResponse: (response) => ({
        data: response?.data ?? [],
        meta: response?.meta,
      }),
      providesTags: (result) =>
        result?.data && Array.isArray(result.data) && result.data.length
          ? [
              ...result.data.map((n) => ({ type: 'Item', id: n.id })),
              { type: 'List', id: 'Notifications' },
            ]
          : [{ type: 'List', id: 'Notifications' }],
    }),
    markAllNotificationsRead: builder.mutation({
      query: () => ({
        url: '/notifications/read-all',
        method: 'PATCH',
      }),
      invalidatesTags: [{ type: 'List', id: 'Notifications' }],
    }),
    markNotificationRead: builder.mutation({
      query: (id) => ({
        url: `/notifications/${id}/read`,
        method: 'PATCH',
      }),
      invalidatesTags: (_result, _err, id) => [
        { type: 'Item', id },
        { type: 'List', id: 'Notifications' },
      ],
    }),
  }),
});

export const {
  useGetNotificationsQuery,
  useMarkAllNotificationsReadMutation,
  useMarkNotificationReadMutation,
} = notificationApi;

