import { z } from 'zod';

/** Shared user model (auth + profile + feed). Wire stays snake_case; UI uses `toUserSummary`. */

export const userSummaryWireSchema = z.object({
  id: z.number(),
  name: z.string().nullable(),
  nickname: z.string().nullable(),
  avatar_url: z.string().nullable(),
  email: z.string().nullable().optional(),
  phone: z.string().nullable().optional(),
  date_of_birth: z.string().nullable().optional(),
  playing_role: z.string().nullable().optional(),
  playing_role_enum: z.string().nullable().optional(),
  bowling_style: z.string().nullable().optional(),
  bowling_style_enum: z.string().nullable().optional(),
  batting_style: z.string().nullable().optional(),
  batting_style_enum: z.string().nullable().optional(),
  country: z.string().nullable().optional(),
  city: z.string().nullable().optional(),
  followers_count: z.number().optional(),
  following_count: z.number().optional(),
  reels_count: z.number().optional(),
  posts_count: z.number().optional(),
  is_official: z.boolean().optional(),
  can_broadcast: z.boolean().optional(),
  broadcast_terms_accepted_at: z.string().nullable().optional(),
  /** Guideline 1.2 — set on register / POST /me/accept-terms. */
  terms_accepted_at: z.string().nullable().optional(),
  /** Present on /me when the user has a shop_vendors row (UserResource::self). */
  vendor: z
    .object({
      id: z.number(),
      store_name: z.string().nullable().optional(),
      status: z.string().nullable().optional(),
    })
    .nullable()
    .optional(),
});
export type UserSummaryWire = z.infer<typeof userSummaryWireSchema>;

export type UserVendorBrief = {
  id: number;
  storeName: string | null;
  status: string | null;
};

export type UserSummary = {
  id: number;
  name: string | null;
  nickname: string | null;
  avatarUrl: string | null;
  email: string | null;
  phone: string | null;
  dateOfBirth: string | null;
  playingRole: string | null;
  playingRoleEnum: string | null;
  bowlingStyle: string | null;
  bowlingStyleEnum: string | null;
  battingStyle: string | null;
  battingStyleEnum: string | null;
  country: string | null;
  city: string | null;
  followersCount: number;
  followingCount: number;
  reelsCount: number;
  postsCount: number;
  isOfficial: boolean;
  canBroadcast: boolean;
  broadcastTermsAcceptedAt: string | null;
  termsAcceptedAt: string | null;
  vendor: UserVendorBrief | null;
};

export function toUserSummary(wire: UserSummaryWire): UserSummary {
  return {
    id: wire.id,
    name: wire.name,
    nickname: wire.nickname,
    avatarUrl: wire.avatar_url,
    email: wire.email ?? null,
    phone: wire.phone ?? null,
    dateOfBirth: wire.date_of_birth ?? null,
    playingRole: wire.playing_role ?? null,
    playingRoleEnum: wire.playing_role_enum ?? null,
    bowlingStyle: wire.bowling_style ?? null,
    bowlingStyleEnum: wire.bowling_style_enum ?? null,
    battingStyle: wire.batting_style ?? null,
    battingStyleEnum: wire.batting_style_enum ?? null,
    country: wire.country ?? null,
    city: wire.city ?? null,
    followersCount: wire.followers_count ?? 0,
    followingCount: wire.following_count ?? 0,
    reelsCount: wire.reels_count ?? 0,
    postsCount: wire.posts_count ?? 0,
    isOfficial: wire.is_official ?? false,
    canBroadcast: Boolean(wire.can_broadcast),
    broadcastTermsAcceptedAt: wire.broadcast_terms_accepted_at ?? null,
    termsAcceptedAt: wire.terms_accepted_at ?? null,
    vendor: wire.vendor
      ? {
          id: wire.vendor.id,
          storeName: wire.vendor.store_name ?? null,
          status: wire.vendor.status ?? null,
        }
      : null,
  };
}

export function userHandle(user: Pick<UserSummary, 'nickname' | 'name'>): string {
  if (user.nickname?.trim()) return user.nickname.trim();
  if (user.name?.trim()) return user.name.trim().replace(/\s+/g, '').toLowerCase();
  return 'player';
}

export function userLocation(user: Pick<UserSummary, 'city' | 'country'>): string | null {
  const parts = [user.city, user.country].filter(Boolean);
  return parts.length ? parts.join(', ') : null;
}

export function userRoleChips(user: UserSummary): string[] {
  return [user.playingRole, user.battingStyle, user.bowlingStyle].filter((v): v is string => Boolean(v && v.trim()));
}
