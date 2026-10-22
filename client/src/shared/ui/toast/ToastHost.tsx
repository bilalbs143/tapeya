import { type ReactNode, useEffect, useSyncExternalStore } from 'react';

import { cn } from '@/shared/lib/cn';
import { CheckIcon, CloseIcon, ExclamationIcon, InfoIcon } from '@/shared/ui/icons';

import { type ToastEntry, toastStore } from './toastStore';

const TONE_BORDER: Record<ToastEntry['tone'], string> = {
  success: 'border-positive/45',
  error: 'border-danger/45',
  info: 'border-brand/45',
  neutral: 'border-border',
};

const TONE_ICON: Record<ToastEntry['tone'], ReactNode> = {
  success: <CheckIcon size="xs" strokeWidth={3} className="text-positive-2" />,
  error: <ExclamationIcon size="xs" strokeWidth={2.6} className="text-danger-soft" />,
  info: <InfoIcon size="xs" strokeWidth={2.6} className="text-brand-text" />,
  neutral: null,
};

/** Subscribes to `toastStore`; errors stay until dismissed, others auto-clear ~4s. */
export function ToastHost() {
  const stack = useSyncExternalStore(toastStore.subscribe, toastStore.getSnapshot, toastStore.getSnapshot);

  if (stack.length === 0) return null;

  return (
    <div
      className={cn(
        'pointer-events-none fixed z-[60] flex w-full flex-col gap-2 p-4',
        'top-[env(safe-area-inset-top)] sm:top-auto sm:right-0 sm:bottom-0 sm:w-[380px]'
      )}
    >
      {stack.map((entry) => (
        <ToastItem key={entry.id} entry={entry} />
      ))}
    </div>
  );
}

function ToastItem({ entry }: { entry: ToastEntry }) {
  useEffect(() => {
    if (entry.tone === 'error') return;
    const timer = window.setTimeout(() => toastStore.dismiss(entry.id), 4000);
    return () => window.clearTimeout(timer);
  }, [entry.id, entry.tone]);

  const icon = TONE_ICON[entry.tone];

  return (
    <div
      role="status"
      className={cn(
        'pointer-events-auto bg-surface text-ink animate-toast-in flex items-start gap-2.5 rounded-panel border p-3 shadow-[var(--shadow-card)]',
        TONE_BORDER[entry.tone]
      )}
    >
      {icon ? <span className="mt-0.5 shrink-0">{icon}</span> : null}
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold">{entry.title}</p>
        {entry.description ? <p className="text-muted mt-0.5 text-2xs leading-relaxed">{entry.description}</p> : null}
      </div>
      <button
        type="button"
        aria-label="Dismiss"
        className="text-dim hover:text-ink shrink-0 transition-colors"
        onClick={() => toastStore.dismiss(entry.id)}
      >
        <CloseIcon size="xs" strokeWidth={2.2} />
      </button>
    </div>
  );
}
