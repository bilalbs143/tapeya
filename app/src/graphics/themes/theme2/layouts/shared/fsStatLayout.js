import { fsStatTile as t } from '../../config';

/**
 * Balance label/value inside a fixed tile height so text never sticks to edges.
 *
 * @param {number} tileH
 * @param {number} labelSize
 * @param {number} valueSize
 */
function resolveTileInsets(tileH, labelSize, valueSize) {
  const contentH = labelSize + valueSize;
  const remaining = tileH - contentH;

  if (remaining <= t.denseTileLabelGap + 2 * t.denseTilePaddingY) {
    const labelGap = Math.max(4, Math.floor(remaining * 0.22));
    const paddingY = Math.max(6, Math.floor((remaining - labelGap) / 2));
    return { paddingY, labelGap };
  }

  const labelGap = Math.max(t.denseTileLabelGap, Math.round(tileH * 0.06));
  const paddingY = Math.max(t.denseTilePaddingY, Math.floor((tileH - contentH - labelGap) / 2));

  return { paddingY, labelGap };
}

/**
 * @param {number} statCount
 * @param {number} tileH
 * @param {number} gap
 */
function stackHeight(statCount, tileH, gap) {
  return statCount * tileH + (statCount - 1) * gap;
}

/**
 * Scale label/value to fit inside a compressed tile.
 *
 * @param {number} tileH
 */
function resolveDenseTypography(tileH) {
  const paddingY = Math.max(6, Math.round(tileH * 0.12));
  const labelGap = Math.max(4, Math.round(tileH * 0.06));
  const inner = tileH - paddingY * 2 - labelGap;

  let labelSize = Math.max(13, Math.min(t.label, Math.floor(inner * 0.34)));
  let valueSize = Math.max(20, Math.min(t.value, Math.floor(inner * 0.56)));

  while (labelSize + valueSize > inner && valueSize > 18) valueSize -= 1;
  while (labelSize + valueSize > inner && labelSize > 12) labelSize -= 1;

  return { labelSize, valueSize, paddingY, labelGap: Math.max(4, labelGap) };
}

/**
 * @param {number} tileH
 */
function resolveTypography(tileH) {
  if (tileH >= t.height) {
    const { paddingY, labelGap } = resolveTileInsets(tileH, t.label, t.value);
    return { labelSize: t.label, valueSize: t.value, paddingY, labelGap };
  }

  if (tileH >= t.denseMinHeight) {
    const scale = tileH / t.height;
    let labelSize = Math.max(t.denseLabel, Math.round(t.label * scale));
    let valueSize = Math.max(t.denseValue, Math.round(t.value * scale));
    let { paddingY, labelGap } = resolveTileInsets(tileH, labelSize, valueSize);

    while (labelSize + valueSize + labelGap + paddingY * 2 > tileH && valueSize > t.denseValue - 6) {
      valueSize -= 1;
      ({ paddingY, labelGap } = resolveTileInsets(tileH, labelSize, valueSize));
    }
    while (labelSize + valueSize + labelGap + paddingY * 2 > tileH && labelSize > t.denseLabel - 2) {
      labelSize -= 1;
      ({ paddingY, labelGap } = resolveTileInsets(tileH, labelSize, valueSize));
    }

    return { labelSize, valueSize, paddingY, labelGap };
  }

  return resolveDenseTypography(tileH);
}

/**
 * Pick row gap + minimum tile height so the stack fills the avatar column.
 *
 * @param {number} statCount
 * @param {number} columnH
 */
function pickStackSizing(statCount, columnH) {
  for (const gap of [t.gap, t.denseGap, 8, 6]) {
    const tileH = Math.floor((columnH - (statCount - 1) * gap) / statCount);
    if (tileH >= t.minTileHeight && stackHeight(statCount, tileH, gap) <= columnH) {
      return { gap, tileH };
    }
  }

  const gap = 6;
  const tileH = Math.max(t.minTileHeight, Math.floor((columnH - (statCount - 1) * gap) / statCount));
  return { gap, tileH };
}

/**
 * Resolve stat chip sizing for full-screen player stats columns.
 * Tiles stretch top-to-bottom to match the avatar column height.
 *
 * @param {number} statCount
 */
export function resolveFsStatLayout(statCount) {
  const columnH = t.columnMaxHeight;

  const standard = {
    tileH: t.height,
    tileW: t.width,
    gap: t.gap,
    labelSize: t.label,
    valueSize: t.value,
    columnH,
    paddingY: t.tilePaddingY,
    labelGap: t.tileLabelGap,
  };

  if (statCount <= 0) return standard;

  const { gap, tileH } = pickStackSizing(statCount, columnH);
  const type = resolveTypography(tileH);
  const scale = Math.min(1, tileH / t.height);

  return {
    ...standard,
    gap,
    tileH,
    tileW: tileH >= t.height ? t.width : Math.round(t.width * Math.max(0.88, scale)),
    ...type,
    columnH,
  };
}
