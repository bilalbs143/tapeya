import { useEffect } from 'react';

const DURATION = 2600;

function FloatingAvatarBubble({ id, left, bottom, drift, delay, gradient, avatarUrl, initials = '?', isLandscape, onEnd }) {
  useEffect(() => {
    const timer = window.setTimeout(() => onEnd(id), DURATION);
    return () => window.clearTimeout(timer);
  }, [id, onEnd]);

  return (
    <span
      className={`live-float-heart pointer-events-none absolute ${isLandscape ? 'live-float-heart--landscape' : ''}`}
      style={{
        left: `${left}%`,
        bottom: `${bottom}%`,
        animationDelay: `${delay}s`,
        animationDuration: `${DURATION}ms`,
        '--heart-drift': `${drift}px`,
      }}
      aria-hidden
    >
      <span className={`relative block h-8 w-8 drop-shadow-md ${isLandscape ? '-rotate-90' : ''}`}>
        {/* Avatar circle */}
        <span
          className={`block h-full w-full overflow-hidden rounded-full bg-gradient-to-br ${gradient} ring-[1.5px] ring-white/70`}
        >
          {avatarUrl ? (
            <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            <span className="flex h-full w-full items-center justify-center text-[10px] font-bold text-white">
              {initials}
            </span>
          )}
        </span>

        {/* Heart badge */}
        <span className="absolute -right-0.5 -bottom-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-rose-500 ring-[1.5px] ring-white">
          <svg viewBox="0 0 24 24" className="h-2 w-2" fill="white" aria-hidden>
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
        </span>
      </span>
    </span>
  );
}

export function FloatingHeartsOverlay({ hearts, onHeartEnd, isLandscape = false }) {
  if (hearts.length === 0) {
    return null;
  }

  return (
    <div className="pointer-events-none absolute inset-0 z-[15] overflow-hidden">
      {hearts.map((heart) => (
        <FloatingAvatarBubble key={heart.id} {...heart} isLandscape={isLandscape} onEnd={onHeartEnd} />
      ))}
    </div>
  );
}
