/**
 * BowlerTable
 *
 * Displays the current bowler's live stats.
 * Shows an "Add Bowler" CTA overlay when no bowler has been selected yet.
 * A pencil icon in the header lets the scorer replace the active bowler mid-over.
 */

import { BORDER, HEADER_BG } from '@/lib/constants/tableStyles';
import { Button } from '@/ui/Button';

const DASH = '—';

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

function PlusIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
    </svg>
  );
}

function economyRate(runs, balls) {
  if (!balls) return '0.0';
  return (Number(runs) / (balls / 6)).toFixed(1);
}

const PLACEHOLDER_ROWS = 1;

/**
 * @param {object}   props
 * @param {object[]} props.bowlersInTable        All bowlers in the live table (max 2).
 * @param {number}   props.currentBowlerIndex    Index of the active bowler.
 * @param {boolean}  [props.hasSquad]            False → show empty placeholder rows.
 * @param {boolean}  [props.matchComplete]       Hides add/replace controls when true.
 * @param {Function} [props.onAddBowler]         Opens add-bowler dialog.
 * @param {Function} [props.onReplaceBowler]     Opens replace-bowler dialog (pencil icon).
 */
export function BowlerTable({
  bowlersInTable = [],
  currentBowlerIndex = 0,
  hasSquad = true,
  matchComplete = false,
  onAddBowler,
  onReplaceBowler,
}) {
  const safeIdx = Math.min(Math.max(0, currentBowlerIndex), Math.max(0, bowlersInTable.length - 1));
  const activeBowler = bowlersInTable[safeIdx] ?? null;
  const showPlaceholder = !hasSquad || !activeBowler;
  const showAddOverlay = bowlersInTable.length === 0 && !matchComplete;

  // Use the overs string from the API/state directly — it is already correctly
  // formatted (e.g. "0.3"). ballsToOvers() would return "0" because the raw
  // ball count is not tracked in this table shape.
  const overs = activeBowler ? (activeBowler.overs ?? '0') : DASH;
  const econ = activeBowler ? economyRate(activeBowler.runs ?? 0, activeBowler.balls ?? 0) : DASH;

  return (
    <div className="relative overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <table className="w-full border-collapse text-[12px]">
        <thead>
          <tr className={HEADER_BG}>
            <th
              className={`${HEADER_BG} min-w-[8.5rem] border-r border-b border-l px-4 py-2.5 text-left font-bold text-white ${BORDER}`}
            >
              <div className="inline-flex max-w-full min-w-0 items-center gap-1.5 whitespace-nowrap">
                {!matchComplete && activeBowler && onReplaceBowler ? (
                  <button
                    type="button"
                    className="inline-flex shrink-0 rounded p-0.5 text-[#DA9811] hover:text-[#f0b94a] focus-visible:outline focus-visible:outline-offset-1 focus-visible:outline-[#DA9811]"
                    aria-label="Replace bowler"
                    onClick={(e) => {
                      e.stopPropagation();
                      onReplaceBowler?.();
                    }}
                  >
                    <EditIcon />
                  </button>
                ) : null}
                <span>Bowler</span>
              </div>
            </th>
            {['O', 'M', 'R', 'W', 'ECON'].map((h) => (
              <th
                key={h}
                className={`${HEADER_BG} ${h === 'ECON' ? 'w-14' : 'w-[2rem]'} border-r border-b py-2.5 text-center font-bold text-white ${BORDER}`}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {showPlaceholder ? (
            Array.from({ length: PLACEHOLDER_ROWS }, (_, i) => <PlaceholderRow key={`bowler-placeholder-${i}`} />)
          ) : (
            <tr key={activeBowler.id} aria-current="true">
              <td className={`border-r border-b border-l ${BORDER} bg-black px-4 py-3`}>
                <span className="flex items-center gap-2">
                  <span className="text-[12px] font-medium text-[#DA9811]">{activeBowler.name ?? DASH}</span>
                  <span
                    className="scoring-blink-dot inline-block h-2.5 w-2.5 flex-shrink-0 rounded-full bg-red-500"
                    aria-label="Bowling"
                  />
                </span>
              </td>
              {[overs, activeBowler.maidens ?? 0, activeBowler.runs ?? 0, activeBowler.wickets ?? 0, econ].map((val, i) => (
                <td key={i} className={`border-r border-b ${BORDER} px-4 py-3 text-center text-white`}>
                  {val ?? DASH}
                </td>
              ))}
            </tr>
          )}
        </tbody>
      </table>

      {/* Add Bowler CTA */}
      {showAddOverlay && onAddBowler && (
        <div
          className="pointer-events-none absolute inset-x-0 top-0 bottom-0 z-0 flex min-h-[5rem] items-center justify-center"
          aria-hidden
        >
          <Button
            type="button"
            variant="dark"
            size="md"
            className="pointer-events-auto flex flex-col items-center gap-1.5"
            aria-label="Add Bowler"
            onClick={onAddBowler}
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#DA9811] text-[#080807]">
              <PlusIcon />
            </span>
            <span className="text-[13px] font-bold tracking-wide text-[#A2A6AB] uppercase">Add Bowler</span>
          </Button>
        </div>
      )}
    </div>
  );
}

function PlaceholderRow() {
  return (
    <tr className="pointer-events-none" aria-hidden>
      <td className={`border-r border-b border-l ${BORDER} bg-black px-4 py-3`}>
        <span className="block min-h-[1.125rem] text-[12px] text-white/20"> </span>
      </td>
      {[0, 1, 2, 3, 4].map((j) => (
        <td key={j} className={`border-r border-b ${BORDER} px-4 py-3 text-center text-white/20`}>
          {' '}
        </td>
      ))}
    </tr>
  );
}
