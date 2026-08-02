/**
 * Shared not-out detection for broadcast scorecard rows.
 * Renders as an inline suffix on the batter name (e.g. MIRZA*).
 */

/**
 * @param {Record<string, unknown>|null|undefined} batter
 */
export function isNotOutBatter(batter) {
  if (!batter || typeof batter !== 'object') return false;
  if (batter.status === 'dismissed') return false;
  if (batter.notOut ?? batter.not_out ?? batter.is_not_out ?? batter.isNotOut ?? batter.star) {
    return true;
  }
  if (batter.status === 'not_out' || batter.is_at_crease || batter.isAtCrease) {
    return true;
  }
  const dismissal = String(batter.dismissal ?? batter.dismissalText ?? batter.dismissal_text ?? '').trim();
  return /^not\s*out$/i.test(dismissal);
}

/**
 * @param {unknown} row
 */
export function resolvePlayerDisplayName(row) {
  if (typeof row === 'string') return row;
  if (!row || typeof row !== 'object') return '';
  return String(row.display_name ?? row.displayName ?? row.name ?? row.full_name ?? row.fullName ?? '');
}

/**
 * @param {string} name
 * @param {boolean} notOut
 */
export function withNotOutNameSuffix(name, notOut) {
  return notOut ? `${name}*` : name;
}
