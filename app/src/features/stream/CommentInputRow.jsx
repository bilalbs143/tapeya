import { useState } from 'react';

function HeartIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
        stroke="#000"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
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

/**
 * Comment / heart row used on watch-live and go-live broadcaster UIs.
 * Owns local draft state so keystrokes do not re-render the parent player.
 */
export function CommentInputRow({ onSend, onSendHeart, disabled = false, placeholder }) {
  const [comment, setComment] = useState('');
  const canSend = comment.trim().length > 0 && !disabled;

  const handleSend = () => {
    const text = comment.trim();
    if (!text) return;
    onSend(text);
    setComment('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey && canSend) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex w-full items-center gap-2 rounded-[12px] bg-white/[0.13] py-2 pr-2 pl-4 backdrop-blur-[9.7px]">
      <input
        type="text"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder ?? (disabled ? 'Chat Unavailable' : 'Add a Comment…')}
        disabled={disabled}
        className="min-w-0 flex-1 border-0 bg-transparent text-[13px] text-white placeholder:text-white/60 focus:outline-none disabled:opacity-50"
      />
      <div className="flex shrink-0 items-center gap-1.5">
        <button
          type="button"
          onClick={handleSend}
          disabled={!canSend}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-white transition-transform active:scale-95 disabled:opacity-50"
          aria-label="Send Comment"
        >
          <SendIcon />
        </button>
        {onSendHeart && (
          <button
            type="button"
            onClick={onSendHeart}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white transition-transform active:scale-95"
            aria-label="Send Heart"
          >
            <HeartIcon />
          </button>
        )}
      </div>
    </div>
  );
}
