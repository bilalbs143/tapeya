import { memo } from 'react';

const VISIBLE = 4;

const CommentList = memo(function CommentList({ messages, isLandscape = false }) {
  const visible = messages.slice(-VISIBLE);

  if (visible.length === 0) {
    return null;
  }

  return (
    <ul
      className={`mb-2 flex flex-col gap-2 overflow-hidden [mask-image:linear-gradient(to_top,black_75%,transparent)] ${
        isLandscape ? 'max-h-36' : 'max-h-28'
      }`}
      aria-label="Live comments"
      aria-live="polite"
      aria-atomic="false"
    >
      {visible.map((m) => (
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
