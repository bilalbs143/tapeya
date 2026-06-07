/* eslint-disable react-refresh/only-export-components */
import { useMemo, useState } from 'react';

import { Link } from 'react-router-dom';

import { CLOUDFRONT_APP_BASE } from '@/lib/constants/assets';
import { formatCount } from '@/lib/format';
import { formatPostTimestamp } from '@/lib/utils/feedUtils';

const feedCommentIcon = `${CLOUDFRONT_APP_BASE}/images/icons/feed-comment.svg`;
const feedShareIcon = `${CLOUDFRONT_APP_BASE}/images/icons/feed-share.svg`;

export function ThumbsUpIcon({ filled, className = '' }) {
  return (
    <svg
      className={className}
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path
        d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"
        fill={filled ? 'currentColor' : 'none'}
      />
    </svg>
  );
}

/**
 * Reusable post card for the activity feed.
 * API-ready: accepts a single post object and optional like state/callbacks.
 *
 * @param {Object} post - Post data (id, imageUrl, publishedAt, authorName, authorAvatarUrl, title, description, likesCount, commentsCount, sharesCount, latestComment)
 * @param {boolean} isLiked - Whether the current user has liked this post
 * @param {number} likesCountOverride - Optional override for displayed like count (e.g. after optimistic update)
 * @param {function(string)} onLike - Callback when like is toggled (receives post id)
 */
export default function PostCard({ post, isLiked = false, likesCountOverride, onLike }) {
  const {
    id,
    imageUrl,
    publishedAt,
    authorName,
    authorAvatarUrl,
    title,
    description,
    likesCount,
    commentsCount,
    sharesCount,
    latestComment,
  } = post;

  const [imageError, setImageError] = useState(false);
  const [authorAvatarError, setAuthorAvatarError] = useState(false);
  const [commenterAvatarError, setCommenterAvatarError] = useState(false);

  const displayLikesCount = likesCountOverride ?? likesCount;
  const formattedTimestamp = useMemo(() => formatPostTimestamp(publishedAt), [publishedAt]);

  const handleLikeClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onLike?.(id);
  };

  const avatarPlaceholder =
    'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64"%3E%3Crect fill="%234a5568" width="64" height="64"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="central" text-anchor="middle" fill="%2394a3b8" font-size="24" font-family="sans-serif" %3E?%3C/text%3E%3C/svg%3E';
  const imagePlaceholder =
    'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600"%3E%3Crect fill="%231a1a1a" width="800" height="600"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="central" text-anchor="middle" fill="%234a5568" font-size="24" font-family="sans-serif"%3EImage%3C/text%3E%3C/svg%3E';

  return (
    <Link to={`/feed/${id}`} className="block">
      <article className="overflow-hidden rounded-2xl bg-surface shadow-[0_18px_40px_rgba(0,0,0,0.9)]" data-post-id={id}>
        {/* Post image with timestamp overlay - bottom-left corner */}
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-black">
          <img
            src={imageError ? imagePlaceholder : imageUrl}
            alt=""
            className="h-full w-full object-cover"
            loading="lazy"
            onError={() => setImageError(true)}
          />
          <div className="absolute bottom-0 left-0 w-fit max-w-full px-3 py-2">
            <span className="text-[12px] font-normal text-white">{formattedTimestamp}</span>
          </div>
        </div>

        <div className="p-4">
          {/* Author */}
          <div className="mb-3 flex items-center gap-2 border-b border-surface-border pb-3">
            <img
              src={authorAvatarError ? avatarPlaceholder : authorAvatarUrl}
              alt=""
              className="h-9 w-9 flex-shrink-0 rounded-full object-cover"
              loading="lazy"
              onError={() => setAuthorAvatarError(true)}
            />
            <span className="text-[14px] font-medium text-white">{authorName}</span>
          </div>

          {/* Title & description */}
          <h2 className="mb-1.5 text-[14px] leading-snug font-bold text-white">{title}</h2>
          <p className="mb-4 line-clamp-3 text-[14px] leading-relaxed font-normal text-[#B0B0B0]">{description}</p>

          {/* Engagement row - icons & text #A2A6AB, evenly spaced */}
          <div className="mb-4 flex items-center justify-between border-t border-b border-surface-border py-3 text-muted">
            <button
              type="button"
              onClick={handleLikeClick}
              className={`flex items-center gap-1.5 transition-transform ${isLiked ? 'text-brand' : ''}`}
              aria-label={isLiked ? 'Unlike' : 'Like'}
            >
              <ThumbsUpIcon filled={isLiked} />
              <span className="text-[14px] font-normal">{formatCount(displayLikesCount)}</span>
            </button>
            <span className="flex items-center gap-1.5" aria-hidden>
              <img src={feedCommentIcon} alt="" className="h-[17px] w-[17px] object-contain" aria-hidden />
              <span className="text-[14px] font-normal">{formatCount(commentsCount)}</span>
            </span>
            <span className="flex items-center gap-1.5" aria-hidden>
              <img src={feedShareIcon} alt="" className="h-5 w-5 object-contain" aria-hidden />
              <span className="text-[14px] font-normal">{formatCount(sharesCount)}</span>
            </span>
          </div>

          {/* Latest comment */}
          {latestComment && (
            <div className="flex gap-2 p-3">
              <img
                src={commenterAvatarError ? avatarPlaceholder : latestComment.commenterAvatarUrl}
                alt=""
                className="h-9 w-9 flex-shrink-0 rounded-full object-cover"
                loading="lazy"
                onError={() => setCommenterAvatarError(true)}
              />
              <div className="min-w-0 flex-1">
                <p className="text-[14px] font-bold text-white">{latestComment.commenterName}</p>
                <p className="mt-0.5 text-[14px] leading-relaxed font-normal text-[#B0B0B0]">{latestComment.text}</p>
              </div>
            </div>
          )}
        </div>
      </article>
    </Link>
  );
}
