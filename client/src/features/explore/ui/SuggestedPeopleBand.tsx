import { Link } from 'react-router-dom';

import { UserAvatar, userProfilePath } from '@/entities/user';

import { SectionLabel } from '@/shared/layout';
import { cn } from '@/shared/lib/cn';
import { VerifiedBadge } from '@/shared/ui/Badge';
import { Button } from '@/shared/ui/Button';
import { toast } from '@/shared/ui/toast';

import { useFollowUserMutation, useUnfollowUserMutation } from '../api/exploreApi';
import type { SuggestedUser } from '../model/schemas';
import { exploreRoutes } from '../routes';

type SuggestedPeopleBandProps = {
  users?: SuggestedUser[];
  className?: string;
  /** Default: “Suggested for you” (Discover); home interstitial uses “Players near you”. */
  title?: string | undefined;
};

/** Feed interstitial who-to-follow band; hidden when empty. */
export function SuggestedPeopleBand({ users = [], className, title = 'Suggested for You' }: SuggestedPeopleBandProps) {
  if (!users.length) return null;

  return (
    <section className={cn('flex flex-col gap-2.5 px-4', className)}>
      <SectionLabel
        as="h2"
        action={
          <Link to={exploreRoutes.discover()} className="text-brand-text text-3xs font-bold">
            View More ›
          </Link>
        }
      >
        {title}
      </SectionLabel>
      <ul className="no-scrollbar flex gap-3 overflow-x-auto">
        {users.slice(0, 8).map((user) => (
          <SuggestedChip key={user.id} user={user} />
        ))}
      </ul>
    </section>
  );
}

function SuggestedChip({ user }: { user: SuggestedUser }) {
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
    <li className="border-border-subtle flex w-36 shrink-0 flex-col items-center gap-2 rounded-card border p-3 text-center">
      <UserAvatar user={{ name: user.name, avatarUrl: user.avatarUrl }} size="lg" to={profileHref} className="w-12" />
      <div className="w-full min-w-0">
        <Link
          to={profileHref}
          className="text-ink inline-flex w-full max-w-full items-center justify-center gap-1 text-2xs font-bold"
        >
          <span className="truncate">{user.name}</span>
          <VerifiedBadge isOfficial={user.isOfficial} size="sm" />
        </Link>
        <p className="text-dim font-mono truncate text-4xs uppercase">{user.subtitle}</p>
      </div>
      <Button
        size="sm"
        variant={user.following ? 'secondary' : 'primary'}
        className="w-full"
        loading={busy}
        onClick={() => void toggleFollow()}
      >
        {user.following ? 'Following' : 'Follow'}
      </Button>
    </li>
  );
}
