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
  emptyMessage = 'No players available.',
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
      {sorted.length === 0 && <p className="py-2 text-center text-[13px] text-[#A2A6AB]">{emptyMessage}</p>}
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
              isSelected ? 'bg-[#1C1C1A] ring-1 ring-[#DA9811]' : 'bg-[#141412] hover:bg-[#1a1a18]'
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
