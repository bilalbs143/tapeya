import { Link, useNavigate } from 'react-router-dom';

import { UserAvatar, userProfilePath } from '@/entities/user';

import { cn } from '@/shared/lib/cn';
import { PhotoIcon, VideoIcon } from '@/shared/ui/icons';

import { feedRoutes } from '../routes';

type ComposerUser = {
  id: number;
  name: string | null;
  nickname?: string | null | undefined;
  avatarUrl: string | null;
};

type ComposerTriggerProps = {
  user: ComposerUser;
  className?: string;
};

/** Feed composer row — post / photo / reel entry points. */
export function ComposerTrigger({ user, className }: ComposerTriggerProps) {
  const navigate = useNavigate();
  const profileHref = userProfilePath({ id: user.id, nickname: user.nickname });

  return (
    <div className={cn('border-border-subtle bg-surface border-b px-4 py-3', className)}>
      <div className="border-border-subtle bg-surface flex items-center gap-2.5 rounded-panel border px-3.5 py-2.5">
        <UserAvatar user={{ name: user.name, avatarUrl: user.avatarUrl }} size="md" to={profileHref} className="w-8" />

        <button
          type="button"
          onClick={() => navigate(feedRoutes.create())}
          className="text-dim min-w-0 flex-1 truncate text-left text-2xs tab:text-body-sm"
        >
          <span className="tab:hidden">Share Your Cricket Moment…</span>
          <span className="hidden tab:inline">Post a result, a clip, or find a match this Sunday…</span>
        </button>

        <button
          type="button"
          aria-label="Add Photos"
          onClick={() => navigate(`${feedRoutes.create()}?media=photo`)}
          className="text-muted hover:text-ink shrink-0 transition-colors tab:hidden"
        >
          <PhotoIcon className="h-[17px] w-[17px]" strokeWidth={1.9} />
        </button>

        <Link
          to={feedRoutes.createReel()}
          aria-label="Upload a Reel"
          className="text-muted hover:text-ink shrink-0 transition-colors tab:hidden"
        >
          <VideoIcon className="h-[17px] w-[17px]" strokeWidth={1.9} />
        </Link>

        <Link
          to={feedRoutes.createReel()}
          className="text-dim hover:text-ink hidden shrink-0 text-2xs font-semibold tab:inline"
        >
          Clip
        </Link>
        <Link
          to={feedRoutes.create()}
          className="bg-brand hover:bg-brand-hover hidden shrink-0 rounded-full px-3 py-1 text-2xs font-bold text-white tab:inline"
        >
          Post
        </Link>
      </div>
    </div>
  );
}
