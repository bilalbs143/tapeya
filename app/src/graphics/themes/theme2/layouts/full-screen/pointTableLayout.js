/** Vertical budget for team rows on the 1080px FS canvas (below title band, above footer). */
export const POINT_TABLE_ROWS_AREA_H = 750;

export const POINT_TABLE_ROW_GAP = 8;

export const POINT_TABLE_ROW_MIN_H = 56;

export const POINT_TABLE_ROW_MAX_H = 88;

/**
 * Row height scales with team count: capped when few teams, compact when many.
 *
 * @param {number} rowCount
 * @returns {number}
 */
export function resolvePointTableRowHeight(rowCount) {
  if (rowCount <= 0) return POINT_TABLE_ROW_MIN_H;

  const gapTotal = Math.max(0, rowCount - 1) * POINT_TABLE_ROW_GAP;
  const evenSplit = (POINT_TABLE_ROWS_AREA_H - gapTotal) / rowCount;

  if (evenSplit >= POINT_TABLE_ROW_MAX_H) return POINT_TABLE_ROW_MAX_H;
  if (evenSplit <= POINT_TABLE_ROW_MIN_H) return POINT_TABLE_ROW_MIN_H;

  return Math.round(evenSplit);
}
