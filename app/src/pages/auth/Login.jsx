import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';

import tapeyaLogo from '@/assets/images/logos/tapeya-logo-white.svg';
import { loginSchema } from '@/lib/validations/auth';
import { useLoginMutation } from '@/store/api/authApi';
import { useAppDispatch } from '@/store/hooks';
import { setCredentials } from '@/store/slices/authSlice';
import { Button } from '@/ui/Button';
import { FormField } from '@/ui/FormField';
import { PhoneInput } from '@/ui/PhoneInput';

export default function Login() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { phone: '+92' },
    mode: 'onChange',
  });

  const [login, { isLoading, error }] = useLoginMutation();

  const onSubmit = async (data) => {
    try {
      const result = await login({ phone: data.phone }).unwrap();

      const user = result?.data?.user ?? result?.user;
      const token =
        result?.data?.auth?.access_token ??
        result?.auth?.access_token ??
        result?.access_token;

      if (user && token) {
        dispatch(setCredentials({ user, accessToken: token }));
        navigate('/home', { replace: true });
      }
    } catch (err) {
      console.error('Login failed:', err);
    }
  };

  const busy = isLoading || isSubmitting;

  return (
    <>
      <div
        className="pointer-events-none fixed top-[-115px] left-1/2 z-0 h-[302px] w-[622px] -translate-x-1/2 rounded-full bg-[#FF9700] opacity-50 blur-[200px]"
        aria-hidden
      />
      <div className="relative z-10 flex min-h-full flex-col items-center justify-center px-6">
        <img
          src={tapeyaLogo}
          alt="Tapeya"
          className="motion-safe:animate-splash-slide-up h-auto w-[270px] opacity-0 motion-reduce:opacity-100"
        />
        <p className="motion-safe:animate-splash-slide-up-delayed mt-6 max-w-[90vw] text-center font-sans text-base text-white opacity-0 motion-reduce:opacity-100">
          Live Cricket & Instant Updates, Anytime!
        </p>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="mt-12 w-full max-w-[358px] space-y-4"
        >
          <h2 className="mb-6 text-center text-xl font-bold text-white">
            Login with your account
          </h2>
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
              className="rounded-lg bg-red-500/20 px-4 py-2 text-sm text-red-200"
              role="alert"
            >
              {error?.data?.message ??
                error?.error ??
                'Login failed. Please try again.'}
            </p>
          )}

          <Button type="submit" disabled={busy} variant="auth" className="mt-4">
            {busy ? 'Signing in...' : 'Login'}
          </Button>

          <p className="mt-6 text-center text-base text-[#A2A6AB]">
            Don&apos;t have an account?{' '}
            <Link to="/register" className="text-[#DA9811] underline">
              Sign up
            </Link>
          </p>
        </form>
      </div>
    </>
  );
}
