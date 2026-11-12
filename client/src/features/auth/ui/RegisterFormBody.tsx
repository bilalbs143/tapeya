import { type ReactNode } from 'react';
import { Link } from 'react-router-dom';

import { Button } from '@/shared/ui/Button';
import { Form } from '@/shared/ui/Form';
import { Input } from '@/shared/ui/Input';

import { NICK_MAX } from '../lib/constants';
import { authRoutes } from '../routes';
import { AuthShell, AuthSwitch } from './AuthShell';
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
    clearPhoneError,
    clearNameError,
    clearNicknameError,
    submit,
  } = flow;

  const phoneError: ReactNode = errors.phone ? (
    taken ? (
      <span>
        This number already has an account.{' '}
        <Link to={authRoutes.login()} state={{ countryCode, national, returnTo }} className="text-body font-bold">
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
          countryCode={countryCode}
          onCountryCodeChange={setCountryCode}
          value={national}
          onNationalChange={(next) => {
            setNational(next);
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
      </Form>
    </AuthShell>
  );
}
