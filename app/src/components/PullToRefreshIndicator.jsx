import { PTR_SETTLE, PTR_THRESHOLD } from '@/lib/pullToRefresh';

/**
 * In-flow or overlay gap + loader. Growing this pushes the screen down like FB / IG / the browser.
 */
export function PullToRefreshIndicator({ offset = 0, refreshing = false, className = '', style }) {
  const settling = offset === 0 && !refreshing;
  const progress = Math.min(offset / PTR_THRESHOLD, 1);
  const spinning = refreshing || offset >= PTR_THRESHOLD;

  return (
    <div
      className={`pointer-events-none flex shrink-0 items-center justify-center overflow-hidden ${className}`.trim()}
      style={{
        ...style,
        height: offset,
        transition: settling ? `height ${PTR_SETTLE}` : 'none',
      }}
      aria-hidden={offset < 8}
    >
      <div
        className={`border-t-brand size-8 rounded-full border-2 border-white/10 ${spinning ? 'animate-loader-spin' : ''}`}
        style={spinning ? undefined : { transform: `rotate(${progress * 280}deg)` }}
      />
    </div>
  );
}
