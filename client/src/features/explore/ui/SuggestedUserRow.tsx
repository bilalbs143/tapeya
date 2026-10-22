import { UserIdentity, userProfilePath } from '@/entities/user';

import { cn } from '@/shared/lib/cn';
import { Button } from '@/shared/ui/Button';
import { toast } from '@/shared/ui/toast';

import { useFollowUserMutation, useUnfollowUserMutation } from '../api/exploreApi';
import type { SuggestedUser } from '../model/schemas';

type SuggestedUserRowProps = {
  user: SuggestedUser;
  className?: string | undefined;
};

export function SuggestedUserRow({ user, className }: SuggestedUserRowProps) {
  const [follow, { isLoading: following }] = useFollowUserMutation();
  const [unfollow, { isLoading: unfollowing }] = useUnfollowUserMutation();
  const busy = following || unfollowing;
  const profileHref = userProfilePath({ id: user.id, nickname: user.nickname });

  async function toggleFollow() {
    try {
      if (user.following) await unfollow(user.id).unwrap();
      else await follow(user.id).unwrap();
    } catch {
      toast({ title: 'Could Not Update Follow', tone: 'error' });
    }
  }

  return (
    <li className={cn('flex items-center gap-2.5', className)}>
      <UserIdentity
        className="min-w-0 flex-1 items-center"
        user={{ name: user.name, avatarUrl: user.avatarUrl, isOfficial: user.isOfficial }}
        to={profileHref}
        avatarSize="sm"
        meta={<p className="text-dim font-mono truncate text-4xs tracking-[.06em] uppercase">{user.subtitle}</p>}
      />
      {user.following ? (
        <Button size="sm" variant="secondary" loading={busy} aria-pressed onClick={() => void toggleFollow()}>
          Following
        </Button>
      ) : (
        <Button size="sm" loading={busy} aria-pressed={false} onClick={() => void toggleFollow()}>
          Follow
        </Button>
      )}
    </li>
  );
}
