/** Shared numeric / date helpers for shop wire → domain maps. */

export function asNumber(value: number | string | null | undefined, fallback = 0): number {
  if (value == null) return fallback;
  const n = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(n) ? n : fallback;
}

export function roundMoney(n: number): number {
  return Math.round(n * 100) / 100;
}

export function formatOrderDate(value: string | null | undefined): string {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

export const CURRENT_ORDER_STATUSES = new Set(['pending', 'processing', 'dispatched']);
