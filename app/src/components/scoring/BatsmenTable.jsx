/**
 * BatsmenTable
 *
 * Displays the two batsmen on the crease with live stats.
 * Clicking a row swaps the striker.
 * Shows an "Add Batsman" CTA when there are fewer than 2 batsmen.
 * Shows a retired-hurt indicator for any batsmen who have retired.
 */

import { ScoringTableAddButton } from '@/components/scoring/ScoringTableAddButton';
import { BORDER, HEADER_BG } from '@/lib/constants/tableStyles';
import { calculateStrikeRate } from '@/lib/utils/matchPlayerStatsUtils';
import { EditIcon } from '@/ui/icons/ScoringTableIcons';

const DASH = '—';

const PLACEHOLDER_ROWS = 2;

/**
 * @param {object}   props
 * @param {object[]} props.batsmenOnCrease     Max 2 active batsmen.
 * @param {number}   props.strikerIndex        0 or 1.
 * @param {Function} props.onStrikerChange     (index: number) => void — swap striker on row click.
 * @param {object[]} [props.retiredBatsmen]    Batsmen who retired hurt (shown below table).
 * @param {boolean}  [props.hasSquad]          False → show empty placeholder rows.
 * @param {boolean}  [props.matchComplete]     Hides add/replace controls when true.
 * @param {Function} [props.onAddBatsman]      Opens add-batsman dialog.
 * @param {Function} [props.onReplaceStriker]  Opens replace-striker dialog.
 */
export function BatsmenTable({
  batsmenOnCrease = [],
  strikerIndex = 0,
  onStrikerChange,
  retiredBatsmen = [],
  hasSquad = true,
  matchComplete = false,
  onAddBatsman,
  onReplaceStriker,
}) {
  const canAdd = batsmenOnCrease.length < 2;
  const showPlaceholder = !hasSquad || batsmenOnCrease.length === 0;
  // Always use the overlay for the Add button — whether zero or one batsman on crease.
  const showAddOverlay = canAdd && !matchComplete && onAddBatsman;

  return (
    <div className="relative overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <table className="w-full border-collapse text-[12px]">
        <thead className="relative z-10">
          <tr className={HEADER_BG}>
            <th
              className={`${HEADER_BG} min-w-[8.5rem] border-r border-b border-l px-4 py-2.5 text-left font-bold text-white ${BORDER}`}
            >
              <div className="inline-flex max-w-full min-w-0 items-center gap-1.5 whitespace-nowrap">
                {!matchComplete && batsmenOnCrease.length > 0 && onReplaceStriker ? (
                  <button
                    type="button"
                    className="text-brand hover:text-brand-hover focus-visible:outline-brand inline-flex shrink-0 rounded p-0.5 focus-visible:outline focus-visible:outline-offset-1"
                    aria-label="Replace Striker"
                    onClick={(e) => {
                      e.stopPropagation();
                      onReplaceStriker?.();
                    }}
                  >
                    <EditIcon />
                  </button>
                ) : null}
                <span>Batsman</span>
              </div>
            </th>
            {['R', 'B', '4s', '6s', 'SR'].map((h) => (
              <th key={h} className={`${HEADER_BG} w-[2rem] border-r border-b py-2.5 text-center font-bold text-white ${BORDER}`}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {showPlaceholder
            ? Array.from({ length: PLACEHOLDER_ROWS }, (_, i) => <PlaceholderRow key={`bat-placeholder-${i}`} />)
            : batsmenOnCrease.slice(0, 2).map((b, idx) => {
                const isStriker = idx === strikerIndex;
                const sr = calculateStrikeRate(b.runs, b.balls);
                return (
                  <tr
                    key={b.id}
                    role="button"
                    tabIndex={0}
                    aria-label={`Switch strike to ${b.name ?? 'batsman'}`}
                    onClick={() => onStrikerChange?.(idx)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        onStrikerChange?.(idx);
                      }
                    }}
                    className="cursor-pointer transition-opacity active:opacity-90"
                  >
                    <td className={`border-r border-b border-l ${BORDER} px-4 py-3`}>
                      <span className="flex items-center gap-2">
                        <span className={`text-[12px] font-medium ${isStriker ? 'text-brand' : 'text-white'}`}>
                          {b.name ?? DASH}
                        </span>
                        {isStriker ? (
                          <span
                            className="scoring-blink-dot inline-block h-2.5 w-2.5 shrink-0 rounded-full bg-red-500"
                            aria-label="On strike"
                          />
                        ) : null}
                      </span>
                    </td>
                    {[b.runs ?? 0, b.balls ?? 0, b.fours ?? 0, b.sixes ?? 0, sr].map((val, i) => (
                      <td key={i} className={`border-r border-b ${BORDER} px-4 py-3 text-center text-white`}>
                        {val ?? DASH}
                      </td>
                    ))}
                  </tr>
                );
              })}
          {/* Empty slot when only one batsman is on crease — gives the overlay a row to sit over */}
          {!showPlaceholder && canAdd ? <PlaceholderRow key="bat-slot-empty" /> : null}
        </tbody>
      </table>

      {showAddOverlay ? (
        <div className="pointer-events-none absolute inset-x-0 top-10 bottom-0 flex items-center justify-center" aria-hidden>
          <ScoringTableAddButton label="Batsman" onClick={onAddBatsman} className="pointer-events-auto" />
        </div>
      ) : null}

      {/* Retired Hurt indicator */}
      {retiredBatsmen.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2 px-4">
          {retiredBatsmen.map((b) => (
            <span
              key={b.id}
              className="bg-surface-elevated text-muted inline-flex items-center gap-1 rounded-md border border-[#3B3B35] px-2 py-0.5 text-[11px]"
            >
              <span className="font-medium text-white/70">{b.name}</span>
              <span className="text-brand">ret hurt</span>
              <span className="text-white/50">
                {b.runs}({b.balls})
              </span>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function PlaceholderRow() {
  return (
    <tr className="pointer-events-none" aria-hidden>
      <td className={`border-r border-b border-l ${BORDER} px-4 py-3`}>
        <span className="block min-h-[1.125rem] text-[12px] text-white/20">{' '}</span>
      </td>
      {[0, 1, 2, 3, 4].map((j) => (
        <td key={j} className={`border-r border-b ${BORDER} px-4 py-3 text-center text-white/20`}>
          {' '}
        </td>
      ))}
    </tr>
  );
}
