import { useState } from 'react';

import { cn } from '@/shared/lib/cn';
import { Chip, type ChipProps } from '@/shared/ui/Chip';
import { CloseIcon, PencilIcon, PlusIcon, ProgressRingIcon, SearchIcon } from '@/shared/ui/icons';
import { Input } from '@/shared/ui/Input';

import { quickMatchInitials } from '../lib/quickMatchForm';
import type { QuickMatchPlayer } from '../lib/quickMatchPayload';

export function QuickMatchChoiceChip({ selected, className, children, ...props }: ChipProps) {
  return (
    <Chip
      role="radio"
      aria-checked={selected ?? false}
      selected={selected}
      className={cn(
        'min-h-10 rounded-field px-4',
        selected ? 'border-brand bg-brand text-white' : 'border-border-subtle bg-surface text-ink',
        className
      )}
      {...props}
    >
      {children}
    </Chip>
  );
}

export function QuickMatchVersusCard({
  overs,
  ballLabel,
  players,
  homeName,
  awayName,
  homeCount,
  awayCount,
}: {
  overs: number;
  ballLabel: string;
  players: number;
  homeName: string;
  awayName: string;
  homeCount: number;
  awayCount: number;
}) {
  return (
    <section className="border-border-subtle bg-surface overflow-hidden rounded-card border">
      <div className="relative flex">
        <span className="bg-border absolute top-4 bottom-4 left-1/2 w-px -translate-x-1/2" aria-hidden />
        <SideCrest name={homeName} fallback="A" count={homeCount} target={players} />
        <SideCrest name={awayName} fallback="B" count={awayCount} target={players} />
        <span className="border-surface bg-brand font-mono absolute top-1/2 left-1/2 grid h-9 w-9 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border-4 text-4xs font-extrabold tracking-eyebrow text-white">
          VS
        </span>
      </div>
      <p className="border-border-subtle bg-surface-raised font-mono text-muted border-t px-3 py-2.5 text-center text-4xs font-semibold tracking-eyebrow uppercase">
        {overs} overs · {ballLabel} · {players} a side
      </p>
    </section>
  );
}

function SideCrest({
  name,
  fallback,
  count,
  target,
}: {
  name: string;
  fallback: string;
  count: number;
  target: number;
}) {
  const ready = name.trim().length > 0 && count >= target && target > 0;
  const missing = Math.max(0, target - count);
  const ratio = target > 0 ? Math.min(1, count / target) : 0;

  return (
    <div className="flex flex-1 flex-col items-center gap-2 px-2 py-4 text-center">
      <RosterRing ratio={ratio} ready={ready} label={quickMatchInitials(name, fallback)} />
      <p className="max-w-full truncate text-sm font-extrabold tracking-tight text-ink uppercase">
        {name.trim() || `Side ${fallback}`}
      </p>
      <span
        className={cn(
          'font-mono inline-flex rounded-full px-2 py-1 text-4xs font-bold tracking-eyebrow uppercase',
          ready ? 'bg-positive/16 text-positive' : 'bg-surface-raised text-muted'
        )}
      >
        {ready ? `Ready · ${count}` : `${missing} more needed`}
      </span>
    </div>
  );
}

function RosterRing({ ratio, ready, label }: { ratio: number; ready: boolean; label: string }) {
  return (
    <span className="relative grid size-14 place-items-center">
      <ProgressRingIcon
        progress={ratio}
        className="absolute inset-0"
        progressClassName={ready || ratio >= 1 ? 'stroke-positive' : 'stroke-brand'}
      />
      <span className="bg-surface-raised font-mono grid size-9 place-items-center rounded-full text-4xs font-extrabold text-ink">
        {label}
      </span>
    </span>
  );
}

export function QuickMatchRoster({
  letter,
  name,
  onRename,
  players,
  target,
  onFind,
  onWalkUp,
  onRemove,
}: {
  letter: string;
  name: string;
  onRename: (value: string) => void;
  players: QuickMatchPlayer[];
  target: number;
  onFind: () => void;
  onWalkUp: () => void;
  onRemove: (index: number) => void;
}) {
  const [editing, setEditing] = useState(name.trim().length === 0);
  const full = players.length >= target;
  const ready = name.trim().length > 0 && players.length === target;
  const ratio = target > 0 ? Math.min(100, Math.round((players.length / target) * 100)) : 0;

  return (
    <section className="border-border-subtle bg-surface overflow-hidden rounded-card border">
      <div className="flex items-center gap-2.5 px-3.5 pt-3.5 pb-2">
        <span className="border-border-subtle bg-surface-raised font-mono grid size-8 shrink-0 place-items-center rounded-icon border text-4xs font-extrabold text-ink">
          {quickMatchInitials(name, letter)}
        </span>
        {editing ? (
          <Input
            value={name}
            aria-label={`Side ${letter} name`}
            placeholder={`Side ${letter} name`}
            onChange={(event) => onRename(event.target.value)}
            onBlur={() => {
              if (name.trim()) setEditing(false);
            }}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && name.trim()) setEditing(false);
            }}
          />
        ) : (
          <span className="min-w-0 flex-1 truncate text-sm font-extrabold text-ink">{name.trim()}</span>
        )}
        <button
          type="button"
          aria-label={`Rename side ${letter}`}
          onClick={() => setEditing(true)}
          className="bg-surface-raised text-brand-text grid size-8 shrink-0 place-items-center rounded-icon"
        >
          <PencilIcon size="xs" className="size-3.5" strokeWidth={1.9} />
        </button>
      </div>

      <div className="px-3.5 pb-3">
        <div className="mb-1.5 flex items-baseline justify-between">
          <span className="font-mono text-muted text-4xs font-bold tracking-eyebrow uppercase">Roster</span>
          <span className={cn('font-mono text-2xs font-bold', ready ? 'text-positive' : 'text-muted')}>
            {players.length} / {target}
            {ready ? ' · ready' : ''}
          </span>
        </div>
        <div
          className="bg-surface-raised h-1.5 overflow-hidden rounded-full"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={target}
          aria-valuenow={players.length}
          aria-label={`${name.trim() || `Side ${letter}`} roster`}
        >
          <div
            className={cn('h-full rounded-full', ready ? 'bg-positive' : 'bg-brand')}
            style={{ width: `${ratio}%` }}
          />
        </div>
      </div>

      {players.length > 0 ? (
        <ul className="flex flex-col gap-2 px-3.5 pb-1">
          {players.map((player, index) => (
            <li
              key={`${player.userId ?? player.phone ?? player.name}-${index}`}
              className="bg-surface-raised flex min-h-11 items-center gap-2.5 rounded-field px-3"
            >
              <span className="font-mono text-muted w-5 text-2xs font-bold">{index + 1}</span>
              <span className="min-w-0 flex-1 truncate text-sm font-semibold text-ink">{player.name}</span>
              <button
                type="button"
                onClick={() => onRemove(index)}
                className="text-muted grid size-8 place-items-center rounded-icon"
                aria-label={`Remove ${player.name}`}
              >
                <CloseIcon size="sm" />
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      <div className="flex gap-2 p-3.5">
        <button
          type="button"
          disabled={full}
          onClick={onFind}
          className="border-brand/55 text-brand-text flex min-h-11 flex-1 items-center justify-center gap-2 rounded-field border text-2xs font-bold disabled:opacity-40"
        >
          <SearchIcon size="sm" />
          Find on Tapeya
        </button>
        <button
          type="button"
          disabled={full}
          onClick={onWalkUp}
          className="border-brand/55 text-brand-text flex min-h-11 flex-1 items-center justify-center gap-2 rounded-field border text-2xs font-bold disabled:opacity-40"
        >
          <PlusIcon size="sm" />
          Walk-up
        </button>
      </div>
    </section>
  );
}
