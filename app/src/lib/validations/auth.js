import { z } from 'zod';

/** Shared: non-empty email */
const emailSchema = z
  .string()
  .min(1, 'Email is required')
  .email('Please enter a valid email address');

/** Shared: password with min length */
const passwordSchema = z
  .string()
  .min(1, 'Password is required')
  .min(8, 'Password must be at least 8 characters');

/** Login form */
export const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

/** Register form (extend as needed) */
export const registerSchema = z
  .object({
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

/** Forgot password: email only */
export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

/** OTP verification */
export const otpSchema = z.object({
  code: z
    .string()
    .min(1, 'Code is required')
    .regex(/^\d+$/, 'Code must contain only digits')
    .length(6, 'Code must be 6 digits'),
});
