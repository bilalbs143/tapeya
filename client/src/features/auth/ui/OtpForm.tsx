import { useEffect } from 'react';
import { Link } from 'react-router-dom';

import { Button } from '@/shared/ui/Button';
import { FieldMessage } from '@/shared/ui/Field';
import { Form } from '@/shared/ui/Form';

import { OTP_LENGTH } from '../lib/constants';
import { formatCooldown } from '../lib/cooldown';
import { formatPhone } from '../lib/phone';
import { AuthShell } from './AuthShell';
import { OtpDebugBanner, OtpInput } from './OtpInput';
import type { useOtpFlow } from './useOtpFlow';

type OtpFlow = ReturnType<typeof useOtpFlow>;

type OtpFormProps = {
  flow: OtpFlow;
};

/** Mount-once kick for debug auto-verify — keeps setState out of the parent render path. */
function OtpAutoSubmit({
  code,
  onVerify,
}: {
  code: string;
  onVerify: (code: string, opts: { minMs: number }) => void;
}) {
  useEffect(() => {
    onVerify(code, { minMs: 2000 });
  }, [code, onVerify]);
  return null;
}

/** OTP entry form inside AuthShell (under page gates for missing phone / blocked). */
export function OtpForm({ flow }: OtpFormProps) {
  const {
    phone,
    message,
    code,
    left,
    resending,
    autoSigningIn,
    autoAttemptedOtp,
    autoDigits,
    latestOtp,
    backTo,
    backState,
    failed,
    busy,
    showTestBanner,
    showDevBanner,
    verify,
    resend,
    handleCodeChange,
  } = flow;

  if (!phone) return null;

  return (
    <AuthShell
      back={{ to: backTo, state: backState }}
      title={autoSigningIn ? 'Signing You In' : failed ? "That Code Didn't Match" : 'Enter the Code'}
      description={
        autoSigningIn ? (
          <>
            Verifying the code for{' '}
            <strong className="font-mono text-sm font-bold text-ink">{formatPhone(phone)}</strong>…
          </>
        ) : (
          <>
            {failed ? 'Still expecting ' : 'Sent to '}
            <strong className="font-mono text-sm font-bold text-ink">{formatPhone(phone)}</strong>.{' '}
            <Link to={backTo} state={backState} className="text-brand-text font-bold">
              Change Number
            </Link>
          </>
        )
      }
      action={
        <Button
          type="submit"
          form="otp-form"
          size="lg"
          className="w-full"
          loading={busy}
          disabled={code.length !== OTP_LENGTH || autoSigningIn}
        >
          {autoSigningIn ? 'Verifying…' : 'Verify'}
        </Button>
      }
    >
      {autoSigningIn && autoAttemptedOtp && autoDigits.length === OTP_LENGTH ? (
        <OtpAutoSubmit key={autoAttemptedOtp} code={autoDigits} onVerify={verify} />
      ) : null}
      <Form
        id="otp-form"
        density="compact"
        onSubmit={(e) => {
          e.preventDefault();
          void verify(code);
        }}
      >
        <div className="flex flex-col gap-1.5">
          <OtpInput
            value={code}
            error={failed}
            disabled={busy}
            describedBy={message ? 'otp-msg' : undefined}
            onChange={handleCodeChange}
            onComplete={(v) => {
              if (!autoSigningIn) void verify(v);
            }}
          />

          {failed && message ? (
            <FieldMessage id="otp-msg" error={message} />
          ) : message ? (
            <span id="otp-msg" role="status" className="text-positive-2 text-2xs font-semibold">
              {message}
            </span>
          ) : null}
        </div>

        {showTestBanner ? (
          <div
            role="status"
            className="border-border bg-page-deep flex items-center gap-2.5 rounded-xl border px-3.5 py-3"
          >
            <span className="text-muted flex-1 text-3xs">Use This OTP Below</span>
            <span className="font-mono text-body-lg font-bold tracking-[.22em] text-body">{latestOtp}</span>
          </div>
        ) : null}

        <OtpDebugBanner code={showDevBanner ? latestOtp : null} />

        <div className="flex items-center gap-1.5 text-2xs">
          {left > 0 ? (
            <span className="text-muted">
              Didn&apos;t receive it? Resend in{' '}
              <strong className="font-mono text-2xs font-bold text-body">{formatCooldown(left)}</strong>
            </span>
          ) : (
            <>
              <span className="text-muted">Didn&apos;t receive it?</span>
              <button
                type="button"
                onClick={() => void resend()}
                disabled={resending || autoSigningIn}
                className="text-brand-text font-bold disabled:opacity-50"
              >
                {resending ? 'Sending…' : 'Resend'}
              </button>
            </>
          )}
        </div>

        <p className="text-dim max-w-[40ch] text-3xs leading-relaxed">
          Code arrives on WhatsApp, or SMS as a fallback. Pasting the full code fills all four cells.
        </p>
      </Form>
    </AuthShell>
  );
}
