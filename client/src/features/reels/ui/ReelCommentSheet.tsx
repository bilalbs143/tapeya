import { useRef, useState } from 'react';

import { useMeQuery } from '@/features/auth';
import {
  type Comment,
  CommentComposer,
  CommentThread,
  useAddPostCommentMutation,
  useDeletePostCommentMutation,
  useGetPostCommentsQuery,
  useLazyGetPostCommentRepliesQuery,
  useLikePostCommentMutation,
  useUnlikePostCommentMutation,
} from '@/features/feed';

import { getApiErrorMessage } from '@/shared/api/errors';
import { confirm } from '@/shared/dialogs';
import { BaseDialog, DialogTitle } from '@/shared/dialogs/BaseDialog';
import { cn } from '@/shared/lib/cn';
import { selectUserId } from '@/shared/store/authSlice';
import { useAppDispatch, useAppSelector } from '@/shared/store/hooks';
import { CloseIcon } from '@/shared/ui/icons';
import { CommentRowSkeleton, EmptyState, ErrorState } from '@/shared/ui/states';
import { toast } from '@/shared/ui/toast';

import { reelsApi } from '../api/reelsApi';
import { REEL_TABS } from '../model/schemas';

type ReelCommentSheetProps = {
  reelId: number | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Seed count shown in the title before the query returns. */
  commentsCount?: number | undefined;
};

/** Reel comments — same `/posts/{id}/comments` as post detail. */
export function ReelCommentSheet({ reelId, open, onOpenChange, commentsCount = 0 }: ReelCommentSheetProps) {
  const dispatch = useAppDispatch();
  const userId = useAppSelector(selectUserId);
  const { data: me } = useMeQuery();
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);

  const enabled = open && reelId != null && reelId > 0;
  const postId = enabled ? reelId : 0;
  const { data: commentsPage, isLoading, isError, refetch } = useGetPostCommentsQuery({ postId }, { skip: !enabled });

  const [addComment, { isLoading: sending }] = useAddPostCommentMutation();
  const [deleteComment] = useDeletePostCommentMutation();
  const [likeComment] = useLikePostCommentMutation();
  const [unlikeComment] = useUnlikePostCommentMutation();
  const [fetchReplies] = useLazyGetPostCommentRepliesQuery();

  const [draft, setDraft] = useState('');
  const [replyTo, setReplyTo] = useState<Comment | null>(null);

  const comments = commentsPage?.items ?? [];
  const total = commentsPage?.total ?? commentsCount;

  function bumpReelComments(delta: number) {
    if (reelId == null) return;
    for (const tab of REEL_TABS) {
      dispatch(
        reelsApi.util.updateQueryData('getReels', { tab }, (draftPage) => {
          const hit = draftPage.items.find((r) => r.id === reelId);
          if (hit) hit.comments = Math.max(0, hit.comments + delta);
        })
      );
    }
    dispatch(
      reelsApi.util.updateQueryData('getReel', reelId, (draftReel) => {
        draftReel.comments = Math.max(0, draftReel.comments + delta);
      })
    );
  }

  function resetComposer() {
    setDraft('');
    setReplyTo(null);
  }

  function close(next: boolean) {
    if (!next) resetComposer();
    onOpenChange(next);
  }

  function startReply(comment: Comment) {
    setReplyTo(comment);
    setDraft(`@${comment.author.handle.replace(/^@/, '')} `);
    window.setTimeout(() => inputRef.current?.focus({ preventScroll: true }), 50);
  }

  async function send() {
    const body = draft.trim();
    if (!body || !enabled) return;
    try {
      await addComment({
        postId,
        body,
        parentId: replyTo?.id,
      }).unwrap();
      bumpReelComments(1);
      resetComposer();
    } catch (err) {
      toast({ title: getApiErrorMessage(err, 'Could not post comment.'), tone: 'error' });
    }
  }

  async function toggleLike(comment: Comment) {
    if (!enabled) return;
    try {
      if (comment.liked) await unlikeComment({ postId, commentId: comment.id }).unwrap();
      else await likeComment({ postId, commentId: comment.id }).unwrap();
    } catch {
      toast({ title: 'Could Not Update Like', tone: 'error' });
    }
  }

  async function remove(comment: Comment) {
    if (!enabled) return;
    const ok = await confirm({
      title: 'Delete Comment?',
      message: 'This cannot be undone.',
      confirmLabel: 'Delete',
      tone: 'danger',
    });
    if (!ok) return;
    try {
      const removed = 1 + comment.repliesCount;
      await deleteComment({
        postId,
        commentId: comment.id,
        removedCount: removed,
      }).unwrap();
      bumpReelComments(-removed);
    } catch (err) {
      toast({ title: getApiErrorMessage(err, 'Could not delete comment.'), tone: 'error' });
    }
  }

  return (
    <BaseDialog
      open={open}
      onOpenChange={close}
      showClose={false}
      contentClassName={cn('bg-surface border-border-subtle flex h-[56dvh] max-h-[560px] flex-col border p-0')}
    >
      <div className="border-border-subtle relative flex min-h-[46px] items-center border-b px-4">
        <DialogTitle className="flex-1 text-sm font-extrabold">Comments ({total.toLocaleString()})</DialogTitle>
        <button
          type="button"
          aria-label="Close"
          onClick={() => close(false)}
          className="text-muted hover:text-ink grid h-8 w-8 place-items-center"
        >
          <CloseIcon size="sm" strokeWidth={2.2} className="h-4 w-4" />
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-4">
        {!enabled ? null : isLoading ? (
          <div className="flex flex-col gap-3.5 py-3" aria-busy="true" aria-label="Loading Comments">
            {[0, 1, 2, 3, 4].map((i) => (
              <CommentRowSkeleton key={i} />
            ))}
          </div>
        ) : isError ? (
          <div className="py-6">
            <ErrorState title="Couldn't Load Comments" onRetry={() => void refetch()} />
          </div>
        ) : comments.length === 0 ? (
          <EmptyState
            title="No Comments Yet"
            description="Be the first — composer stays focused and ready."
            className="py-10"
          />
        ) : (
          <>
            <h2 className="text-dim font-mono flex min-h-[30px] items-center text-4xs font-bold tracking-eyebrow uppercase">
              Top Comments
            </h2>
            <CommentThread
              comments={comments}
              viewerUserId={userId}
              onReply={startReply}
              onLike={(c) => void toggleLike(c)}
              onDelete={(c) => void remove(c)}
              onLoadReplies={async (commentId) => {
                const page = await fetchReplies({ postId, commentId }).unwrap();
                return page.items;
              }}
            />
          </>
        )}
      </div>

      {enabled ? (
        <CommentComposer
          className="shrink-0"
          user={{
            id: me?.id,
            name: me?.name ?? null,
            nickname: me?.nickname,
            avatarUrl: me?.avatarUrl ?? null,
          }}
          draft={draft}
          onDraftChange={setDraft}
          replyTo={replyTo}
          onCancelReply={resetComposer}
          onSend={() => void send()}
          sending={sending}
          inputRef={inputRef}
        />
      ) : null}
    </BaseDialog>
  );
}
