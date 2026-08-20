import { useCallback, useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { Link, useLocation, useNavigate } from 'react-router-dom';

import { UserAvatar } from '@/components/UserAvatar';
import { useToast } from '@/hooks/useToast';
import { getApiErrorMessage, isUnauthorizedError } from '@/lib/apiErrors';
import { CLOUDFRONT_APP_BASE } from '@/lib/constants/assets';
import { extractOtpFromAuthResponse, setOtpPreview } from '@/lib/otpPreviewSession';
import { markReturningUser } from '@/lib/returningUser';
import { clearProfileToken, getSavedProfiles, removeSavedProfile } from '@/lib/savedProfiles';
import { getInitials } from '@/lib/utils/displayUtils';
import { formatPhoneMasked } from '@/lib/utils/phoneUtils';
import { getRedirectPath } from '@/lib/utils/routeUtils';
import { loginSchema } from '@/lib/validations/auth';
import { authApi, useRequestOtpMutation } from '@/store/api/authApi';
import { useAppDispatch } from '@/store/hooks';
import { clearCredentials, setCredentials } from '@/store/slices/authSlice';
import { Button } from '@/ui/Button';
import { FormActions } from '@/ui/form/FormActions';
import { FormStack } from '@/ui/form/FormStack';
import { FormField } from '@/ui/FormField';
import { Loader } from '@/ui/Loader';
import { PhoneInput } from '@/ui/PhoneInput';

const tapeyaLogo = `${CLOUDFRONT_APP_BASE}/images/logos/tapeya-logo-white.svg`;

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const toast = useToast();

  const [showOtherAccount, setShowOtherAccount] = useState(false);
  const [tappingProfile, setTappingProfile] = useState(null);

  // Local copy so removing a profile updates the UI without a page reload.
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

  // isLoading covers the mutation in-flight; isSubmitting covers form validation delay.
  const [requestOtp, { isLoading, error, reset }] = useRequestOtpMutation();

  const requestOtpAndNavigate = useCallback(
    async (phone) => {
      const result = await requestOtp({ phone }).unwrap();
      const otp = extractOtpFromAuthResponse(result);
      if (otp) setOtpPreview(phone, otp);
      // otp is intentionally excluded from nav state; setOtpPreview handles the preview.
      navigate('/otp', {
        state: { phone, from: location.state?.from },
        replace: true,
      });
    },
    [requestOtp, navigate, location.state?.from],
  );

  const onSubmit = async (data) => {
    try {
      await requestOtpAndNavigate(data.phone);
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Could not send OTP. Please try again.'));
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

      // Optimistically set credentials so authenticated endpoints work immediately.
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

      const result = await dispatch(authApi.endpoints.getMe.initiate(undefined, { forceRefetch: true }));

      if (isUnauthorizedError(result.error)) {
        // Token expired or invalid — drop saved profile (stale token) and continue with OTP.
        removeSavedProfile(profile.phone);
        setSavedProfiles(getSavedProfiles());
        dispatch(clearCredentials());
        await requestOtpAndNavigate(profile.phone);
        return;
      }

      // Update stored user data with the latest from the server.
      const userData = result.data?.data ?? result.data;
      if (userData) {
        dispatch(setCredentials({ user: userData, accessToken: profile.accessToken }));
      }

      markReturningUser();
      navigate(getRedirectPath(location.state), { replace: true });
    } catch (err) {
      if (isUnauthorizedError(err)) {
        removeSavedProfile(profile.phone);
        setSavedProfiles(getSavedProfiles());
      } else {
        clearProfileToken(profile.phone);
      }
      dispatch(clearCredentials());
      await requestOtpAndNavigate(profile.phone);
    } finally {
      setTappingProfile(null);
    }
  };

  // isSubmitting and isLoading can both be true during a phone form submission.
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

          <p className="text-muted pt-2 text-center text-[14px] lg:pt-0">
            Don&apos;t have an account?{' '}
            <Link
              to="/register"
              className="text-brand font-medium underline underline-offset-2 transition-colors hover:text-[#E8A820]"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}

function ProfilePicker({ profiles, tappingProfile, busy, onTap, onRemove, onUseOther }) {
  return (
    <>
      <h2 className="text-center text-[16px] font-bold tracking-wide text-white uppercase">Choose an Account</h2>

      <div className="scrollbar-hide mb-2 flex max-h-[280px] flex-col gap-3 overflow-y-auto p-[10px]">
        {profiles.map((profile) => {
          const isTapping = tappingProfile === profile.phone;

          return (
            <div
              key={profile.phone}
              className="border-surface-border bg-surface relative flex w-full rounded-[18px] border px-4 py-3.5"
            >
              <button
                type="button"
                onClick={(e) => onRemove(e, profile.phone)}
                aria-label={`Remove ${profile.name ?? profile.phone} from saved accounts`}
                className="bg-brand text-ink focus:ring-brand absolute top-[5px] right-[5px] flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[20px] leading-none font-bold shadow-sm transition-opacity hover:opacity-90 focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#141412] focus:outline-none active:opacity-80"
              >
                ×
              </button>

              <button
                type="button"
                onClick={() => onTap(profile)}
                disabled={busy}
                className="focus:ring-brand flex min-w-0 flex-1 items-center gap-4 pr-8 text-left transition-opacity focus:ring-2 focus:ring-offset-2 focus:ring-offset-black focus:outline-none active:opacity-90 disabled:opacity-60"
              >
                <UserAvatar
                  src={profile.avatarUrl ?? profile.avatar_url}
                  name={profile.name}
                  size="card"
                  fallback={getInitials(profile.name, profile.nickname)}
                />

                <div className="min-w-0 flex-1">
                  <p className="truncate text-[14px] font-bold text-white">{profile.name}</p>
                  <p className="text-muted truncate text-[12px] font-medium">{formatPhoneMasked(profile.phone)}</p>
                </div>

                {isTapping ? <Loader size="xs" /> : null}
              </button>
            </div>
          );
        })}
      </div>

      <div className="h-px w-full bg-[linear-gradient(to_right,#00000000,#FFFFFF33,#00000000)]" />

      <button
        type="button"
        onClick={onUseOther}
        className="text-brand w-full py-3 text-center text-[14px] font-medium underline underline-offset-2 transition-colors hover:text-[#E8A820]"
      >
        Login With Other Account
      </button>
    </>
  );
}

function PhoneForm({ control, errors, error, busy, hasSavedProfiles, onSubmit, onFocus, onBack }) {
  return (
    <FormStack as="form" density="compact" className="lg:mx-auto lg:max-w-[400px]" onSubmit={onSubmit} onFocus={onFocus}>
      <h2 className="text-center text-[16px] font-bold tracking-wide text-white uppercase">Login With Your Account</h2>

      {hasSavedProfiles && (
        <button type="button" onClick={onBack} className="text-muted text-[14px] font-medium transition-colors hover:text-white">
          ← Back to Saved Accounts
        </button>
      )}

      <FormField label="Phone (+923001234567)" htmlFor="phone" required>
        <Controller
          name="phone"
          control={control}
          render={({ field }) => <PhoneInput id="phone" placeholder="3001234567" error={errors.phone?.message} {...field} />}
        />
      </FormField>

      {error && (
        <p className="border-surface-border rounded-[6px] border bg-red-500/20 px-4 py-2.5 text-[14px] text-red-200" role="alert">
          {getApiErrorMessage(error, 'Could not send OTP. Please try again.')}
        </p>
      )}

      <FormActions align="stack" className="pt-0">
        <Button type="submit" disabled={busy} loading={busy} variant="auth" className="lg:w-full">
          Login
        </Button>
      </FormActions>
    </FormStack>
  );
}
