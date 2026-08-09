import { Link } from 'react-router-dom';

import { OfficialBadge } from '@/components/OfficialBadge';
import { UserAvatar } from '@/components/UserAvatar';
import { buildCreatorProfilePath } from '@/lib/share';
import { useFollowReelCreatorMutation } from '@/store/api/reelsApi';

const VISIBLE_ROWS = 3;
/** Keeps widget height stable while followed users drop out of the buffer. */
const ROW_SLOT_CLASS = 'min-h-[3.25rem]';

function SuggestedFollowRow({ user, onFollowed }) {
  const [followCreator, { isLoading: isFollowPending }] = useFollowReelCreatorMutation();
  const profilePath = buildCreatorProfilePath(user.id);
  const displayName = user.name || user.nickname || 'User';

  const onFollowClick = async () => {
    if (isFollowPending || !user.id) return;

    try {
      await followCreator(user.id).unwrap();
      onFollowed?.();
    } catch {
      // The mutation rolls back its optimistic cache update on failure.
    }
  };

  return (
    <div className={`${ROW_SLOT_CLASS} flex animate-[fadeSlideIn_240ms_ease-out] items-center gap-3`}>
      <UserAvatar src={user.avatarUrl} name={displayName} userId={user.id} size="xl" />

      <div className="min-w-0 flex-1">
        <Link to={profilePath} className="flex min-w-0 items-center gap-1">
          <span className="truncate text-[14px] font-bold text-white">{displayName}</span>
          <OfficialBadge isOfficial={user.isOfficial} size="sm" />
        </Link>
        {user.nickname ? <p className="text-muted truncate text-[12px]">@{user.nickname}</p> : null}
        {user.subtitle ? <p className="text-muted/90 mt-0.5 truncate text-[11px]">{user.subtitle}</p> : null}
      </div>

      <button
        type="button"
        onClick={onFollowClick}
        disabled={isFollowPending}
        aria-label={`Follow ${displayName}`}
        className="text-brand ring-brand/40 hover:bg-brand/10 h-9 shrink-0 rounded-full px-3 text-[12px] font-semibold ring-1 transition-all ring-inset active:scale-95 disabled:opacity-50"
      >
        {isFollowPending ? 'Following…' : 'Follow'}
      </button>
    </div>
  );
}

/**
 * Compact who-to-follow card injected into the Explore feed.
 *
 * @param {{ users: Array<object>, onFollowed?: () => void }} props
 */
export function FeedSuggestedFollowsWidget({ users, onFollowed }) {
  if (!users?.length) return null;

  const visible = users.slice(0, VISIBLE_ROWS);

  return (
    <section className="bg-surface overflow-hidden px-4 py-3.5">
      <header className="mb-3">
        <p className="text-[14px] font-bold text-white">Suggested for you</p>
      </header>

      <div className="flex min-h-[11.25rem] flex-col gap-3.5">
        {visible.map((user) => (
          <SuggestedFollowRow key={user.id} user={user} onFollowed={onFollowed} />
        ))}
      </div>
    </section>
  );
}
