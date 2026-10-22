import type { HTMLAttributes } from 'react';

import { cn } from '@/shared/lib/cn';
import { EyeIcon } from '@/shared/ui/icons';

type LiveBadgeProps = HTMLAttributes<HTMLSpanElement> & {
  label?: string | undefined;
  /** `soft` on page chrome; `media` solid pill on video/thumbnails. */
  variant?: 'soft' | 'media' | undefined;
  viewers?: string | null | undefined;
};

export function LiveBadge({ className, label = 'LIVE', variant = 'soft', viewers, ...props }: LiveBadgeProps) {
  const watching = viewers?.trim() || null;

  if (variant === 'media') {
    return (
      <span
        className={cn(
          'font-mono inline-flex items-center gap-1 rounded-full bg-danger px-1.5 py-0.5 text-4xs leading-none font-bold tracking-eyebrow text-white uppercase',
          className
        )}
        {...props}
      >
        <span className="h-1 w-1 shrink-0 rounded-full bg-white" aria-hidden />
        {label}
        {watching ? (
          <>
            <span className="text-white/55" aria-hidden>
              ·
            </span>
            <EyeIcon size="xs" className="h-2.5 w-2.5 shrink-0" strokeWidth={2.2} aria-hidden />
            <span className="normal-case tracking-normal tabular-nums">{watching}</span>
          </>
        ) : null}
      </span>
    );
  }

  return (
    <span
      className={cn(
        'font-mono inline-flex h-5 items-center gap-1.5 rounded-full bg-danger/20 px-2 text-3xs font-bold tracking-eyebrow text-danger-soft',
        className
      )}
      {...props}
    >
      <span className="relative flex h-1.5 w-1.5">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-danger opacity-75" />
        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-danger-text" />
      </span>
      {label}
      {watching ? <span className="font-semibold tracking-normal normal-case tabular-nums">· {watching}</span> : null}
    </span>
  );
}
