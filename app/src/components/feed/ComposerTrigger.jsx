import { Link } from 'react-router-dom';

import { CLOUDFRONT_APP_BASE } from '@/lib/constants/assets';
import { composeDestination } from '@/lib/feed/composeDestination';
import { useAppSelector } from '@/store/hooks';
import { selectUser } from '@/store/selectors';

const defaultAvatar = `${CLOUDFRONT_APP_BASE}/images/standard/default-avatar.png`;

/**
 * Compact compose affordance — prompt row only; sticky + handles create entry.
 */
export default function ComposerTrigger() {
  const user = useAppSelector(selectUser);
  const avatar = user?.avatar_url || user?.avatarUrl || defaultAvatar;

  return (
    <section className="-mx-4 mb-0.5 bg-black">
      <div className="bg-surface px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-[linear-gradient(135deg,var(--color-brand),var(--color-brand-dark))] p-[2px]">
            <img src={avatar} alt="" className="border-surface h-10 w-10 rounded-full border-2 object-cover" />
          </div>
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
