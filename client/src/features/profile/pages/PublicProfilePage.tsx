import { Navigate } from 'react-router-dom';

import { APP_PATHS } from '@/shared/config/paths';
import { ScreenBar } from '@/shared/layout';
import { ErrorState, ProfileHeaderSkeleton } from '@/shared/ui/states';

import { PublicProfileBody } from '../ui/PublicProfileBody';
import { usePublicProfile } from '../ui/usePublicProfile';

/** Public creator profile — `/users/:handle` (numeric id or nickname). Own profile → `/you`. */
export default function PublicProfilePage() {
  const flow = usePublicProfile();
  const { parsed, resolving, resolveFailed, userId, isOwn, goBack } = flow;

  if (!parsed) {
    return (
      <div className="px-4 py-8">
        <ErrorState title="Profile Not Found" description="That link doesn’t look right." />
      </div>
    );
  }

  if (resolving) {
    return (
      <div className="bg-surface flex min-h-full flex-col">
        <ScreenBar title="Profile" subtitle="Player Card" onBack={goBack} />
        <ProfileHeaderSkeleton />
      </div>
    );
  }

  if (resolveFailed || userId == null) {
    return (
      <div className="px-4 py-8">
        <ErrorState title="Profile Not Found" description="No player matches that handle." />
      </div>
    );
  }

  if (isOwn) {
    return <Navigate to={APP_PATHS.you} replace />;
  }

  return <PublicProfileBody flow={flow} />;
}
