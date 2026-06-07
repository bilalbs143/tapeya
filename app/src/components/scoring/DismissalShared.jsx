import { useId } from 'react';

import { ScoringPlayerPickerMeta } from '@/components/scoring/ScoringPlayerPickerMeta';
import { ToggleChevron } from '@/ui/ToggleChevron';

/**
 * Collapsible section used inside dismissal and substitute dialogs.
 * Renders a bordered panel with a toggle button and an animated reveal.
 *
 * @param {string}   title     Header label
 * @param {string}   [subtitle] Shown below title when collapsed (e.g. selected player name)
 * @param {boolean}  open      Controlled open state
 * @param {Function} onToggle  Called when the header button is pressed
 * @param {React.ReactNode} children Content shown when open
 */
export function CollapsibleSection({ title, subtitle, open, onToggle, children }) {
  const panelId = useId();
  return (
    <section className="rounded-lg border border-[#282824] bg-[#141412]">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-3 px-3 py-3 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#DA9811]"
        aria-expanded={open}
        aria-controls={panelId}
      >
        <span className="min-w-0 flex-1">
          <span className="block text-[13px] font-medium text-white">{title}</span>
          {!open && subtitle ? (
            <span className="mt-1 block truncate text-[12px] font-medium text-[#DA9811]">{subtitle}</span>
          ) : null}
        </span>
        <ToggleChevron open={open} />
      </button>
      {open ? (
        <div id={panelId} className="border-t border-[#282824] px-3 pt-2 pb-3">
          {children}
        </div>
      ) : null}
    </section>
  );
}

/**
 * Avatar-style card representing a batter (striker or non-striker).
 * Renders nothing when `batter` is null/undefined — safe to call unconditionally.
 *
 * @param {{ id: number, name: string, runs?: number, balls?: number } | null} batter
 * @param {boolean}  selected  Whether this card is currently selected
 * @param {Function} onSelect  Called with `batter.id` on press
 */
export function BatterCard({ batter, selected, onSelect }) {
  if (!batter) return null;
  return (
    <button
      type="button"
      onClick={() => onSelect(batter.id)}
      aria-pressed={selected}
      className={`flex flex-1 flex-col items-center gap-2 rounded-[17px] border-2 px-3 py-4 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#DA9811] ${
        selected ? 'border-[#DA9811] bg-[#1C1C1A]' : 'border-[#141412] bg-[#141412]'
      }`}
    >
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#10100F] text-lg font-bold text-[#DA9811]">
        {(batter.name ?? '?').charAt(0)}
      </span>
      <span className="text-center text-[11px] font-semibold text-white">{batter.name}</span>
      {batter.runs != null ? (
        <span className="text-[10px] text-[#A2A6AB]">
          {batter.runs} ({batter.balls ?? 0})
        </span>
      ) : null}
    </button>
  );
}

/**
 * Scrollable list of fielding-side players for fielder selection.
 *
 * @param {{ id: number, name: string }[]} players      Full fielding squad list
 * @param {number | null}                 selectedId    Currently selected player ID
 * @param {Function}                      onSelect      Called with player ID on press
 */
export function FielderList({ players, selectedId, onSelect }) {
  return (
    <div
      className="flex max-h-48 flex-col gap-2 overflow-y-auto px-1 py-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      role="radiogroup"
      aria-label="Select Fielder"
    >
      {players.length === 0 && <p className="py-2 text-center text-[13px] text-[#A2A6AB]">No fielders available.</p>}
      {players.map((player) => (
        <button
          key={player.id}
          type="button"
          onClick={() => onSelect(player.id)}
          aria-pressed={selectedId === player.id}
          className={`cursor-pointer rounded-[6px] px-4 py-3 text-left transition-opacity active:opacity-90 ${
            selectedId === player.id ? 'bg-[#1C1C1A] ring-1 ring-[#DA9811]' : 'bg-[#141412] hover:bg-[#1a1a18]'
          }`}
        >
          <span className="block text-[14px] font-medium text-white">{player.name}</span>
          <ScoringPlayerPickerMeta player={player} variant="fielder" />
        </button>
      ))}
    </div>
  );
}
