import { Link } from 'react-router-dom';

import { Button } from '@/shared/ui/Button';

import { formatPhone } from '../lib/phone';
import { authRoutes } from '../routes';
import { AuthShell } from '../ui/AuthShell';
import { OtpForm } from '../ui/OtpForm';
import { useOtpFlow } from '../ui/useOtpFlow';

export default function OtpPage() {
  const flow = useOtpFlow();
  const { phone, status } = flow;

  if (!phone) {
    return (
      <AuthShell
        title="We Lost the Number"
        description="The verify screen was reopened without a phone in session — nothing to verify against. Numbers are never kept in the URL, so a stale link can't restore it."
        action={
          <div className="flex w-full gap-2">
            <Button asChild className="flex-1">
              <Link to={authRoutes.login()}>Start Again</Link>
            </Button>
            <Button asChild variant="secondary" className="flex-1">
              <Link to={authRoutes.register()}>Register</Link>
            </Button>
          </div>
        }
      />
    );
  }

  if (status === 'blocked') {
    return (
      <AuthShell
        title="This Account Is Blocked"
        description={
          <>
            The code was right, but{' '}
            <strong className="text-body font-mono text-2xs font-bold">{formatPhone(phone)}</strong> can&apos;t sign in.
            No session was created.
          </>
        }
        action={
          <div className="flex flex-col gap-2">
            <Button asChild variant="secondary" className="w-full">
              <a href="mailto:support@tapeya.com">Contact Support</a>
            </Button>
            <Button asChild variant="ghost" className="w-full">
              <Link to={authRoutes.login()}>Back to Login</Link>
            </Button>
          </div>
        }
      />
    );
  }

  return <OtpForm flow={flow} />;
}
