/**
 * ScoringControls
 *
 * The full scoring control panel:
 *   • Run buttons (0–6 + custom) — tap 1–6 to open shot-area dialog; tap 0 to score directly
 *   • Free Hit badge (pulsing gold bar) — shown when pendingFreeHit is true
 *   • Extra buttons (WD / NB / BYE / LB) — tap to open runs dialog
 *   • Penalty Runs button — awards 5 penalty runs (Law 41.17)
 *   • OUT button — opens dismissal dialog (filtered for free hit when applicable)
 *   • Retired Hurt button — removes batsman without wicket credit
 *   • UNDO button — reverses last ball
 *
 * Rendered only when 2 batsmen are on the crease and at least 1 bowler is selected.
 *
 * @param {object}   props
 * @param {boolean}  props.pendingFreeHit       Is the next delivery a free hit?
 * @param {object[]} props.extraTypeOptions     From getExtraTypeOptions(enums.extra_type)
 * @param {boolean}  [props.disabled]           Disable all controls (e.g. match complete).
 * @param {Function} props.onRun               (runs: number) => void — called for 0 runs, or after shot-area skip
 * @param {Function} props.onRunWithShot       (runs: number) => void — called when shot-area dialog should open
 * @param {Function} props.onExtra             (type: 'wd'|'nb'|'bye'|'lb') => void — opens extra-runs dialog
 * @param {Function} props.onPenaltyRuns       () => void — awards 5 penalty runs immediately
 * @param {Function} props.onOut               () => void — opens dismissal dialog
 * @param {Function} props.onRetiredHurt       () => void — marks active striker as retired hurt
 * @param {Function} props.onUndo              () => void — reverses last ball
 * @param {Function} [props.onCustomScore]     () => void — opens custom-score dialog
 */

import { FreeHitIndicator } from './FreeHitIndicator';

// ─── Constants ────────────────────────────────────────────────────────────────

const PENALTY_RUNS_AMOUNT = 5;

/** Background colours for run buttons 0–6 (dark, progressively lighter). */
const RUN_BUTTON_BG = [
  '#10100F',
  '#171715',
  '#1F1F1C',
  '#282824',
  '#31312C',
  '#3B3B35',
  '#46463F',
];

// ─── Sub-components ───────────────────────────────────────────────────────────

/** Circular scoring action button. */
function ActionButton({ onClick, label, className = '', children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={`flex h-[40px] w-[40px] shrink-0 cursor-pointer items-center justify-center rounded-full text-[12px] font-bold uppercase transition-opacity active:opacity-80 ${className}`}
    >
      {children}
    </button>
  );
}

/** Undo arrow icon. */
function UndoIcon() {
  return (
    <svg
      className="h-3 w-3"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 10h10a5 5 0 0 1 5 5v2" />
      <path d="M3 10l4-4M3 10l4 4" />
    </svg>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ScoringControls({
  pendingFreeHit = false,
  extraTypeOptions = [],
  disabled = false,
  onRun,
  onRunWithShot,
  onExtra,
  onPenaltyRuns,
  onOut,
  onRetiredHurt,
  onUndo,
  onCustomScore,
}) {
  if (disabled) return null;

  return (
    <div className="mt-6 flex flex-col items-center gap-4 pb-8">
      {/* Free Hit banner */}
      <FreeHitIndicator pendingFreeHit={pendingFreeHit} />

      {/* Run buttons: 0–6 + custom */}
      <div className="flex flex-wrap justify-center gap-2">
        {[0, 1, 2, 3, 4, 5, 6].map((runs) => (
          <button
            key={runs}
            type="button"
            onClick={() => (runs === 0 ? onRun?.(0) : onRunWithShot?.(runs))}
            className="flex h-[40px] w-[40px] shrink-0 cursor-pointer items-center justify-center rounded-full text-[14px] font-bold text-white transition-opacity active:opacity-80"
            style={{ backgroundColor: RUN_BUTTON_BG[runs] }}
            aria-label={`${runs} run${runs !== 1 ? 's' : ''}`}
          >
            {runs}
          </button>
        ))}

        {/* Custom score */}
        {onCustomScore && (
          <button
            type="button"
            onClick={onCustomScore}
            className="flex h-[40px] w-[40px] shrink-0 cursor-pointer items-center justify-center rounded-full bg-[#46463F] text-[25px] font-bold text-[#DA9811] transition-opacity active:opacity-80"
            aria-label="Add custom score"
          >
            +
          </button>
        )}
      </div>

      {/* Extra buttons + OUT + Retired Hurt + Penalty + UNDO */}
      <div className="flex flex-wrap justify-center gap-2">
        {/* WD / NB / BYE / LB */}
        {extraTypeOptions.map((opt) => (
          <ActionButton
            key={opt.value}
            onClick={() => onExtra?.(opt.value)}
            label={opt.label}
            className="bg-[#141412] text-white"
          >
            {opt.short_label ?? opt.value?.toUpperCase()}
          </ActionButton>
        ))}

        {/* Penalty runs */}
        {onPenaltyRuns && (
          <ActionButton
            onClick={onPenaltyRuns}
            label={`Award ${PENALTY_RUNS_AMOUNT} penalty runs (Law 41.17)`}
            className="bg-[#1C1C1A] text-[#DA9811]"
          >
            P{PENALTY_RUNS_AMOUNT}
          </ActionButton>
        )}

        {/* OUT */}
        <ActionButton
          onClick={onOut}
          label="Wicket — select dismissal type"
          className="bg-[#141412] text-[#DA9811]"
        >
          OUT
        </ActionButton>

        {/* Retired Hurt */}
        {onRetiredHurt && (
          <ActionButton
            onClick={onRetiredHurt}
            label="Retired Hurt — batsman leaves without wicket credit"
            className="bg-[#141412] text-[#6B7280]"
          >
            <span className="text-center text-[9px] leading-tight">
              RET
              <br />
              HURT
            </span>
          </ActionButton>
        )}

        {/* UNDO */}
        <ActionButton
          onClick={onUndo}
          label="Undo last ball"
          className="border-2 border-red-500 bg-[#141412] text-red-500"
        >
          <span className="flex flex-col items-center gap-0.5">
            <UndoIcon />
            <span className="text-[8px]">UNDO</span>
          </span>
        </ActionButton>
      </div>
    </div>
  );
}
