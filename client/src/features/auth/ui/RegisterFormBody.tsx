import { type ReactNode } from 'react';
import { Link } from 'react-router-dom';

import { APP_PATHS } from '@/shared/config/paths';
import { Button } from '@/shared/ui/Button';
import { Checkbox } from '@/shared/ui/Checkbox';
import { Form } from '@/shared/ui/Form';
import { Input } from '@/shared/ui/Input';

import { NICK_MAX } from '../lib/constants';
import { authRoutes } from '../routes';
import { AuthShell, AuthSwitch, AuthWhatsAppNote } from './AuthShell';
import { PhoneField } from './PhoneField';
import type { useRegisterForm } from './useRegisterForm';

type RegisterFlow = ReturnType<typeof useRegisterForm>;

type RegisterFormBodyProps = {
  flow: RegisterFlow;
};

/** AuthShell + register fields, terms, sticky Continue. */
export function RegisterFormBody({ flow }: RegisterFormBodyProps) {
  const {
    returnTo,
    dial,
    setDial,
    national,
    setNational,
    name,
    setName,
    nickname,
    setNickname,
    acceptTerms,
    setAcceptTerms,
    errors,
    taken,
    busy,
    description,
    clearPhoneError,
    clearNameError,
    clearNicknameError,
    clearAcceptTermsError,
    submit,
  } = flow;

  const phoneError: ReactNode = errors.phone ? (
    taken ? (
      <span>
        This number already has an account.{' '}
        <Link to={authRoutes.login()} state={{ dial, national, returnTo }} className="text-body font-bold">
          Login Instead →
        </Link>
      </span>
    ) : (
      errors.phone
    )
  ) : null;

  return (
    <AuthShell
      title="Create an Account"
      description={description}
      footer={
        <AuthSwitch prompt="Already have an account?" to={authRoutes.login()} label="Login" state={{ returnTo }} />
      }
      action={
        <Button type="submit" form="register-form" size="lg" className="w-full" loading={busy}>
          Continue
        </Button>
      }
    >
      <Form id="register-form" density="compact" onSubmit={submit} className="flex flex-1 flex-col">
        <PhoneField
          label="Phone Number"
          required
          dial={dial}
          onDialChange={setDial}
          value={national}
          onChange={(e) => {
            setNational(e.target.value);
            clearPhoneError();
          }}
          error={phoneError}
        />

        <Input
          label="Full Name"
          required
          value={name}
          autoComplete="name"
          onChange={(e) => {
            setName(e.target.value);
            clearNameError();
          }}
          error={errors.name}
          className="h-12 rounded-panel text-sm leading-normal"
        />

        <Input
          label="Nickname"
          required
          value={nickname}
          maxLength={NICK_MAX}
          autoComplete="nickname"
          onChange={(e) => {
            setNickname(e.target.value);
            clearNicknameError();
          }}
          error={errors.nickname}
          hint={errors.nickname ? undefined : 'What teammates call you on the scorecard.'}
          className="h-12 rounded-panel text-sm leading-normal"
        />

        <AuthWhatsAppNote />

        <div>
          <label className="flex cursor-pointer items-start gap-3">
            <Checkbox
              checked={acceptTerms}
              onCheckedChange={(v) => {
                setAcceptTerms(v === true);
                clearAcceptTermsError();
              }}
              className="mt-0.5"
              aria-label="Agree to Terms of Use"
            />
            <span className="text-dim text-3xs leading-[1.65]">
              I agree to the{' '}
              <Link to={APP_PATHS.legalTerms} className="text-brand-text font-semibold underline underline-offset-2">
                Terms of Use
              </Link>{' '}
              (zero tolerance for objectionable content and abusive users) and{' '}
              <Link to={APP_PATHS.legalPrivacy} className="text-brand-text font-semibold underline underline-offset-2">
                Privacy Policy
              </Link>
              .
            </span>
          </label>
          {errors.acceptTerms ? (
            <p className="text-danger-text mt-1.5 text-3xs" role="alert">
              {errors.acceptTerms}
            </p>
          ) : null}
        </div>
      </Form>
    </AuthShell>
  );
}
