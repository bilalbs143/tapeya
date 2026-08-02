/**
 * Blue verification tick for admin-marked official accounts.
 * Scalloped verified mark (not a plain circle). Renders nothing when falsey.
 *
 * @param {{ isOfficial?: boolean, className?: string, size?: 'sm' | 'md' }} props
 */
export function OfficialBadge({ isOfficial = false, className = '', size = 'sm' }) {
  if (!isOfficial) return null;

  // Slightly larger than body text so the tick reads next to 13–15px names.
  const dim = size === 'md' ? 'h-5 w-5' : 'h-4 w-4';

  return (
    <svg
      className={`inline-block shrink-0 ${dim} ${className}`.trim()}
      viewBox="0 0 24 24"
      aria-label="Official account"
      role="img"
    >
      <path
        fill="var(--color-official-badge)"
        d="M23 12l-2.44-2.79.34-3.69-3.61-.82-1.89-3.2L12 2.96 8.6 1.5 6.71 4.69 3.1 5.5l.34 3.7L1 12l2.44 2.79-.34 3.7 3.61.82L8.6 22.5 12 21.04l3.4 1.46 1.89-3.19 3.61-.82-.34-3.7L23 12z"
      />
      <path fill="#fff" d="M10.09 16.72 6.29 12.91l1.48-1.48 2.32 2.33 5.85-5.87 1.48 1.48-7.33 7.35z" />
    </svg>
  );
}
