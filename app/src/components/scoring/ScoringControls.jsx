/**
 * ScoringControls
 *
 * The full scoring control panel:
 *   • Run buttons (0, 1–4, 6 + wicket + custom) — single row of circular buttons
 *   • Free Hit badge (pulsing gold bar) — shown when pendingFreeHit is true
 *   • Extra / delivery buttons — horizontally scrollable row(s); UNDO at end of primary strip
 *
 * Rendered only when 2 batsmen are on the crease and at least 1 bowler is selected.
 *
 * @param {object}   props
 * @param {boolean}  props.pendingFreeHit       Is the next delivery a free hit?
 * @param {object[]} props.extraTypeOptions     From getExtraTypeOptions(enums.extra_type)
 * @param {boolean}  [props.disabled]           Disable all controls (e.g. match complete).
 * @param {boolean}  [props.isSubmitting]       Ball request in-flight — dim and block all inputs.
 * @param {Function} props.onRun               (runs: number) => void — called for 0 runs, or after shot-area skip
 * @param {Function} props.onRunWithShot       (runs: number) => void — called when shot-area dialog should open
 * @param {Function} props.onExtra             (type: 'wd'|'nb'|'bye'|'lb') => void — opens extra-runs dialog
 * @param {Function} [props.onOverthrow]         () => void — overthrow (pick delivery type)
 * @param {Function} [props.onOverthrowWide]     () => void — overthrow on wide (runs step only)
 * @param {Function} [props.onOverthrowNoBall]   () => void — overthrow on no ball (runs step only)
 * @param {Function} [props.onWideWicket]      () => void — wide + wicket (Run Out / Stumped only)
 * @param {Function} [props.onNoBallWicket]    () => void — no ball + wicket (Law 21.18 dismissals)
 * @param {Function} props.onPenaltyRuns       () => void — opens penalty runs dialog
 * @param {Function} props.onOut               () => void — opens dismissal dialog
 * @param {Function} props.onRetiredHurt       () => void — marks active striker as retired hurt
 * @param {Function} props.onUndo              () => void — reverses last ball
 * @param {Function} [props.onCustomScore]     () => void — opens custom-score dialog
 */

import { useRef } from 'react';

import undoIconUrl from '@/assets/images/icons/control-undo.svg';
import wicketIconUrl from '@/assets/images/icons/control-wicket.svg';
import { CdnIcon } from '@/ui/CdnIcon';

import { FreeHitIndicator } from './FreeHitIndicator';

// ─── Constants ────────────────────────────────────────────────────────────────

/** Left-to-right row gradient: 0 → 1 → 2 → 3 → 4 → 6 → wicket → + */
const RUN_ROW_BG = ['#10100F', '#171715', '#1F1F1C', '#282824', '#31312C', '#3B3B35', '#46463F', '#51514A'];

/** Desktop: cap circle size and bump type; mobile keeps flex-1 fill. */
const SCORING_BTN_DESKTOP = 'lg:size-14 lg:max-h-14 lg:max-w-14 lg:flex-none';

const RUN_CIRCLE_BASE = `flex aspect-square min-w-0 flex-1 cursor-pointer items-center justify-center rounded-full text-[15px] font-bold transition-opacity active:opacity-80 ${SCORING_BTN_DESKTOP} lg:text-[18px]`;

const RUN_CIRCLE_CLASS = `${RUN_CIRCLE_BASE} text-white`;

/** Primary run keys — single row: 0, 1–4, 6 (5 via custom +). */
const RUN_BUTTONS = [0, 1, 2, 3, 4, 6];

const WICKET_ROW_INDEX = RUN_BUTTONS.length;
const CUSTOM_ROW_INDEX = WICKET_ROW_INDEX + 1;

/**
 * @param {object} props
 * @param {number} props.runs
 * @param {string} props.backgroundColor
 * @param {Function} props.onClick
 */
function RunCircleButton({ runs, backgroundColor, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={RUN_CIRCLE_CLASS}
      style={{ backgroundColor }}
      aria-label={`${runs} run${runs !== 1 ? 's' : ''}`}
    >
      {runs}
    </button>
  );
}

/** Undo arrow icon — red extras-row control (matches legacy scoring UI). */
function UndoIcon() {
  return <CdnIcon src={undoIconUrl} className="h-3 w-3 lg:h-4 lg:w-4" />;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

/** Circular scoring action button — flex-1 so it fills available space without clipping. */
function ActionButton({ onClick, label, className = '', children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={`flex aspect-square min-w-0 flex-1 cursor-pointer items-center justify-center rounded-full text-[12px] font-bold uppercase transition-opacity active:opacity-80 ${SCORING_BTN_DESKTOP} lg:text-[14px] ${className}`}
    >
      {children}
    </button>
  );
}

/** UNDO — last button on the extras strip (WD / NB / BYE / LB row). */
function UndoActionButton({ onClick }) {
  return (
    <ActionButton onClick={onClick} label="Undo last ball" className="bg-surface border-2 border-red-500 text-red-500">
      <span className="flex flex-col items-center gap-0.5">
        <UndoIcon />
        <span className="text-[8px] leading-none font-bold lg:text-[10px]">UNDO</span>
      </span>
    </ActionButton>
  );
}

/** WICKET — gold stump icon on the run row. */
function WicketRunButton({ backgroundColor, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={RUN_CIRCLE_BASE}
      style={{ backgroundColor }}
      aria-label="Wicket — open dismissal dialog"
    >
      <CdnIcon src={wicketIconUrl} className="text-brand h-[22px] w-[22px] lg:h-6 lg:w-6" />
    </button>
  );
}

/**
 * Horizontally scrollable extras / delivery actions — snap-aligned pages with arrow navigation.
 *
 * @param {object} props
 * @param {React.ReactNode[][]} props.pages  Each inner array is one full-width snap page.
 */
function ExtrasScrollRow({ pages }) {
  const visiblePages = pages.filter((page) => page.length > 0);
  const scrollRef = useRef(null);

  if (visiblePages.length === 0) return null;

  const scroll = (dir) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth, behavior: 'smooth' });
  };

  const hasMultiplePages = visiblePages.length > 1;

  return (
    <div className="flex w-full items-center gap-2 self-stretch">
      {hasMultiplePages && (
        <button
          type="button"
          onClick={() => scroll(-1)}
          className="bg-surface-raised flex h-[44px] w-[44px] shrink-0 items-center justify-center rounded-lg text-white transition-opacity hover:opacity-90 active:opacity-80"
          aria-label="Previous Actions"
        >
          <span className="text-xl font-bold">&lsaquo;</span>
        </button>
      )}

      <div
        ref={scrollRef}
        className="flex flex-1 snap-x snap-mandatory overflow-x-auto scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        role="region"
        aria-label="Delivery and Scoring Actions — Swipe for More"
      >
        {visiblePages.map((pageButtons, pageIndex) => (
          <div
            key={pageIndex}
            className="flex w-full shrink-0 snap-start items-center gap-1.5 lg:justify-center"
            aria-label={`Actions page ${pageIndex + 1} of ${visiblePages.length}`}
          >
            {pageButtons}
          </div>
        ))}
      </div>

      {hasMultiplePages && (
        <button
          type="button"
          onClick={() => scroll(1)}
          className="bg-surface-raised flex h-[44px] w-[44px] shrink-0 items-center justify-center rounded-lg text-white transition-opacity hover:opacity-90 active:opacity-80"
          aria-label="Next Actions"
        >
          <span className="text-xl font-bold">&rsaquo;</span>
        </button>
      )}
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ScoringControls({
  pendingFreeHit = false,
  extraTypeOptions = [],
  disabled = false,
  isSubmitting = false,
  onRun,
  onRunWithShot,
  onExtra,
  onOverthrow,
  onOverthrowWide,
  onOverthrowNoBall,
  onWideWicket,
  onNoBallWicket,
  onPenaltyRuns,
  onOut,
  onRetiredHurt,
  onUndo,
  onCustomScore,
}) {
  if (disabled) return null;

  const extrasPage1 = [
    ...extraTypeOptions.map((opt) => (
      <ActionButton key={opt.value} onClick={() => onExtra?.(opt.value)} label={opt.label} className="bg-surface text-white">
        {opt.short_label ?? opt.value?.toUpperCase()}
      </ActionButton>
    )),
    onOverthrow ? (
      <ActionButton
        key="ot"
        onClick={onOverthrow}
        label="Overthrow — Select Delivery Type and Runs"
        className="bg-surface text-white"
      >
        OT
      </ActionButton>
    ) : null,
    onUndo ? <UndoActionButton key="undo" onClick={onUndo} /> : null,
  ].filter(Boolean);

  const extrasPage2 = [
    onOverthrowWide ? (
      <ActionButton key="ot-wide" onClick={onOverthrowWide} label="Overthrow on Wide Delivery" className="bg-surface text-white">
        <span className="text-center text-[8px] leading-tight lg:text-[10px]">
          OT
          <br />
          (W)
        </span>
      </ActionButton>
    ) : null,
    onOverthrowNoBall ? (
      <ActionButton
        key="ot-nb"
        onClick={onOverthrowNoBall}
        label="Overthrow on No Ball Delivery"
        className="bg-surface text-white"
      >
        <span className="text-center text-[8px] leading-tight lg:text-[10px]">
          OT
          <br />
          (NB)
        </span>
      </ActionButton>
    ) : null,
    onPenaltyRuns ? (
      <ActionButton
        key="pen"
        onClick={onPenaltyRuns}
        label="Award Penalty Runs (Law 41.17)"
        className="bg-surface-raised text-brand"
      >
        <span className="text-center text-[9px] leading-tight lg:text-[11px]">
          PEN
          <br />
          RUNS
        </span>
      </ActionButton>
    ) : null,
    onWideWicket ? (
      <ActionButton
        key="wd-wkt"
        onClick={onWideWicket}
        label="Wide Plus Wicket — Run Out or Stumped Only"
        className="bg-surface text-brand"
      >
        <span className="text-center text-[9px] leading-tight lg:text-[11px]">
          WD
          <br />
          WKT
        </span>
      </ActionButton>
    ) : null,
    onNoBallWicket ? (
      <ActionButton
        key="nb-wkt"
        onClick={onNoBallWicket}
        label="No Ball Plus Wicket — Run Out, Obstruct, or Hit Ball Twice"
        className="bg-surface text-brand"
      >
        <span className="text-center text-[9px] leading-tight lg:text-[11px]">
          NB
          <br />
          WKT
        </span>
      </ActionButton>
    ) : null,
    onRetiredHurt ? (
      <ActionButton
        key="rh"
        onClick={onRetiredHurt}
        label="Retired Hurt — Batsman Leaves Without Wicket Credit"
        className="bg-surface text-[#6B7280]"
      >
        <span className="text-center text-[9px] leading-tight lg:text-[11px]">
          RET
          <br />
          HURT
        </span>
      </ActionButton>
    ) : null,
  ].filter(Boolean);

  return (
    <div
      className={`mt-6 flex flex-col items-center gap-4 transition-opacity ${isSubmitting ? 'pointer-events-none opacity-40' : ''}`}
      aria-busy={isSubmitting}
    >
      {/* Free Hit banner */}
      <FreeHitIndicator pendingFreeHit={pendingFreeHit} />

      {/* Run buttons: 0, 1–4, 6, wicket, custom (+) */}
      <div className="flex w-full gap-2 self-stretch lg:justify-center" role="group" aria-label="Run Scoring">
        {RUN_BUTTONS.map((runs, index) => (
          <RunCircleButton
            key={runs}
            runs={runs}
            backgroundColor={RUN_ROW_BG[index]}
            onClick={() => (runs === 0 ? onRun?.(0) : onRunWithShot?.(runs))}
          />
        ))}

        {onOut ? <WicketRunButton backgroundColor={RUN_ROW_BG[WICKET_ROW_INDEX]} onClick={onOut} /> : null}

        {onCustomScore ? (
          <button
            type="button"
            onClick={onCustomScore}
            className={`${RUN_CIRCLE_BASE} text-brand text-[22px] leading-none lg:text-[26px]`}
            style={{ backgroundColor: RUN_ROW_BG[CUSTOM_ROW_INDEX] }}
            aria-label="Add Custom Score"
          >
            +
          </button>
        ) : null}
      </div>

      {/* Extras + delivery actions — horizontal scroll (2 snap pages) */}
      <ExtrasScrollRow pages={[extrasPage1, extrasPage2]} />
    </div>
  );
}
