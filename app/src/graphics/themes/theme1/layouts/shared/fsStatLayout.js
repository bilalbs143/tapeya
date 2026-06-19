import { fsStatTile as t } from '../../config';

/**
 * Resolve stat chip sizing for full-screen player stats columns.
 * Compresses when the default stack would exceed {@link t.columnMaxHeight}.
 *
 * @param {number} statCount
 */
export function resolveFsStatLayout(statCount) {
  const standard = {
    tileH: t.height,
    tileW: t.width,
    gap: t.gap,
    labelSize: t.label,
    valueSize: t.value,
    columnH: t.columnMaxHeight,
  };

  if (statCount <= 0) return standard;

  const naturalH = statCount * t.height + (statCount - 1) * t.gap;
  if (naturalH <= t.columnMaxHeight) return standard;

  const gap = t.denseGap;
  const tileH = Math.max(t.denseMinHeight, Math.floor((t.columnMaxHeight - (statCount - 1) * gap) / statCount));
  const scale = tileH / t.height;

  return {
    tileH,
    tileW: Math.round(t.width * scale),
    gap,
    labelSize: Math.max(t.denseLabel, Math.round(t.label * scale)),
    valueSize: Math.max(t.denseValue, Math.round(t.value * scale)),
    columnH: t.columnMaxHeight,
  };
}
