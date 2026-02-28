import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useLocation, useNavigate } from 'react-router-dom';

import tapeyaLogo from '@/assets/images/logos/tapeya-logo-white.svg';
import { getApiErrorMessage } from '@/lib/apiErrors';
import { addSavedProfile, bumpSavedProfile } from '@/lib/savedProfiles';
import { otpSchema } from '@/lib/validations/auth';
import {
  useRequestOtpMutation,
  useVerifyOtpMutation,
} from '@/store/api/authApi';
import { useAppDispatch } from '@/store/hooks';
import { setCredentials } from '@/store/slices/authSlice';
import { Button } from '@/ui/Button';
import { Input } from '@/ui/Input';
import { useToast } from '@/ui/useToast';

const LENGTH = 6;

function formatPhone(phone) {
  const d = (phone || '').replace(/\D/g, '');
  if (d.length < 10) return phone || '+92 315 711 8511';
  return `+${d.slice(0, 2)} ${d.slice(2, 5)} ${d.slice(5, 8)} ${d.slice(8, 12)}`;
}

export default function Otp() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { state } = useLocation();
  const phoneRaw = state?.phone;
  const phone = formatPhone(phoneRaw || '+923157118511');
  const [latestOtp, setLatestOtp] = useState(state?.otp ?? null);
  const toast = useToast();
  const [serverError, setServerError] = useState(null);
  const [resendError, setResendError] = useState(null);
  const [resendCooldown, setResendCooldown] = useState(0);
  const refs = useRef([]);

  const [verifyOtp, { isLoading }] = useVerifyOtpMutation();
  const [requestOtp, { isLoading: isResendLoading }] = useRequestOtpMutation();

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setInterval(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearInterval(t);
  }, [resendCooldown]);

  const handleResend = async () => {
    if (!phoneRaw) {
      setResendError('Session expired. Please start from Login or Register.');
      return;
    }
    setResendError(null);
    try {
      const result = await requestOtp({ phone: phoneRaw }).unwrap();
      toast.success('OTP sent again!');
      const otp = result?.data?.otp ?? result?.otp;
      if (otp) setLatestOtp(otp);
      setResendCooldown(60);
    } catch (err) {
      setResendError(
        getApiErrorMessage(err, 'Could not resend OTP. Please try again.'),
      );
    }
  };

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

  const setDigit = (i, val) => {
    const digit = val.replace(/\D/g, '').slice(0, 1);
    const next = code.split('');
    next[i] = digit;
    setValue('code', next.join('').slice(0, LENGTH));
    if (digit && i < LENGTH - 1) refs.current[i + 1]?.focus();
  };

  const onKeyDown = (i, e) => {
    if (e.key === 'Backspace' && !code[i] && i > 0)
      refs.current[i - 1]?.focus();
  };

  const onPaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData
      .getData('text')
      .replace(/\D/g, '')
      .slice(0, LENGTH);
    setValue('code', pasted);
    refs.current[Math.min(pasted.length, LENGTH - 1)]?.focus();
  };

  const onSubmit = async ({ code }) => {
    if (!phoneRaw) {
      setServerError('Session expired. Please start from Login or Register.');
      return;
    }
    setServerError(null);
    try {
      const result = await verifyOtp({ phone: phoneRaw, code }).unwrap();
      const { user, auth } = result?.data ?? result ?? {};
      const token = auth?.access_token;
      if (token && user) {
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
      }
      navigate('/home', { replace: true });
    } catch (err) {
      setServerError(
        getApiErrorMessage(err, 'Invalid or expired OTP. Please try again.'),
      );
    }
  };

  return (
    <>
      <div
        className="pointer-events-none fixed top-[-115px] left-1/2 z-0 h-[302px] w-[622px] -translate-x-1/2 rounded-full bg-[#FF9700] opacity-50 blur-[200px]"
        aria-hidden
      />
      <div className="relative z-10 flex w-full flex-col items-center px-6 pt-6 sm:pt-8 md:pt-10">
        <img
          src={tapeyaLogo}
          alt="Tapeya"
          className="motion-safe:animate-splash-slide-up h-auto w-[240px] opacity-0 motion-reduce:opacity-100"
        />
        <p className="motion-safe:animate-splash-slide-up-delayed mt-6 max-w-[90vw] text-center text-base text-white opacity-0 motion-reduce:opacity-100">
          Live Cricket & Instant Updates, Anytime!
        </p>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="mt-12 w-full max-w-[358px] space-y-6"
        >
          <p className="text-center text-[14px] text-white">
            Enter OTP sent to <span className="font-bold text-[#DA9811]">{phone}</span>
          </p>

          {latestOtp && (
            <p
              className="rounded-[6px] border border-[#1A1A1A] bg-[#DA9811]/20 px-4 py-2.5 text-center text-[14px] text-[#E8A820]"
              role="status"
            >
              For testing: OTP is{' '}
              <strong className="tabular-nums">{latestOtp}</strong>
            </p>
          )}

          <div
            className="flex justify-between"
            role="group"
            aria-label="OTP digits"
          >
            {[...Array(LENGTH)].map((_, i) => (
              <div key={i} className="h-[55px] w-[55px] shrink-0">
                <Input
                  ref={(el) => (refs.current[i] = el)}
                  type="text"
                  inputMode="numeric"
                  autoComplete={i ? 'off' : 'one-time-code'}
                  maxLength={1}
                  value={code[i] ?? ''}
                  onChange={(e) => setDigit(i, e.target.value)}
                  onKeyDown={(e) => onKeyDown(i, e)}
                  onPaste={i ? undefined : onPaste}
                  className="!h-[55px] !max-w-full rounded-full border border-[#1A1A1A] text-center text-lg tabular-nums"
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
                className="font-medium text-[#DA9811] underline underline-offset-2 transition-colors hover:text-[#E8A820] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {resendCooldown > 0
                  ? `Resend in ${resendCooldown}s`
                  : isResendLoading
                    ? 'Sending...'
                    : 'Resend'}
              </button>
            </p>
            {resendError && (
              <p className="text-sm text-red-200" role="alert">
                {resendError}
              </p>
            )}
          </div>

          <Button
            type="submit"
            disabled={isSubmitting || isLoading}
            variant="auth"
            className="mt-4"
          >
            {isSubmitting || isLoading ? 'Verifying...' : 'Next'}
          </Button>
        </form>
      </div>
    </>
  );
}
