import { z } from 'zod';

/** Shared: non-empty email */
const emailSchema = z
  .string()
  .min(1, 'Email is required')
  .email('Please enter a valid email address');

/** Shared: non-empty name (full name) */
const nameSchema = z.string().min(1, 'Name is required');

/** Shared: password with min length */
const passwordSchema = z
  .string()
  .min(1, 'Password is required')
  .min(8, 'Password must be at least 8 characters');

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

/** Login form with name & password (e.g. Register) */
export const loginWithPasswordSchema = z.object({
  phone: phoneSchema,
  name: nameSchema,
  password: passwordSchema,
});

/** Register form (extend as needed) */
export const registerSchema = z
  .object({
    name: nameSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
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
