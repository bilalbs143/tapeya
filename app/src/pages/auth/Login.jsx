import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';

import tapeyaLogo from '@/assets/images/logos/tapeya-logo-white.svg';
import { loginSchema } from '@/lib/validations/auth';
import { useLoginMutation } from '@/store/api/authApi';
import { useAppDispatch } from '@/store/hooks';
import { setCredentials } from '@/store/slices/authSlice';
import { Button } from '@/ui/Button';
import { FormField } from '@/ui/FormField';
import { Input } from '@/ui/Input';

export default function Login() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
    mode: 'onChange',
  });

  const [login, { isLoading, error }] = useLoginMutation();

  const onSubmit = async (data) => {
    try {
      const result = await login({
        email: data.email,
        password: data.password,
      }).unwrap();

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
      <div className="relative z-10 flex min-h-full flex-col items-center px-6 pt-12">
        <img
          src={tapeyaLogo}
          alt="Tapeya"
          className="motion-safe:animate-splash-slide-up h-auto w-[270px] opacity-0 motion-reduce:opacity-100"
        />
        <p
          className="motion-safe:animate-splash-slide-up-delayed mt-6 max-w-[90vw] text-center text-[16px] text-white opacity-0 motion-reduce:opacity-100"
          style={{ fontFamily: 'ui-sans-serif, system-ui, sans-serif' }}
        >
          Live Cricket & Instant Updates, Anytime!
        </p>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="mt-12 w-full max-w-[320px] space-y-4"
        >
          <FormField label="Email" htmlFor="email">
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              error={errors.email?.message}
              {...register('email')}
            />
          </FormField>

          <FormField label="Password" htmlFor="password">
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              autoComplete="current-password"
              showPasswordToggle
              error={errors.password?.message}
              {...register('password')}
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

          <Button
            type="submit"
            disabled={busy}
            className="mt-4 w-full bg-[#FF9700] hover:bg-[#e08800]"
          >
            {busy ? 'Signing in...' : 'Sign in'}
          </Button>
        </form>
      </div>
    </>
  );
}
