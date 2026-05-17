import { isValidPhoneNumber } from 'libphonenumber-js/min';
import { z } from 'zod';

import { normalizePhoneE164 } from '@/lib/phoneCodes';

const emailSchema = z
  .union([z.string().email('Please enter a valid email address'), z.literal('')])
  .optional()
  .transform((v) => (v === '' ? undefined : v));

const nameSchema = z.string().min(1, 'Name is required');

const phoneSchema = z
  .string()
  .min(1, 'Phone is required')
  .transform((v) => normalizePhoneE164(v))
  .refine((v) => {
    try {
      return isValidPhoneNumber(v);
    } catch {
      return false;
    }
  }, 'Enter a valid phone number for the selected country');

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
  name: z.string().min(1).optional(),
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
  date_of_birth: z.string().optional(),
  bowling_style: z.union([z.string().min(1), z.null()]).optional(),
  batting_style: z.union([z.string().min(1), z.null()]).optional(),
  playing_role: z.union([z.string().min(1), z.null()]).optional(),
  country: z.string().optional(),
  city: z.string().optional(),
});

export const otpSchema = z.object({
  code: z.string().min(1, 'Code is required').regex(/^\d+$/, 'Code must contain only digits').length(4, 'Code must be 4 digits'),
});

export const otp5Schema = z.object({
  code: z.string().min(1, 'Code is required').regex(/^\d+$/, 'Code must contain only digits').length(5, 'Code must be 5 digits'),
});
