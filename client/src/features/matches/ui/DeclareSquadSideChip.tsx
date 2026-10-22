import { cn } from '@/shared/lib/cn';

import type { DeclareSquadPlayer } from '../model/squadSchemas';
import { statusLine } from '../model/squadSchemas';

type DeclareSquadSideChipProps = {
  short: string;
  roleLabel: string;
  roster: DeclareSquadPlayer[];
  playersPerSide: number;
  active: boolean;
  onClick: () => void;
};

export function DeclareSquadSideChip({
  short,
  roleLabel,
  roster,
  playersPerSide,
  active,
  onClick,
}: DeclareSquadSideChipProps) {
  const status = statusLine(roster, playersPerSide);
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'focus-visible:outline-brand flex min-h-13 flex-1 flex-col justify-center rounded-field border px-2.5 py-2 text-left focus-visible:outline-2 focus-visible:outline-offset-2',
        active ? 'border-brand bg-brand/12' : 'border-border-subtle bg-surface'
      )}
    >
      <p className={cn('truncate text-xs leading-normal font-extrabold', active ? 'text-ink' : 'text-muted')}>
        {short} · {roleLabel}
      </p>
      <p
        className={cn(
          'font-mono mt-0.5 text-4xs font-semibold uppercase',
          status.complete ? 'text-brand-text' : active ? 'text-brand-text/80' : 'text-dim'
        )}
      >
        {status.text}
      </p>
    </button>
  );
}
