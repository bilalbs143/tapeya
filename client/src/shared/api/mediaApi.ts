import { z } from 'zod';

import { baseApi } from '@/shared/api/baseApi';
import { unwrapData, unwrapMessage } from '@/shared/api/unwrap';

const mediaUrlWireSchema = z.object({
  url: z.string(),
});

export type MediaUploadArg = {
  type: string;
  id: number;
  field: string;
  file: File;
};

/** User-scoped media POST/DELETE; deletes unwrap message envelope (HTTP 200). */
export const mediaApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    uploadMedia: builder.mutation<{ url: string }, MediaUploadArg>({
      query: ({ type, id, field, file }) => {
        const body = new FormData();
        body.append('file', file);
        return {
          url: `/media/${type}/${id}/${field}`,
          method: 'POST',
          body,
        };
      },
      transformResponse: (raw: unknown) => unwrapData(mediaUrlWireSchema)(raw),
    }),

    deleteMedia: builder.mutation<string | undefined, { type: string; id: number; field: string }>({
      query: ({ type, id, field }) => ({
        url: `/media/${type}/${id}/${field}`,
        method: 'DELETE',
      }),
      transformResponse: (raw: unknown) => unwrapMessage()(raw),
    }),
  }),
});

export const { useUploadMediaMutation, useDeleteMediaMutation } = mediaApi;

export async function uploadMediaFile(
  uploadFn: (arg: MediaUploadArg) => { unwrap: () => Promise<{ url: string }> },
  opts: MediaUploadArg
): Promise<string> {
  const result = await uploadFn(opts).unwrap();
  return result.url;
}
