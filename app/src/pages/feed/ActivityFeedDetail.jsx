import { useCallback, useEffect, useMemo, useState } from 'react';

import { useNavigate, useParams } from 'react-router-dom';

import feedCommentIcon from '@/assets/images/icons/feed-comment.svg';
import feedShareIcon from '@/assets/images/icons/feed-share.svg';
import {
  formatCount,
  formatPostTimestamp,
  ThumbsUpIcon,
} from '@/pages/feed/PostCard';
import { Container } from '@/ui/Container';

import { getPostDetail } from './feedData';

const AVATAR_PLACEHOLDER =
  'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64"%3E%3Crect fill="%234a5568" width="64" height="64"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="central" text-anchor="middle" fill="%2394a3b8" font-size="24" font-family="sans-serif" %3E?%3C/text%3E%3C/svg%3E';
const IMAGE_PLACEHOLDER =
  'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600"%3E%3Crect fill="%231a1a1a" width="800" height="600"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="central" text-anchor="middle" fill="%234a5568" font-size="24" font-family="sans-serif"%3EImage%3C/text%3E%3C/svg%3E';

function ThumbsDownIcon({ filled, className = '' }) {
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
        d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h3a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2h-3"
        fill={filled ? 'currentColor' : 'none'}
      />
    </svg>
  );
}

/**
 * Single comment row: avatar, name, text, like/dislike counts.
 * Supports optional like/dislike toggle for interactivity.
 */
function CommentItem({
  comment,
  onLike,
  onDislike,
  likedByUser,
  dislikedByUser,
}) {
  const [avatarError, setAvatarError] = useState(false);
  const displayLikes =
    likedByUser !== undefined
      ? comment.likesCount + (likedByUser ? 1 : 0)
      : comment.likesCount;
  const displayDislikes =
    dislikedByUser !== undefined
      ? comment.dislikesCount + (dislikedByUser ? 1 : 0)
      : comment.dislikesCount;

  return (
    <div className="flex gap-2 border-b border-[#1A1A1A] py-3 last:border-b-0">
      <img
        src={avatarError ? AVATAR_PLACEHOLDER : comment.commenterAvatarUrl}
        alt=""
        className="h-9 w-9 flex-shrink-0 rounded-full object-cover"
        loading="lazy"
        onError={() => setAvatarError(true)}
      />
      <div className="min-w-0 flex-1">
        <p className="text-[14px] font-bold text-white">
          {comment.commenterName}
        </p>
        <p className="mt-0.5 text-[14px] leading-relaxed font-normal text-[#B0B0B0]">
          {comment.text}
        </p>
        <div className="mt-2 flex items-center gap-4 text-[#A2A6AB]">
          {typeof onLike === 'function' ? (
            <button
              type="button"
              onClick={() => onLike(comment.id)}
              className={`flex items-center gap-1.5 transition-colors ${likedByUser ? 'text-[#DA9811]' : ''}`}
              aria-label="Like comment"
            >
              <ThumbsUpIcon filled={likedByUser} />
              <span className="text-[14px] font-normal">
                {formatCount(displayLikes)}
              </span>
            </button>
          ) : (
            <span className="flex items-center gap-1.5" aria-hidden>
              <ThumbsUpIcon />
              <span className="text-[14px] font-normal">
                {formatCount(comment.likesCount)}
              </span>
            </span>
          )}
          {typeof onDislike === 'function' ? (
            <button
              type="button"
              onClick={() => onDislike(comment.id)}
              className={`flex items-center gap-1.5 transition-colors ${dislikedByUser ? 'text-red-500' : ''}`}
              aria-label="Dislike comment"
            >
              <ThumbsDownIcon filled={dislikedByUser} />
              <span className="text-[14px] font-normal">
                {formatCount(displayDislikes)}
              </span>
            </button>
          ) : (
            <span className="flex items-center gap-1.5" aria-hidden>
              <ThumbsDownIcon />
              <span className="text-[14px] font-normal">
                {formatCount(comment.dislikesCount)}
              </span>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Activity Feed Detail: single post with full content and comment thread.
 * UI matches ActivityFeed/PostCard; adds comment list and add-comment input.
 */
export default function ActivityFeedDetail() {
  const { postId } = useParams();
  const navigate = useNavigate();
  const detail = useMemo(
    () => (postId ? getPostDetail(postId) : null),
    [postId],
  );

  const [postLiked, setPostLiked] = useState(false);
  const [newComments, setNewComments] = useState([]);
  const [commentInput, setCommentInput] = useState('');
  const [commentReactions, setCommentReactions] = useState(() => new Map());
  const [imageError, setImageError] = useState(false);
  const [authorAvatarError, setAuthorAvatarError] = useState(false);

  const post = detail?.post ?? null;
  const commentsToShow = useMemo(
    () => [...(detail?.comments ?? []), ...newComments],
    [detail, newComments],
  );

  useEffect(() => {
    if (!postId) return;
    setNewComments([]);
    setCommentReactions(new Map());
    setImageError(false);
    setAuthorAvatarError(false);
  }, [postId]);

  const displayLikesCount = post
    ? postLiked
      ? post.likesCount + 1
      : post.likesCount
    : 0;
  const displayCommentsCount = commentsToShow.length;

  const togglePostLike = useCallback(() => {
    setPostLiked((prev) => !prev);
  }, []);

  const handleCommentLike = useCallback((commentId) => {
    setCommentReactions((prev) => {
      const next = new Map(prev);
      const current = next.get(commentId);
      if (current === 'like') {
        next.delete(commentId);
      } else {
        next.set(commentId, 'like');
      }
      return next;
    });
  }, []);

  const handleCommentDislike = useCallback((commentId) => {
    setCommentReactions((prev) => {
      const next = new Map(prev);
      const current = next.get(commentId);
      if (current === 'dislike') {
        next.delete(commentId);
      } else {
        next.set(commentId, 'dislike');
      }
      return next;
    });
  }, []);

  const handleAddComment = useCallback(
    (e) => {
      e?.preventDefault();
      const text = commentInput.trim();
      if (!text) return;
      const comment = {
        id: `comment-new-${Date.now()}`,
        commenterName: 'You',
        commenterAvatarUrl: 'https://i.pravatar.cc/128?img=1',
        text,
        likesCount: 0,
        dislikesCount: 0,
      };
      setNewComments((prev) => [...prev, comment]);
      setCommentInput('');
    },
    [commentInput],
  );

  const formattedTimestamp = useMemo(
    () => (post ? formatPostTimestamp(post.publishedAt) : ''),
    [post],
  );

  if (!post) {
    return (
      <div className="bg-black text-white">
        <Container className="py-8 text-center">
          <p className="text-[#A2A6AB]">Post not found.</p>
          <button
            type="button"
            onClick={() => navigate('/feed')}
            className="mt-4 text-[#DA9811] underline"
          >
            Back to feed
          </button>
        </Container>
      </div>
    );
  }

  const {
    imageUrl,
    authorName,
    authorAvatarUrl,
    title,
    description,
    sharesCount,
  } = post;

  return (
    <div className="min-h-full bg-black text-white">
      <header className="sticky top-0 z-10 flex items-center gap-3 border-b border-[#1A1A1A] bg-black px-4 py-4">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[#A2A6AB] transition-opacity hover:opacity-80"
          aria-label="Back"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="min-w-0 flex-1 text-center text-[16px] font-bold tracking-wide text-white uppercase">
          ACTIVITY FEED
        </h1>
        <span className="w-9" aria-hidden />
      </header>

      <Container className="flex flex-col gap-0 pt-4 pb-24">
        {/* Post block - consistent with PostCard */}
        <article className="overflow-hidden rounded-2xl bg-[#141412] shadow-[0_18px_40px_rgba(0,0,0,0.9)]">
          <div className="relative aspect-[4/3] w-full overflow-hidden bg-black">
            <img
              src={imageError ? IMAGE_PLACEHOLDER : imageUrl}
              alt=""
              className="h-full w-full object-cover"
              loading="lazy"
              onError={() => setImageError(true)}
            />
            <div className="absolute bottom-0 left-0 max-w-full px-3 py-2">
              <span className="text-[12px] font-normal text-white">
                {formattedTimestamp}
              </span>
            </div>
          </div>

          <div className="p-4">
            <div className="mb-3 flex items-center gap-2 border-b border-[#1A1A1A] pb-3">
              <img
                src={authorAvatarError ? AVATAR_PLACEHOLDER : authorAvatarUrl}
                alt=""
                className="h-9 w-9 flex-shrink-0 rounded-full object-cover"
                loading="lazy"
                onError={() => setAuthorAvatarError(true)}
              />
              <div className="min-w-0">
                <span className="block text-[14px] font-medium text-white">
                  {authorName}
                </span>
                <span className="block text-[12px] font-normal text-[#A2A6AB]">
                  {formattedTimestamp}
                </span>
              </div>
            </div>

            <h2 className="mb-1.5 text-[14px] leading-snug font-bold text-white">
              {title}
            </h2>
            <p className="mb-4 text-[14px] leading-relaxed font-normal text-[#B0B0B0]">
              {description}
            </p>

            <div className="mb-4 flex items-center justify-between border-t border-b border-[#1A1A1A] py-3 text-[#A2A6AB]">
              <button
                type="button"
                onClick={togglePostLike}
                className={`flex items-center gap-1.5 transition-transform ${postLiked ? 'text-[#DA9811]' : ''}`}
                aria-label={postLiked ? 'Unlike' : 'Like'}
              >
                <ThumbsUpIcon filled={postLiked} />
                <span className="text-[14px] font-normal">
                  {formatCount(displayLikesCount)}
                </span>
              </button>
              <span className="flex items-center gap-1.5" aria-hidden>
                <img
                  src={feedCommentIcon}
                  alt=""
                  className="h-[17px] w-[17px] object-contain"
                />
                <span className="text-[14px] font-normal">
                  {formatCount(displayCommentsCount)}
                </span>
              </span>
              <span className="flex items-center gap-1.5" aria-hidden>
                <img
                  src={feedShareIcon}
                  alt=""
                  className="h-5 w-5 object-contain"
                />
                <span className="text-[14px] font-normal">
                  {formatCount(sharesCount)}
                </span>
              </span>
            </div>
          </div>
        </article>

        {/* Comments */}
        <div className="mt-4 rounded-2xl bg-[#141412] px-4 py-3 shadow-[0_18px_40px_rgba(0,0,0,0.9)]">
          {commentsToShow.length === 0 ? (
            <p className="py-4 text-center text-[14px] text-[#A2A6AB]">
              No comments yet. Be the first to comment.
            </p>
          ) : (
            <div className="divide-y divide-[#1A1A1A]">
              {commentsToShow.map((comment) => (
                <CommentItem
                  key={comment.id}
                  comment={comment}
                  onLike={handleCommentLike}
                  onDislike={handleCommentDislike}
                  likedByUser={commentReactions.get(comment.id) === 'like'}
                  dislikedByUser={
                    commentReactions.get(comment.id) === 'dislike'
                  }
                />
              ))}
            </div>
          )}
        </div>

        {/* Add comment - fixed at bottom above nav */}
        <form
          onSubmit={handleAddComment}
          className="fixed right-0 bottom-20 left-0 z-10 mx-auto max-w-2xl px-4"
        >
          <div className="flex items-center gap-2 rounded-2xl border border-[#2A2A2A] bg-[#1A1A1A] px-4 py-3">
            <input
              type="text"
              value={commentInput}
              onChange={(e) => setCommentInput(e.target.value)}
              placeholder="Add a comment..."
              className="min-w-0 flex-1 bg-transparent text-[14px] text-white placeholder:text-[#A2A6AB] focus:outline-none"
              aria-label="Add a comment"
            />
            <button
              type="button"
              className="flex h-8 w-8 shrink-0 items-center justify-center text-[#A2A6AB] transition-opacity hover:opacity-80"
              aria-label="Emoji"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M8 14s1.5 2 4 2 4-2 4-2" />
                <line x1="9" y1="9" x2="9.01" y2="9" />
                <line x1="15" y1="9" x2="15.01" y2="9" />
              </svg>
            </button>
            <button
              type="button"
              className="flex h-8 w-8 shrink-0 items-center justify-center text-[#A2A6AB] transition-opacity hover:opacity-80"
              aria-label="Like"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            </button>
          </div>
        </form>
      </Container>
    </div>
  );
}
