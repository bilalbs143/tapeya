import { formatBroadcastBowlingFigures } from '@tapeya/graphics-core/domain/player';

import { chipTypeToVariant, overlayVariantFor, presentBall } from '../../../../../../shared/ball-delivery/index.js';

export { chipTypeToVariant, overlayVariantFor, presentBall };

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
    const rawFigures = parts[0] ?? '';
    return {
      figures: formatBroadcastBowlingFigures(rawFigures, { w: b.w, r: b.r }),
      overs: parts[1] ?? String(b.o ?? 0),
    };
  }

  return {
    figures: formatBroadcastBowlingFigures(null, { w: b.w, r: b.r }),
    overs: String(b.o ?? 0),
  };
}
