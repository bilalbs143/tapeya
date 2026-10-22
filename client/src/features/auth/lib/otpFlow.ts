import { getOtpPreview, getOtpPreviewSession } from './otpPreviewSession';

export type OtpLocationState = {
  phone?: string;
  debugOtp?: string;
  justRegistered?: boolean;
  returnTo?: string;
  from?: string;
};

export type OtpStatus = 'idle' | 'verifying' | 'invalid' | 'blocked';

export function resolveOtpPhone(state: OtpLocationState | null): string | null {
  if (state?.phone) return state.phone;
  return getOtpPreviewSession()?.phone ?? null;
}

export function resolveLatestOtp(phone: string | null, state: OtpLocationState | null): string | null {
  if (state?.debugOtp != null && state.debugOtp !== '') return String(state.debugOtp);
  if (phone) return getOtpPreview(phone);
  return getOtpPreviewSession()?.otp ?? null;
}

/** Digits-only OTP suitable for auto-fill when settings have loaded. */
export function otpAutoFillDigits(
  latestOtp: string | null | undefined,
  opts: { testPhonesReady: boolean; isTestPhone: boolean; hasPhone: boolean }
): string {
  if (!opts.testPhonesReady || !latestOtp || opts.isTestPhone || !opts.hasPhone) return '';
  return String(latestOtp).replace(/\D/g, '');
}
