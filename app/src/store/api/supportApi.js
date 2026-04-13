import { baseApi } from './baseApi';

export const supportApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    submitSupportMessage: builder.mutation({
      query: (payload) => {
        const { attachment, ...fields } = payload;
        if (attachment instanceof File) {
          const formData = new FormData();
          formData.append('name', fields.name);
          if (fields.phone) {
            formData.append('phone', fields.phone);
          }
          formData.append('message', fields.message);
          formData.append('attachment', attachment);
          return {
            url: '/support/messages',
            method: 'POST',
            body: formData,
          };
        }
        return {
          url: '/support/messages',
          method: 'POST',
          body: fields,
        };
      },
    }),
  }),
});

export const { useSubmitSupportMessageMutation } = supportApi;
