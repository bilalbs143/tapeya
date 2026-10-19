/**
 * Blocking Terms gate for users who have not accepted the EULA (Guideline 1.2).
 *
 * Mounted only when acceptance is required. On legal/CMS URLs (`TERMS_GATE_EXEMPT_PATHS`)
 * this component returns null so the Radix dialog fully unmounts — releasing modal
 * scroll-lock / pointer-events — instead of leaving an `open={false}` portal over the page.
 */

import { useState } from 'react';

import { Link } from 'react-router-dom';

import { BaseDialog } from '@/components/dialogs/BaseDialog';
import { useToast } from '@/hooks/useToast';
import { getApiErrorMessage } from '@/lib/apiErrors';
import { useIsTermsGateExempt } from '@/lib/termsGateExempt';
import { useAcceptTermsMutation } from '@/store/api/userApi';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { selectIsAuthenticated, selectUser } from '@/store/selectors';
import { updateUser } from '@/store/slices/authSlice';
import { Checkbox } from '@/ui/Checkbox';
import { DialogHeaderRow, dialogPrimaryTitleClass, DialogSaveButton, DialogScrollBody, DialogTitle } from '@/ui/Dialog';

export default function TermsAcceptanceGate() {
  const user = useAppSelector(selectUser);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const onExemptRoute = useIsTermsGateExempt();
  const dispatch = useAppDispatch();
  const toast = useToast();
  const [checked, setChecked] = useState(false);
  const [acceptTerms, { isLoading }] = useAcceptTermsMutation();

  const needsAcceptance = Boolean(isAuthenticated && user && !user.terms_accepted_at);

  const handleAccept = async () => {
    if (!checked) {
      toast.error('Please agree to the Terms of Use to continue.');
      return;
    }
    try {
      const result = await acceptTerms().unwrap();
      const acceptedAt = result?.data?.terms_accepted_at || new Date().toISOString();
      dispatch(updateUser({ terms_accepted_at: acceptedAt }));
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Could not save Terms acceptance.'));
    }
  };

  // Unmount entirely on exempt routes / when not needed — do not keep a closed Dialog portal.
  if (onExemptRoute || !needsAcceptance) return null;

  return (
    <BaseDialog
      open
      onOpenChange={() => {
        /* Blocking — cannot dismiss without accepting */
      }}
      overlayClassName="!z-[200] bg-black/80"
      contentClassName="!z-[200]"
    >
      <DialogHeaderRow hideClose reserveCloseSpace={false}>
        <DialogTitle className={`${dialogPrimaryTitleClass} w-full text-center`}>Terms of Use</DialogTitle>
      </DialogHeaderRow>

      <DialogScrollBody className="pb-2">
        <p className="text-muted text-[13px] leading-relaxed">
          Tapeya has <span className="font-semibold text-white">zero tolerance</span> for objectionable content or abusive users.
          You can report content and block users in the app. We aim to act on reports within 24 hours.
        </p>

        <label className="mt-4 flex cursor-pointer items-start gap-3">
          <Checkbox
            checked={checked}
            onCheckedChange={(v) => setChecked(v === true)}
            className="mt-0.5"
            aria-label="Agree to Terms of Use"
          />
          <span className="text-[13px] leading-relaxed text-white/90">
            I agree to the{' '}
            <Link to="/pages/terms-of-use" className="text-brand font-semibold underline underline-offset-2">
              Terms of Use
            </Link>{' '}
            and{' '}
            <Link to="/pages/privacy-policy" className="text-brand font-semibold underline underline-offset-2">
              Privacy Policy
            </Link>
            .
          </span>
        </label>
      </DialogScrollBody>

      <DialogSaveButton disabled={!checked || isLoading} loading={isLoading} onClick={handleAccept}>
        {isLoading ? 'Please wait…' : 'Continue'}
      </DialogSaveButton>
    </BaseDialog>
  );
}
