import { cn } from '@/shared/lib/cn';
import { Avatar } from '@/shared/ui/Avatar';

import type { DeclareSquadPlayer } from '../model/squadSchemas';

type DeclareSquadPlayerRowProps = {
  p: DeclareSquadPlayer;
  onPlaying: (id: number, playing: boolean) => void;
  onCaptain: (id: number) => void;
  onKeeper: (id: number) => void;
};

export function DeclareSquadPlayerRow({ p, onPlaying, onCaptain, onKeeper }: DeclareSquadPlayerRowProps) {
  const roleLine = p.playing
    ? [p.role, p.hand].filter(Boolean).join(' · ') || p.role || 'Player'
    : 'Benched · available as sub';

  return (
    <div className={cn('flex min-h-15 items-center gap-2.5 rounded-field px-2 py-2', p.playing && 'bg-brand/8')}>
      <Avatar name={p.name} size="sm" />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <span className="truncate font-bold text-ink">{p.name}</span>
          {p.playing ? (
            <>
              <RoleChip
                label="C"
                roleDescription="captain"
                name={p.name}
                active={p.captain}
                tone="brand"
                onClick={() => onCaptain(p.id)}
              />
              <RoleChip
                label="WK"
                roleDescription="wicket keeper"
                name={p.name}
                active={p.keeper}
                tone="positive"
                onClick={() => onKeeper(p.id)}
              />
            </>
          ) : null}
        </div>
        <p className="font-mono text-dim truncate text-4xs font-medium uppercase">{roleLine}</p>
      </div>

      <div className="bg-page-deep flex shrink-0 gap-0.5 rounded-icon p-0.5">
        <button
          type="button"
          onClick={() => onPlaying(p.id, true)}
          aria-pressed={p.playing}
          aria-label={`Play, ${p.name}`}
          className={cn(
            'focus-visible:outline-brand flex h-7 items-center rounded-lg px-2.5 text-3xs font-bold focus-visible:outline-2',
            p.playing ? 'bg-brand text-white' : 'text-dim'
          )}
        >
          Play
        </button>
        <button
          type="button"
          onClick={() => onPlaying(p.id, false)}
          aria-pressed={!p.playing}
          aria-label={`Bench, ${p.name}`}
          className={cn(
            'focus-visible:outline-brand flex h-7 items-center rounded-lg px-2.5 text-3xs font-semibold focus-visible:outline-2',
            !p.playing ? 'bg-surface-raised text-ink' : 'text-dim'
          )}
        >
          Bench
        </button>
      </div>
    </div>
  );
}

function RoleChip({
  label,
  roleDescription,
  name,
  active,
  tone,
  onClick,
}: {
  label: string;
  roleDescription: string;
  name: string;
  active: boolean;
  tone: 'brand' | 'positive';
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      aria-label={`${label}, ${roleDescription}, ${name}`}
      className={cn(
        'font-mono focus-visible:outline-brand rounded-chip px-1.5 py-0.5 text-4xs font-extrabold focus-visible:outline-2',
        active
          ? tone === 'positive'
            ? 'bg-positive text-white'
            : 'bg-brand text-white'
          : 'border-border-subtle text-dim border'
      )}
    >
      {label}
    </button>
  );
}
