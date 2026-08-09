/**
 * Shared post/reel comments thread — TikTok-style rows, replies, mentions.
 * Used inline on feed detail and inside ReelCommentsSheet.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { useLocation, useNavigate } from 'react-router-dom';

import { OfficialBadge } from '@/components/OfficialBadge';
import { UserAvatar } from '@/components/UserAvatar';
import { useDebounce } from '@/hooks/useDebounce';
import { DEBOUNCE_MS } from '@/lib/constants/search';
import { formatCount } from '@/lib/format';
import { formatRelativeDate } from '@/lib/utils/dateUtils';
import { detectMentionTrigger, splitMentionSegments } from '@/lib/utils/displayUtils';
import { HeartIcon } from '@/pages/feed/PostCard';
import {
  useAddReelCommentMutation,
  useDeleteReelCommentMutation,
  useGetReelCommentRepliesQuery,
  useGetReelCommentsQuery,
  useLazyGetReelCommentRepliesQuery,
  useLazyGetReelCommentsQuery,
  useLikeReelCommentMutation,
  useUnlikeReelCommentMutation,
} from '@/store/api/reelsApi';
import { useSearchUsersQuery } from '@/store/api/userApi';
import { useAppSelector } from '@/store/hooks';
import { selectIsAuthenticated, selectUser } from '@/store/selectors';
import { Textarea } from '@/ui/Textarea';

const COMMENTS_PER_PAGE = 20;
const REPLIES_PER_PAGE = 50;

function TrashIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M3 6h18" />
      <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    </svg>
  );
}

function ChevronDownIcon({ className = '' }) {
  return (
    <svg
      className={className}
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

function SendIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
    </svg>
  );
}

function userAvatarUrl(user) {
  return user?.avatarUrl || user?.avatar_url || null;
}

function MentionDropdown({ query, onSelect, onClose }) {
  const debouncedQuery = useDebounce(query, DEBOUNCE_MS);
  const { data, isFetching } = useSearchUsersQuery(debouncedQuery, { skip: debouncedQuery == null });
  const users = (data ?? []).filter((user) => Boolean(user.nickname));
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    setActiveIndex(0);
  }, [debouncedQuery, users.length]);

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
        return;
      }
      if (users.length === 0) return;
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        setActiveIndex((index) => Math.min(index + 1, users.length - 1));
        return;
      }
      if (event.key === 'ArrowUp') {
        event.preventDefault();
        setActiveIndex((index) => Math.max(index - 1, 0));
        return;
      }
      if (event.key === 'Enter' || event.key === 'Tab') {
        const user = users[activeIndex];
        if (!user) return;
        event.preventDefault();
        onSelect(user);
      }
    };
    window.addEventListener('keydown', onKeyDown, true);
    return () => window.removeEventListener('keydown', onKeyDown, true);
  }, [activeIndex, onClose, onSelect, users]);

  return (
    <div
      className="border-border bg-surface-elevated absolute bottom-full left-0 z-20 mb-2 max-h-52 w-full overflow-y-auto rounded-[6px] border shadow-xl"
      role="listbox"
      aria-label="Mention suggestions"
    >
      {isFetching && users.length === 0 ? (
        <p className="text-muted px-3 py-3 text-[12px]">Searching…</p>
      ) : users.length === 0 ? (
        <p className="text-muted px-3 py-3 text-[12px]">No users found</p>
      ) : (
        users.map((user, index) => (
          <button
            key={user.id}
            type="button"
            role="option"
            aria-selected={index === activeIndex}
            onMouseDown={(e) => e.preventDefault()}
            onPointerDown={(e) => e.preventDefault()}
            onClick={() => onSelect(user)}
            onMouseEnter={() => setActiveIndex(index)}
            className={`flex w-full items-center gap-2.5 px-3 py-2 text-left transition-colors ${
              index === activeIndex ? 'bg-border' : 'hover:bg-border'
            }`}
          >
            <UserAvatar src={userAvatarUrl(user)} name={user.name} size="xs" />
            <span className="min-w-0 flex-1">
              <span className="flex min-w-0 items-center gap-1">
                <span className="block truncate text-[13px] font-medium text-white">{user.name}</span>
                <OfficialBadge isOfficial={user.isOfficial} />
              </span>
              <span className="text-muted block truncate text-[11px]">@{user.nickname}</span>
            </span>
          </button>
        ))
      )}
    </div>
  );
}

function CommentRow({ comment, isReply = false, currentUserId, deleting, liking, onReply, onDelete, onToggleLike }) {
  const isOwn = currentUserId != null && comment.user?.id === currentUserId;
  const [liked, setLiked] = useState(Boolean(comment.liked));
  const [likesCount, setLikesCount] = useState(Number(comment.likesCount ?? 0));
  const likeInFlightRef = useRef(false);

  useEffect(() => {
    setLiked(Boolean(comment.liked));
    setLikesCount(Number(comment.likesCount ?? 0));
  }, [comment.id, comment.liked, comment.likesCount]);

  const handleLike = async () => {
    if (liking || likeInFlightRef.current) return;
    likeInFlightRef.current = true;
    const nextLiked = !liked;
    const prevLiked = liked;
    const prevCount = likesCount;
    setLiked(nextLiked);
    setLikesCount((count) => Math.max(0, count + (nextLiked ? 1 : -1)));
    try {
      const result = await onToggleLike(comment, nextLiked);
      if (result?.liked != null) setLiked(Boolean(result.liked));
      if (result?.likes_count != null) setLikesCount(Number(result.likes_count));
    } catch {
      setLiked(prevLiked);
      setLikesCount(prevCount);
    } finally {
      likeInFlightRef.current = false;
    }
  };

  return (
    <div className="flex gap-2.5">
      <UserAvatar
        src={userAvatarUrl(comment.user)}
        name={comment.user?.name}
        userId={comment.user?.id}
        size={isReply ? 'xs' : 'md'}
      />
      <div className="min-w-0 flex-1">
        <div className="flex min-w-0 flex-wrap items-baseline gap-x-2">
          <span className="inline-flex min-w-0 items-center gap-1 text-[13px] font-semibold text-white">
            <span className="truncate">{comment.user?.name || 'User'}</span>
            <OfficialBadge isOfficial={comment.user?.isOfficial} />
          </span>
          <span className="text-muted text-[11px]">{formatRelativeDate(comment.createdAt, { compact: true })}</span>
        </div>

        <p className="mt-0.5 text-[13px] leading-relaxed whitespace-pre-wrap text-white/85">
          {splitMentionSegments(comment.body).map((segment, i) =>
            segment.isMention ? (
              <span key={i} className="text-brand">
                {segment.text}
              </span>
            ) : (
              <span key={i}>{segment.text}</span>
            ),
          )}
        </p>

        <button
          type="button"
          onClick={() => onReply(comment)}
          className="text-brand hover:text-brand-hover mt-1.5 text-[12px] font-medium transition-colors"
        >
          Reply
        </button>
      </div>

      <div className="flex min-w-6 shrink-0 flex-col items-center gap-1 self-start">
        {isOwn ? (
          <button
            type="button"
            onClick={() => onDelete(comment)}
            disabled={deleting}
            className="text-muted inline-flex size-6 items-center justify-center rounded-md transition-colors hover:text-red-400 disabled:opacity-40"
            aria-label="Delete Comment"
          >
            <TrashIcon />
          </button>
        ) : null}
        <button
          type="button"
          onClick={handleLike}
          disabled={liking}
          className={`inline-flex min-h-6 min-w-6 flex-col items-center justify-center gap-0.5 rounded-md text-[10px] font-medium transition-colors disabled:opacity-40 ${
            liked ? 'text-brand' : 'text-muted hover:text-white'
          }`}
          aria-label={liked ? 'Unlike comment' : 'Like comment'}
          aria-pressed={liked}
        >
          <HeartIcon filled={liked} className="h-3.5 w-3.5 shrink-0" />
          {likesCount > 0 ? <span className="leading-none">{formatCount(likesCount)}</span> : null}
        </button>
      </div>
    </div>
  );
}

function RepliesSection({ postId, comment, currentUserId, deletingId, likingId, onReply, onDelete, onToggleLike }) {
  const [expanded, setExpanded] = useState(false);
  const [extraItems, setExtraItems] = useState([]);
  const [loadedPage, setLoadedPage] = useState(1);
  const activePostIdRef = useRef(postId);

  useEffect(() => {
    activePostIdRef.current = postId;
  }, [postId]);

  useEffect(() => {
    setExtraItems([]);
    setLoadedPage(1);
  }, [comment.id, postId]);

  const { data, isFetching } = useGetReelCommentRepliesQuery(
    { reelId: postId, commentId: comment.id, page: 1, perPage: REPLIES_PER_PAGE },
    { skip: !expanded },
  );
  const [fetchRepliesPage, { isFetching: isLoadingMore }] = useLazyGetReelCommentRepliesQuery();

  const page1Ids = (data?.items ?? []).map((r) => r.id).join(',');
  const prevPage1IdsRef = useRef(page1Ids);
  useEffect(() => {
    if (prevPage1IdsRef.current && prevPage1IdsRef.current !== page1Ids && loadedPage > 1) {
      setExtraItems([]);
      setLoadedPage(1);
    }
    prevPage1IdsRef.current = page1Ids;
  }, [page1Ids, loadedPage]);

  const replies = useMemo(() => {
    const first = data?.items ?? [];
    const seen = new Set(first.map((r) => r.id));
    return [...first, ...extraItems.filter((r) => !seen.has(r.id))];
  }, [data?.items, extraItems]);

  const total = data?.total ?? comment.repliesCount ?? replies.length;
  const lastPage = data?.lastPage ?? 1;
  const hasMore = loadedPage < lastPage && replies.length < total;
  const remaining = Math.max(0, total - replies.length);

  const handleLoadMore = async () => {
    if (!postId || isLoadingMore || !hasMore) return;
    const requestPostId = postId;
    const nextPage = loadedPage + 1;
    try {
      const pageData = await fetchRepliesPage({
        reelId: postId,
        commentId: comment.id,
        page: nextPage,
        perPage: REPLIES_PER_PAGE,
      }).unwrap();
      if (activePostIdRef.current !== requestPostId) return;
      const pageItems = pageData?.items ?? [];
      if (pageItems.length === 0) {
        setLoadedPage(lastPage);
        return;
      }
      setExtraItems((prev) => {
        const seen = new Set([...(data?.items ?? []), ...prev].map((r) => r.id));
        return [...prev, ...pageItems.filter((r) => !seen.has(r.id))];
      });
      setLoadedPage(nextPage);
    } catch {
      // Caller can retry; keep existing replies.
    }
  };

  if (!comment.repliesCount) return null;

  const toggleLabel = expanded
    ? 'Hide Replies'
    : comment.repliesCount === 1
      ? 'View 1 Reply'
      : `View ${comment.repliesCount} Replies`;

  return (
    <div className="mt-2 pl-11">
      <div className="border-l border-white/10 pl-3">
        <button
          type="button"
          onClick={() => setExpanded((prev) => !prev)}
          className="text-brand hover:text-brand-hover flex items-center gap-1 text-[12px] font-semibold transition-colors"
        >
          {toggleLabel}
          <ChevronDownIcon className={expanded ? 'rotate-180' : ''} />
        </button>

        {expanded ? (
          <div className="mt-3 space-y-3">
            {isFetching && replies.length === 0 ? (
              <p className="text-muted text-[12px]">Loading replies…</p>
            ) : (
              <>
                {replies.map((reply) => (
                  <CommentRow
                    key={reply.id}
                    comment={reply}
                    isReply
                    currentUserId={currentUserId}
                    deleting={deletingId === reply.id}
                    liking={likingId === reply.id}
                    onReply={onReply}
                    onDelete={onDelete}
                    onToggleLike={onToggleLike}
                  />
                ))}
                {hasMore ? (
                  <button
                    type="button"
                    onClick={handleLoadMore}
                    disabled={isLoadingMore}
                    className="text-brand hover:text-brand-hover text-[12px] font-semibold transition-colors disabled:opacity-50"
                  >
                    {isLoadingMore
                      ? 'Loading…'
                      : remaining > 0
                        ? `Load more replies (${formatCount(remaining)} left)`
                        : 'Load more replies'}
                  </button>
                ) : null}
              </>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}

/**
 * @param {{
 *   postId: string|number,
 *   enabled?: boolean,
 *   loginFrom?: string|object,
 *   className?: string,
 *   showHeader?: boolean,
 *   stickyComposer?: boolean,
 *   render?: (parts: { list: import('react').ReactNode, composer: import('react').ReactNode, total: number, resetLocal: () => void }) => import('react').ReactNode,
 * }} props
 */
export default function PostCommentsThread({
  postId,
  enabled = true,
  loginFrom: _loginFrom,
  className = '',
  showHeader = true,
  stickyComposer = false,
  render,
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const currentUser = useAppSelector(selectUser);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const textareaRef = useRef(null);
  const activePostIdRef = useRef(postId);
  const [body, setBody] = useState('');
  const [replyTo, setReplyTo] = useState(null);
  const [mentionState, setMentionState] = useState(null);
  const [extraItems, setExtraItems] = useState([]);
  const [loadedPage, setLoadedPage] = useState(1);
  const [actionError, setActionError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [likingId, setLikingId] = useState(null);

  const {
    data,
    isLoading,
    isFetching,
    isError: commentsQueryError,
  } = useGetReelCommentsQuery({ reelId: postId, page: 1, perPage: COMMENTS_PER_PAGE }, { skip: !enabled || !postId });
  const [fetchCommentsPage, { isFetching: isLoadingMore }] = useLazyGetReelCommentsQuery();
  const [addComment, { isLoading: isPosting }] = useAddReelCommentMutation();
  const [deleteComment] = useDeleteReelCommentMutation();
  const [likeComment] = useLikeReelCommentMutation();
  const [unlikeComment] = useUnlikeReelCommentMutation();

  useEffect(() => {
    activePostIdRef.current = postId;
  }, [postId]);

  // Reset appended pages when switching posts. Do not key off fulfilledTimeStamp —
  // background refetch of page 1 would wipe pages the user already loaded.
  useEffect(() => {
    setExtraItems([]);
    setLoadedPage(1);
    setActionError(null);
    setDeletingId(null);
    setLikingId(null);
    setReplyTo(null);
    setBody('');
    setMentionState(null);
  }, [postId]);

  // If page 1 is invalidated after add/delete, drop extras once the new first page arrives.
  const page1Ids = (data?.items ?? []).map((c) => c.id).join(',');
  const prevPage1IdsRef = useRef(page1Ids);
  useEffect(() => {
    if (prevPage1IdsRef.current && prevPage1IdsRef.current !== page1Ids && loadedPage > 1) {
      setExtraItems([]);
      setLoadedPage(1);
    }
    prevPage1IdsRef.current = page1Ids;
  }, [page1Ids, loadedPage]);

  const comments = useMemo(() => {
    const first = data?.items ?? [];
    const seen = new Set(first.map((c) => c.id));
    return [...first, ...extraItems.filter((c) => !seen.has(c.id))];
  }, [data?.items, extraItems]);

  const total = data?.total ?? comments.length;
  const lastPage = data?.lastPage ?? 1;
  const hasMore = loadedPage < lastPage && comments.length < total;
  const remaining = Math.max(0, total - comments.length);

  const handleLoadMore = async () => {
    if (!postId || isLoadingMore || !hasMore) return;
    const requestPostId = postId;
    const nextPage = loadedPage + 1;
    setActionError(null);
    try {
      const pageData = await fetchCommentsPage({
        reelId: postId,
        page: nextPage,
        perPage: COMMENTS_PER_PAGE,
      }).unwrap();
      if (activePostIdRef.current !== requestPostId) return;
      const pageItems = pageData?.items ?? [];
      if (pageItems.length === 0) {
        setLoadedPage(lastPage);
        return;
      }
      setExtraItems((prev) => {
        const seen = new Set([...(data?.items ?? []), ...prev].map((c) => c.id));
        return [...prev, ...pageItems.filter((c) => !seen.has(c.id))];
      });
      setLoadedPage(nextPage);
    } catch {
      if (activePostIdRef.current === requestPostId) {
        setActionError('Could not load more comments. Try again.');
      }
    }
  };

  const resetLocal = useCallback(() => {
    setReplyTo(null);
    setBody('');
    setMentionState(null);
    setExtraItems([]);
    setLoadedPage(1);
    setActionError(null);
    setDeletingId(null);
    setLikingId(null);
  }, []);

  const handleReply = (comment, threadId) => {
    setReplyTo({ id: comment.id, name: comment.user?.name, threadId });
    setActionError(null);
    requestAnimationFrame(() => textareaRef.current?.focus());
  };

  const handleToggleLike = useCallback(
    async (comment, nextLiked) => {
      if (!postId || !comment?.id) {
        throw new Error('Missing comment');
      }
      if (!isAuthenticated) {
        navigate('/login', { state: { from: location } });
        throw new Error('Auth required');
      }

      setLikingId(comment.id);
      setActionError(null);
      try {
        const mutation = nextLiked ? likeComment : unlikeComment;
        const response = await mutation({ reelId: postId, commentId: comment.id }).unwrap();
        return response?.data ?? response;
      } catch (error) {
        setActionError('Could not update like. Try again.');
        throw error;
      } finally {
        setLikingId(null);
      }
    },
    [isAuthenticated, likeComment, location, navigate, postId, unlikeComment],
  );

  const handleBodyChange = (e) => {
    const { value, selectionStart } = e.target;
    setBody(value);
    setMentionState(detectMentionTrigger(value, selectionStart ?? 0));
  };

  const syncMentionFromCaret = () => {
    const el = textareaRef.current;
    if (!el) return;
    setMentionState(detectMentionTrigger(el.value, el.selectionStart ?? 0));
  };

  const handleSelectMention = useCallback(
    (user) => {
      if (!mentionState || !user?.nickname) return;
      const handle = user.nickname;
      const before = body.slice(0, mentionState.start);
      const after = body.slice(mentionState.start + 1 + mentionState.query.length);
      const insert = `@${handle} `;
      const next = `${before}${insert}${after}`;
      setBody(next);
      setMentionState(null);
      requestAnimationFrame(() => {
        const el = textareaRef.current;
        if (!el) return;
        const caret = before.length + insert.length;
        el.focus();
        el.setSelectionRange(caret, caret);
      });
    },
    [body, mentionState],
  );

  const closeMentionDropdown = useCallback(() => setMentionState(null), []);

  const handleDelete = async (comment) => {
    if (!postId || deletingId) return;
    const removedCount = comment.parentId ? 1 : 1 + (comment.repliesCount ?? 0);
    setDeletingId(comment.id);
    setActionError(null);
    try {
      await deleteComment({ reelId: postId, commentId: comment.id, removedCount }).unwrap();
    } catch {
      setActionError('Could not delete comment. Try again.');
    } finally {
      setDeletingId(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const text = body.trim();
    if (!text || !postId || isPosting) return;
    setActionError(null);
    try {
      await addComment({
        reelId: postId,
        body: text,
        parentId: replyTo?.threadId || undefined,
      }).unwrap();
      setBody('');
      setReplyTo(null);
      setMentionState(null);
    } catch {
      setActionError('Could not post comment. Try again.');
    }
  };

  const errorBanner =
    actionError || commentsQueryError ? (
      <p
        className="mb-3 rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-center text-[12px] text-red-300"
        role="alert"
      >
        {actionError || 'Could not load comments. Try again.'}
      </p>
    ) : null;

  const list = (
    <>
      {errorBanner}
      {isLoading || (isFetching && comments.length === 0) ? (
        <div className="flex items-center justify-center py-10" role="status" aria-label="Loading comments">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/10 border-t-white/70" aria-hidden />
        </div>
      ) : comments.length === 0 && !commentsQueryError ? (
        <p className="py-8 text-center text-sm text-white/50">No comments yet. Be the first.</p>
      ) : comments.length === 0 ? null : (
        <>
          <ul className="space-y-5">
            {comments.map((comment) => (
              <li key={comment.id}>
                <CommentRow
                  comment={comment}
                  currentUserId={currentUser?.id}
                  deleting={deletingId === comment.id}
                  liking={likingId === comment.id}
                  onReply={(c) => handleReply(c, c.id)}
                  onDelete={handleDelete}
                  onToggleLike={handleToggleLike}
                />
                <RepliesSection
                  postId={postId}
                  comment={comment}
                  currentUserId={currentUser?.id}
                  deletingId={deletingId}
                  likingId={likingId}
                  onReply={(c) => handleReply(c, comment.id)}
                  onDelete={handleDelete}
                  onToggleLike={handleToggleLike}
                />
              </li>
            ))}
          </ul>

          {hasMore ? (
            <div className="mt-5 flex justify-center">
              <button
                type="button"
                onClick={handleLoadMore}
                disabled={isLoadingMore}
                className="text-muted border-border rounded-full border px-4 py-2 text-[13px] font-semibold transition-colors hover:text-white disabled:opacity-50"
              >
                {isLoadingMore
                  ? 'Loading…'
                  : remaining > 0
                    ? `Load more comments (${formatCount(remaining)} left)`
                    : 'Load more comments'}
              </button>
            </div>
          ) : null}
        </>
      )}
    </>
  );

  const composer = (
    <form onSubmit={handleSubmit}>
      {replyTo ? (
        <div className="mb-2 flex items-center justify-between text-xs text-white/60">
          <span>
            Replying to <span className="text-white">{replyTo.name ?? 'user'}</span>
          </span>
          <button type="button" className="text-brand" onClick={() => setReplyTo(null)}>
            Cancel
          </button>
        </div>
      ) : null}
      <div className="flex items-end gap-2">
        <UserAvatar src={userAvatarUrl(currentUser)} name={currentUser?.name} userId={currentUser?.id} size="sm" />
        <div className="relative flex min-h-9 flex-1 items-center rounded-2xl border border-white/10 bg-black/40 px-3">
          <Textarea
            ref={textareaRef}
            size="compact"
            value={body}
            onChange={handleBodyChange}
            onClick={syncMentionFromCaret}
            onKeyUp={syncMentionFromCaret}
            onBlur={() => setMentionState(null)}
            placeholder="Add a Comment…"
            maxLength={500}
            className="rounded-none! border-0! bg-transparent! px-0! text-sm leading-5 text-white shadow-none! focus:ring-0!"
          />
          {mentionState ? (
            <MentionDropdown query={mentionState.query} onSelect={handleSelectMention} onClose={closeMentionDropdown} />
          ) : null}
        </div>
        <button
          type="submit"
          disabled={!body.trim() || isPosting}
          className="bg-brand text-ink flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-transform active:scale-95 disabled:opacity-50"
          aria-label="Post Comment"
        >
          {isPosting ? (
            <span className="border-ink/30 border-t-ink h-3.5 w-3.5 animate-spin rounded-full border-2" aria-hidden />
          ) : (
            <SendIcon />
          )}
        </button>
      </div>
    </form>
  );

  if (typeof render === 'function') {
    return render({ list, composer, total, resetLocal });
  }

  return (
    <section id="comments" className={`scroll-mt-24 ${stickyComposer ? 'pb-16' : ''} ${className}`}>
      {showHeader ? (
        <div className="mb-4 flex items-center justify-between gap-2">
          <h2 className="text-[15px] font-bold text-white">
            Comments{typeof total === 'number' ? ` (${formatCount(total)})` : ''}
          </h2>
          <div className="flex items-center gap-1 text-[12px] font-semibold text-white">
            Top Comments
            <ChevronDownIcon className="text-muted" />
          </div>
        </div>
      ) : null}

      {list}

      <div
        className={
          stickyComposer
            ? 'border-border bg-surface/98 fixed right-0 bottom-[calc(58px+max(6px,env(safe-area-inset-bottom)))] left-0 z-39 border-t px-4 py-3 shadow-[0_-8px_24px_rgba(0,0,0,0.3)] backdrop-blur-xl lg:bottom-0 lg:left-[280px]'
            : 'border-border mt-5 border-t pt-4'
        }
      >
        <div className={stickyComposer ? 'mx-auto w-full max-w-2xl' : ''}>{composer}</div>
      </div>
    </section>
  );
}
