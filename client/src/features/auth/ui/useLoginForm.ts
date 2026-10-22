import { type FormEvent, use, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { getApiErrorMessage, parseApiError } from '@/shared/api/errors';
import { APP_PATHS } from '@/shared/config/paths';
import { safeInternalPath } from '@/shared/lib/safeInternalPath';
import { persistAuthSession } from '@/shared/store/authSession';
import { useAppDispatch } from '@/shared/store/hooks';

import { useLazyMeWithTokenQuery, useRequestOtpMutation } from '../api/authApi';
import { COUNTRIES } from '../lib/constants';
import { startCooldown } from '../lib/cooldown';
import {
  type LoginLocationState,
  type LoginMode,
  loginNationalError,
  loginShellDescription,
  loginShellTitle,
} from '../lib/loginForm';
import { setOtpPreview } from '../lib/otpPreviewSession';
import { toE164 } from '../lib/phone';
import { getProfiles, removeProfile, type SavedProfile, saveProfile } from '../lib/profiles';
import { authRoutes } from '../routes';

/** Saved profiles + phone OTP request for LoginPage. */
export function useLoginForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const state = location.state as LoginLocationState | null;
  const returnTo = safeInternalPath(state?.returnTo ?? state?.from, APP_PATHS.home);

  const [requestOtp] = useRequestOtpMutation();
  const [meWithToken] = useLazyMeWithTokenQuery();

  const [profilesBoot] = useState(() => getProfiles());
  const bootProfiles = use(profilesBoot);
  const [profiles, setProfiles] = useState(bootProfiles);
  const [mode, setMode] = useState<LoginMode>(() => (bootProfiles.length ? 'saved' : 'phone'));
  const [busyPhone, setBusyPhone] = useState<string | null>(null);

  const [dial, setDial] = useState(state?.dial ?? COUNTRIES[0].dial);
  const [national, setNational] = useState(state?.national ?? '');
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  const savedMode = mode === 'saved' && profiles.length > 0;
  const signingInAs = busyPhone ? (profiles.find((p) => p.phone === busyPhone)?.name ?? 'you') : null;
  const title = loginShellTitle(savedMode);
  const description = loginShellDescription(savedMode, signingInAs);

  async function requestAndGo(phone: string, extra: Record<string, unknown> = {}) {
    const result = await requestOtp({ phone }).unwrap();
    startCooldown(phone);
    if (result.otp) setOtpPreview(phone, result.otp);
    navigate(authRoutes.otp(), {
      state: { phone, debugOtp: result.otp, returnTo, ...extra },
    });
  }

  async function pickProfile(profile: SavedProfile) {
    setBusyPhone(profile.phone);
    try {
      if (profile.token) {
        const me = await meWithToken({ token: profile.token }).unwrap();
        await persistAuthSession(dispatch, {
          accessToken: profile.token,
          userId: me.id,
        });
        setProfiles(
          await saveProfile({
            ...profile,
            name: me.name ?? profile.name,
            nickname: me.nickname,
            avatarUrl: me.avatarUrl,
            token: profile.token,
          })
        );
        navigate(returnTo, { replace: true });
        return;
      }
      await requestAndGo(profile.phone, { name: profile.name });
    } catch (e) {
      const parsed = parseApiError(e);
      // Stale saved token → drop card and fall back to OTP.
      if (parsed.type === 'unauthorized') {
        setProfiles(await removeProfile(profile.phone));
      }
      try {
        await requestAndGo(profile.phone, { name: profile.name });
      } catch (otpErr) {
        setError(getApiErrorMessage(otpErr, "We couldn't send the code. Check your signal and try again."));
      }
    } finally {
      setBusyPhone(null);
    }
  }

  async function dropProfile(profile: SavedProfile) {
    const next = await removeProfile(profile.phone);
    setProfiles(next);
    if (!next.length) setMode('phone');
  }

  async function submitPhone(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setNotFound(null);

    const nationalError = loginNationalError(national);
    if (nationalError) {
      setError(nationalError);
      return;
    }

    const phone = toE164(dial, national);
    setSending(true);
    try {
      await requestAndGo(phone);
    } catch (err) {
      const parsed = parseApiError(err);
      if (parsed.type === 'unknown' && parsed.status === 404) {
        setNotFound(phone);
      } else {
        setError(getApiErrorMessage(err, "We couldn't send the code. Check your signal and try again."));
      }
    } finally {
      setSending(false);
    }
  }

  function clearPhoneFeedback() {
    setError(null);
    setNotFound(null);
  }

  return {
    returnTo,
    profiles,
    savedMode,
    busyPhone,
    dial,
    setDial,
    national,
    setNational,
    error,
    notFound,
    sending,
    title,
    description,
    setMode,
    pickProfile,
    dropProfile,
    submitPhone,
    clearPhoneFeedback,
  };
}
