import type { ReactNode } from 'react';

import { cn } from '@/shared/lib/cn';
import { CheckIcon, CloseIcon, InfoIcon, WarningIcon } from '@/shared/ui/icons';

export type AlertTone = 'info' | 'success' | 'danger' | 'warning';

const TONES: Record<AlertTone, { wrap: string; iconWrap: string; title: string }> = {
  info: {
    wrap: 'border-brand/35 bg-brand/10',
    iconWrap: 'bg-brand/18 text-brand-text',
    title: 'text-ink',
  },
  success: {
    wrap: 'border-positive/35 bg-positive/12',
    iconWrap: 'bg-positive/18 text-positive-2',
    title: 'text-ink',
  },
  danger: {
    wrap: 'border-danger/40 bg-danger/10',
    iconWrap: 'bg-danger/16 text-danger-soft',
    title: 'text-ink',
  },
  warning: {
    wrap: 'border-warning/40 bg-warning/10',
    iconWrap: 'bg-warning/16 text-warning-soft',
    title: 'text-ink',
  },
};

export type AlertProps = {
  tone?: AlertTone | undefined;
  title?: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  onDismiss?: (() => void) | undefined;
  className?: string | undefined;
  icon?: ReactNode;
};

export function Alert({ tone = 'info', title, description, action, onDismiss, className, icon }: AlertProps) {
  const t = TONES[tone];

  return (
    <div className={cn('flex items-start gap-2.5 rounded-panel border px-3.5 py-3', t.wrap, className)}>
      <span className={cn('mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full', t.iconWrap)}>
        {icon ?? <ToneIcon tone={tone} />}
      </span>
      <div className="min-w-0 flex-1">
        {title ? <p className={cn('text-body-sm font-extrabold', t.title)}>{title}</p> : null}
        {description ? <p className="text-muted mt-0.5 text-2xs leading-relaxed">{description}</p> : null}
        {action ? <div className="mt-2">{action}</div> : null}
      </div>
      {onDismiss ? (
        <button
          type="button"
          aria-label="Dismiss"
          onClick={onDismiss}
          className="text-dim hover:text-ink mt-0.5 grid h-7 w-7 shrink-0 place-items-center"
        >
          <CloseIcon className="h-3.5 w-3.5" strokeWidth={2.2} />
        </button>
      ) : null}
    </div>
  );
}

export type OfflineBannerProps = {
  title?: ReactNode;
  onRetry?: (() => void) | undefined;
  className?: string | undefined;
};

export function OfflineBanner({ title = "You're offline — scores paused", onRetry, className }: OfflineBannerProps) {
  return (
    <div
      className={cn(
        'border-warning/40 bg-warning/12 text-warning-soft flex items-center gap-2.5 border-y px-4 py-2.5',
        className
      )}
    >
      <span className="min-w-0 flex-1 text-[12.5px] font-bold">{title}</span>
      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className="shrink-0 text-xs leading-normal font-extrabold underline-offset-2 hover:underline"
        >
          Retry
        </button>
      ) : null}
    </div>
  );
}

function ToneIcon({ tone }: { tone: AlertTone }) {
  if (tone === 'success') return <CheckIcon className="h-3.5 w-3.5" strokeWidth={3} />;
  if (tone === 'danger' || tone === 'warning') {
    return <WarningIcon className="h-3.5 w-3.5" strokeWidth={2.4} />;
  }
  return <InfoIcon className="h-3.5 w-3.5" strokeWidth={2.2} />;
}
