import { Link } from 'react-router-dom';

import { ScreenBar } from '@/shared/layout';
import { Button } from '@/shared/ui/Button';
import { CheckIcon } from '@/shared/ui/icons';

import { formatPkr } from '../lib/money';
import { ORDER_SUCCESS_STATUS_AFTER_TOTAL, ORDER_SUCCESS_STATUS_NO_TOTAL } from '../lib/orderSuccess';
import { shopPaths } from '../lib/shopPaths';
import type { useOrderSuccess } from './useOrderSuccess';

type OrderSuccessFlow = ReturnType<typeof useOrderSuccess>;

type OrderSuccessBodyProps = {
  flow: OrderSuccessFlow;
};

/** Confirmation hero after checkout. */
export function OrderSuccessBody({ flow }: OrderSuccessBodyProps) {
  const { total, goHome } = flow;

  return (
    <div className="bg-surface flex min-h-full flex-col">
      <ScreenBar title="Order Successful" subtitle="Thanks — we're on it" onBack={goHome} />

      <div className="flex flex-1 flex-col items-center justify-center gap-6 px-4 py-8 text-center">
        <span className="border-positive/40 bg-positive/14 grid h-16 w-16 place-items-center rounded-sheet border">
          <CheckIcon size="lg" strokeWidth={2.2} className="text-positive-2 h-9 w-9" />
        </span>

        <div>
          <h1 className="text-title leading-snug font-extrabold tracking-tight text-ink">Order Placed</h1>
          <p className="text-muted mx-auto mt-2.5 max-w-[33ch] text-xs leading-relaxed" role="status">
            {total != null ? (
              <>
                <strong className="font-mono font-bold text-body">{formatPkr(total)}</strong>
                {ORDER_SUCCESS_STATUS_AFTER_TOTAL}
              </>
            ) : (
              ORDER_SUCCESS_STATUS_NO_TOTAL
            )}
          </p>
        </div>

        <div className="flex w-full max-w-xs flex-col gap-2.5">
          <Button asChild size="lg" className="min-h-12 rounded-field text-body-sm font-bold">
            <Link to={shopPaths.orders()}>View My Orders</Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="secondary"
            className="bg-surface-raised min-h-12 rounded-field text-body-sm font-bold"
          >
            <Link to={shopPaths.home()}>Shop Again</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
