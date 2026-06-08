import { useMemo } from 'react';

import { ScoringPlayerPickerMeta } from '@/components/scoring/ScoringPlayerPickerMeta';

/**
 * Scrollable sorted player list for dismissal / substitute selection.
 * Replaces duplicated PlayerList in WhoIsOutDismissalDialog and SubstitutePlayerDialog.
 *
 * @param {{ id: number|string, name?: string }[]} players
 * @param {number|string|null} selectedId
 * @param {Function} onSelect     Called with player.id on press
 * @param {string} [variant='batsman']  Passed to ScoringPlayerPickerMeta
 * @param {string} [ariaLabel='Select Player']
 * @param {string} [emptyMessage='No players available.']
 */
export function ScoringPlayerList({
  players,
  selectedId,
  onSelect,
  variant = 'batsman',
  ariaLabel = 'Select Player',
  emptyMessage = 'No Players Available.',
  className = '',
}) {
  const sorted = useMemo(
    () =>
      [...(players ?? [])]
        .filter((p) => p?.id != null)
        .sort((a, b) => (a.name ?? '').localeCompare(b.name ?? '', undefined, { sensitivity: 'base' })),
    [players],
  );

  return (
    <div
      className={`flex max-h-48 flex-col gap-2 overflow-y-auto px-1 py-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${className}`}
      role="radiogroup"
      aria-label={ariaLabel}
    >
      {sorted.length === 0 && <p className="text-muted py-2 text-center text-[13px]">{emptyMessage}</p>}
      {sorted.map((player) => {
        const id = String(player.id);
        const isSelected = String(selectedId) === id;
        return (
          <button
            key={id}
            type="button"
            onClick={() => onSelect(player.id)}
            aria-pressed={isSelected}
            className={`cursor-pointer rounded-[6px] px-4 py-3 text-left transition-opacity active:opacity-90 ${
              isSelected ? 'bg-surface-raised ring-brand ring-1' : 'bg-surface hover:bg-surface-elevated'
            }`}
          >
            <span className="block text-[14px] font-medium text-white">{player.name}</span>
            <ScoringPlayerPickerMeta player={player} variant={variant} />
          </button>
        );
      })}
    </div>
  );
}
