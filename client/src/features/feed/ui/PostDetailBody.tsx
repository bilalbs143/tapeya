import { ScreenBar } from '@/shared/layout';
import { Button } from '@/shared/ui/Button';
import { CommentRowSkeleton, EmptyState, ErrorState, PostSkeleton } from '@/shared/ui/states';

import { CommentComposer } from './CommentComposer';
import { CommentThread } from './CommentThread';
import { PostCard } from './PostCard';
import type { usePostDetail } from './usePostDetail';

type PostDetailFlow = ReturnType<typeof usePostDetail>;

type PostDetailBodyProps = {
  flow: PostDetailFlow;
};

/** Post card, comment thread, and compose footer for PostDetailPage. */
export function PostDetailBody({ flow }: PostDetailBodyProps) {
  const {
    valid,
    userId,
    me,
    composerInputRef,
    keyboardInset,
    data,
    isLoading,
    isError,
    refetch,
    comments,
    commentsLoading,
    commentsError,
    refetchComments,
    reposting,
    sending,
    draft,
    setDraft,
    replyTo,
    goHome,
    toggleLike,
    toggleSave,
    repost,
    focusComposer,
    startReply,
    cancelReply,
    sendComment,
    toggleCommentLike,
    removeComment,
    loadReplies,
  } = flow;

  return (
    /* Opaque compose footer (not sticky overlay — iOS showed media through dock sides). */
    <div className="bg-surface flex h-full min-h-0 flex-col overflow-hidden" style={{ paddingBottom: keyboardInset }}>
      <ScreenBar title="Activity Feed" subtitle="Post and Comments" sticky={false} onBack={goHome} />

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain" data-scroll-to-top>
        {!valid ? (
          <div className="flex flex-col items-center gap-3 px-4 py-8">
            <ErrorState title="Couldn't Load This Post" />
            <Button variant="secondary" size="sm" onClick={goHome}>
              Back to Home
            </Button>
          </div>
        ) : null}

        {valid && isError ? (
          <div className="px-4 pt-3.5">
            <ErrorState title="Couldn't Load This Post" onRetry={() => void refetch()} />
          </div>
        ) : null}

        {valid && isLoading ? (
          <div className="px-4 pt-3.5">
            <PostSkeleton className="rounded-none border-0 border-b shadow-none" />
          </div>
        ) : null}

        {data ? (
          <PostCard
            post={data}
            isOwn={userId != null && data.author.id === userId}
            className="border-border-subtle rounded-none border-0 border-b shadow-none"
            onLike={() => void toggleLike()}
            onComment={focusComposer}
            onRepost={() => void repost()}
            repostBusy={reposting}
            onSave={() => void toggleSave()}
          />
        ) : null}

        {data ? (
          <div id="comments" className="scroll-mt-14 flex flex-col px-4 pt-1 pb-4">
            {commentsLoading ? (
              <div className="flex flex-col gap-3.5 py-2" aria-busy="true" aria-label="Loading Comments">
                {[0, 1, 2].map((i) => (
                  <CommentRowSkeleton key={i} />
                ))}
              </div>
            ) : null}

            {commentsError ? (
              <div className="py-2">
                <ErrorState title="Couldn't Load Comments" onRetry={() => void refetchComments()} />
              </div>
            ) : null}

            {!commentsLoading && !commentsError && comments.length === 0 ? (
              <div className="py-2">
                <EmptyState title="No Comments Yet" description="Be the first — composer stays focused and ready." />
              </div>
            ) : null}

            {!commentsLoading && !commentsError && comments.length > 0 ? (
              <CommentThread
                comments={comments}
                viewerUserId={userId}
                onReply={startReply}
                onLike={(c) => void toggleCommentLike(c)}
                onDelete={(c) => void removeComment(c)}
                onLoadReplies={loadReplies}
              />
            ) : null}
          </div>
        ) : null}
      </div>

      {data ? (
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
          onCancelReply={cancelReply}
          onSend={() => void sendComment()}
          sending={sending}
          inputRef={composerInputRef}
        />
      ) : null}
    </div>
  );
}
