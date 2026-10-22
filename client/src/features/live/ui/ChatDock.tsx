import { useEffect, useRef } from 'react';

import { UserAvatar, userProfilePath } from '@/entities/user';

import { cn } from '@/shared/lib/cn';
import {
  COMMENT_COMPOSE_ACTION,
  COMMENT_COMPOSE_DOCK_WATCH,
  COMMENT_COMPOSE_PILL,
} from '@/shared/ui/commentComposeChrome';
import { SendIcon } from '@/shared/ui/icons';

import type { LiveComment } from '../model/schemas';

type ComposerUser = {
  id?: number | undefined;
  name: string | null;
  nickname?: string | null | undefined;
  avatarUrl: string | null;
};

/** One uppercase initial for nickname fallback. */
function nicknameInitial(name: string): string {
  const ch = name.trim().charAt(0);
  return ch ? ch.toUpperCase() : '?';
}

/** Stable “random” chip colors — same nickname → same hue. */
const FALLBACK_BG = [
  'bg-[#3d6b8c]',
  'bg-[#5a6b3d]',
  'bg-[#8c5a3d]',
  'bg-[#6b3d7a]',
  'bg-[#3d7a6b]',
  'bg-[#7a3d4d]',
  'bg-[#4d5a8c]',
  'bg-[#8c6b3d]',
] as const;

function fallbackBgFor(name: string): string {
  const key = name.trim().toLowerCase() || '?';
  let hash = 0;
  for (let i = 0; i < key.length; i += 1) {
    hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
  }
  return FALLBACK_BG[hash % FALLBACK_BG.length] ?? FALLBACK_BG[0] ?? 'bg-[#3d6b8c]';
}

/** Avatar sized to `leading-5` first line — tops align for single + multi-line. */
function CommentAvatar({ name, src }: { name: string; src: string | null }) {
  const initial = nicknameInitial(name);
  const fallback = (
    <span
      aria-hidden
      className={cn('grid h-full w-full place-items-center text-4xs font-bold text-white', fallbackBgFor(name))}
    >
      {initial}
    </span>
  );

  if (!src) {
    return <span className="h-5 w-5 shrink-0 overflow-hidden rounded-full">{fallback}</span>;
  }

  return (
    <span className="relative h-5 w-5 shrink-0 overflow-hidden rounded-full">
      <span className="absolute inset-0">{fallback}</span>
      <img
        src={src}
        alt=""
        className="relative z-10 h-full w-full object-cover"
        onError={(e) => {
          e.currentTarget.style.opacity = '0';
        }}
      />
    </span>
  );
}

type ChatDockProps = {
  comments: LiveComment[];
  draft: string;
  onDraft: (value: string) => void;
  onSend: () => void;
  canChat: boolean;
  /** Viewer face for the compose row — same as post-detail CommentComposer. */
  user?: ComposerUser | undefined;
  className?: string | undefined;
  /** `sheet` = watch page surface; `overlay` = transparent go-live camera chrome. */
  variant?: 'sheet' | 'overlay' | undefined;
};

/** Watch chat sheet — comments scroll; compose dock matches CommentComposer. */
export function ChatDock({
  comments,
  draft,
  onDraft,
  onSend,
  canChat,
  user,
  className,
  variant = 'sheet',
}: ChatDockProps) {
  const listRef = useRef<HTMLDivElement>(null);
  const lastId = comments.at(-1)?.id;
  const canSend = Boolean(draft.trim());
  const overlay = variant === 'overlay';

  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [comments.length, lastId]);

  return (
    <div className={cn(overlay ? 'flex min-h-0 flex-col bg-transparent' : 'bg-surface flex min-h-0 flex-col', className)}>
      <div
        ref={listRef}
        className={cn(
          'flex min-h-0 flex-1 flex-col gap-1.5 overflow-y-auto pt-2.5 pb-3',
          overlay ? 'px-1 text-white' : 'text-ink px-4'
        )}
      >
        {comments.length === 0 ? (
          <p className={cn('text-3xs', overlay ? 'text-white/55' : 'text-dim')}>
            {canChat ? 'Say hello — be the first in chat.' : 'Chat is off for this stream.'}
          </p>
        ) : (
          comments.map((c) => (
            <div key={c.id} className={cn('flex items-start gap-2', overlay ? 'text-white' : 'text-ink')}>
              <CommentAvatar name={c.name} src={c.avatarUrl} />
              {/* leading-5 (20px) matches h-5 avatar — first line + avatar share the same top edge */}
              <p className="min-w-0 flex-1 text-2xs leading-5">
                <span className="font-bold">{c.name}</span> {c.text}
              </p>
            </div>
          ))
        )}
      </div>

      {canChat ? (
        <div
          className={cn(
            'flex shrink-0 items-center gap-2.5',
            overlay ? 'border-0 bg-transparent px-0 pb-0' : COMMENT_COMPOSE_DOCK_WATCH
          )}
        >
          {user && !overlay ? (
            <UserAvatar
              user={user}
              size="sm"
              to={user.id != null ? userProfilePath({ id: user.id, nickname: user.nickname }) : undefined}
              className="w-[30px]"
            />
          ) : null}
          <div className={cn(COMMENT_COMPOSE_PILL, overlay && 'border-white/20 bg-black/45 backdrop-blur-sm')}>
            <input
              value={draft}
              onChange={(e) => onDraft(e.target.value.slice(0, 500))}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && canSend) {
                  e.preventDefault();
                  onSend();
                }
              }}
              placeholder="Add a Comment…"
              aria-label="Add a Comment"
              maxLength={500}
              className={cn(
                'placeholder:text-dim h-full w-full bg-transparent text-2xs outline-none',
                overlay ? 'text-white placeholder:text-white/45' : 'text-ink'
              )}
            />
          </div>
          <button
            type="button"
            onClick={onSend}
            disabled={!canSend}
            aria-label="Send"
            className={cn(COMMENT_COMPOSE_ACTION, overlay && 'bg-black/45 text-white')}
          >
            <SendIcon className="h-[15px] w-[15px]" strokeWidth={2} />
          </button>
        </div>
      ) : null}
    </div>
  );
}
