import { z } from 'zod';

/** Shared: optional email; when provided must be valid */
const emailSchema = z
  .union([z.string().email('Please enter a valid email address'), z.literal('')])
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

/** Register form: phone, name, optional email (backend: email nullable) */
export const registerSchema = z.object({
  phone: phoneSchema,
  name: nameSchema,
  email: emailSchema.optional(),
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
