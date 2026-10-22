import type { ReactNode } from 'react';

import { cn } from '@/shared/lib/cn';

export const MEDIA_ACTION_CHIP =
  'border-border-subtle bg-surface text-muted hover:text-ink flex h-9 min-w-0 flex-1 items-center justify-center gap-1.5 rounded-field border text-3xs font-bold disabled:opacity-60';

export const MEDIA_ACTION_CHIP_ACTIVE = 'border-brand bg-brand/16 text-brand-text hover:text-brand-text';

export type MediaActionItem = {
  key: string;
  label: string;
  ariaLabel: string;
  onClick: () => void;
  icon: ReactNode;
  active?: boolean | undefined;
  disabled?: boolean | undefined;
  /** Extra classes (e.g. `tab:hidden` for Full). */
  className?: string | undefined;
};

type MediaActionRowProps = {
  actions: MediaActionItem[];
  className?: string | undefined;
};

/** Compact equal-width action chips — live / highlights / episode title rows. */
export function MediaActionRow({ actions, className }: MediaActionRowProps) {
  return (
    <div className={cn('flex gap-1.5', className)}>
      {actions.map((action) => (
        <button
          key={action.key}
          type="button"
          onClick={action.onClick}
          disabled={action.disabled}
          aria-label={action.ariaLabel}
          aria-pressed={action.active}
          className={cn(MEDIA_ACTION_CHIP, action.active && MEDIA_ACTION_CHIP_ACTIVE, action.className)}
        >
          {action.icon}
          {action.label}
        </button>
      ))}
    </div>
  );
}
