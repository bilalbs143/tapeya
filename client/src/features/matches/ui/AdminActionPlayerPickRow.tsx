import { cn } from '@/shared/lib/cn';
import { CheckIcon } from '@/shared/ui/icons';

import { adminPlayerInitials } from '../lib/adminActionSheetMeta';
import type { AdminPlayer } from '../lib/adminActionSheetTypes';

type AdminActionPlayerPickRowProps = {
  player: AdminPlayer;
  selected: boolean;
  meta?: string | undefined;
  metaTone?: 'positive' | undefined;
  disabled?: boolean | undefined;
  chevron?: boolean | undefined;
  bordered?: boolean | undefined;
  onClick: () => void;
};

export function AdminActionPlayerPickRow({
  player,
  selected,
  meta,
  metaTone,
  disabled,
  chevron,
  bordered,
  onClick,
}: AdminActionPlayerPickRowProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      aria-pressed={selected}
      className={cn(
        'focus-visible:outline-brand flex w-full items-center gap-2.5 px-3 py-2.5 text-left focus-visible:outline-2 focus-visible:-outline-offset-2 disabled:opacity-40',
        bordered && 'border-border-subtle rounded-icon border',
        selected && bordered ? 'border-brand bg-surface' : bordered ? 'bg-surface' : null,
        selected && !bordered ? 'bg-brand/10' : !bordered ? 'bg-surface' : null
      )}
    >
      <span className="bg-page-deep text-dim font-mono grid h-7 w-7 shrink-0 place-items-center rounded-icon text-4xs font-extrabold">
        {adminPlayerInitials(player.name)}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-2xs font-bold text-ink">{player.name}</span>
        {meta ? (
          <span
            className={cn(
              'font-mono block text-4xs uppercase',
              metaTone === 'positive' ? 'text-positive font-bold' : 'text-dim'
            )}
          >
            {meta}
          </span>
        ) : null}
      </span>
      {selected && !chevron ? <CheckIcon className="text-brand-text h-4 w-4 shrink-0" strokeWidth={3} /> : null}
      {chevron ? <span className="text-dim text-body-sm font-semibold">›</span> : null}
    </button>
  );
}
