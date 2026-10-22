import { useState } from 'react';
import { Link } from 'react-router-dom';

import { UserIdentity, userProfilePath } from '@/entities/user';

import { APP_PATHS } from '@/shared/config/paths';
import { cn } from '@/shared/lib/cn';

import type { Reel } from '../model/schemas';
import { matchChipLabel } from '../model/schemas';

const CAPTION_COLLAPSE_LIMIT = 100;

type ReelCaptionProps = {
  reel: Reel;
  className?: string | undefined;
};

/** Creator + caption — collapse at ~100 chars; match chip when wire includes `match`. */
export function ReelCaption({ reel, className }: ReelCaptionProps) {
  const [expanded, setExpanded] = useState(false);
  const caption = reel.caption.trim();
  const needsCollapse = caption.length > CAPTION_COLLAPSE_LIMIT;
  const visible = needsCollapse && !expanded ? `${caption.slice(0, CAPTION_COLLAPSE_LIMIT).trimEnd()}…` : caption;

  const profileHref =
    reel.author.id != null ? userProfilePath({ id: reel.author.id, nickname: reel.author.nickname }) : undefined;
  const handle = reel.author.handle.startsWith('@') ? reel.author.handle : `@${reel.author.handle}`;
  const showHandle = Boolean(reel.author.nickname);
  const match = reel.match;

  return (
    <div className={cn('min-w-0 text-white', className)}>
      <UserIdentity
        avatar={false}
        className="gap-0"
        user={{
          name: reel.author.name,
          avatarUrl: reel.author.avatarUrl,
          isOfficial: reel.author.isOfficial,
        }}
        to={profileHref}
        nameClassName="text-body-sm font-extrabold text-white drop-shadow-[0_1px_4px_rgba(0,0,0,0.55)]"
        meta={
          showHandle ? (
            <p className="mt-0.5 truncate text-2xs font-medium text-white/75 drop-shadow-[0_1px_3px_rgba(0,0,0,0.5)]">
              {handle}
            </p>
          ) : null
        }
      />

      {match ? (
        <Link
          to={`${APP_PATHS.matchCard}/${match.id}`}
          className="mt-1.5 inline-flex max-w-full items-center truncate rounded-chip border border-white/20 bg-black/55 px-2.5 py-1 font-mono text-3xs font-bold tracking-eyebrow text-white uppercase"
        >
          {matchChipLabel(match)}
        </Link>
      ) : null}

      {caption ? (
        <p className="mt-1 text-2xs leading-relaxed text-white/90 drop-shadow-[0_1px_3px_rgba(0,0,0,0.5)]">
          {visible}
          {needsCollapse ? (
            <>
              {' '}
              <button type="button" onClick={() => setExpanded((open) => !open)} className="font-bold text-white">
                {expanded ? 'See Less' : 'See More'}
              </button>
            </>
          ) : null}
        </p>
      ) : null}

      {reel.hashtags.length ? (
        <p className="text-brand-cyan mt-1.5 truncate text-2xs font-semibold">
          {reel.hashtags.map((tag) => (tag.startsWith('#') ? tag : `#${tag}`)).join(' ')}
        </p>
      ) : null}
    </div>
  );
}
