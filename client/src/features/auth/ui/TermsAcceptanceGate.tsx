import { useState } from 'react';
import { Link } from 'react-router-dom';

import { getApiErrorMessage } from '@/shared/api/errors';
import { APP_PATHS } from '@/shared/config/paths';
import {
  BaseDialog,
  DialogBody,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/dialogs/BaseDialog';
import { useIsTermsGateExempt } from '@/shared/routing/termsGateExempt';
import { selectIsAuthenticated } from '@/shared/store/authSlice';
import { useAppSelector } from '@/shared/store/hooks';
import { Button } from '@/shared/ui/Button';
import { Checkbox } from '@/shared/ui/Checkbox';
import { toast } from '@/shared/ui/toast';

import { useAcceptTermsMutation, useMeQuery } from '../api/authApi';

/** Guideline 1.2 — blocking terms until accepted; null on exempt routes (no closed dialog portal). */
export function TermsAcceptanceGate() {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const onExemptRoute = useIsTermsGateExempt();
  const { data: user } = useMeQuery(undefined, { skip: !isAuthenticated });
  const [acceptTerms, { isLoading }] = useAcceptTermsMutation();
  const [checked, setChecked] = useState(false);

  const needsAcceptance = Boolean(isAuthenticated && user && !user.termsAcceptedAt);

  async function handleAccept() {
    if (!checked) {
      toast({ title: 'Please agree to the Terms of Use to continue.', tone: 'error' });
      return;
    }
    try {
      await acceptTerms().unwrap();
    } catch (err) {
      toast({ title: getApiErrorMessage(err, 'Could not save Terms acceptance.'), tone: 'error' });
    }
  }

  // Unmount entirely on exempt routes / when not needed — do not keep a closed Dialog portal.
  if (onExemptRoute || !needsAcceptance) return null;

  return (
    <BaseDialog
      open
      onOpenChange={() => {
        /* Blocking — cannot dismiss without accepting */
      }}
      dismissible={false}
      showClose={false}
      contentClassName="flex max-h-[min(92dvh,520px)] flex-col p-0"
    >
      <DialogHeader className="items-center pr-5 text-center">
        <DialogTitle>Terms of Use</DialogTitle>
        <DialogDescription className="text-muted text-left text-2xs leading-relaxed">
          Tapeya has <span className="font-semibold text-ink">zero tolerance</span> for objectionable content or abusive
          users. You can report content and block users in the app. We aim to act on reports within 24 hours.
        </DialogDescription>
      </DialogHeader>

      <DialogBody>
        <label className="flex cursor-pointer items-start gap-3">
          <Checkbox
            checked={checked}
            onCheckedChange={(v) => setChecked(v === true)}
            className="mt-0.5"
            aria-label="Agree to Terms of Use"
          />
          <span className="text-body text-2xs leading-relaxed">
            I agree to the{' '}
            <Link to={APP_PATHS.legalTerms} className="text-brand-text font-semibold underline underline-offset-2">
              Terms of Use
            </Link>{' '}
            and{' '}
            <Link to={APP_PATHS.legalPrivacy} className="text-brand-text font-semibold underline underline-offset-2">
              Privacy Policy
            </Link>
            .
          </span>
        </label>
      </DialogBody>

      <DialogFooter>
        <Button type="button" disabled={!checked || isLoading} loading={isLoading} onClick={() => void handleAccept()}>
          Continue
        </Button>
      </DialogFooter>
    </BaseDialog>
  );
}
