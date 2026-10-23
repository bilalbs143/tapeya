import { Link } from 'react-router-dom';

import { Button } from '@/shared/ui/Button';
import { Form } from '@/shared/ui/Form';
import { InfoIcon, PlusIcon } from '@/shared/ui/icons';

import { authRoutes } from '../routes';
import { AuthShell, AuthSwitch } from './AuthShell';
import { PhoneField } from './PhoneField';
import { SavedProfileList } from './SavedProfileList';
import type { useLoginForm } from './useLoginForm';

type LoginFlow = ReturnType<typeof useLoginForm>;

type LoginFormBodyProps = {
  flow: LoginFlow;
};

/** AuthShell with saved-profile picker or phone OTP form. */
export function LoginFormBody({ flow }: LoginFormBodyProps) {
  const {
    returnTo,
    profiles,
    savedMode,
    busyPhone,
    dial,
    setDial,
    national,
    setNational,
    error,
    notFound,
    sending,
    title,
    description,
    setMode,
    pickProfile,
    dropProfile,
    submitPhone,
    clearPhoneFeedback,
  } = flow;

  return (
    <AuthShell
      back={
        !savedMode && profiles.length ? { onClick: () => setMode('saved'), label: 'Back to Saved Accounts' } : undefined
      }
      title={title}
      description={description}
      footer={
        <AuthSwitch prompt="Don't have an account?" to={authRoutes.register()} label="Sign Up" state={{ returnTo }} />
      }
      action={
        savedMode ? (
          <Button
            variant="secondary"
            size="lg"
            className="w-full"
            disabled={Boolean(busyPhone)}
            onClick={() => setMode('phone')}
          >
            <PlusIcon className="h-3.5 w-3.5" strokeWidth={2} />
            Use another number
          </Button>
        ) : (
          <Button type="submit" form="login-phone" size="lg" className="w-full" loading={sending}>
            Continue
          </Button>
        )
      }
    >
      {savedMode ? (
        <SavedProfileList
          profiles={profiles}
          busyPhone={busyPhone}
          onPick={(p) => void pickProfile(p)}
          onRemove={(p) => void dropProfile(p)}
        />
      ) : (
        <Form id="login-phone" density="compact" onSubmit={(e) => void submitPhone(e)} className="flex flex-1 flex-col">
          <PhoneField
            label="Phone Number"
            required
            dial={dial}
            onDialChange={setDial}
            value={national}
            onChange={(e) => {
              setNational(e.target.value);
              clearPhoneFeedback();
            }}
            error={error ?? undefined}
          />

          {notFound ? (
            <div className="border-danger/40 bg-danger/10 flex flex-col gap-2.5 rounded-panel border p-3.5 text-left">
              <p className="flex items-center gap-2 text-sm font-bold text-ink">
                <InfoIcon className="text-danger-soft h-4 w-4 shrink-0" strokeWidth={2.2} />
                User not found
              </p>
              <p className="text-muted text-xs leading-relaxed">
                No Tapeya account uses <strong className="text-body font-mono font-bold">{notFound}</strong>. Register
                first — it takes a name and this same number.
              </p>
              <Button asChild variant="secondary" size="sm">
                <Link to={authRoutes.register()} state={{ dial, national, returnTo }}>
                  Register This Number
                </Link>
              </Button>
            </div>
          ) : null}
        </Form>
      )}
    </AuthShell>
  );
}
