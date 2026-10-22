import { Link } from 'react-router-dom';

import { ScreenBar } from '@/shared/layout';
import { Button } from '@/shared/ui/Button';
import { EmptyState, ErrorState, FormFieldsSkeleton, Skeleton } from '@/shared/ui/states';

import { shopPaths } from '../lib/shopPaths';
import { CheckoutFormBody } from '../ui/CheckoutFormBody';
import { useCheckout } from '../ui/useCheckout';

export default function CheckoutPage() {
  const flow = useCheckout();
  const { isLoading, isError, refetch, lines, goCart } = flow;

  const header = <ScreenBar title="Billing Details" subtitle="Delivery and Payment" onBack={goCart} />;

  if (isLoading) {
    return (
      <div className="bg-surface flex min-h-full flex-col">
        {header}
        <div className="flex flex-col gap-4 px-4 pt-4" aria-busy="true" aria-label="Loading Checkout">
          <FormFieldsSkeleton rows={4} />
          <div className="border-border-subtle rounded-card border p-4">
            <Skeleton className="h-3 w-28" />
            <Skeleton className="mt-3 h-3 w-full" />
            <Skeleton className="mt-2 h-3 w-2/3" />
            <Skeleton className="mt-4 h-4 w-1/3" />
          </div>
          <Skeleton className="h-12 w-full rounded-field" />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-surface flex min-h-full flex-col">
        {header}
        <div className="px-4 py-8">
          <ErrorState title="Couldn't Load Checkout" onRetry={() => void refetch()} />
        </div>
      </div>
    );
  }

  if (!lines.length) {
    return (
      <div className="bg-surface flex min-h-full flex-col">
        {header}
        <div className="flex flex-1 flex-col px-4">
          <EmptyState
            size="lg"
            title="There's Nothing to Check Out"
            description="Your cart emptied — add something and come back."
            action={
              <>
                <Button asChild variant="secondary">
                  <Link to={shopPaths.cart()}>View Cart</Link>
                </Button>
                <Button asChild>
                  <Link to={shopPaths.home()}>Continue Shopping</Link>
                </Button>
              </>
            }
          />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface flex min-h-full flex-col">
      {header}
      <CheckoutFormBody flow={flow} />
    </div>
  );
}
