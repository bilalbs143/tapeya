/**
 * BatsmenTable
 *
 * Displays the two batsmen on the crease with live stats.
 * Clicking a row swaps the striker.
 * Shows an "Add Batsman" CTA when there are fewer than 2 batsmen.
 * Shows a retired-hurt indicator for any batsmen who have retired.
 */

import { BORDER, HEADER_BG } from '@/lib/constants/tableStyles';
import { Button } from '@/ui/Button';

const DASH = '—';

/** Pencil/edit icon used in table headers. */
function EditIcon() {
  return (
    <svg
      className="block h-4 w-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}

/** Plus icon inside the Add button. */
function PlusIcon() {
  return (
    <svg
      className="h-4 w-4"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={5}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
    </svg>
  );
}

function strikeRate(runs, balls) {
  if (!balls) return '0.0';
  return ((Number(runs) / Number(balls)) * 100).toFixed(1);
}

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

  return (
    <div className="relative overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <table className="w-full border-collapse text-[12px]">
        <thead>
          <tr className={HEADER_BG}>
            <th
              className={`${HEADER_BG} min-w-[8.5rem] border-r border-b border-l px-4 py-2.5 text-left font-bold text-white ${BORDER}`}
            >
              <div className="inline-flex max-w-full min-w-0 items-center gap-1.5 whitespace-nowrap">
                {!matchComplete &&
                batsmenOnCrease.length > 0 &&
                onReplaceStriker ? (
                  <button
                    type="button"
                    className="inline-flex shrink-0 rounded p-0.5 text-[#DA9811] hover:text-[#f0b94a] focus-visible:outline focus-visible:outline-offset-1 focus-visible:outline-[#DA9811]"
                    aria-label="Replace striker"
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
              <th
                key={h}
                className={`${HEADER_BG} w-[2rem] border-r border-b py-2.5 text-center font-bold text-white ${BORDER}`}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {showPlaceholder
            ? Array.from({ length: PLACEHOLDER_ROWS }, (_, i) => (
                <PlaceholderRow key={`bat-placeholder-${i}`} />
              ))
            : batsmenOnCrease.slice(0, 2).map((b, idx) => {
                const isStriker = idx === strikerIndex;
                const sr = strikeRate(b.runs, b.balls);
                return (
                  <tr
                    key={b.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => onStrikerChange?.(idx)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        onStrikerChange?.(idx);
                      }
                    }}
                    className="cursor-pointer transition-opacity active:opacity-90"
                  >
                    <td
                      className={`border-r border-b border-l ${BORDER} px-4 py-3`}
                    >
                      <span className="flex items-center gap-2">
                        <span
                          className={`text-[12px] font-medium ${isStriker ? 'text-[#DA9811]' : 'text-white'}`}
                        >
                          {b.name ?? DASH}
                        </span>
                        {isStriker && (
                          <span
                            className="scoring-blink-dot inline-block h-2.5 w-2.5 flex-shrink-0 rounded-full bg-red-500"
                            aria-label="On strike"
                          />
                        )}
                      </span>
                    </td>
                    {[
                      b.runs ?? 0,
                      b.balls ?? 0,
                      b.fours ?? 0,
                      b.sixes ?? 0,
                      sr,
                    ].map((val, i) => (
                      <td
                        key={i}
                        className={`border-r border-b ${BORDER} px-4 py-3 text-center text-white`}
                      >
                        {val ?? DASH}
                      </td>
                    ))}
                  </tr>
                );
              })}
        </tbody>
      </table>

      {/* Add Batsman CTA */}
      {canAdd && !matchComplete && onAddBatsman && (
        <div
          className="pointer-events-none absolute inset-x-0 top-0 bottom-0 z-0 flex min-h-[5rem] items-center justify-center"
          aria-hidden
        >
          <Button
            type="button"
            variant="dark"
            size="md"
            className="pointer-events-auto flex flex-col items-center gap-1.5"
            aria-label="Add Batsman"
            onClick={onAddBatsman}
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#DA9811] text-[#080807]">
              <PlusIcon />
            </span>
            <span className="text-[13px] font-bold tracking-wide text-[#A2A6AB] uppercase">
              Add Batsman
            </span>
          </Button>
        </div>
      )}

      {/* Retired Hurt indicator */}
      {retiredBatsmen.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2 px-4">
          {retiredBatsmen.map((b) => (
            <span
              key={b.id}
              className="inline-flex items-center gap-1 rounded-md border border-[#3B3B35] bg-[#1A1A18] px-2 py-0.5 text-[11px] text-[#A2A6AB]"
            >
              <span className="font-medium text-white/70">{b.name}</span>
              <span className="text-[#DA9811]">ret hurt</span>
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
        <span className="block min-h-[1.125rem] text-[12px] text-white/20">
          {' '}
        </span>
      </td>
      {[0, 1, 2, 3, 4].map((j) => (
        <td
          key={j}
          className={`border-r border-b ${BORDER} px-4 py-3 text-center text-white/20`}
        >
          {' '}
        </td>
      ))}
    </tr>
  );
}
