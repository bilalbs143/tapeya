import { useState } from 'react';
import { Link } from 'react-router-dom';

import { UserIdentity, userProfilePath } from '@/entities/user';

import { cn } from '@/shared/lib/cn';
import { PlayFillIcon } from '@/shared/ui/icons';
import { MediaFrame } from '@/shared/ui/media';

import { getFeedTextBackground } from '../lib/composeBackgrounds';
import type { RepostOriginal } from '../model/schemas';
import { feedRoutes } from '../routes';
import { TextPostBackground } from './TextPostBackground';

type RepostedPostEmbedProps = {
  /** Nested `repost_of` — `null` when the API omitted the original entirely. */
  original: RepostOriginal | null;
  className?: string | undefined;
};

/**
 * Nested original inside a repost card.
 * Compact bordered shell with author + caption/media; engagement stays on the wrapper.
 */
export function RepostedPostEmbed({ original, className }: RepostedPostEmbedProps) {
  const [imageBroken, setImageBroken] = useState(false);

  if (!original || original.unavailable || !original.author) {
    return (
      <div
        role="status"
        className={cn('border-border text-muted mx-3.5 mb-3.5 rounded-field border px-3 py-3.5 text-2xs', className)}
      >
        Original post unavailable
      </div>
    );
  }

  const href = original.kind === 'video' ? feedRoutes.reel(original.id) : feedRoutes.post(original.id);
  const profileHref = userProfilePath({
    id: original.author.id,
    nickname: original.author.nickname,
  });
  const textBg = original.kind === 'text' ? getFeedTextBackground(original.background) : null;
  const primaryPhoto = original.kind === 'photos' ? (original.photos[0] ?? null) : null;
  const extraPhotos = original.kind === 'photos' ? Math.max(0, original.photos.length - 1) : 0;
  const caption = original.body?.trim() ? original.body : null;

  return (
    <div className={cn('border-border mx-3.5 mb-3.5 overflow-hidden rounded-field border', className)}>
      <div className="px-3 pt-3 pb-2">
        <UserIdentity
          user={{
            name: original.author.name,
            avatarUrl: original.author.avatarUrl,
            isOfficial: original.author.isOfficial,
          }}
          to={profileHref}
          avatarSize="sm"
          className="items-center gap-2.5"
          nameClassName="text-body-sm leading-snug"
          meta={
            original.age ? (
              <Link
                to={href}
                className="text-dim mt-0.5 block text-4xs leading-none font-medium"
                onClick={(e) => e.stopPropagation()}
              >
                {original.age}
              </Link>
            ) : null
          }
        />
      </div>

      <Link
        to={href}
        className="block focus-visible:ring-brand focus-visible:ring-2 focus-visible:outline-none focus-visible:ring-inset"
        onClick={(e) => e.stopPropagation()}
        aria-label="View original post"
      >
        {caption && original.kind === 'text' && textBg ? (
          <TextPostBackground background={textBg} className="min-h-[120px]" rounded={false}>
            <p className={cn('text-pretty whitespace-pre-wrap', textBg.textClass)}>{caption}</p>
          </TextPostBackground>
        ) : null}

        {caption && !(original.kind === 'text' && textBg) ? (
          <p className="text-body px-3 pb-2.5 text-2xs leading-relaxed text-pretty whitespace-pre-wrap">{caption}</p>
        ) : null}

        {primaryPhoto && !imageBroken ? (
          <span className="relative mt-0 block w-full">
            <img
              src={primaryPhoto.url}
              alt=""
              className="block h-auto w-full max-w-full"
              style={{ aspectRatio: 'auto' }}
              loading="lazy"
              decoding="async"
              onError={() => setImageBroken(true)}
            />
            {extraPhotos > 0 ? (
              <span className="absolute right-2 bottom-2 rounded-chip bg-black/60 px-1.5 py-0.5 text-4xs font-bold text-white tabular-nums">
                +{extraPhotos}
              </span>
            ) : null}
          </span>
        ) : null}

        {primaryPhoto && imageBroken ? (
          <span className="text-muted grid min-h-28 place-items-center px-3 py-6 text-2xs">Photo unavailable</span>
        ) : null}

        {original.kind === 'video' ? (
          original.poster ? (
            <span className="relative mt-0 block w-full">
              <MediaFrame
                kind="reelPoster"
                src={original.poster}
                alt=""
                rounded="none"
                fade
                className="w-full max-h-[min(52vh,420px)]"
              >
                <span className="bg-brand absolute top-2 left-2 flex items-center gap-1 rounded-full px-2 py-0.5 text-4xs font-bold tracking-wide text-white uppercase">
                  <PlayFillIcon size="xs" className="h-2.5 w-2.5 fill-white" />
                  Reel
                </span>
                <span className="pointer-events-none absolute inset-0 m-auto grid h-11 w-11 place-items-center rounded-full border border-white/50 bg-black/45">
                  <PlayFillIcon size="sm" className="h-4 w-4 fill-white" />
                </span>
              </MediaFrame>
            </span>
          ) : (
            <p className="text-brand-text px-3 pb-3 text-2xs font-semibold">Open Reel</p>
          )
        ) : null}
      </Link>
    </div>
  );
}
