/**
 * Single live broadcast — full-screen cover or centered landscape (minimized) layout.
 */

import { useCallback, useEffect, useRef, useState } from 'react';

import { CLOUDFRONT_APP_BASE } from '@/lib/constants/assets';
import { defaultAvatar } from '@/pages/live/liveBroadcastData';
import { useAppSelector } from '@/store/hooks';
import { selectUser } from '@/store/selectors';

const maxMinIcon = `${CLOUDFRONT_APP_BASE}/images/icons/max-min-icon.svg`;
const emojiIcon = `${CLOUDFRONT_APP_BASE}/images/icons/emoji-icon.svg`;

const MAX_VISIBLE_COMMENTS = 4;

const BOTTOM_PANEL_CLASS =
  'absolute right-0 left-0 z-10 flex flex-col gap-3 px-4 bottom-[calc(90px+env(safe-area-inset-bottom)+10px)] lg:bottom-6';

const COMMENT_LIST_CLASS =
  'flex max-h-[168px] flex-col justify-end gap-2.5 overflow-hidden [mask-image:linear-gradient(to_top,black_75%,transparent)]';

function HeartIcon({ filled }) {
  const color = filled ? '#ef4444' : '#000';
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill={filled ? color : 'none'}
      />
    </svg>
  );
}

function SendIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"
        stroke="#080807"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CommentList({ comments }) {
  const visibleComments = comments.slice(-MAX_VISIBLE_COMMENTS);

  return (
    <ul className={COMMENT_LIST_CLASS}>
      {visibleComments.map((entry) => (
        <li key={entry.id} className="flex items-start gap-2">
          <img src={entry.avatar} alt="" className="h-8 w-8 shrink-0 rounded-full object-cover" />
          <div className="min-w-0 pt-0.5">
            <p className="text-[13px] leading-tight font-bold text-white">{entry.username}</p>
            <p className="text-[12px] leading-snug text-white/75">{entry.text}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}

function CommentInputBar({
  comment,
  onCommentChange,
  onSend,
  canSend,
  isLiked,
  onLike,
  onToggleView,
  isMinimized,
}) {
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  return (
    <div className="relative w-full">
      <button
        type="button"
        onClick={onToggleView}
        className="absolute right-0 bottom-full mb-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/[0.13] backdrop-blur-[9.7px] transition-opacity active:opacity-80"
        aria-label={isMinimized ? 'Maximize video' : 'Minimize video'}
      >
        <img src={maxMinIcon} alt="" className="h-5 w-5 shrink-0 object-contain" aria-hidden />
      </button>

      <div className="flex w-full items-center gap-2 rounded-[12px] bg-white/[0.13] py-2 pr-2 pl-4 backdrop-blur-[9.7px]">
        <input
          type="text"
          value={comment}
          onChange={(e) => onCommentChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Add a comment..."
          className="min-w-0 flex-1 border-0 bg-transparent text-[13px] text-white placeholder:text-white/60 focus:outline-none"
        />
        <div className="flex shrink-0 items-center gap-1.5">
          <button
            type="button"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white transition-transform active:scale-95"
            aria-label="Add emoji"
          >
            <img src={emojiIcon} alt="" className="h-[18px] w-[18px] shrink-0 object-contain" aria-hidden />
          </button>
          <button
            type="button"
            onClick={onSend}
            disabled={!canSend}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white transition-transform active:scale-95 disabled:opacity-50"
            aria-label="Send comment"
          >
            <SendIcon />
          </button>
          <button
            type="button"
            onClick={onLike}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white transition-transform active:scale-95"
            aria-label={isLiked ? 'Unlike' : 'Like'}
          >
            <HeartIcon filled={isLiked} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function LiveBroadcastItem({ broadcast, isLiked, onLike }) {
  const videoRef = useRef(null);
  const user = useAppSelector(selectUser);
  const [isMinimized, setIsMinimized] = useState(false);
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState(broadcast.comments);

  useEffect(() => {
    setComments(broadcast.comments);
    setComment('');
  }, [broadcast.id, broadcast.comments]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.play().catch(() => {});
    return () => {
      video.pause();
    };
  }, [broadcast.videoUrl, isMinimized]);

  const handleToggleView = useCallback(() => {
    setIsMinimized((v) => !v);
  }, []);

  const canSend = comment.trim().length > 0;

  const handleSend = useCallback(() => {
    const text = comment.trim();
    if (!text) return;

    const username = user?.name?.trim() || user?.nickname?.trim() || 'You';
    const avatar = user?.avatar_url || defaultAvatar;

    setComments((prev) => [
      ...prev,
      { id: `local-${Date.now()}`, username, avatar, text },
    ]);
    setComment('');
  }, [comment, user]);

  const inputBar = (
    <CommentInputBar
      comment={comment}
      onCommentChange={setComment}
      onSend={handleSend}
      canSend={canSend}
      isLiked={isLiked}
      onLike={onLike}
      onToggleView={handleToggleView}
      isMinimized={isMinimized}
    />
  );

  if (isMinimized) {
    return (
      <div className="absolute inset-0 overflow-hidden bg-black lg:top-14">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="aspect-video w-full max-h-full overflow-hidden">
            <video
              ref={videoRef}
              src={broadcast.videoUrl}
              autoPlay
              muted={false}
              loop
              playsInline
              preload="metadata"
              className="pointer-events-none h-full w-full object-cover object-center"
            >
              <track kind="captions" />
            </video>
          </div>
        </div>

        <div className={`pointer-events-none ${BOTTOM_PANEL_CLASS}`}>
          <CommentList comments={comments} />
          <div className="pointer-events-auto">{inputBar}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 overflow-hidden bg-black lg:top-14">
      <video
        ref={videoRef}
        src={broadcast.videoUrl}
        autoPlay
        muted={false}
        loop
        playsInline
        preload="metadata"
        className="pointer-events-none absolute inset-0 h-full w-full object-cover object-center"
      >
        <track kind="captions" />
      </video>

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-black/30" />

      <div className={`pointer-events-none ${BOTTOM_PANEL_CLASS}`}>
        <CommentList comments={comments} />
        <div className="pointer-events-auto">{inputBar}</div>
      </div>
    </div>
  );
}
