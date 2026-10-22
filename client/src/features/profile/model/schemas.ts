import { z } from 'zod';

import { toUserSummary, type UserSummary, userSummaryWireSchema } from '@/entities/user';

export const PROFILE_FIELD_NONE = '__none__';

const NAME_REGEX = /^[A-Za-z]+(?:\s+[A-Za-z]+)*$/;

export const editProfileFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Name is required')
    .max(255)
    .regex(NAME_REGEX, 'Name may only contain letters and spaces'),
  nickname: z
    .string()
    .trim()
    .min(1, 'Nickname is required')
    .max(50)
    .regex(NAME_REGEX, 'Nickname may only contain letters and spaces'),
  email: z
    .string()
    .trim()
    .superRefine((value, ctx) => {
      if (!value) return;
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        ctx.addIssue({ code: 'custom', message: 'Enter a valid email address' });
      }
    }),
  dateOfBirth: z.string().superRefine((value, ctx) => {
    if (!value.trim()) return;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      ctx.addIssue({ code: 'custom', message: 'Enter a valid date of birth' });
      return;
    }
    if (new Date(value) >= new Date()) {
      ctx.addIssue({ code: 'custom', message: 'Date of birth must be in the past' });
    }
  }),
  playingRole: z.string(),
  battingStyle: z.string(),
  bowlingStyle: z.string(),
  country: z.string().max(100),
  city: z.string().max(100),
});
export type EditProfileFormValues = z.infer<typeof editProfileFormSchema>;

/** Wire body for PATCH/POST /profile (no avatar file). */

export type UpdateProfileWire = {
  name: string;
  nickname: string;
  email?: string | null;
  date_of_birth?: string | null;
  playing_role?: string | null;
  batting_style?: string | null;
  bowling_style?: string | null;
  country?: string | null;
  city?: string | null;
  avatar?: File | null;
};

export function toUpdateProfileWire(values: EditProfileFormValues): UpdateProfileWire {
  const none = (v: string) => (v && v !== PROFILE_FIELD_NONE ? v : null);
  return {
    name: values.name.trim(),
    nickname: values.nickname.trim(),
    email: values.email.trim() || null,
    date_of_birth: values.dateOfBirth.trim() || null,
    playing_role: none(values.playingRole),
    batting_style: none(values.battingStyle),
    bowling_style: none(values.bowlingStyle),
    country: values.country.trim() || null,
    city: values.city.trim() || null,
  };
}

/** Laravel enum *name* (ALL_ROUNDER) or value (all_rounder) → select value. */

export function enumToSelectValue(
  enumName: string | null | undefined,
  enumValueOrLabel: string | null | undefined,
  options: readonly { value: string; label: string }[]
): string {
  if (enumName) {
    const asValue = enumName.toLowerCase();
    if (options.some((o) => o.value === asValue)) return asValue;
  }
  if (enumValueOrLabel) {
    const hit = options.find(
      (o) => o.value === enumValueOrLabel || o.label.toLowerCase() === enumValueOrLabel.toLowerCase()
    );
    if (hit) return hit.value;
  }
  return PROFILE_FIELD_NONE;
}

const STRENGTH_FIELDS: (keyof EditProfileFormValues)[] = [
  'name',
  'nickname',
  'email',
  'dateOfBirth',
  'playingRole',
  'battingStyle',
  'bowlingStyle',
  'country',
  'city',
];

export const PROFILE_STRENGTH_TOTAL = STRENGTH_FIELDS.length + 1;

const GAP_META = {
  avatar: { id: 'profile-photo', label: 'Photo' },
  playingRole: { id: 'profile-playing-role', label: 'Playing role' },
  city: { id: 'profile-city', label: 'City' },
  name: { id: 'profile-name', label: 'Name' },
  nickname: { id: 'profile-nickname', label: 'Nickname' },
  email: { id: 'profile-email', label: 'Email' },
  dateOfBirth: { id: 'profile-dob', label: 'Date of birth' },
  battingStyle: { id: 'profile-batting', label: 'Batting style' },
  bowlingStyle: { id: 'profile-bowling', label: 'Bowling style' },
  country: { id: 'profile-country', label: 'Country' },
} as const;

const GAP_ORDER = [
  'avatar',
  'playingRole',
  'city',
  'name',
  'nickname',
  'email',
  'dateOfBirth',
  'battingStyle',
  'bowlingStyle',
  'country',
] as const;

export type ProfileGap = { id: string; label: string };

function fieldFilled(value: string | undefined): boolean {
  const trimmed = value?.trim();
  return Boolean(trimmed && trimmed !== PROFILE_FIELD_NONE);
}

/** Missing strength steps, photo and role first so the chips match the edit screen. */

export function profileGaps(values: EditProfileFormValues, hasAvatar: boolean): ProfileGap[] {
  const gaps: ProfileGap[] = [];
  for (const key of GAP_ORDER) {
    if (key === 'avatar') {
      if (!hasAvatar) gaps.push(GAP_META.avatar);
      continue;
    }
    if (!fieldFilled(values[key])) gaps.push(GAP_META[key]);
  }
  return gaps;
}

export function profileStrength(values: EditProfileFormValues, hasAvatar: boolean): number {
  const filled = PROFILE_STRENGTH_TOTAL - profileGaps(values, hasAvatar).length;
  return Math.round((filled / PROFILE_STRENGTH_TOTAL) * 100);
}

/** Public profile wire — `PublicUserProfileResource` (+ viewer follow / block flags). */

export const publicProfileWireSchema = userSummaryWireSchema
  .omit({
    email: true,
    phone: true,
    date_of_birth: true,
  })
  .extend({
    is_following: z.boolean().optional(),
    is_blocked: z.boolean().optional(),
  });

export type PublicProfileWire = z.infer<typeof publicProfileWireSchema>;

export type PublicProfile = UserSummary & {
  isFollowing: boolean;
  isBlocked: boolean;
};

export function toPublicProfile(wire: PublicProfileWire): PublicProfile {
  return {
    ...toUserSummary(wire),
    isFollowing: Boolean(wire.is_following),
    isBlocked: Boolean(wire.is_blocked),
  };
}
