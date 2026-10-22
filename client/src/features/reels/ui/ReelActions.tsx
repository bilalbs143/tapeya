import { UserAvatar, userProfilePath } from '@/entities/user';

import { cn } from '@/shared/lib/cn';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/shared/ui/DropdownMenu';
import { BookmarkIcon, CommentIcon, HeartIcon, MoreIcon, ShareIcon } from '@/shared/ui/icons';

import type { Reel } from '../model/schemas';

type ReelActionsProps = {
  reel: Reel;
  isOwn: boolean;
  onLike: () => void;
  onFollow: () => void;
  onComments: () => void;
  onReport: () => void;
  onBlock: () => void;
  onSave: () => void;
  onShare: () => void;
  onDelete: () => void;
  className?: string | undefined;
};

export function ReelActions({
  reel,
  isOwn,
  onLike,
  onFollow,
  onComments,
  onReport,
  onBlock,
  onSave,
  onShare,
  onDelete,
  className,
}: ReelActionsProps) {
  const profileHref =
    reel.author.id != null ? userProfilePath({ id: reel.author.id, nickname: reel.author.nickname }) : undefined;
  const authorLabel = reel.author.name?.trim() || 'User';

  return (
    <div className={cn('flex flex-col items-center gap-3', className)}>
      <span className="relative block">
        <UserAvatar
          user={{ name: reel.author.name, avatarUrl: reel.author.avatarUrl }}
          size="md"
          to={profileHref}
          className="w-11 shadow-[0_2px_10px_rgba(0,0,0,0.45)] ring-[1.5px] ring-white/70"
        />
        {!isOwn && !reel.author.following ? (
          <button
            type="button"
            onClick={onFollow}
            aria-label={`Follow ${reel.author.name}`}
            className="bg-brand absolute -bottom-1.5 left-1/2 grid h-4 w-4 -translate-x-1/2 place-items-center rounded-full text-4xs font-extrabold text-white ring-2 ring-black"
          >
            +
          </button>
        ) : null}
      </span>

      <button
        type="button"
        onClick={onLike}
        className="flex flex-col items-center gap-0.5"
        aria-label={reel.liked ? 'Unlike' : 'Like'}
        aria-pressed={reel.liked}
      >
        <HeartIcon
          size="lg"
          filled={reel.liked}
          strokeWidth={1.8}
          className={reel.liked ? 'text-like' : 'text-white'}
        />
        <span className="font-mono text-4xs font-bold text-white">{reel.likes}</span>
      </button>

      <button type="button" onClick={onComments} className="flex flex-col items-center gap-0.5" aria-label="Comments">
        <CommentIcon size="lg" strokeWidth={1.8} className="text-white" />
        <span className="font-mono text-4xs font-bold text-white">{reel.comments}</span>
      </button>

      <button type="button" aria-label="Share" className="text-white" onClick={onShare}>
        <ShareIcon size="lg" strokeWidth={1.8} />
      </button>

      <button
        type="button"
        aria-label={reel.saved ? 'Unsave reel' : 'Save reel'}
        aria-pressed={reel.saved}
        className="text-white"
        onClick={onSave}
      >
        <BookmarkIcon size="lg" filled={reel.saved} strokeWidth={1.8} />
      </button>

      <DropdownMenu>
        <DropdownMenuTrigger aria-label="More" className="text-white/55">
          <MoreIcon size="lg" />
        </DropdownMenuTrigger>
        <DropdownMenuContent side="left">
          {isOwn ? (
            <DropdownMenuItem destructive onSelect={onDelete}>
              Delete Reel
            </DropdownMenuItem>
          ) : (
            <>
              <DropdownMenuItem onSelect={onReport}>Report Reel</DropdownMenuItem>
              <DropdownMenuItem destructive onSelect={onBlock}>
                Block {authorLabel}
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
