import { Link } from 'react-router-dom';

import { UserAvatar } from '@/components/UserAvatar';
import { composeDestination } from '@/lib/feed/composeDestination';
import { useAppSelector } from '@/store/hooks';
import { selectUser } from '@/store/selectors';

/**
 * Compact compose affordance — prompt row only; sticky + handles create entry.
 */
export default function ComposerTrigger() {
  const user = useAppSelector(selectUser);

  return (
    <section className="-mx-4 mb-0.5 bg-black">
      <div className="bg-surface px-4 py-3">
        <div className="flex items-center gap-3">
          <UserAvatar src={user?.avatar_url || user?.avatarUrl} name={user?.name} userId={user?.id} size="lg" ring="brand" />
          <Link
            to={composeDestination('text', true)}
            className="bg-surface-raised text-muted hover:bg-surface-elevated h-11 flex-1 rounded-full px-4 text-left text-[13px] leading-11 transition-colors"
          >
            Share your cricket moment…
          </Link>
        </div>
      </div>
    </section>
  );
}
