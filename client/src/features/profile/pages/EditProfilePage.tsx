import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useDeleteAccountMutation, useMeQuery } from '@/features/auth';

import { getApiErrorMessage } from '@/shared/api/errors';
import { APP_PATHS } from '@/shared/config/paths';
import { confirm } from '@/shared/dialogs';
import { ScreenBar } from '@/shared/layout';
import { ErrorState, FormFieldsSkeleton, Skeleton } from '@/shared/ui/states';
import { toast } from '@/shared/ui/toast';

import { profileRoutes } from '../routes';
import { EditProfileForm } from '../ui/EditProfileForm';

/** Edit profile form — strength chips jump to missing fields. */
export default function EditProfilePage() {
  const navigate = useNavigate();
  const { data: me, isLoading, isError, refetch } = useMeQuery();
  const [deleteAccount, { isLoading: deleting }] = useDeleteAccountMutation();
  const [unsaved, setUnsaved] = useState(0);

  async function handleDelete() {
    const ok = await confirm({
      title: 'Delete Account?',
      message: 'This permanently closes your Tapeya account. This cannot be undone.',
      confirmLabel: 'Delete Account',
      tone: 'danger',
    });
    if (!ok) return;
    try {
      await deleteAccount().unwrap();
      window.location.assign(APP_PATHS.login);
    } catch (err) {
      toast({ title: getApiErrorMessage(err, 'Could not delete account.'), tone: 'error' });
    }
  }

  const subtitle = unsaved > 0 ? `${unsaved} unsaved ${unsaved === 1 ? 'change' : 'changes'}` : undefined;

  return (
    <div className="bg-surface flex min-h-full flex-col">
      <ScreenBar title="Edit Profile" subtitle={subtitle} onBack={() => navigate(profileRoutes.you())} />

      {isLoading ? (
        <div className="flex flex-col gap-4 px-4 py-6" aria-busy="true" aria-label="Loading Profile Editor">
          <Skeleton className="aspect-hero-banner w-full rounded-panel" />
          <div className="-mt-10 flex justify-center">
            <Skeleton className="border-surface h-20 w-20 rounded-full border-4" />
          </div>
          <FormFieldsSkeleton rows={5} />
          <Skeleton className="h-12 w-full rounded-field" />
        </div>
      ) : null}

      {isError || (!isLoading && !me) ? (
        <div className="px-4 py-8">
          <ErrorState title="Couldn't Load Your Profile" onRetry={() => void refetch()} />
        </div>
      ) : null}

      {me ? (
        <EditProfileForm
          key={me.id}
          user={me}
          deleting={deleting}
          onUnsavedCount={setUnsaved}
          onDelete={() => void handleDelete()}
          onSaved={() => navigate(profileRoutes.you())}
        />
      ) : null}
    </div>
  );
}
