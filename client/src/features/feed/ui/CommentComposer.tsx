import { type RefObject } from 'react';

import { UserAvatar, userProfilePath } from '@/entities/user';

import { cn } from '@/shared/lib/cn';
import { COMMENT_COMPOSE_ACTION, COMMENT_COMPOSE_DOCK, COMMENT_COMPOSE_PILL } from '@/shared/ui/commentComposeChrome';
import { SendIcon } from '@/shared/ui/icons';

import { type Comment, COMMENT_MAX } from '../model/commentSchemas';

type ComposerUser = {
  id?: number | undefined;
  name: string | null;
  nickname?: string | null | undefined;
  avatarUrl: string | null;
};

type CommentComposerProps = {
  user: ComposerUser;
  draft: string;
  onDraftChange: (value: string) => void;
  replyTo: Comment | null;
  onCancelReply: () => void;
  onSend: () => void;
  sending?: boolean | undefined;
  inputRef?: RefObject<HTMLInputElement | HTMLTextAreaElement | null> | undefined;
  className?: string | undefined;
};

/** Comment compose dock — parent handles keyboard inset. */
export function CommentComposer({
  user,
  draft,
  onDraftChange,
  replyTo,
  onCancelReply,
  onSend,
  sending = false,
  inputRef,
  className,
}: CommentComposerProps) {
  const canSend = Boolean(draft.trim()) && !sending;
  const profileHref = user.id != null ? userProfilePath({ id: user.id, nickname: user.nickname }) : undefined;

  function setDraftCapped(value: string) {
    onDraftChange(value.slice(0, COMMENT_MAX));
  }

  return (
    <div className={cn(COMMENT_COMPOSE_DOCK, className)}>
      {replyTo ? (
        <div className="border-border-subtle bg-page overflow-hidden rounded-panel border">
          <div className="border-border-subtle bg-brand/12 flex items-center gap-2 border-b px-3 py-2">
            <span className="text-brand-text text-3xs font-semibold">Replying to {replyTo.author.name}</span>
            <button type="button" onClick={onCancelReply} className="text-muted ml-auto text-3xs font-bold">
              Cancel
            </button>
          </div>
          <textarea
            ref={inputRef as RefObject<HTMLTextAreaElement>}
            value={draft}
            onChange={(e) => setDraftCapped(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                if (canSend) onSend();
              }
            }}
            placeholder="Add a Comment…"
            aria-label="Add a Comment"
            rows={2}
            className="text-ink placeholder:text-dim w-full resize-none bg-transparent px-3 py-2.5 text-2xs leading-snug outline-none"
          />
          <div className="flex items-center px-3 pb-2.5">
            <span className="font-mono text-dim ml-auto text-4xs font-semibold">
              {draft.length} / {COMMENT_MAX}
            </span>
            <button
              type="button"
              onClick={onSend}
              disabled={!canSend}
              aria-label="Send"
              className="bg-brand ml-2.5 grid h-[38px] w-[38px] shrink-0 place-items-center rounded-full text-white disabled:opacity-40"
            >
              <SendIcon className="h-[15px] w-[15px]" strokeWidth={2} />
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-2.5">
          <UserAvatar user={user} size="sm" to={profileHref} className="w-[30px]" />
          <div className={COMMENT_COMPOSE_PILL}>
            <input
              ref={inputRef as RefObject<HTMLInputElement>}
              value={draft}
              onChange={(e) => setDraftCapped(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && canSend) onSend();
              }}
              placeholder="Add a Comment…"
              aria-label="Add a Comment"
              className="text-ink placeholder:text-dim h-full w-full bg-transparent text-2xs outline-none"
            />
          </div>
          <button
            type="button"
            onClick={onSend}
            disabled={!canSend}
            aria-label="Send"
            className={COMMENT_COMPOSE_ACTION}
          >
            <SendIcon className="h-[15px] w-[15px]" strokeWidth={2} />
          </button>
        </div>
      )}
    </div>
  );
}
