import { Link } from 'react-router-dom';

import { ScreenBar } from '@/shared/layout';
import { Button } from '@/shared/ui/Button';
import { EmptyState, ErrorState, Skeleton } from '@/shared/ui/states';

import { shopPaths } from '../lib/shopPaths';
import { OrdersPageBody } from '../ui/OrdersPageBody';
import { useOrdersPage } from '../ui/useOrdersPage';

export default function OrdersPage() {
  const flow = useOrdersPage();
  const { current, previous, isLoading, isError, refetch, goHome } = flow;

  const header = <ScreenBar title="My Orders" subtitle="Track Purchases and Returns" onBack={goHome} />;

  if (isLoading) {
    return (
      <div className="bg-surface flex min-h-full flex-col">
        {header}
        <div className="flex flex-col gap-2.5 px-4 pt-4">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-24 w-full rounded-card" />
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-surface flex min-h-full flex-col">
        {header}
        <div className="px-4 py-8">
          <ErrorState title="Couldn't Load Orders" onRetry={() => void refetch()} />
        </div>
      </div>
    );
  }

  if (!current.length && !previous.length) {
    return (
      <div className="bg-surface flex min-h-full flex-col">
        {header}
        <div className="flex flex-1 flex-col px-4">
          <EmptyState
            size="lg"
            title="No Orders Yet"
            description="Anything you buy on Tapeya shows up here, with tracking once the seller dispatches it."
            action={
              <Button asChild>
                <Link to={shopPaths.home()}>Browse Shop</Link>
              </Button>
            }
          />
        </div>
      </div>
    );
  }

  return <OrdersPageBody flow={flow} />;
}
