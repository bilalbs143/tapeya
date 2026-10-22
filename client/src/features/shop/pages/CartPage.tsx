import { Link } from 'react-router-dom';

import { ScreenBar } from '@/shared/layout';
import { Button } from '@/shared/ui/Button';
import { EmptyState, ErrorState, Skeleton } from '@/shared/ui/states';

import { shopPaths } from '../lib/shopPaths';
import { CartPageBody } from '../ui/CartPageBody';
import { useCartPage } from '../ui/useCartPage';

export default function CartPage() {
  const flow = useCartPage();
  const { isLoading, isError, refetch, lines, goHome } = flow;

  const header = <ScreenBar title="Selected Items" subtitle="Review Before Checkout" onBack={goHome} />;

  if (isLoading) {
    return (
      <div className="bg-surface flex min-h-full flex-col">
        {header}
        <div className="flex flex-col gap-3 px-4 pt-4" aria-busy="true" aria-label="Loading Cart">
          <Skeleton className="h-3 w-28" />
          {[0, 1].map((i) => (
            <div key={i} className="border-border-subtle flex gap-3 rounded-card border p-3">
              <Skeleton className="h-16 w-16 shrink-0 rounded-panel" />
              <div className="flex min-w-0 flex-1 flex-col gap-2">
                <Skeleton className="h-3 w-3/4" />
                <Skeleton className="h-2.5 w-1/3" />
                <Skeleton className="mt-auto h-8 w-24 rounded-field" />
              </div>
            </div>
          ))}
          <div className="border-border-subtle mt-2 rounded-card border p-3">
            <Skeleton className="h-3 w-full" />
            <Skeleton className="mt-2 h-3 w-2/3" />
            <Skeleton className="mt-3 h-4 w-1/3" />
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-surface flex min-h-full flex-col">
        {header}
        <div className="px-4 py-8">
          <ErrorState
            title="Couldn't Load Your Cart"
            description="Try again in a moment."
            onRetry={() => void refetch()}
          />
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
            title="Your Cart Is Empty"
            description="Nothing selected yet. The Special Offer rail on Shop Home is the quickest place to start."
            action={
              <Button asChild size="lg">
                <Link to={shopPaths.home()}>Continue Shopping</Link>
              </Button>
            }
          />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface flex min-h-full flex-col">
      {header}
      <CartPageBody flow={flow} />
    </div>
  );
}
