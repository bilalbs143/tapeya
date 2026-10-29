import type { ReactNode } from 'react';

import { cn } from '@/shared/lib/cn';

import type { ComposeBackgroundDef } from '../lib/composeBackgrounds';
import { CRICKET_ICON_MAP, type CricketIconKey } from '../lib/cricketPatternIconMap';
import { CRICKET_PATTERN_LAYOUTS } from '../lib/cricketPatternLayouts';

function CricketIconScatter({ patternId }: { patternId: string }) {
  const layout = CRICKET_PATTERN_LAYOUTS[patternId as keyof typeof CRICKET_PATTERN_LAYOUTS];
  if (!layout?.length) return null;

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden select-none" aria-hidden>
      {layout.map((item, i) => {
        const Icon = CRICKET_ICON_MAP[item.icon as CricketIconKey];
        if (!Icon) return null;
        return (
          <span
            key={`${patternId}-${i}`}
            className={cn('absolute', item.color ?? 'text-white')}
            style={{
              top: item.top,
              left: item.left,
              opacity: item.opacity ?? 0.16,
              transform: `rotate(${item.rotate}deg)`,
            }}
          >
            <Icon size={item.size} {...(item.seamColor ? { seamColor: item.seamColor } : {})} />
          </span>
        );
      })}
    </div>
  );
}

type TextPostBackgroundProps = {
  background: ComposeBackgroundDef | null | undefined;
  className?: string | undefined;
  contentClassName?: string | undefined;
  rounded?: boolean | undefined;
  children: ReactNode;
};

/** Shared surface for compose preview + feed/detail text posts. Plain still wraps so height stays stable. */
export function TextPostBackground({
  background,
  className,
  contentClassName,
  rounded = true,
  children,
}: TextPostBackgroundProps) {
  if (!background) return children;

  const styled = background.id !== 'plain';

  return (
    <div
      className={cn(
        'relative flex w-full items-center justify-center overflow-hidden',
        styled && 'ring-1 ring-white/10 ring-inset',
        rounded && 'rounded-card',
        background.surfaceClass,
        className
      )}
    >
      {styled && background.overlayClass ? (
        <div className={cn('pointer-events-none absolute inset-0', background.overlayClass)} aria-hidden />
      ) : null}
      {styled && background.pattern ? <CricketIconScatter patternId={background.pattern} /> : null}
      <div className={cn('relative z-10 w-full', contentClassName ?? 'px-8 py-10')}>{children}</div>
    </div>
  );
}
