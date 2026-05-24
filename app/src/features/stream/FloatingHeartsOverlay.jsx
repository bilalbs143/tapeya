import { useEffect } from 'react';

function FloatingHeartParticle({ id, left, bottom, size, drift, delay, color, isLandscape, onEnd }) {
  useEffect(() => {
    const timer = window.setTimeout(() => onEnd(id), 2200);
    return () => window.clearTimeout(timer);
  }, [id, onEnd]);

  return (
    <span
      className={`live-float-heart pointer-events-none absolute ${isLandscape ? 'live-float-heart--landscape' : ''}`}
      style={{
        left: `${left}%`,
        bottom: `${bottom}%`,
        width: size,
        height: size,
        color,
        animationDelay: `${delay}s`,
        '--heart-drift': `${drift}px`,
      }}
      aria-hidden
    >
      <svg viewBox="0 0 24 24" className="size-full drop-shadow-md" fill="currentColor">
        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
      </svg>
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
        <FloatingHeartParticle key={heart.id} {...heart} isLandscape={isLandscape} onEnd={onHeartEnd} />
      ))}
    </div>
  );
}
