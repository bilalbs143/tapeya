import { z } from 'zod';

/** Shared: optional email; when provided must be valid */
const emailSchema = z
  .union([
    z.string().email('Please enter a valid email address'),
    z.literal(''),
  ])
  .optional()
  .transform((v) => (v === '' ? undefined : v));

/** Shared: non-empty name (full name) */
const nameSchema = z.string().min(1, 'Name is required');

/** Phone: optional leading +, then at least one digit */
const phoneSchema = z
  .string()
  .min(1, 'Phone is required')
  .refine(
    (v) => /^\+\d+$/.test(v) && v.length >= 2,
    'Enter a valid phone number',
  );

/** Login form (phone only) */
export const loginSchema = z.object({
  phone: phoneSchema,
});

/** Nickname: letters, numbers, underscores only; unique on backend */
const nicknameSchema = z
  .string()
  .min(1, 'Nickname is required')
  .max(50, 'Nickname must be at most 50 characters')
  .regex(
    /^[a-zA-Z0-9_]+$/,
    'Nickname may only contain letters, numbers and underscores',
  );

/** Register form: phone, name, nickname, optional email (backend: email nullable) */
export const registerSchema = z.object({
  phone: phoneSchema,
  name: nameSchema,
  nickname: nicknameSchema,
  email: emailSchema.optional(),
});

/** Profile edit: optional nickname; when provided same format as register (unique validated on backend) */
export const profileNicknameSchema = z
  .string()
  .max(50, 'Nickname must be at most 50 characters')
  .regex(
    /^[a-zA-Z0-9_]*$/,
    'Nickname may only contain letters, numbers and underscores',
  )
  .optional()
  .transform((v) => (v === '' ? undefined : v));

/** Profile update payload (optional fields) */
export const updateProfileSchema = z.object({
  name: z.string().min(1).optional(),
  nickname: profileNicknameSchema,
  email: emailSchema.optional(),
  phone: z.string().optional(),
  date_of_birth: z.string().optional(),
  playing_role: z.string().optional(),
  bowling_style: z.string().optional(),
  batting_style: z.string().optional(),
  country: z.string().optional(),
  city: z.string().optional(),
});

/** OTP verification (6 digits) */
export const otpSchema = z.object({
  code: z
    .string()
    .min(1, 'Code is required')
    .regex(/^\d+$/, 'Code must contain only digits')
    .length(6, 'Code must be 6 digits'),
});

/** OTP verification (5 digits, for digit-by-digit input UI) */
export const otp5Schema = z.object({
  code: z
    .string()
    .min(1, 'Code is required')
    .regex(/^\d+$/, 'Code must contain only digits')
    .length(5, 'Code must be 5 digits'),
});
