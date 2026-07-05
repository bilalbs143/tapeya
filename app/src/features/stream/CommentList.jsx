import { memo } from 'react';

const VISIBLE = 10;

const CommentList = memo(function CommentList({ messages, isLandscape = false }) {
  const visible = messages.slice(-VISIBLE);

  if (visible.length === 0) {
    return null;
  }

  return (
    <ul
      className={`mb-2 flex flex-col-reverse gap-1 overflow-hidden ${isLandscape ? 'max-h-90' : 'max-h-70'}`}
      aria-label="Live Comments"
      aria-live="polite"
      aria-atomic="false"
    >
      {[...visible].reverse().map((m) => (
        <li key={m.id} className="flex items-start gap-2">
          <div className="min-w-0">
            <span className="text-[13px] font-bold text-white">{m.name} </span>
            <span className="text-[12px] text-white/80">{m.text}</span>
          </div>
        </li>
      ))}
    </ul>
  );
});

export default CommentList;
