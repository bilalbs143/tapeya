import type { ReactNode } from 'react';

import { cn } from '@/shared/lib/cn';
import { ChevronLeftIcon } from '@/shared/ui/icons';
import { SlidingText } from '@/shared/ui/SlidingText';

import { scrollShellToTop } from './shellScroll';

type ScreenBarProps = {
  title: string;
  subtitle?: string | undefined;
  onBack: () => void;
  action?: ReactNode;
  /** Tab strip / filter row that must stick to the title row as one unit. */
  below?: ReactNode;
  /** When the title is clipped (e.g. Share/Rotate in the action slot), slide to reveal it. */
  slideTitle?: boolean | undefined;
  sticky?: boolean | undefined;
  className?: string | undefined;
};

/** Subpage header — back/action top-aligned with title so subtitle does not shift action. */
export function ScreenBar({
  title,
  subtitle,
  onBack,
  action,
  below,
  slideTitle = false,
  sticky = true,
  className,
}: ScreenBarProps) {
  const bar = (
    <header
      className={cn(
        'bg-surface flex items-start gap-2 px-3.5 py-2',
        below ? null : 'border-border-subtle border-b',
        sticky && !below && 'sticky top-0 z-20',
        'tab:static tab:gap-3 tab:border-b-0 tab:px-4 tab:pt-5 tab:pb-4',
        className
      )}
    >
      <button
        type="button"
        onClick={onBack}
        aria-label="Back"
        className="text-body hover:text-ink focus-visible:outline-brand -ml-1.5 grid h-8 w-8 shrink-0 place-items-center rounded-icon focus-visible:outline-2 tab:hidden"
      >
        <ChevronLeftIcon size="sm" strokeWidth={2.2} />
      </button>

      <button
        type="button"
        onClick={() => scrollShellToTop('smooth')}
        aria-label="Scroll to Top"
        className="min-w-0 flex-1 pt-0.5 text-left tab:pt-0"
      >
        <h1
          className={cn(
            'font-mono text-2xs leading-tight font-bold tracking-eyebrow text-ink uppercase',
            'tab:font-sans tab:text-title tab:leading-snug tab:font-extrabold tab:tracking-tight tab:normal-case',
            !slideTitle && 'truncate'
          )}
        >
          {slideTitle ? <SlidingText text={title} /> : title}
        </h1>
        {subtitle ? (
          <p className="text-muted mt-0.5 truncate text-2xs leading-tight tab:mt-1 tab:overflow-visible tab:text-body-sm tab:leading-relaxed tab:whitespace-normal">
            {subtitle}
          </p>
        ) : null}
      </button>

      {/* Reserve action width so the title never reflows when it appears. */}
      <div
        className={cn(
          'flex h-8 min-w-8 shrink-0 items-center justify-end gap-2',
          'tab:h-auto tab:min-w-0',
          !action && 'tab:hidden'
        )}
      >
        {action}
      </div>
    </header>
  );

  if (!below) return bar;

  return (
    <div
      className={cn(
        'border-border-subtle bg-surface border-b tab:static tab:border-b-0',
        sticky && 'sticky top-0 z-20'
      )}
    >
      {bar}
      <div
        className={cn(sticky && 'tab:border-border-subtle tab:bg-surface tab:sticky tab:top-0 tab:z-20 tab:border-b')}
      >
        {below}
      </div>
    </div>
  );
}
