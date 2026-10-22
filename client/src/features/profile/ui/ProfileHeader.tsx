import type { UserSummary } from '@/entities/user';
import { userHandle, userLocation, userRoleChips } from '@/entities/user';

import { cn } from '@/shared/lib/cn';
import { Avatar } from '@/shared/ui/Avatar';
import { VerifiedBadge } from '@/shared/ui/Badge';
import { Button } from '@/shared/ui/Button';
import { ShareIcon } from '@/shared/ui/icons';

type OwnActions = {
  variant: 'own';
  onEdit: () => void;
  onShare: () => void;
};

type PublicActions = {
  variant: 'public';
  onShare: () => void;
  onFollowToggle: () => void;
  isFollowing: boolean;
  followLoading?: boolean | undefined;
};

type ProfileHeaderProps = {
  user: UserSummary;
  className?: string | undefined;
} & (OwnActions | PublicActions);

export function ProfileHeader(props: ProfileHeaderProps) {
  const { user, className } = props;
  const handle = userHandle(user);
  const location = userLocation(user);
  const chips = userRoleChips(user);

  return (
    <div className={cn('flex flex-col px-4 pt-1 pb-3.5', className)}>
      <div className="mb-3.5 flex items-start gap-3.5">
        <Avatar src={user.avatarUrl ?? undefined} name={user.name ?? handle} size="xl" className="h-16 w-16" />
        <div className="min-w-0 flex-1 pt-0.5">
          <div className="flex items-center gap-1.5">
            <h1 className="truncate text-base font-extrabold text-ink">{user.name ?? handle}</h1>
            <VerifiedBadge isOfficial={user.isOfficial} size="md" />
          </div>
          <p className="text-muted font-mono mt-0.5 text-2xs leading-normal font-semibold">@{handle}</p>
          {location ? <p className="text-dim mt-0.5 text-2xs">{location}</p> : null}
        </div>
      </div>

      {chips.length ? (
        <div className="mb-3.5 flex flex-wrap gap-1.5">
          {chips.map((label) => (
            <span
              key={label}
              className="bg-brand/14 text-brand-text inline-flex min-h-[26px] items-center rounded-icon px-2.5 text-3xs font-bold"
            >
              {label}
            </span>
          ))}
        </div>
      ) : null}

      <div className="mb-3.5 flex gap-5">
        <Count value={user.followingCount} label="Following" />
        <Count value={user.followersCount} label="Followers" />
        <Count value={user.reelsCount} label="Reels" />
      </div>

      {props.variant === 'own' ? (
        <div className="flex gap-2">
          <Button variant="secondary" className="h-10 flex-1 rounded-panel text-xs" onClick={props.onEdit}>
            Edit Profile
          </Button>
          <Button variant="secondary" className="h-10 rounded-panel px-4 text-xs" onClick={props.onShare}>
            <ShareIcon className="h-4 w-4" strokeWidth={1.8} />
            Share
          </Button>
        </div>
      ) : (
        <div className="flex gap-2">
          <Button
            variant={props.isFollowing ? 'secondary' : 'primary'}
            className="h-10 flex-1 rounded-panel text-xs"
            loading={Boolean(props.followLoading)}
            aria-pressed={props.isFollowing}
            onClick={props.onFollowToggle}
          >
            {props.isFollowing ? 'Following' : 'Follow'}
          </Button>
          <Button variant="secondary" className="h-10 rounded-panel px-4 text-xs" onClick={props.onShare}>
            <ShareIcon className="h-4 w-4" strokeWidth={1.8} />
            Share
          </Button>
        </div>
      )}
    </div>
  );
}

function Count({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col">
      <span className="font-mono text-body-sm font-extrabold text-ink">{value.toLocaleString()}</span>
      <span className="text-dim text-3xs font-semibold">{label}</span>
    </div>
  );
}
