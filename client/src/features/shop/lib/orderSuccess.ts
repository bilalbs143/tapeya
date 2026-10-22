export type OrderSuccessLocationState = {
  total?: number | undefined;
  orderId?: number | undefined;
};

export function parseOrderSuccessTotal(state: unknown): number | null {
  if (!state || typeof state !== 'object') return null;
  const total = (state as OrderSuccessLocationState).total;
  return typeof total === 'number' && Number.isFinite(total) ? total : null;
}

export const ORDER_SUCCESS_STATUS_NO_TOTAL =
  "The seller has been notified and will confirm dispatch — you'll see it under My Orders.";

export const ORDER_SUCCESS_STATUS_AFTER_TOTAL =
  " confirmed. The seller has been notified and will confirm dispatch — you'll see it under My Orders.";
