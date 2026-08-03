import { useMemo, useState } from 'react';

import { Link } from 'react-router-dom';

import TextPostBackground from '@/components/feed/TextPostBackground';
import { OfficialBadge } from '@/components/OfficialBadge';
import { CLOUDFRONT_APP_BASE } from '@/lib/constants/assets';
import { getFeedTextBackground } from '@/lib/constants/composeBackgrounds';
import { buildPostDetailPath } from '@/lib/share';
import { formatPostTimestamp } from '@/lib/utils/feedUtils';

const AVATAR_PLACEHOLDER = `${CLOUDFRONT_APP_BASE}/images/standard/default-avatar.png`;
const IMAGE_PLACEHOLDER =
  'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600"%3E%3Crect fill="%231a1a1a" width="800" height="600"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="central" text-anchor="middle" fill="%234a5568" font-size="24" font-family="sans-serif"%3EImage%3C/text%3E%3C/svg%3E';

function PlayIcon({ className = '' }) {
  return (
    <svg className={className} width="28" height="28" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}

/**
 * Nested original inside a repost: compact profile row + indented bordered shell.
 * Media stays square (no radius) so it matches main feed posts.
 */
export default function RepostedPostEmbed({ post, className = '' }) {
  const [avatarError, setAvatarError] = useState(false);
  const [imageError, setImageError] = useState(false);

  const formattedTimestamp = useMemo(() => (post?.publishedAt ? formatPostTimestamp(post.publishedAt) : ''), [post?.publishedAt]);

  if (!post?.id) return null;

  if (post.unavailable) {
    return (
      <div
        className={`border-border bg-surface-raised/40 text-muted mx-4 mt-3 border px-3 py-4 text-[13px] ${className}`.trim()}
        role="status"
      >
        Original post unavailable
      </div>
    );
  }

  const type = post.type || 'text';
  const caption = post.description || post.body || '';
  const textBg = type === 'text' ? getFeedTextBackground(post.backgroundId) : null;
  const mediaUrl = post.imageUrl || post.media?.[0]?.url || null;
  const mediaWidth = post.media?.[0]?.width || null;
  const mediaHeight = post.media?.[0]?.height || null;
  const detailTo = buildPostDetailPath(post);

  return (
    <Link
      to={detailTo}
      className={`border-border bg-surface-raised/40 focus-visible:ring-brand mx-4 mt-3 block overflow-hidden border focus-visible:ring-2 focus-visible:outline-none focus-visible:ring-inset ${className}`.trim()}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex items-center gap-2.5 px-3 pt-2.5 pb-2">
        <span className="rounded-full bg-[linear-gradient(135deg,var(--color-brand),var(--color-brand-dark))] p-px">
          <img
            src={avatarError || !post.authorAvatarUrl ? AVATAR_PLACEHOLDER : post.authorAvatarUrl}
            alt=""
            className="border-surface h-8 w-8 rounded-full border object-cover"
            loading="lazy"
            onError={() => setAvatarError(true)}
          />
        </span>
        <div className="min-w-0 flex-1">
          <p className="flex min-w-0 items-center gap-1 text-[13px] font-bold text-white">
            <span className="truncate">{post.authorName}</span>
            <OfficialBadge isOfficial={post.authorIsOfficial} />
          </p>
          {formattedTimestamp ? (
            <p className="text-muted text-[11px]">
              <time dateTime={post.publishedAt || undefined}>{formattedTimestamp}</time>
            </p>
          ) : null}
        </div>
      </div>

      {caption && textBg ? (
        <TextPostBackground background={textBg} className="min-h-44" rounded={false}>
          <p className={`mx-auto whitespace-pre-wrap ${textBg.textClassName}`}>{caption}</p>
        </TextPostBackground>
      ) : caption ? (
        <p className="px-3 pb-3 text-[14px] leading-relaxed text-pretty whitespace-pre-wrap text-white">{caption}</p>
      ) : null}

      {post.title && type !== 'text' && type !== 'repost' && post.title !== caption ? (
        <h2 className="px-3 pb-2 text-[13px] leading-snug font-bold text-white/80">{post.title}</h2>
      ) : null}

      {type === 'image' && mediaUrl ? (
        <div className="w-full bg-black">
          <img
            src={imageError ? IMAGE_PLACEHOLDER : mediaUrl}
            alt=""
            width={mediaWidth || undefined}
            height={mediaHeight || undefined}
            className="block h-auto w-full"
            loading="lazy"
            decoding="async"
            onError={() => setImageError(true)}
          />
        </div>
      ) : null}

      {type === 'video' && mediaUrl ? (
        <div className="relative w-full overflow-hidden bg-black">
          <img
            src={imageError ? IMAGE_PLACEHOLDER : mediaUrl}
            alt=""
            className="block h-auto w-full"
            loading="lazy"
            onError={() => setImageError(true)}
          />
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.35)_0%,transparent_30%,transparent_60%,rgba(0,0,0,0.7)_100%)]" />
          <span className="bg-brand text-ink absolute top-2.5 left-2.5 flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wide uppercase shadow-lg">
            <PlayIcon className="h-2.5 w-2.5" />
            Reel
          </span>
          <span className="absolute inset-0 grid place-items-center" aria-hidden>
            <span className="grid h-12 w-12 place-items-center rounded-full bg-black/30 ring-1 ring-white/40 backdrop-blur-md">
              <PlayIcon className="ml-0.5 h-5 w-5 text-white" />
            </span>
          </span>
        </div>
      ) : null}

      {type === 'video' && !mediaUrl ? <p className="text-brand px-3 pb-3 text-[13px] font-semibold">Open reel</p> : null}
    </Link>
  );
}
