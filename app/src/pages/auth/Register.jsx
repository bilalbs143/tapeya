import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';

import { getApiErrorMessage } from '@/lib/apiErrors';
import { CLOUDFRONT_APP_BASE } from '@/lib/constants/assets';
import { extractOtpFromAuthResponse, setOtpPreview } from '@/lib/otpPreviewSession';
import { registerSchema } from '@/lib/validations/auth';
import { useRegisterMutation } from '@/store/api/authApi';
import { Button } from '@/ui/Button';
import { FormField } from '@/ui/FormField';
import { Input } from '@/ui/Input';
import { PhoneInput } from '@/ui/PhoneInput';

const tapeyaLogo = `${CLOUDFRONT_APP_BASE}/images/logos/tapeya-logo-white.svg`;

const normalizeOptionalString = (value) => {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  return trimmed === '' ? undefined : trimmed;
};

export default function Register() {
  const navigate = useNavigate();

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: { phone: '+92', name: '', nickname: '', email: '' },
    mode: 'onChange',
  });

  const [registerUser, { isLoading, error, reset: resetRegisterMutation }] = useRegisterMutation();

  const onSubmit = async (data) => {
    try {
      const result = await registerUser({
        name: data.name,
        nickname: data.nickname,
        phone: data.phone,
        email: normalizeOptionalString(data.email),
      }).unwrap();

      const otp = extractOtpFromAuthResponse(result);
      if (otp) setOtpPreview(data.phone, otp);
      // otp is intentionally excluded from nav state; setOtpPreview handles the preview.
      navigate('/otp', { state: { phone: data.phone }, replace: true });
    } catch (err) {
      console.error('Register failed:', err);
    }
  };

  const busy = isLoading || isSubmitting;

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
          onFocus={resetRegisterMutation}
          className="mt-10 w-full max-w-[358px] space-y-4 lg:mt-14 lg:max-w-[400px] lg:px-0"
        >
          <h2 className="text-center text-[16px] font-bold tracking-wide text-white uppercase">Create an account</h2>

          <div className="rounded-[6px] border border-[#FF9700]/45 bg-[#141412] p-4 text-center shadow-[0_0_0_1px_rgba(255,151,0,0.12)]">
            <p className="text-[12px] leading-snug text-[#A2A6AB] md:text-[13px]">
              Your provided phone number must be on WhatsApp.
            </p>
            <p
              lang="ur"
              dir="rtl"
              className="font-[system-ui,'Noto Nastaliq Urdu','Geeza Pro',sans-serif] mt-2 text-[13px] leading-relaxed text-[#A2A6AB] md:text-[14px]"
            >
              آپ کا دیا گیا فون نمبر واٹس ایپ پر موجود ہونا ضروری ہے۔
            </p>
          </div>

          <FormField label="Phone (+923001234567)" htmlFor="phone" required>
            <Controller
              name="phone"
              control={control}
              render={({ field }) => <PhoneInput id="phone" placeholder="3001234567" error={errors.phone?.message} {...field} />}
            />
          </FormField>

          <FormField label="Full Name" htmlFor="name" required>
            <Input
              id="name"
              type="text"
              placeholder="Enter Full Name"
              autoComplete="name"
              error={errors.name?.message}
              {...register('name')}
            />
          </FormField>

          <FormField label="Nickname" htmlFor="nickname" required>
            <Input
              id="nickname"
              type="text"
              placeholder="Example: ali07"
              autoComplete="username"
              error={errors.nickname?.message}
              {...register('nickname')}
            />
          </FormField>

          <FormField label="Email" htmlFor="email">
            <Input
              id="email"
              type="email"
              placeholder="Enter Your Email"
              autoComplete="email"
              error={errors.email?.message}
              {...register('email')}
            />
          </FormField>

          {error && (
            <p className="rounded-[6px] border border-[#1A1A1A] bg-red-500/20 px-4 py-2.5 text-[14px] text-red-200" role="alert">
              {getApiErrorMessage(error, 'Registration failed. Please try again.')}
            </p>
          )}

          <Button type="submit" disabled={busy} variant="auth" className="mt-4 lg:w-full">
            {busy ? 'Signing up…' : 'Sign up'}
          </Button>

          <div className="mt-6 mb-6 space-y-3 text-center">
            <p className="text-[14px] text-[#A2A6AB]">
              Already have an account?{' '}
              <Link
                to="/login"
                className="font-medium text-[#DA9811] underline underline-offset-2 transition-colors hover:text-[#E8A820]"
              >
                Login
              </Link>
            </p>
            <p className="text-[14px] text-[#A2A6AB]">
              By signing up, you agree to the{' '}
              <Link
                to="/pages/terms-of-use"
                className="font-medium text-[#DA9811] underline underline-offset-2 transition-colors hover:text-[#E8A820]"
              >
                Terms of Use
              </Link>{' '}
              and{' '}
              <Link
                to="/pages/privacy-policy"
                className="font-medium text-[#DA9811] underline underline-offset-2 transition-colors hover:text-[#E8A820]"
              >
                Privacy Policy
              </Link>
              .
            </p>
          </div>
        </form>
      </div>
    </>
  );
}
