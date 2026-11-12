import { type FormEvent, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { getApiErrorMessage, parseApiError } from '@/shared/api/errors';
import { APP_PATHS } from '@/shared/config/paths';
import { safeInternalPath } from '@/shared/lib/safeInternalPath';

import { useRegisterMutation } from '../api/authApi';
import { countryByCode, DEFAULT_COUNTRY_CODE } from '../lib/constants';
import { startCooldown } from '../lib/cooldown';
import { markJustRegistered } from '../lib/justRegistered';
import { setOtpPreview } from '../lib/otpPreviewSession';
import { toE164 } from '../lib/phone';
import {
  omitRegisterError,
  type RegisterFieldErrors,
  type RegisterLocationState,
  registerShellDescription,
  validateRegisterForm,
} from '../lib/registerForm';
import { authRoutes } from '../routes';

/** Country / name / nickname state and register → OTP navigation. */
export function useRegisterForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as RegisterLocationState | null;
  const returnTo = safeInternalPath(state?.returnTo ?? state?.from, APP_PATHS.home);

  const [register] = useRegisterMutation();

  const [countryCode, setCountryCode] = useState(state?.countryCode ?? DEFAULT_COUNTRY_CODE);
  const [national, setNational] = useState(state?.national ?? '');
  const [name, setName] = useState('');
  const [nickname, setNickname] = useState('');
  const [errors, setErrors] = useState<RegisterFieldErrors>({});
  const [taken, setTaken] = useState(false);
  const [busy, setBusy] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const errorCount = Object.values(errors).filter(Boolean).length;
  const description = registerShellDescription(submitted, errorCount);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setTaken(false);
    setSubmitted(true);
    const next = validateRegisterForm(national, name, nickname, countryCode);
    setErrors(next);
    if (Object.keys(next).length) return;

    const phone = toE164(countryByCode(countryCode).dial, national);
    setBusy(true);
    try {
      // Register already sends OTP — do not call request-otp again.
      // terms_accepted_at is stamped by the API when accept_terms is omitted.
      const result = await register({
        phone,
        name: name.trim(),
        nickname: nickname.trim(),
      }).unwrap();
      startCooldown(phone);
      markJustRegistered(phone);
      if (result.otp) setOtpPreview(phone, result.otp);
      navigate(authRoutes.otp(), {
        state: {
          phone,
          debugOtp: result.otp,
          returnTo,
          justRegistered: true,
          name: name.trim(),
        },
      });
    } catch (err) {
      const parsed = parseApiError(err);
      if (parsed.type === 'validation' && parsed.fields.phone) {
        setTaken(true);
        setErrors({ phone: parsed.fields.phone[0] ?? 'This number already has an account.' });
      } else {
        setErrors({
          phone: getApiErrorMessage(err, "We couldn't create the account. Check your signal and try again."),
        });
      }
    } finally {
      setBusy(false);
    }
  }

  return {
    returnTo,
    countryCode,
    setCountryCode,
    national,
    setNational,
    name,
    setName,
    nickname,
    setNickname,
    errors,
    taken,
    busy,
    description,
    clearPhoneError: () => {
      setErrors((prev) => omitRegisterError(prev, 'phone'));
      setTaken(false);
    },
    clearNameError: () => setErrors((prev) => omitRegisterError(prev, 'name')),
    clearNicknameError: () => setErrors((prev) => omitRegisterError(prev, 'nickname')),
    submit,
  };
}
