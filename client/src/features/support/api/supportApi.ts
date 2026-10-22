import { z } from 'zod';

import { baseApi } from '@/shared/api/baseApi';
import { unwrapMutation } from '@/shared/api/unwrap';

export type SubmitSupportMessageBody = {
  name: string;
  phone?: string | undefined;
  message: string;
  attachment?: File | undefined;
};

const submitDataSchema = z
  .object({
    id: z.number().optional(),
  })
  .passthrough();

const DEFAULT_SUCCESS = 'Your message has been sent. We will get back to you soon.';

export const supportApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    submitSupportMessage: builder.mutation<{ message: string }, SubmitSupportMessageBody>({
      query: (payload) => {
        const { attachment, ...fields } = payload;
        if (attachment instanceof File) {
          const formData = new FormData();
          formData.append('name', fields.name);
          if (fields.phone) formData.append('phone', fields.phone);
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
      transformResponse: (raw: unknown) => {
        const result = unwrapMutation(submitDataSchema)(raw);
        return {
          message: result.message?.trim() || DEFAULT_SUCCESS,
        };
      },
    }),
  }),
});

export const { useSubmitSupportMessageMutation } = supportApi;
