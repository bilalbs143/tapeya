/**
 * BowlerTable
 *
 * Displays the current bowler's live stats.
 * Shows an "Add Bowler" CTA overlay when no bowler has been selected yet.
 * Edit icon in the table header opens the change-bowler picker.
 */

import { ScoringTableAddButton } from '@/components/scoring/ScoringTableAddButton';
import { BORDER, HEADER_BG } from '@/lib/constants/tableStyles';
import { oversDisplayToLegalBalls } from '@/lib/utils/scoringMappers';
import { EditIcon } from '@/ui/icons/ScoringTableIcons';

const DASH = '—';

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
 * @param {Function} [props.onReplaceBowler]     Opens change-bowler dialog (edit icon in header).
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
  const legalBalls = activeBowler ? oversDisplayToLegalBalls(activeBowler.overs ?? '0') : 0;
  const econ = activeBowler ? economyRate(activeBowler.runs ?? 0, legalBalls) : DASH;

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
                    className="text-brand hover:text-brand-hover focus-visible:outline-brand inline-flex shrink-0 rounded p-0.5 focus-visible:outline focus-visible:outline-offset-1"
                    aria-label="Change Bowler"
                    onClick={(e) => {
                      e.stopPropagation();
                      onReplaceBowler();
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
                <span className="flex flex-col gap-0.5">
                  <span className="flex items-center gap-2">
                    <span className="text-brand text-[12px] font-medium">{activeBowler.name ?? DASH}</span>
                    <span
                      className="scoring-blink-dot inline-block h-2.5 w-2.5 shrink-0 rounded-full bg-red-500"
                      aria-label="Bowling"
                    />
                  </span>
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
          <ScoringTableAddButton label="Bowler" onClick={onAddBowler} className="pointer-events-auto" />
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
