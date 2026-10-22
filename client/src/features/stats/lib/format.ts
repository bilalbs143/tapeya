/** Display helpers for career stat values — nullish → em dash. */

export function formatNum(n: number | string | null | undefined): string {
  if (n == null || n === '') return '—';
  if (typeof n === 'number' && Number.isFinite(n)) return String(n);
  return String(n);
}

export function formatDecimal(n: number | string | null | undefined, decimals = 2): string {
  if (n == null || n === '') return '—';
  if (typeof n === 'number' && Number.isFinite(n)) return n.toFixed(decimals);
  const parsed = Number(n);
  if (Number.isFinite(parsed)) return parsed.toFixed(decimals);
  return '—';
}
