import { type CSSProperties, useLayoutEffect, useRef, useState } from 'react';

import { cn } from '@/shared/lib/cn';

type SlidingTextProps = {
  text: string;
  className?: string | undefined;
};

/**
 * Single-line text that auto-slides when truncated, so the full string can be read.
 * Idle when it fits, or when the user prefers reduced motion.
 */
export function SlidingText({ text, className }: SlidingTextProps) {
  const clipRef = useRef<HTMLSpanElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const [offsetPx, setOffsetPx] = useState(0);

  useLayoutEffect(() => {
    const clip = clipRef.current;
    const label = textRef.current;
    if (!clip || !label) return;

    const measure = () => {
      const overflow = Math.ceil(label.scrollWidth - clip.clientWidth);
      setOffsetPx(overflow > 2 ? overflow : 0);
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(clip);
    ro.observe(label);
    return () => ro.disconnect();
  }, [text]);

  const sliding = offsetPx > 0;
  /** Longer overflow → slightly longer cycle; keep readable pauses at each end. */
  const durationSec = sliding ? Math.min(14, Math.max(7, 5 + offsetPx / 28)) : 0;

  const slideStyle: CSSProperties | undefined = sliding
    ? ({
        '--title-slide-x': `${offsetPx}px`,
        animationDuration: `${durationSec}s`,
      } as CSSProperties)
    : undefined;

  return (
    <span ref={clipRef} className={cn('block min-w-0 overflow-hidden', className)}>
      <span
        ref={textRef}
        className={cn('inline-block max-w-none whitespace-nowrap', sliding && 'animate-title-slide')}
        style={slideStyle}
      >
        {text}
      </span>
    </span>
  );
}
