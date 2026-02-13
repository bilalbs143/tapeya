import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';

import tapeyaLogo from '@/assets/images/logos/tapeya-logo-white.svg';
import { loginWithPasswordSchema } from '@/lib/validations/auth';
import { Button } from '@/ui/Button';
import { FormField } from '@/ui/FormField';
import { Input } from '@/ui/Input';
import { PhoneInput } from '@/ui/PhoneInput';

export default function Register() {
  const navigate = useNavigate();

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginWithPasswordSchema),
    defaultValues: { phone: '+92', name: '', password: '' },
    mode: 'onChange',
  });

  const [submitError, setSubmitError] = useState(null);

  const onSubmit = async (data) => {
    setSubmitError(null);
    try {
      // TODO: wire to register API when available
      console.log('Register', data);
      navigate('/login', { replace: true });
    } catch (err) {
      console.error('Register failed:', err);
      setSubmitError(
        err?.data?.message ??
          err?.message ??
          'Registration failed. Please try again.',
      );
    }
  };

  const busy = isSubmitting;

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
        <p className="motion-safe:animate-splash-slide-up-delayed mt-6 max-w-[90vw] text-center font-sans text-base text-white opacity-0 motion-reduce:opacity-100">
          Live Cricket & Instant Updates, Anytime!
        </p>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="mt-12 w-full max-w-[358px] space-y-4"
        >
          <h2 className="text-center text-xl font-bold text-white">
            Create an account
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

          <FormField label="Full Name" htmlFor="fname">
            <Input
              id="fname"
              type="text"
              placeholder="Enter Full Name"
              autoComplete="fname"
              error={errors.name?.message}
              {...register('name')}
            />
          </FormField>

          <FormField label="Password" htmlFor="password">
            <Input
              id="password"
              type="password"
              placeholder="Create a password"
              autoComplete="new-password"
              showPasswordToggle
              error={errors.password?.message}
              {...register('password')}
            />
          </FormField>

          {submitError && (
            <p
              className="rounded-lg bg-red-500/20 px-4 py-2 text-sm text-red-200"
              role="alert"
            >
              {submitError}
            </p>
          )}

          <Button type="submit" disabled={busy} variant="auth" className="mt-4">
            {busy ? 'Signing up...' : 'Sign up'}
          </Button>

          <p className="mt-6 text-center text-base text-[#A2A6AB]">
            Already have an account?{' '}
            <Link to="/login" className="text-[#DA9811] underline">
              Login
            </Link>
          </p>
          <p className="mt-3 text-center text-base text-[#A2A6AB]">
            By signing up, you agree to the{' '}
            <Link to="/terms" className="text-[#DA9811] underline">
              Terms of Use
            </Link>{' '}
            and{' '}
            <Link to="/privacy" className="text-[#DA9811] underline">
              Privacy Policy
            </Link>
            .
          </p>
        </form>
      </div>
    </>
  );
}
