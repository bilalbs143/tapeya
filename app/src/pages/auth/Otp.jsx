import { useCallback, useEffect, useRef, useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useLocation, useNavigate } from 'react-router-dom';

import { useToast } from '@/hooks/useToast';
import { AppEventParams, AppEvents, logEvent } from '@/lib/analytics/facebook';
import { getApiErrorMessage } from '@/lib/apiErrors';
import { consumeJustRegistered, markPendingCompleteProfilePrompt } from '@/lib/completeProfilePrompt';
import { CLOUDFRONT_APP_BASE } from '@/lib/constants/assets';
import { clearOtpPreview, extractOtpFromAuthResponse, getOtpPreview, setOtpPreview } from '@/lib/otpPreviewSession';
import { isReturningUser, markReturningUser } from '@/lib/returningUser';
import { addSavedProfile, bumpSavedProfile } from '@/lib/savedProfiles';
import { formatPhoneFull } from '@/lib/utils/phoneUtils';
import { getRedirectPath } from '@/lib/utils/routeUtils';
import { otpSchema } from '@/lib/validations/auth';
import { useRequestOtpMutation, useVerifyOtpMutation } from '@/store/api/authApi';
import { useAppDispatch } from '@/store/hooks';
import { setCredentials } from '@/store/slices/authSlice';
import { Button } from '@/ui/Button';
import { Input } from '@/ui/Input';

const tapeyaLogo = `${CLOUDFRONT_APP_BASE}/images/logos/tapeya-logo-white.svg`;

const OTP_LENGTH = 4;
const RESEND_COOLDOWN_SECONDS = 60;
const OTP_COOLDOWN_KEY = 'otp_resend_cooldown_end';

function getStoredCooldownRemaining() {
  try {
    const end = sessionStorage.getItem(OTP_COOLDOWN_KEY);
    if (!end) return 0;
    const remaining = Math.ceil((Number(end) - Date.now()) / 1000);
    return remaining > 0 ? remaining : 0;
  } catch {
    return 0;
  }
}

function setStoredCooldownEnd(secondsFromNow) {
  try {
    sessionStorage.setItem(OTP_COOLDOWN_KEY, String(Date.now() + secondsFromNow * 1000));
  } catch {
    // sessionStorage unavailable (e.g. private browsing restrictions) — ignore.
  }
}

export default function Otp() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { state } = useLocation();
  const toast = useToast();

  const phoneRaw = state?.phone ?? null;
  const phone = formatPhoneFull(phoneRaw ?? '');

  const [latestOtp, setLatestOtp] = useState(() => {
    // state?.otp is set by non-production environments only (APP_DEBUG / TEST_OTP_PHONES).
    if (state?.otp != null && state.otp !== '') return String(state.otp);
    if (phoneRaw) return getOtpPreview(phoneRaw);
    return null;
  });
  const [serverError, setServerError] = useState(null);
  const [resendError, setResendError] = useState(null);
  const [resendCooldown, setResendCooldown] = useState(() => getStoredCooldownRemaining());

  const refs = useRef([]);
  const submitRef = useRef(null);

  const [verifyOtp, { isLoading }] = useVerifyOtpMutation();
  const [requestOtp, { isLoading: isResendLoading }] = useRequestOtpMutation();

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((c) => Math.max(0, c - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  useEffect(
    () => () => {
      if (submitRef.current) clearTimeout(submitRef.current);
    },
    [],
  );

  // iOS Safari / WebView can drop router state on resume — recover OTP from sessionStorage.
  useEffect(() => {
    if (state?.otp != null && state.otp !== '') {
      setLatestOtp(String(state.otp));
      return;
    }
    if (phoneRaw) {
      const fromSession = getOtpPreview(phoneRaw);
      if (fromSession) setLatestOtp(fromSession);
    }
  }, [state?.otp, phoneRaw]);

  const {
    setValue,
    watch,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(otpSchema),
    defaultValues: { code: '' },
    mode: 'onSubmit',
  });

  const code = watch('code') || '';

  const onSubmit = useCallback(
    async ({ code: submittedCode }) => {
      if (!phoneRaw) {
        setServerError('Session expired. Please start from Login or Register.');
        return;
      }
      setServerError(null);

      try {
        const result = await verifyOtp({
          phone: phoneRaw,
          code: submittedCode,
        }).unwrap();
        const { user, auth } = result?.data ?? result ?? {};
        const token = auth?.access_token;

        if (token && user) {
          clearOtpPreview();
          const isNewUser = !isReturningUser();
          markReturningUser();
          if (isNewUser) {
            logEvent(AppEvents.COMPLETED_REGISTRATION, {
              [AppEventParams.REGISTRATION_METHOD]: 'phone',
            });
          }
          if (consumeJustRegistered(phoneRaw) && user.id) {
            markPendingCompleteProfilePrompt(user.id);
          }
          dispatch(setCredentials({ user, accessToken: token }));
          addSavedProfile({
            id: user.id,
            name: user.name,
            nickname: user.nickname,
            phone: user.phone,
            email: user.email,
            accessToken: token,
          });
          bumpSavedProfile(phoneRaw);
          navigate(getRedirectPath(state), { replace: true });
        } else {
          setServerError('Unexpected response. Please try again.');
        }
      } catch (err) {
        setServerError(getApiErrorMessage(err, 'Invalid OTP. Please try again.'));
      }
    },
    [phoneRaw, verifyOtp, dispatch, navigate, state],
  );

  const scheduleAutoSubmit = useCallback(() => {
    if (submitRef.current) clearTimeout(submitRef.current);
    submitRef.current = setTimeout(() => {
      submitRef.current = null;
      handleSubmit(onSubmit)();
    }, 300);
  }, [handleSubmit, onSubmit]);

  const setDigit = (index, value) => {
    const digit = value.replace(/\D/g, '').slice(0, 1);
    const chars = code.split('');
    chars[index] = digit;
    const nextCode = chars.join('').slice(0, OTP_LENGTH);
    setValue('code', nextCode);
    if (digit && index < OTP_LENGTH - 1) refs.current[index + 1]?.focus();
    if (nextCode.length === OTP_LENGTH) scheduleAutoSubmit();
  };

  const onKeyDown = (index, e) => {
    // Move focus backward on Backspace when the current cell is already empty.
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      refs.current[index - 1]?.focus();
    }
  };

  const onPaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH);
    setValue('code', pasted);
    refs.current[Math.min(pasted.length, OTP_LENGTH - 1)]?.focus();
    if (pasted.length === OTP_LENGTH) scheduleAutoSubmit();
  };

  const handleResend = async () => {
    if (!phoneRaw) {
      setResendError('Session expired. Please start from Login or Register.');
      return;
    }
    setResendError(null);

    try {
      const result = await requestOtp({ phone: phoneRaw }).unwrap();
      toast.success('OTP sent again!');
      const otp = extractOtpFromAuthResponse(result);
      if (otp) {
        setOtpPreview(phoneRaw, otp);
        setLatestOtp(otp);
      }
      setResendCooldown(RESEND_COOLDOWN_SECONDS);
      setStoredCooldownEnd(RESEND_COOLDOWN_SECONDS);
    } catch (err) {
      setResendError(getApiErrorMessage(err, 'Could not resend OTP. Please try again.'));
    }
  };

  const busy = isSubmitting || isLoading || isResendLoading;

  return (
    <>
      {/* Ambient glow — decorative only */}
      <div
        className="pointer-events-none fixed top-[-115px] left-1/2 z-0 h-[302px] w-[622px] -translate-x-1/2 rounded-full bg-[#FF9700] opacity-50 blur-[200px] lg:top-[-260px] lg:w-[1159px]"
        aria-hidden
      />

      <div className="relative z-10 flex w-full flex-col items-center px-6 pt-6 sm:pt-8 md:pt-10 lg:pt-16">
        <img
          src={tapeyaLogo}
          alt="Tapeya"
          className="motion-safe:animate-splash-slide-up h-auto w-[240px] opacity-0 motion-reduce:opacity-100 lg:w-[280px]"
        />
        <p className="motion-safe:animate-splash-slide-up-delayed mt-6 max-w-[90vw] text-center font-sans text-base text-white opacity-0 motion-reduce:opacity-100">
          Live Cricket &amp; Instant Updates, Anytime!
        </p>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="mt-12 w-full max-w-[358px] space-y-6 lg:mt-14 lg:max-w-[400px] lg:px-0 lg:py-15"
        >
          <p className="text-center text-[14px] text-white">
            {phoneRaw ? (
              <>
                Enter OTP sent to <span className="text-brand font-bold">{phone}</span>
              </>
            ) : (
              'Enter the OTP you received'
            )}
          </p>

          {/* Shown in non-production environments when the API returns the OTP directly */}
          {latestOtp && (
            <p
              className="border-surface-border bg-brand/20 rounded-[6px] border px-4 py-2.5 text-center text-[14px] text-[#E8A820]"
              role="status"
            >
              Use this OTP Below: <strong className="tabular-nums">{latestOtp}</strong>
            </p>
          )}

          <div className="flex justify-between" role="group" aria-label="OTP digits">
            {Array.from({ length: OTP_LENGTH }, (_, i) => (
              <div key={i} className="h-[55px] w-[55px] shrink-0">
                <Input
                  ref={(el) => (refs.current[i] = el)}
                  type="text"
                  inputMode="numeric"
                  autoComplete={i === 0 ? 'one-time-code' : 'off'}
                  maxLength={1}
                  value={code[i] ?? ''}
                  onChange={(e) => setDigit(i, e.target.value)}
                  onKeyDown={(e) => onKeyDown(i, e)}
                  onPaste={onPaste}
                  className="border-surface-border !h-[55px] !max-w-full rounded-full border text-center text-lg tabular-nums"
                  aria-label={`Digit ${i + 1}`}
                />
              </div>
            ))}
          </div>

          {(errors.code?.message || serverError) && (
            <p className="text-center text-sm text-red-200" role="alert">
              {errors.code?.message ?? serverError}
            </p>
          )}

          <div className="space-y-1 text-center">
            <p className="text-base text-white">
              Didn&apos;t receive?{' '}
              <button
                type="button"
                onClick={handleResend}
                disabled={!phoneRaw || isResendLoading || resendCooldown > 0}
                className="text-brand font-medium underline underline-offset-2 transition-colors hover:text-[#E8A820] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : isResendLoading ? 'Sending…' : 'Resend'}
              </button>
            </p>
            {resendError && (
              <p className="text-sm text-red-200" role="alert">
                {resendError}
              </p>
            )}
          </div>

          <Button type="submit" disabled={busy} variant="auth" className="mt-4 lg:w-full">
            {busy ? 'Verifying…' : 'Next'}
          </Button>
        </form>
      </div>
    </>
  );
}
