/** Shared fulfillment status pill — same colors on seller list + detail (matches My Orders). */
const STATUS_PILL_STYLES = {
  pending: 'border border-brand text-brand font-bold uppercase tracking-wide',
  processing: 'border border-white text-white font-bold uppercase tracking-wide',
  dispatched: 'border border-[#34C759] text-[#34C759] font-bold uppercase tracking-wide',
  delivered: 'border border-[#22C55E] text-[#22C55E] font-bold uppercase tracking-wide',
  cancelled: 'border border-[#FF3B30] text-[#FF3B30] font-bold uppercase tracking-wide',
};

const FALLBACK = 'border border-[#6B7280] bg-transparent text-[#6B7280] font-bold uppercase tracking-wide';

export function OrderStatusPill({ status, statusLabel, className = '' }) {
  const value = (status ?? '').toLowerCase();
  const display = (statusLabel ?? value) !== '' ? (statusLabel ?? value).toUpperCase() : '—';
  const style = STATUS_PILL_STYLES[value] ?? FALLBACK;

  return <span className={`inline-block rounded-full px-3 py-1 text-[11px] ${style} ${className}`.trim()}>{display}</span>;
}
