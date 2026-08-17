import { StatusPill } from '@/ui/StatusPill';
import { orderStatusTone } from '@/ui/statusPillTones';

/** Shared fulfillment status pill — seller list + detail + My Orders. */
export function OrderStatusPill({ status, statusLabel, className = '' }) {
  const value = (status ?? '').toLowerCase();
  const display = (statusLabel ?? value) !== '' ? (statusLabel ?? value) : '—';

  return <StatusPill tone={orderStatusTone(value)} label={display} className={className} />;
}
