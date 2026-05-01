import { useNavigate } from 'react-router-dom';

import { useToast } from '@/hooks/useToast';
import { getApiErrorMessage } from '@/lib/apiErrors';
import { removeSavedProfile } from '@/lib/savedProfiles';
import { useDeleteAccountMutation } from '@/store/api/authApi';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { selectUser } from '@/store/selectors';
import { clearCredentials } from '@/store/slices/authSlice';
import { closeDialog } from '@/store/slices/commonSlice';
import {
  DialogHeaderClose,
  DialogHeaderRow,
  dialogPrimaryTitleClass,
  DialogScrollBody,
  DialogTitle,
} from '@/ui/Dialog';

export function DeleteAccountDialog() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const toast = useToast();
  const user = useAppSelector(selectUser);
  const [deleteAccount, { isLoading }] = useDeleteAccountMutation();

  const handleClose = () => {
    if (!isLoading) {
      dispatch(closeDialog());
    }
  };

  const handleDelete = async () => {
    const phone = user?.phone;
    try {
      await deleteAccount().unwrap();
      if (phone) {
        removeSavedProfile(phone);
      }
      dispatch(closeDialog());
      dispatch(clearCredentials());
      toast.success('Your account has been deleted.');
      navigate('/login', { replace: true });
    } catch (err) {
      toast.error(
        getApiErrorMessage(
          err,
          'Could not delete your account. Please try again.',
        ),
      );
    }
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <DialogHeaderRow
        closeSlot={
          isLoading ? (
            <span
              className="inline-flex size-9 shrink-0 items-center justify-center text-[#A2A6AB]/25"
              aria-hidden
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 15 15"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M11.7816 4.03157C12.0062 3.80702 12.0062 3.44295 11.7816 3.2184C11.5571 2.99385 11.193 2.99385 10.9685 3.2184L7.50005 6.68682L4.03164 3.2184C3.80708 2.99385 3.44301 2.99385 3.21846 3.2184C2.99391 3.44295 2.99391 3.80702 3.21846 4.03157L6.68688 7.49999L3.21846 10.9684C2.99391 11.193 2.99391 11.557 3.21846 11.7816C3.44301 12.0061 3.80708 12.0061 4.03164 11.7816L7.50005 8.31316L10.9685 11.7816C11.193 12.0061 11.5571 12.0061 11.7816 11.7816C12.0062 11.557 12.0062 11.193 11.7816 10.9684L8.31322 7.49999L11.7816 4.03157Z" />
              </svg>
            </span>
          ) : (
            <DialogHeaderClose aria-label="Close" />
          )
        }
      >
        <DialogTitle className={dialogPrimaryTitleClass}>
          Delete Account
        </DialogTitle>
      </DialogHeaderRow>

      <DialogScrollBody className="flex flex-col px-5 pb-2">
        <p className="text-center text-[13px] leading-relaxed text-[#A2A6AB]">
          You will not be able to sign in again with this phone number. Your
          profile and personal data will be removed permanently.
        </p>
      </DialogScrollBody>

      <div className="flex shrink-0 flex-col gap-2 border-t border-white/10 px-4 py-4 sm:flex-row sm:justify-end">
        <button
          type="button"
          disabled={isLoading}
          onClick={handleClose}
          className="inline-flex h-10 items-center justify-center rounded-md border border-zinc-600 bg-zinc-800 px-4 text-sm font-medium text-white transition hover:bg-zinc-700 disabled:pointer-events-none disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="button"
          disabled={isLoading}
          onClick={handleDelete}
          className="inline-flex h-10 items-center justify-center rounded-md bg-red-600 px-4 text-sm font-medium text-white transition hover:bg-red-700 disabled:pointer-events-none disabled:opacity-50"
        >
          {isLoading ? 'Deleting…' : 'Delete My Account'}
        </button>
      </div>
    </div>
  );
}

export default DeleteAccountDialog;
