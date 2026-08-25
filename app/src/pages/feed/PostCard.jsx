import { useMemo, useState } from 'react';

import { Link } from 'react-router-dom';

import RepostedPostEmbed from '@/components/feed/RepostedPostEmbed';
import TextPostBackground from '@/components/feed/TextPostBackground';
import { OfficialBadge } from '@/components/OfficialBadge';
import { UserAvatar } from '@/components/UserAvatar';
import { usePostEngagement } from '@/features/feed/usePostEngagement';
import { getFeedTextBackground } from '@/lib/constants/composeBackgrounds';
import { formatCount } from '@/lib/format';
import { buildPostDetailPath, resolveCreatorProfilePath } from '@/lib/share';
import { formatPostTimestamp } from '@/lib/utils/feedUtils';
import { useFollowReelCreatorMutation, useUnfollowReelCreatorMutation } from '@/store/api/reelsApi';
import { useAppSelector } from '@/store/hooks';
import { selectUser } from '@/store/selectors';

const imagePlaceholder =
  'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600"%3E%3Crect fill="%231a1a1a" width="800" height="600"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="central" text-anchor="middle" fill="%234a5568" font-size="24" font-family="sans-serif"%3EImage%3C/text%3E%3C/svg%3E';

export function HeartIcon({ filled = false, className = '' }) {
  return (
    <svg
      className={className}
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

/** @deprecated Prefer HeartIcon — kept for ActivityFeedDetail / older imports */
export function ThumbsUpIcon({ filled, className = '' }) {
  return <HeartIcon filled={filled} className={className} />;
}

export function CommentIcon({ className = '' }) {
  return (
    <svg
      className={className}
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
    </svg>
  );
}

export function ShareIcon({ className = '' }) {
  return (
    <svg
      className={className}
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <path d="M8.59 13.51l6.83 3.98M15.41 6.51l-6.82 3.98" />
    </svg>
  );
}

export function BookmarkIcon({ filled = false, className = '' }) {
  return (
    <svg
      className={className}
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
    </svg>
  );
}

export function RepostIcon({ className = '' }) {
  return (
    <svg
      className={className}
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M17 1l4 4-4 4" />
      <path d="M3 11V9a4 4 0 0 1 4-4h14" />
      <path d="M7 23l-4-4 4-4" />
      <path d="M21 13v2a4 4 0 0 1-4 4H3" />
    </svg>
  );
}

function PlayIcon({ className = '' }) {
  return (
    <svg className={className} width="28" height="28" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}

export function ActionButton({ active, onClick, icon, ariaLabel, disabled }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      aria-pressed={active == null ? undefined : Boolean(active)}
      title={ariaLabel}
      className={`grid h-11 min-h-11 flex-1 place-items-center rounded-xl transition-[color,background-color,transform] active:scale-95 disabled:opacity-50 ${
        active ? 'text-brand' : 'text-muted hover:bg-surface-raised hover:text-white'
      }`}
    >
      {icon}
    </button>
  );
}

/** Quiet outline Follow control shared by feed list + detail. */
export function FollowChip({ following, busy, onClick, name }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={busy}
      aria-label={following ? `Unfollow ${name}` : `Follow ${name}`}
      aria-pressed={Boolean(following)}
      className={`h-9 shrink-0 rounded-full px-3 text-[12px] font-semibold transition-colors disabled:opacity-50 ${
        following ? 'text-muted hover:text-white' : 'text-brand ring-brand/40 hover:bg-brand/10 ring-1 ring-inset'
      }`}
    >
      {following ? 'Following' : 'Follow'}
    </button>
  );
}

/**
 * Feed card for mixed posts (text / image / video / repost).
 * Content is a link; engagement controls sit outside so nested interactive a11y stays valid.
 */
export default function PostCard({ post }) {
  const {
    id,
    type = 'text',
    imageUrl,
    publishedAt,
    authorName,
    authorAvatarUrl,
    authorIsOfficial,
    title,
    description,
    body,
    backgroundId,
    likesCount,
    commentsCount,
    sharesCount,
    repostsCount,
    viewsCount,
    latestComment,
    repostOf,
    media,
    liked,
    saved,
    followingCreator,
    authorId,
  } = post;

  const currentUser = useAppSelector(selectUser);
  const [followCreator, { isLoading: isFollowPending }] = useFollowReelCreatorMutation();
  const [unfollowCreator, { isLoading: isUnfollowPending }] = useUnfollowReelCreatorMutation();

  const [imageError, setImageError] = useState(false);

  const { toggleLike, toggleSave, share, repost, isReposting } = usePostEngagement(post);

  const formattedTimestamp = useMemo(() => formatPostTimestamp(publishedAt), [publishedAt]);
  const caption = description || body || '';
  const textBg = type === 'text' ? getFeedTextBackground(backgroundId) : null;
  const mediaUrl = imageUrl || media?.[0]?.url || repostOf?.imageUrl || null;
  const mediaWidth = media?.[0]?.width || null;
  const mediaHeight = media?.[0]?.height || null;
  const detailTo = buildPostDetailPath(post);
  const profileTo = resolveCreatorProfilePath(authorId);

  const isOwnPost = authorId != null && currentUser?.id != null && String(authorId) === String(currentUser.id);
  const showFollow = Boolean(authorId) && !isOwnPost;
  const followBusy = isFollowPending || isUnfollowPending;

  const onFollowClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!authorId || followBusy) return;
    if (followingCreator) {
      unfollowCreator(authorId);
    } else {
      followCreator(authorId);
    }
  };

  return (
    <article
      className="bg-surface overflow-hidden shadow-[0_1px_0_0_rgba(255,255,255,0.06)_inset,0_20px_40px_-24px_rgba(0,0,0,0.8)]"
      data-post-id={id}
    >
      <header className="flex items-center gap-2 px-4 pt-3.5">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <UserAvatar src={authorAvatarUrl} name={authorName} userId={authorId} size="xl" ring="brand" />
          <div className="min-w-0 flex-1">
            {profileTo ? (
              <Link
                to={profileTo}
                className="focus-visible:ring-brand focus-visible:ring-offset-surface flex min-w-0 items-center gap-1 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
                aria-label={authorName ? `View ${authorName}'s profile` : 'View profile'}
              >
                <span className="truncate text-[14px] font-bold text-white">{authorName}</span>
                <OfficialBadge isOfficial={authorIsOfficial} />
              </Link>
            ) : (
              <div className="flex min-w-0 items-center gap-1">
                <span className="truncate text-[14px] font-bold text-white">{authorName}</span>
                <OfficialBadge isOfficial={authorIsOfficial} />
              </div>
            )}
            {formattedTimestamp ? (
              <Link
                to={detailTo}
                className="focus-visible:ring-brand focus-visible:ring-offset-surface focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
              >
                <time className="text-muted block text-[11px] leading-tight" dateTime={publishedAt || undefined}>
                  {formattedTimestamp}
                </time>
              </Link>
            ) : null}
          </div>
        </div>
        {showFollow ? (
          <FollowChip following={followingCreator} busy={followBusy} onClick={onFollowClick} name={authorName} />
        ) : null}
      </header>

      {(caption ||
        (title && type !== 'text' && type !== 'repost' && title !== caption) ||
        (type === 'image' && mediaUrl) ||
        (type === 'video' && mediaUrl)) && (
        <Link
          to={detailTo}
          className="focus-visible:ring-brand block focus-visible:ring-2 focus-visible:outline-none focus-visible:ring-inset"
        >
          {caption && textBg ? (
            <TextPostBackground background={textBg} className="mt-3 min-h-56" rounded={false}>
              <p className={`mx-auto whitespace-pre-wrap ${textBg.textClassName}`}>{caption}</p>
            </TextPostBackground>
          ) : caption ? (
            <p className="max-w-[42ch] px-5 pt-3 text-[15px] leading-[1.6] text-pretty whitespace-pre-wrap text-white sm:px-6">
              {caption}
            </p>
          ) : null}

          {title && type !== 'text' && type !== 'repost' && title !== caption && (
            <h2 className="px-5 pt-1 text-[14px] leading-snug font-bold text-white/80 sm:px-6">{title}</h2>
          )}

          {type === 'image' && mediaUrl && (
            <div className="mt-3 w-full bg-black">
              <img
                src={imageError ? imagePlaceholder : mediaUrl}
                alt=""
                width={mediaWidth || undefined}
                height={mediaHeight || undefined}
                className="block h-auto w-full"
                loading="lazy"
                decoding="async"
                onError={() => setImageError(true)}
              />
            </div>
          )}

          {type === 'video' && mediaUrl && (
            <div className="relative mt-3 w-full overflow-hidden bg-black">
              <img
                src={imageError ? imagePlaceholder : mediaUrl}
                alt=""
                className="block h-auto w-full"
                loading="lazy"
                onError={() => setImageError(true)}
              />
              <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.2)_0%,transparent_28%,transparent_62%,rgba(0,0,0,0.55)_100%)]" />
              <span className="absolute inset-0 grid place-items-center" aria-hidden>
                <span className="grid h-12 w-12 place-items-center rounded-full bg-black/35 ring-1 ring-white/35 backdrop-blur-sm">
                  <PlayIcon className="ml-0.5 h-5 w-5 text-white" />
                </span>
              </span>
              {typeof viewsCount === 'number' && viewsCount > 0 && (
                <span className="absolute bottom-3 left-3 rounded-full bg-black/40 px-2 py-1 text-[11px] font-semibold text-white backdrop-blur-sm">
                  {formatCount(viewsCount)} views
                </span>
              )}
            </div>
          )}
        </Link>
      )}

      {type === 'repost' && repostOf ? <RepostedPostEmbed post={repostOf} /> : null}

      <div className="text-muted flex items-center justify-between px-4 pt-3 pb-1 text-[12px]">
        <span className="flex items-center gap-1.5">
          <span className="from-brand to-brand-dark grid h-5 w-5 place-items-center rounded-full bg-linear-to-br">
            <HeartIcon filled className="h-2.5 w-2.5 text-white" />
          </span>
          <span className="tabular-nums">{formatCount(likesCount)}</span>
        </span>
        <Link to={detailTo} className="tabular-nums transition-colors hover:text-white">
          {formatCount(commentsCount)} comments · {formatCount(sharesCount)} shares · {formatCount(repostsCount)} reposts
        </Link>
      </div>

      <div className="border-border my-1 border-t" />

      <div className="flex items-center gap-0.5 px-1.5 pb-2" role="group" aria-label="Post actions">
        <ActionButton
          active={liked}
          onClick={toggleLike}
          icon={<HeartIcon filled={liked} />}
          ariaLabel={liked ? 'Unlike' : 'Like'}
        />
        <Link
          to={detailTo}
          className="text-muted hover:bg-surface-raised grid h-11 min-h-11 flex-1 place-items-center rounded-xl transition-colors hover:text-white active:scale-95"
          aria-label="Comment"
          title="Comment"
        >
          <CommentIcon />
        </Link>
        <ActionButton onClick={share} icon={<ShareIcon />} ariaLabel="Share" />
        <ActionButton onClick={repost} icon={<RepostIcon />} ariaLabel="Repost" disabled={isReposting} />
        <ActionButton
          active={saved}
          onClick={toggleSave}
          icon={<BookmarkIcon filled={saved} />}
          ariaLabel={saved ? 'Unsave post' : 'Save post'}
        />
      </div>

      {latestComment && commentsCount > 0 ? (
        <Link
          to={detailTo}
          className="border-border text-muted block border-t px-5 py-2.5 text-[13px] leading-snug transition-colors hover:text-white/80 sm:px-6"
        >
          <span className="block truncate">
            <span className="font-semibold text-white/80">{latestComment.commenterName}</span>
            <span>: {latestComment.text}</span>
          </span>
        </Link>
      ) : null}
    </article>
  );
}
