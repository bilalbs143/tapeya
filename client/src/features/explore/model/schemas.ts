import { z } from 'zod';

export const suggestedUserWireSchema = z.object({
  id: z.number(),
  name: z.string().nullable(),
  nickname: z.string().nullable(),
  avatar_url: z.string().nullable(),
  is_official: z.boolean().optional(),
  followers_count: z.number().optional(),
  playing_role: z.string().nullable().optional(),
  is_following: z.boolean().optional(),
  subtitle: z.string().optional(),
});

export type SuggestedUserWire = z.infer<typeof suggestedUserWireSchema>;

export type SuggestedUser = {
  id: number;
  name: string;
  /** Display handle (`nickname` or `user{id}` fallback). */
  handle: string;
  /** Raw nickname for profile URLs — null when the API had none. */
  nickname: string | null;
  avatarUrl: string | null;
  isOfficial: boolean;
  followersCount: number;
  role: string | null;
  following: boolean;
  subtitle: string;
};

export function toSuggestedUser(wire: SuggestedUserWire): SuggestedUser {
  const nickname = wire.nickname?.trim() || null;
  const name = wire.name?.trim() || nickname || 'Player';
  const handle = nickname || `user${wire.id}`;
  return {
    id: wire.id,
    name,
    handle,
    nickname,
    avatarUrl: wire.avatar_url,
    isOfficial: Boolean(wire.is_official),
    followersCount: wire.followers_count ?? 0,
    role: wire.playing_role ?? null,
    following: Boolean(wire.is_following),
    subtitle: wire.subtitle?.trim() || wire.playing_role || 'Suggested',
  };
}

export const followResultWireSchema = z.object({
  followers_count: z.number(),
  following_count: z.number(),
  am_following: z.boolean(),
});

export type FollowResult = {
  followersCount: number;
  followingCount: number;
  following: boolean;
};

export function toFollowResult(wire: z.infer<typeof followResultWireSchema>): FollowResult {
  return {
    followersCount: wire.followers_count,
    followingCount: wire.following_count,
    following: wire.am_following,
  };
}
