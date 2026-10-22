import { useState } from 'react';

import { UserIdentity, userProfilePath } from '@/entities/user';

import { cn } from '@/shared/lib/cn';
import { HeartIcon } from '@/shared/ui/icons';
import { Spinner } from '@/shared/ui/Spinner';

import type { Comment } from '../model/commentSchemas';

type CommentThreadProps = {
  comments: Comment[];
  viewerUserId: number | null;
  onReply: (comment: Comment) => void;
  onLike: (comment: Comment) => void;
  onDelete: (comment: Comment) => void;
  /** Load replies for a top-level comment (post / reel / drama episode). */
  onLoadReplies: (commentId: number) => Promise<Comment[]>;
  className?: string | undefined;
};

export function CommentThread({
  comments,
  viewerUserId,
  onReply,
  onLike,
  onDelete,
  onLoadReplies,
  className,
}: CommentThreadProps) {
  return (
    <ul className={cn('flex flex-col', className)}>
      {comments.map((c) => (
        <CommentRow
          key={c.id}
          comment={c}
          viewerUserId={viewerUserId}
          onReply={onReply}
          onLike={onLike}
          onDelete={onDelete}
          onLoadReplies={onLoadReplies}
        />
      ))}
    </ul>
  );
}

function CommentRow({
  comment,
  viewerUserId,
  onReply,
  onLike,
  onDelete,
  onLoadReplies,
  depth = 0,
}: {
  comment: Comment;
  viewerUserId: number | null;
  onReply: (comment: Comment) => void;
  onLike: (comment: Comment) => void;
  onDelete: (comment: Comment) => void;
  onLoadReplies: (commentId: number) => Promise<Comment[]>;
  depth?: number;
}) {
  const nested = depth > 0;
  const isOwn = viewerUserId != null && comment.author.id === viewerUserId;
  const profileHref =
    comment.author.id != null
      ? userProfilePath({ id: comment.author.id, nickname: comment.author.nickname })
      : undefined;
  const age = String(comment.age ?? '')
    .replace(/\s*AGO\s*$/i, '')
    .trim();

  const [open, setOpen] = useState(false);
  const [replies, setReplies] = useState<Comment[]>([]);
  const [fetching, setFetching] = useState(false);
  const replyCount = Math.max(comment.repliesCount, replies.length);

  async function toggleReplies() {
    if (open) {
      setOpen(false);
      return;
    }
    if (!replies.length) {
      setFetching(true);
      try {
        const items = await onLoadReplies(comment.id);
        setReplies(items);
      } catch {
        /* parent surfaces toast if needed */
      } finally {
        setFetching(false);
      }
    }
    setOpen(true);
  }

  const bodyClass = cn('text-body leading-snug', nested ? 'text-3xs' : 'text-2xs');

  const body = (
    <p className={cn(bodyClass, 'mt-1')}>
      {comment.body.split(/(@[\w.]+)/g).map((part, i) =>
        part.startsWith('@') ? (
          <span key={i} className="text-brand-text font-semibold">
            {part}
          </span>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </p>
  );

  const actions = !nested ? (
    <div className="flex items-center gap-3.5 pt-1.5">
      <button
        type="button"
        onClick={() => onLike(comment)}
        aria-pressed={comment.liked}
        className={cn(
          'flex items-center gap-1 text-3xs leading-none',
          comment.liked ? 'text-like font-bold' : 'text-muted font-semibold'
        )}
      >
        <HeartIcon size="xs" filled={comment.liked} className="h-3.5 w-3.5" strokeWidth={2} />
        {comment.likes || ''}
      </button>
      <button type="button" onClick={() => onReply(comment)} className="text-muted text-3xs leading-none font-bold">
        Reply
      </button>
      {isOwn ? (
        <button
          type="button"
          onClick={() => onDelete(comment)}
          className="text-danger-soft text-3xs leading-none font-bold"
        >
          Delete
        </button>
      ) : null}
    </div>
  ) : null;

  return (
    <li className={cn('py-2', nested && 'pt-2 pl-3.5')}>
      <div className={cn(nested && 'bg-page-deep rounded-panel px-2.5 py-2')}>
        <UserIdentity
          user={{
            name: comment.author.name,
            avatarUrl: comment.author.avatarUrl,
            isOfficial: comment.author.isOfficial,
          }}
          to={profileHref}
          avatarSize="sm"
          className={cn(nested && 'gap-2')}
          nameClassName={cn('leading-none', nested ? 'text-3xs' : 'text-2xs')}
          beside={age ? <span className="font-mono text-dim text-4xs leading-none font-medium">{age}</span> : null}
        >
          {body}
          {actions}
        </UserIdentity>
      </div>

      {!nested && replyCount > 0 ? (
        <div className="mt-2">
          <button
            type="button"
            onClick={() => void toggleReplies()}
            className="text-brand-text inline-flex items-center gap-1.5 text-3xs font-bold"
          >
            <span className="bg-border-subtle h-px w-4" aria-hidden />
            {fetching ? (
              <Spinner size="sm" label="Loading Replies" />
            ) : open ? (
              'Hide Replies'
            ) : (
              `View ${replyCount} ${replyCount === 1 ? 'Reply' : 'Replies'}`
            )}
          </button>
          {open ? (
            <ul className="flex flex-col">
              {replies.map((r) => (
                <CommentRow
                  key={r.id}
                  comment={r}
                  viewerUserId={viewerUserId}
                  onReply={onReply}
                  onLike={onLike}
                  onDelete={onDelete}
                  onLoadReplies={onLoadReplies}
                  depth={depth + 1}
                />
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}
    </li>
  );
}
