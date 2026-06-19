import { chipTypeToVariant, overlayVariantFor, presentBall } from '../../../../../../shared/ball-delivery/index.js';

export { chipTypeToVariant, overlayVariantFor, presentBall };

/** Shared helpers for scoreboard bar player / bowler display. */

/** Broadcast-style surname — strips leading initial (e.g. "A. Smith" → "Smith"). */
export const surname = (name) => String(name ?? '').replace(/^[A-Z]\.? /, '');

export const PLAYER_NAME_TRUNCATE_CLASS = 'max-w-[8ch] overflow-hidden text-ellipsis whitespace-nowrap';

/**
 * @param {{ figText?: string, w?: number, r?: number, o?: string|number }|null|undefined} bowler
 */
export function bowlerFigParts(bowler) {
  const b = bowler ?? {};
  if (b.figText) {
    const parts = String(b.figText).trim().split(/\s+/);
    return {
      figures: parts[0] ?? `${b.w ?? 0}-${b.r ?? 0}`,
      overs: parts[1] ?? String(b.o ?? 0),
    };
  }

  return {
    figures: `${b.w ?? 0}-${b.r ?? 0}`,
    overs: String(b.o ?? 0),
  };
}

/** @deprecated Use overlayVariantFor(presentation) — kept for BallChip string fallback. */
export function ballChipVariant(code) {
  return overlayVariantFor(code);
}
