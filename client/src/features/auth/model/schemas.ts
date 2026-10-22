import { z } from 'zod';

import { toUserSummary, type UserSummary, userSummaryWireSchema } from '@/entities/user';

import { OTP_LENGTH } from '../lib/constants';

/** `+` plus country code and digits — matches the backend's phone rule. */
export const phoneSchema = z
  .string()
  .min(1, 'Phone number is required')
  .regex(/^\+[1-9]\d{6,14}$/, 'Include your country code, e.g. +923001234567');

export const requestOtpInputSchema = z.object({
  phone: phoneSchema,
});
export type RequestOtpInput = z.infer<typeof requestOtpInputSchema>;

export const otpCodeSchema = z
  .string()
  .length(OTP_LENGTH, `Enter the ${OTP_LENGTH}-digit code`)
  .regex(/^\d+$/, 'Code must be numbers only');

export const verifyOtpInputSchema = z.object({
  phone: phoneSchema,
  code: otpCodeSchema,
});
export type VerifyOtpInput = z.infer<typeof verifyOtpInputSchema>;

export const registerInputSchema = z.object({
  name: z.string().min(1).max(255),
  nickname: z.string().min(1).max(50),
  phone: phoneSchema,
  /** Laravel `accept_terms` — must be true (Guideline 1.2). */
  accept_terms: z.literal(true),
});
export type RegisterInput = z.infer<typeof registerInputSchema>;

/** Verify OTP wire — `{ user, auth: { access_token, token_type } }`. */
export const verifyOtpResultWireSchema = z.object({
  user: userSummaryWireSchema,
  auth: z.object({
    access_token: z.string(),
    token_type: z.string(),
  }),
});
export type VerifyOtpResultWire = z.infer<typeof verifyOtpResultWireSchema>;

export type VerifyOtpResult = {
  user: UserSummary;
  auth: { accessToken: string; tokenType: string };
};

export function toVerifyOtpResult(wire: VerifyOtpResultWire): VerifyOtpResult {
  return {
    user: toUserSummary(wire.user),
    auth: {
      accessToken: wire.auth.access_token,
      tokenType: wire.auth.token_type,
    },
  };
}

export const requestOtpResultWireSchema = z
  .object({
    otp: z.string().optional(),
  })
  .nullable()
  .optional();

export type RequestOtpResult = {
  otp?: string;
};

export const registerResultWireSchema = z.object({
  user: userSummaryWireSchema,
  otp: z.string().optional(),
});

export type RegisterResult = {
  user: UserSummary;
  otp?: string;
};

export function toRegisterResult(wire: z.infer<typeof registerResultWireSchema>): RegisterResult {
  return {
    user: toUserSummary(wire.user),
    ...(wire.otp ? { otp: wire.otp } : {}),
  };
}
