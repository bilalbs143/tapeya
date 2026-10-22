import { type CSSProperties, useEffect } from 'react';

import { cn } from '@/shared/lib/cn';
import { HeartIcon } from '@/shared/ui/icons';

import type { FloatingHeart } from '../lib/useFloatingHearts';

const DURATION_MS = 2600;

function FloatingAvatarBubble({ heart, onEnd }: { heart: FloatingHeart; onEnd: (id: number) => void }) {
  useEffect(() => {
    const timer = window.setTimeout(() => onEnd(heart.id), DURATION_MS);
    return () => window.clearTimeout(timer);
  }, [heart.id, onEnd]);

  const style = {
    left: `${heart.left}%`,
    bottom: `${heart.bottom}%`,
    animationDuration: `${DURATION_MS}ms`,
    '--heart-drift': `${heart.drift}px`,
  } as CSSProperties;

  return (
    <span className="live-float-heart pointer-events-none absolute" style={style} aria-hidden>
      <span className="relative block h-8 w-8 drop-shadow-md">
        <span
          className={cn('block h-full w-full overflow-hidden rounded-full ring-[1.5px] ring-white/70', heart.gradient)}
        >
          {heart.avatarUrl ? (
            <img src={heart.avatarUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            <span className="flex h-full w-full items-center justify-center text-4xs font-bold text-white">
              {heart.initials}
            </span>
          )}
        </span>
        <span className="bg-like absolute -right-0.5 -bottom-0.5 grid h-3.5 w-3.5 place-items-center rounded-full text-white ring-[1.5px] ring-white">
          <HeartIcon size="xs" filled className="h-2 w-2" />
        </span>
      </span>
    </span>
  );
}

type FloatingHeartsOverlayProps = {
  hearts: FloatingHeart[];
  onHeartEnd: (id: number) => void;
};

/** Avatar + heart-badge floaters over the watch stage. */
export function FloatingHeartsOverlay({ hearts, onHeartEnd }: FloatingHeartsOverlayProps) {
  if (hearts.length === 0) return null;

  return (
    <div className="pointer-events-none absolute inset-0 z-20 overflow-hidden">
      {hearts.map((heart) => (
        <FloatingAvatarBubble key={heart.id} heart={heart} onEnd={onHeartEnd} />
      ))}
    </div>
  );
}
