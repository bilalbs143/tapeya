import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { getApiErrorMessage, parseApiError } from '@/shared/api/errors';
import { settingsByKey, useGetPublicSystemSettingsQuery } from '@/shared/api/systemSettingsApi';
import { APP_PATHS } from '@/shared/config/paths';
import { safeInternalPath } from '@/shared/lib/safeInternalPath';
import { persistAuthSession } from '@/shared/store/authSession';
import { useAppDispatch } from '@/shared/store/hooks';

import { useRequestOtpMutation, useVerifyOtpMutation } from '../api/authApi';
import { OTP_LENGTH } from '../lib/constants';
import { cooldownRemaining, startCooldown } from '../lib/cooldown';
import { isClientTestOtpPhone } from '../lib/isClientTestOtpPhone';
import { consumeJustRegistered } from '../lib/justRegistered';
import {
  otpAutoFillDigits,
  type OtpLocationState,
  type OtpStatus,
  resolveLatestOtp,
  resolveOtpPhone,
} from '../lib/otpFlow';
import { clearOtpPreview, setOtpPreview } from '../lib/otpPreviewSession';
import { saveProfile } from '../lib/profiles';
import { markReturningUser } from '../lib/returningUser';
import { authRoutes } from '../routes';

/** Verify / resend / debug auto-fill for OtpPage. */
export function useOtpFlow() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const state = location.state as OtpLocationState | null;

  const [phone] = useState(() => resolveOtpPhone(state));
  const justRegistered = Boolean(state?.justRegistered);
  const returnTo = safeInternalPath(state?.returnTo ?? state?.from, APP_PATHS.home);

  const { data: settingsRows, isSuccess: settingsReady, isError: settingsFailed } = useGetPublicSystemSettingsQuery();
  const settings = useMemo(() => settingsByKey(settingsRows), [settingsRows]);
  const testPhonesReady = settingsReady || settingsFailed;
  const isTestPhone = isClientTestOtpPhone(phone, settings.test_otp_phones);

  const resolvedOtp = resolveLatestOtp(phone, state);
  const [latestOtp, setLatestOtp] = useState(resolvedOtp);
  const [prevResolvedOtp, setPrevResolvedOtp] = useState(resolvedOtp);
  // iOS / Cap can drop router state — keep latest OTP aligned with state/session.
  if (resolvedOtp !== prevResolvedOtp) {
    setPrevResolvedOtp(resolvedOtp);
    setLatestOtp(resolvedOtp);
  }

  const [verifyOtp] = useVerifyOtpMutation();
  const [requestOtp] = useRequestOtpMutation();

  const [code, setCode] = useState('');
  const [status, setStatus] = useState<OtpStatus>('idle');
  const [message, setMessage] = useState<string | null>(null);
  const [left, setLeft] = useState(() => (phone ? cooldownRemaining(phone) : 0));
  const [resending, setResending] = useState(false);
  const [autoSigningIn, setAutoSigningIn] = useState(false);
  const [autoAttemptedOtp, setAutoAttemptedOtp] = useState<string | null>(null);

  useEffect(() => {
    if (!phone || left <= 0) return;
    const t = setInterval(() => setLeft(cooldownRemaining(phone)), 1000);
    return () => clearInterval(t);
  }, [phone, left]);

  const verify = useCallback(
    async (value: string, { minMs = 0 }: { minMs?: number } = {}) => {
      if (!phone || value.length !== OTP_LENGTH) return;
      setStatus((current) => (current === 'verifying' ? current : 'verifying'));
      setMessage(null);
      const startedAt = Date.now();
      try {
        const result = await verifyOtp({ phone, code: value }).unwrap();
        clearOtpPreview();
        markReturningUser();
        // Persist before navigate — RTK onQueryStarted may still be racing RequireAuth.
        await persistAuthSession(dispatch, {
          accessToken: result.auth.accessToken,
          userId: result.user.id,
        });
        await saveProfile({
          id: result.user.id,
          name: result.user.name ?? 'Player',
          nickname: result.user.nickname,
          phone,
          avatarUrl: result.user.avatarUrl,
          token: result.auth.accessToken,
        });

        if (minMs > 0) {
          const remaining = minMs - (Date.now() - startedAt);
          if (remaining > 0) await new Promise((r) => setTimeout(r, remaining));
        }

        const showComplete = justRegistered && consumeJustRegistered(phone);
        navigate(returnTo, {
          replace: true,
          state: showComplete ? { completeProfile: true } : undefined,
        });
      } catch (err) {
        setAutoSigningIn(false);
        const parsed = parseApiError(err);
        if (parsed.type === 'unknown' && parsed.status === 403) {
          setStatus('blocked');
          setMessage(parsed.message ?? 'This account is blocked.');
          return;
        }
        setStatus('invalid');
        setMessage(getApiErrorMessage(err, 'Incorrect OTP. Check the code and try again.'));
      }
    },
    [phone, verifyOtp, dispatch, justRegistered, navigate, returnTo, setStatus, setMessage, setAutoSigningIn]
  );

  // Debug OTP in API response — auto-fill for non-test phones.
  const autoDigits = otpAutoFillDigits(latestOtp, {
    testPhonesReady,
    isTestPhone,
    hasPhone: Boolean(phone),
  });
  if (autoDigits.length === OTP_LENGTH && latestOtp && autoAttemptedOtp !== latestOtp) {
    setAutoAttemptedOtp(latestOtp);
    if (code !== autoDigits) setCode(autoDigits);
    if (!autoSigningIn) setAutoSigningIn(true);
  }

  async function resend() {
    if (!phone || left > 0 || resending || autoSigningIn) return;
    setResending(true);
    try {
      const result = await requestOtp({ phone }).unwrap();
      startCooldown(phone);
      setLeft(cooldownRemaining(phone));
      setCode('');
      setStatus('idle');
      setMessage('New code sent.');
      if (result.otp) {
        setOtpPreview(phone, result.otp);
        setAutoAttemptedOtp(null);
        setLatestOtp(result.otp);
        setPrevResolvedOtp(result.otp);
      }
      navigate('.', {
        replace: true,
        state: {
          ...state,
          phone,
          debugOtp: result.otp ?? latestOtp ?? undefined,
          returnTo,
          justRegistered,
        },
      });
    } catch (err) {
      setMessage(getApiErrorMessage(err, "We couldn't resend the code. Check your signal and try again."));
    } finally {
      setResending(false);
    }
  }

  const backTo = justRegistered ? authRoutes.register() : authRoutes.login();
  const backState = { returnTo };
  const failed = status === 'invalid';
  const sentOk = Boolean(message) && !failed;
  const busy = status === 'verifying' || autoSigningIn;
  const showTestBanner = testPhonesReady && Boolean(latestOtp) && isTestPhone;
  const showDevBanner = import.meta.env.DEV && Boolean(latestOtp) && !isTestPhone;

  function handleCodeChange(v: string) {
    setCode(v);
    if (failed || sentOk) {
      setStatus('idle');
      setMessage(null);
    }
  }

  return {
    phone,
    status,
    message,
    code,
    left,
    resending,
    autoSigningIn,
    autoAttemptedOtp,
    autoDigits,
    latestOtp,
    backTo,
    backState,
    failed,
    busy,
    showTestBanner,
    showDevBanner,
    verify,
    resend,
    handleCodeChange,
  };
}
