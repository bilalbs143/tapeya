/**
 * Renders commentary text with numbers highlighted in an accent color.
 * Used for match commentary (e.g. "Need 35 runs from 60 balls").
 */
const DEFAULT_NUMBER_CLASS = 'font-semibold text-[#DA9811]';

export function CommentaryText({ text, className = '', numberClassName = DEFAULT_NUMBER_CLASS }) {
  if (!text) return null;
  const parts = text.split(/(\d+)/);
  return (
    <span className={className || 'text-[14px] text-white'}>
      {parts.map((part, i) =>
        /^\d+$/.test(part) ? (
          <span key={`${i}-${part}`} className={numberClassName}>
            {part}
          </span>
        ) : (
          part
        ),
      )}
    </span>
  );
}
