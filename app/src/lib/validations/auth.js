import { isValidPhoneNumber } from 'libphonenumber-js/min';
import { z } from 'zod';

import { normalizePhoneE164 } from '@/lib/phoneCodes';
import { toApiDate } from '@/lib/utils/dateUtils';

import { phoneSchema } from './shared';

const EMAIL_WITH_VALID_TLD_REGEX =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*\.[a-zA-Z]{2,24}$/;
const NAME_TEXT_ONLY_REGEX = /^[A-Za-z]+(?:\s+[A-Za-z]+)*$/;

const emailSchema = z
  .union([
    z
      .string()
      .trim()
      .email('Please enter a valid email address')
      .refine((value) => EMAIL_WITH_VALID_TLD_REGEX.test(value), 'Please enter a valid email address'),
    z.literal(''),
  ])
  .optional()
  .transform((v) => (v === '' ? undefined : v));

const nameSchema = z
  .string()
  .trim()
  .min(1, 'Name is required')
  .regex(NAME_TEXT_ONLY_REGEX, 'Name may only contain letters and spaces');

export const loginSchema = z.object({
  phone: phoneSchema,
});

const nicknameSchema = z
  .string()
  .min(1, 'Nickname is required')
  .max(50, 'Nickname must be at most 50 characters')
  .regex(/^[a-zA-Z0-9_]+$/, 'Nickname may only contain letters, numbers and underscores');

export const registerSchema = z.object({
  phone: phoneSchema,
  name: nameSchema,
  nickname: nicknameSchema,
  email: emailSchema.optional(),
});

export const updateProfileSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Name is required')
    .regex(NAME_TEXT_ONLY_REGEX, 'Name may only contain letters and spaces')
    .optional(),
  nickname: nicknameSchema,
  email: emailSchema.optional(),
  phone: z
    .string()
    .transform((v) => normalizePhoneE164(v))
    .refine((v) => {
      try {
        return isValidPhoneNumber(v);
      } catch {
        return false;
      }
    }, 'Enter a valid phone number for the selected country')
    .optional(),
  date_of_birth: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Please enter a valid date of birth')
    .optional(),
  bowling_style: z.union([z.string().min(1), z.null()]).optional(),
  batting_style: z.union([z.string().min(1), z.null()]).optional(),
  playing_role: z.union([z.string().min(1), z.null()]).optional(),
  country: z.string().optional(),
  city: z.string().optional(),
});

/** RHF form shape for UserEdit dialog (camelCase field names). */
export const userEditFormSchema = z.object({
  name: z.union([
    z.literal(''),
    z.string().trim().min(1, 'Name is required').regex(NAME_TEXT_ONLY_REGEX, 'Name may only contain letters and spaces'),
  ]),
  nickname: nicknameSchema,
  email: z
    .string()
    .trim()
    .superRefine((value, ctx) => {
      if (!value) return;
      const result = emailSchema.safeParse(value);
      if (!result.success) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: result.error.issues[0]?.message ?? 'Please enter a valid email address',
        });
      }
    }),
  dateOfBirth: z.string().superRefine((value, ctx) => {
    if (!value || !value.trim()) return;
    const api = toApiDate(value);
    if (!api || !/^\d{4}-\d{2}-\d{2}$/.test(api)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Please enter a valid date of birth',
      });
    }
  }),
  battingStyle: z.string(),
  bowlingStyle: z.string(),
  playingRole: z.string(),
  country: z.string(),
  city: z.string(),
});

export const otpSchema = z.object({
  code: z.string().min(1, 'Code is required').regex(/^\d+$/, 'Code must contain only digits').length(4, 'Code must be 4 digits'),
});

export const otp5Schema = z.object({
  code: z.string().min(1, 'Code is required').regex(/^\d+$/, 'Code must contain only digits').length(5, 'Code must be 5 digits'),
});
