import { Navigate } from 'react-router-dom';

import { APP_PATHS } from '@/shared/config/paths';
import { PageDock, ScreenBar } from '@/shared/layout';
import { ErrorState, ProfileHeaderSkeleton } from '@/shared/ui/states';

import { PublicProfileBody } from '../ui/PublicProfileBody';
import { usePublicProfile } from '../ui/usePublicProfile';

/** Public creator profile — `/users/:handle` (numeric id or nickname). Own profile → `/you`. */
export default function PublicProfilePage() {
  const flow = usePublicProfile();
  const { parsed, resolving, resolveFailed, userId, isOwn, goBack } = flow;

  if (!parsed) {
    return (
      <PageDock>
        <div className="px-4 py-8">
          <ErrorState title="Profile Not Found" description="That link doesn’t look right." />
        </div>
      </PageDock>
    );
  }

  if (resolving) {
    return (
      <PageDock header={<ScreenBar title="Profile" subtitle="Player Card" onBack={goBack} />}>
        <ProfileHeaderSkeleton />
      </PageDock>
    );
  }

  if (resolveFailed || userId == null) {
    return (
      <PageDock>
        <div className="px-4 py-8">
          <ErrorState title="Profile Not Found" description="No player matches that handle." />
        </div>
      </PageDock>
    );
  }

  if (isOwn) {
    return <Navigate to={APP_PATHS.you} replace />;
  }

  return <PublicProfileBody flow={flow} />;
}
