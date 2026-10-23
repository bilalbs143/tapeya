import { UserAvatar } from '@/entities/user';

import { cn } from '@/shared/lib/cn';
import { ChevronRightIcon, CloseIcon } from '@/shared/ui/icons';

import { maskPhone } from '../lib/phone';
import type { SavedProfile } from '../lib/profiles';

type SavedProfileListProps = {
  profiles?: SavedProfile[];
  busyPhone?: string | null;
  onPick?: (profile: SavedProfile) => void;
  onRemove?: (profile: SavedProfile) => void;
  className?: string;
};

export function SavedProfileList({
  profiles = [],
  busyPhone = null,
  onPick,
  onRemove,
  className,
}: SavedProfileListProps) {
  const busy = Boolean(busyPhone);

  return (
    <ul className={cn('flex flex-col gap-2', className)}>
      {profiles.map((p) => {
        const isBusy = p.phone === busyPhone;
        const stale = !p.token;

        return (
          <li
            key={p.phone}
            className={cn(
              'flex items-center gap-2.5 rounded-panel border py-2.5 pr-2.5 pl-3 transition-colors',
              isBusy ? 'border-brand/50 bg-brand/10' : 'border-border-subtle bg-surface',
              busy && !isBusy && 'pointer-events-none opacity-40'
            )}
          >
            <button
              type="button"
              onClick={() => onPick?.(p)}
              disabled={busy}
              aria-busy={isBusy || undefined}
              className="focus-visible:outline-brand flex min-w-0 flex-1 items-center gap-2.5 rounded-panel text-left focus-visible:outline-2"
            >
              <UserAvatar user={{ name: p.name, avatarUrl: p.avatarUrl }} className="size-10" />
              <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span className="truncate text-body-sm font-bold text-ink">{p.name}</span>
                {stale ? (
                  <span className="text-danger-soft font-mono text-4xs font-medium tracking-wide">
                    CODE NEEDED · TOKEN EXPIRED
                  </span>
                ) : (
                  <span className="text-dim font-mono text-4xs font-medium">{maskPhone(p.phone)}</span>
                )}
              </span>

              {isBusy ? (
                <span
                  className="border-positive-light/25 border-t-positive-light h-4 w-4 shrink-0 animate-spin rounded-full border-2"
                  role="status"
                  aria-label="Signing In"
                />
              ) : (
                <ChevronRightIcon
                  className={cn('size-3.5 shrink-0', stale ? 'text-dim' : 'text-brand-text')}
                  strokeWidth={2.4}
                />
              )}
            </button>

            {isBusy ? null : (
              <>
                <span className="bg-border-subtle mx-0.5 h-6 w-px shrink-0" aria-hidden="true" />
                <button
                  type="button"
                  onClick={() => onRemove?.(p)}
                  disabled={busy}
                  aria-label={`Remove ${p.name} from this device`}
                  className="border-border text-muted hover:text-ink hover:border-danger/60 focus-visible:outline-brand grid size-7 shrink-0 place-items-center rounded-icon border transition-colors focus-visible:outline-2"
                >
                  <CloseIcon className="size-2.5" strokeWidth={2.4} />
                </button>
              </>
            )}
          </li>
        );
      })}
    </ul>
  );
}
