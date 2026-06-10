/**
 * User-scoped media API — upload and delete media fields on user-owned records.
 *
 * POST   /media/{type}/{id}/{field}  — upload / replace  (multipart, key "file")
 * DELETE /media/{type}/{id}/{field}  — remove
 *
 * Registered types:  team/logo  |  match/thumbnail  |  interest-submission/profile_picture  |  interest-submission/id_document
 *
 * Usage:
 *   const [uploadMedia] = useUploadMediaMutation();
 *   const { url } = await uploadMedia({ type: 'team', id: 5, field: 'logo', file }).unwrap();
 *
 *   const [deleteMedia] = useDeleteMediaMutation();
 *   await deleteMedia({ type: 'team', id: 5, field: 'logo' }).unwrap();
 */

import { baseApi } from './baseApi';

export const mediaApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    /**
     * Upload or replace a media field.
     * Sends a FormData body with key "file".
     * Returns { data: { url: string } } on success.
     */
    uploadMedia: builder.mutation({
      query: ({ type, id, field, file }) => {
        const fd = new FormData();
        fd.append('file', file);
        return {
          url: `/media/${type}/${id}/${field}`,
          method: 'POST',
          body: fd,
        };
      },
    }),

    /**
     * Remove a media field (sets DB column to null, deletes the stored file).
     */
    deleteMedia: builder.mutation({
      query: ({ type, id, field }) => ({
        url: `/media/${type}/${id}/${field}`,
        method: 'DELETE',
      }),
    }),
  }),
});

export const { useUploadMediaMutation, useDeleteMediaMutation } = mediaApi;

// ── Payload helpers ───────────────────────────────────────────────────────────

/** Known fields uploaded after create via POST /media/{type}/{id}/{field}. */
const DEFERRED_MEDIA_FIELD_NAMES = ['thumbnail', 'logo', 'avatar'];

/**
 * Strip file fields from a mutation payload so the request body stays JSON.
 * Upload files separately with uploadMediaFile() once the record id exists.
 *
 * @param {Record<string, unknown>} payload
 * @returns {Record<string, unknown>}
 */
export function stripDeferredMediaFields(payload) {
  const body = { ...payload };
  for (const name of DEFERRED_MEDIA_FIELD_NAMES) {
    delete body[name];
  }
  for (const key of Object.keys(body)) {
    if (body[key] instanceof File) {
      delete body[key];
    }
  }
  return body;
}

// ── Standalone helper ─────────────────────────────────────────────────────────

/**
 * Upload a file to a media field and return the new URL.
 * Throws on error (let the caller handle it).
 *
 * @param {ReturnType<typeof useUploadMediaMutation>[0]} uploadFn  RTK mutation trigger
 * @param {{ type: string, id: number, field: string, file: File }} opts
 * @returns {Promise<string>} The new public URL of the uploaded file
 */
export async function uploadMediaFile(uploadFn, { type, id, field, file }) {
  const result = await uploadFn({ type, id, field, file }).unwrap();
  return result?.url ?? result?.data?.url ?? '';
}
