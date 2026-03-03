import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';

import tapeyaLogo from '@/assets/images/logos/tapeya-logo-white.svg';
import defaultAvatar from '@/assets/images/standard/default-avatar.png';
import { getApiErrorMessage } from '@/lib/apiErrors';
import {
  clearProfileToken,
  getSavedProfiles,
  removeSavedProfile,
} from '@/lib/savedProfiles';
import { loginSchema } from '@/lib/validations/auth';
import { authApi, useRequestOtpMutation } from '@/store/api/authApi';
import { useAppDispatch } from '@/store/hooks';
import { clearCredentials, setCredentials } from '@/store/slices/authSlice';
import { Avatar, AvatarFallback, AvatarImage } from '@/ui/Avatar';
import { Button } from '@/ui/Button';
import { FormField } from '@/ui/FormField';
import { PhoneInput } from '@/ui/PhoneInput';

function getInitials(name, nickname) {
  if (nickname) return nickname.slice(0, 2).toUpperCase();
  const parts = (name || '').trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return (name || 'U').slice(0, 2).toUpperCase();
}

function formatPhoneDisplay(phone) {
  const d = (phone || '').replace(/\D/g, '');
  if (d.length < 10) return phone || '';
  return `+${d.slice(0, 2)} ${d.slice(2, 5)} *** ****`;
}

export default function Login() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [showOtherAccount, setShowOtherAccount] = useState(false);
  const [tappingProfile, setTappingProfile] = useState(null);
  const [savedProfiles, setSavedProfiles] = useState(() => getSavedProfiles());

  const handleRemoveProfile = (e, phone) => {
    e.stopPropagation();
    removeSavedProfile(phone);
    setSavedProfiles(getSavedProfiles());
  };

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { phone: '+92' },
    mode: 'onChange',
  });

  const [requestOtp, { isLoading, error, reset }] = useRequestOtpMutation();

  const requestOtpAndNavigate = async (phone) => {
    try {
      const result = await requestOtp({ phone }).unwrap();
      const otp = result?.data?.otp ?? result?.otp;
      navigate('/otp', { state: { phone, otp }, replace: true });
    } catch (err) {
      console.error('Login failed:', err);
    }
  };

  const onSubmit = async (data) => {
    await requestOtpAndNavigate(data.phone);
  };

  const onProfileTap = async (profile) => {
    if (profile.accessToken) {
      setTappingProfile(profile.phone);
      try {
        dispatch(
          setCredentials({
            user: {
              id: profile.id,
              name: profile.name,
              nickname: profile.nickname,
              phone: profile.phone,
              email: profile.email,
            },
            accessToken: profile.accessToken,
          }),
        );
        const result = await dispatch(
          authApi.endpoints.getMe.initiate(undefined, { forceRefetch: true }),
        );
        if (result.error && result.error.status === 401) {
          clearProfileToken(profile.phone);
          dispatch(clearCredentials());
          await requestOtpAndNavigate(profile.phone);
        } else {
          const userData = result.data?.data ?? result.data;
          if (userData) {
            dispatch(
              setCredentials({
                user: userData,
                accessToken: profile.accessToken,
              }),
            );
          }
          navigate('/home', { replace: true });
        }
      } catch {
        clearProfileToken(profile.phone);
        await requestOtpAndNavigate(profile.phone);
      } finally {
        setTappingProfile(null);
      }
    } else {
      await requestOtpAndNavigate(profile.phone);
    }
  };

  const busy = isLoading || isSubmitting || tappingProfile !== null;
  const showProfiles = savedProfiles.length > 0 && !showOtherAccount;

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
        <p className="motion-safe:animate-splash-slide-up-delayed mt-6 max-w-[90vw] text-center font-sans text-base text-white opacity-0 motion-reduce:opacity-100">
          Live Cricket & Instant Updates, Anytime!
        </p>

        <div className="mt-12 w-full max-w-[358px] space-y-6">
          {showProfiles ? (
            <>
              <h2 className="text-center text-[16px] font-bold tracking-wide text-white uppercase">
                Choose an account
              </h2>
              <div className="scrollbar-hide mb-2 flex max-h-[280px] flex-col gap-3 overflow-y-auto p-[10px]">
                {savedProfiles.map((profile) => {
                  const isTapping = tappingProfile === profile.phone;
                  return (
                    <div
                      key={profile.phone}
                      className="relative flex w-full rounded-[18px] border border-[#1A1A1A] bg-[#141412] px-4 py-3.5"
                    >
                      <button
                        type="button"
                        onClick={(e) => handleRemoveProfile(e, profile.phone)}
                        aria-label="Remove account"
                        className="absolute top-[5px] right-[5px] flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#DA9811] text-[20px] leading-none font-bold text-[#080807] shadow-sm transition-opacity hover:opacity-90 focus:ring-2 focus:ring-[#DA9811] focus:ring-offset-2 focus:ring-offset-[#141412] focus:outline-none active:opacity-80"
                      >
                        ×
                      </button>
                      <button
                        type="button"
                        onClick={() => onProfileTap(profile)}
                        disabled={busy}
                        className="flex min-w-0 flex-1 items-center gap-4 pr-8 text-left transition-opacity focus:ring-2 focus:ring-[#DA9811] focus:ring-offset-2 focus:ring-offset-black focus:outline-none active:opacity-90 disabled:opacity-60"
                      >
                        <Avatar className="h-12 w-12 shrink-0 overflow-hidden rounded-full border border-[#1A1A1A]">
                          <AvatarImage src={defaultAvatar} alt="" />
                          <AvatarFallback className="bg-[#DA9811] text-sm font-bold text-[#080807]">
                            {getInitials(profile.name, profile.nickname)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[14px] font-bold text-white">
                            {isTapping ? 'Signing in...' : profile.name}
                          </p>
                          <p className="truncate text-[12px] font-medium text-[#A2A6AB]">
                            {formatPhoneDisplay(profile.phone)}
                          </p>
                        </div>
                      </button>
                    </div>
                  );
                })}
              </div>
              <div className="h-px w-full bg-[linear-gradient(to_right,#00000000,#FFFFFF33,#00000000)]" />
              <button
                type="button"
                onClick={() => setShowOtherAccount(true)}
                className="w-full py-3 text-center text-[14px] font-medium text-[#DA9811] underline underline-offset-2 transition-colors hover:text-[#E8A820]"
              >
                Login with other account
              </button>
            </>
          ) : (
            <form
              onSubmit={handleSubmit(onSubmit)}
              onFocus={() => reset()}
              className="space-y-4"
            >
              <h2 className="text-center text-[16px] font-bold tracking-wide text-white uppercase">
                Login with your account
              </h2>
              {savedProfiles.length > 0 && (
                <button
                  type="button"
                  onClick={() => setShowOtherAccount(false)}
                  className="text-[14px] font-medium text-[#A2A6AB] transition-colors hover:text-white"
                >
                  ← Back to saved accounts
                </button>
              )}
              <FormField label="Phone" htmlFor="phone">
                <Controller
                  name="phone"
                  control={control}
                  render={({ field }) => (
                    <PhoneInput
                      id="phone"
                      placeholder="Enter Phone Number"
                      error={errors.phone?.message}
                      {...field}
                    />
                  )}
                />
              </FormField>

              {error && (
                <p
                  className="rounded-[6px] border border-[#1A1A1A] bg-red-500/20 px-4 py-2.5 text-[14px] text-red-200"
                  role="alert"
                >
                  {getApiErrorMessage(
                    error,
                    'Could not send OTP. Please try again.',
                  )}
                </p>
              )}

              <Button
                type="submit"
                disabled={busy}
                variant="auth"
                className="mt-4"
              >
                {busy ? 'Signing in...' : 'Login'}
              </Button>
            </form>
          )}

          <p className="pt-2 text-center text-[14px] text-[#A2A6AB]">
            Don&apos;t have an account?{' '}
            <Link
              to="/register"
              className="font-medium text-[#DA9811] underline underline-offset-2 transition-colors hover:text-[#E8A820]"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}
