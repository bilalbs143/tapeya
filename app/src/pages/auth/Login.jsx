import { useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { Link, useLocation, useNavigate } from 'react-router-dom';

import tapeyaLogo from '@/assets/images/logos/tapeya-logo-white.svg';
import defaultAvatar from '@/assets/images/standard/default-avatar.png';
import { getApiErrorMessage } from '@/lib/apiErrors';
import {
  clearProfileToken,
  getSavedProfiles,
  removeSavedProfile,
} from '@/lib/savedProfiles';
import { getInitials } from '@/lib/utils/displayUtils';
import { formatPhoneMasked } from '@/lib/utils/phoneUtils';
import { loginSchema } from '@/lib/validations/auth';
import { authApi, useRequestOtpMutation } from '@/store/api/authApi';
import { useAppDispatch } from '@/store/hooks';
import { clearCredentials, setCredentials } from '@/store/slices/authSlice';
import { Avatar, AvatarFallback, AvatarImage } from '@/ui/Avatar';
import { Button } from '@/ui/Button';
import { FormField } from '@/ui/FormField';
import { PhoneInput } from '@/ui/PhoneInput';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();

  const [showOtherAccount, setShowOtherAccount] = useState(false);
  const [tappingProfile, setTappingProfile] = useState(null);

  // Keep local copy so removing a profile updates the UI without a page reload.
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
    const result = await requestOtp({ phone }).unwrap();
    const otp = result?.data?.otp ?? result?.otp;
    navigate('/otp', {
      state: { phone, otp, from: location.state?.from },
      replace: true,
    });
  };

  const onSubmit = async (data) => {
    try {
      await requestOtpAndNavigate(data.phone);
    } catch (err) {
      console.error('Login failed:', err);
    }
  };

  /**
   * Attempts a silent re-login using the stored access token.
   * Falls back to OTP flow when the token is absent or expired (401).
   */
  const onProfileTap = async (profile) => {
    setTappingProfile(profile.phone);

    try {
      if (!profile.accessToken) {
        await requestOtpAndNavigate(profile.phone);
        return;
      }

      // Optimistically set credentials so authenticated endpoints work.
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

      if (result.error?.status === 401) {
        // Token expired — clear it and re-authenticate via OTP.
        clearProfileToken(profile.phone);
        dispatch(clearCredentials());
        await requestOtpAndNavigate(profile.phone);
        return;
      }

      // Refresh stored user data with the latest from the server.
      const userData = result.data?.data ?? result.data;
      if (userData) {
        dispatch(
          setCredentials({ user: userData, accessToken: profile.accessToken }),
        );
      }

      const from = location.state?.from?.pathname;
      navigate(from && from !== '/login' ? from : '/home', { replace: true });
    } catch {
      clearProfileToken(profile.phone);
      dispatch(clearCredentials());
      await requestOtpAndNavigate(profile.phone);
    } finally {
      setTappingProfile(null);
    }
  };

  const busy = isLoading || isSubmitting || tappingProfile !== null;
  const showProfiles = savedProfiles.length > 0 && !showOtherAccount;

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

        <div className="mt-10 w-full max-w-[358px] space-y-4 lg:mt-14 lg:max-w-[880px] lg:p-0 lg:px-20">
          {showProfiles ? (
            <ProfilePicker
              profiles={savedProfiles}
              tappingProfile={tappingProfile}
              busy={busy}
              onTap={onProfileTap}
              onRemove={handleRemoveProfile}
              onUseOther={() => setShowOtherAccount(true)}
            />
          ) : (
            <PhoneForm
              control={control}
              errors={errors}
              error={error}
              busy={busy}
              hasSavedProfiles={savedProfiles.length > 0}
              onSubmit={handleSubmit(onSubmit)}
              onFocus={reset}
              onBack={() => setShowOtherAccount(false)}
            />
          )}

          <p className="pt-2 text-center text-[14px] text-[#A2A6AB] lg:pt-0">
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

function ProfilePicker({
  profiles,
  tappingProfile,
  busy,
  onTap,
  onRemove,
  onUseOther,
}) {
  return (
    <>
      <h2 className="text-center text-[16px] font-bold tracking-wide text-white uppercase">
        Choose an account
      </h2>

      <div className="scrollbar-hide mb-2 flex max-h-[280px] flex-col gap-3 overflow-y-auto p-[10px]">
        {profiles.map((profile) => {
          const isTapping = tappingProfile === profile.phone;

          return (
            <div
              key={profile.phone}
              className="relative flex w-full rounded-[18px] border border-[#1A1A1A] bg-[#141412] px-4 py-3.5"
            >
              {/* Remove button */}
              <button
                type="button"
                onClick={(e) => onRemove(e, profile.phone)}
                aria-label={`Remove ${profile.name ?? profile.phone} from saved accounts`}
                className="absolute top-[5px] right-[5px] flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#DA9811] text-[20px] leading-none font-bold text-[#080807] shadow-sm transition-opacity hover:opacity-90 focus:ring-2 focus:ring-[#DA9811] focus:ring-offset-2 focus:ring-offset-[#141412] focus:outline-none active:opacity-80"
              >
                ×
              </button>

              {/* Profile tap target */}
              <button
                type="button"
                onClick={() => onTap(profile)}
                disabled={busy}
                className="flex min-w-0 flex-1 items-center gap-4 pr-8 text-left transition-opacity focus:ring-2 focus:ring-[#DA9811] focus:ring-offset-2 focus:ring-offset-black focus:outline-none active:opacity-90 disabled:opacity-60"
              >
                <Avatar className="h-12 w-12 shrink-0 overflow-hidden rounded-full border border-[#1A1A1A]">
                  <AvatarImage
                    src={
                      profile.avatarUrl ?? profile.avatar_url ?? defaultAvatar
                    }
                    alt=""
                  />
                  <AvatarFallback className="bg-[#DA9811] text-sm font-bold text-[#080807]">
                    {getInitials(profile.name, profile.nickname)}
                  </AvatarFallback>
                </Avatar>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-[14px] font-bold text-white">
                    {isTapping ? 'Signing in…' : profile.name}
                  </p>
                  <p className="truncate text-[12px] font-medium text-[#A2A6AB]">
                    {formatPhoneMasked(profile.phone)}
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
        onClick={onUseOther}
        className="w-full py-3 text-center text-[14px] font-medium text-[#DA9811] underline underline-offset-2 transition-colors hover:text-[#E8A820]"
      >
        Login with other account
      </button>
    </>
  );
}

function PhoneForm({
  control,
  errors,
  error,
  busy,
  hasSavedProfiles,
  onSubmit,
  onFocus,
  onBack,
}) {
  return (
    <form onSubmit={onSubmit} onFocus={onFocus} className="space-y-4">
      <h2 className="text-center text-[16px] font-bold tracking-wide text-white uppercase">
        Login with your account
      </h2>

      {hasSavedProfiles && (
        <button
          type="button"
          onClick={onBack}
          className="text-[14px] font-medium text-[#A2A6AB] transition-colors hover:text-white"
        >
          ← Back to saved accounts
        </button>
      )}

      <FormField label="Phone (+923001234567)" htmlFor="phone" required>
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
          {getApiErrorMessage(error, 'Could not send OTP. Please try again.')}
        </p>
      )}

      <Button
        type="submit"
        disabled={busy}
        variant="auth"
        className="mt-4 lg:w-full"
      >
        {busy ? 'Signing in…' : 'Login'}
      </Button>
    </form>
  );
}
