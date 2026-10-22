import { z } from 'zod';

import { baseApi } from '@/shared/api/baseApi';
import { unwrapData, unwrapList } from '@/shared/api/unwrap';

import { type PublicProfile, publicProfileWireSchema, toPublicProfile } from '../model/schemas';

function mapProfile(raw: unknown): PublicProfile {
  return toPublicProfile(unwrapData(publicProfileWireSchema)(raw));
}

/** Lookup row — `GET /users/lookup` (squad/typeahead; nickname resolve). */

const lookupUserWireSchema = z.object({
  id: z.number(),
  name: z.string().nullable().optional(),
  nickname: z.string().nullable().optional(),
  phone: z.string().nullable().optional(),
  playing_role: z.string().nullable().optional(),
  playing_role_enum: z.string().nullable().optional(),
});
export type LookupUser = {
  id: number;
  name: string | null;
  nickname: string | null;
  phone: string | null;
  playingRole: string | null;
  playingRoleEnum: string | null;
};

function mapLookup(raw: unknown): LookupUser[] {
  return unwrapList(lookupUserWireSchema)(raw).map((u) => ({
    id: u.id,
    name: u.name ?? null,
    nickname: u.nickname ?? null,
    phone: u.phone ?? null,
    playingRole: u.playing_role ?? null,
    playingRoleEnum: u.playing_role_enum ?? null,
  }));
}

export const profileApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getUserProfile: builder.query<PublicProfile, number>({
      query: (userId) => `/users/${userId}/profile`,
      transformResponse: mapProfile,
      providesTags: (_r, _e, userId) => [{ type: 'User', id: userId }],
    }),
    /** Resolve nickname → id via typeahead; caller picks exact nickname match. */
    lookupUsers: builder.query<LookupUser[], string>({
      query: (search) => ({
        url: '/users/lookup',
        params: { search },
      }),
      transformResponse: mapLookup,
    }),
    /** Walk-ups this scorer already created — GET /users/lookup?mine=1. */
    // eslint-disable-next-line @typescript-eslint/no-invalid-void-type -- RTK Query no-arg query
    lookupMyUsers: builder.query<LookupUser[], void>({
      query: () => ({
        url: '/users/lookup',
        params: { mine: 1 },
      }),
      transformResponse: mapLookup,
    }),
  }),
});

export const { useGetUserProfileQuery, useLookupUsersQuery, useLookupMyUsersQuery } = profileApi;
