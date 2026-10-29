import { Link } from 'react-router-dom';

import { DockScreen } from '@/shared/layout';
import { Button } from '@/shared/ui/Button';
import { EmptyState, ErrorState, Skeleton } from '@/shared/ui/states';

import { shopPaths } from '../lib/shopPaths';
import { OrdersPageBody } from '../ui/OrdersPageBody';
import { useOrdersPage } from '../ui/useOrdersPage';

export default function OrdersPage() {
  const flow = useOrdersPage();
  const { current, previous, isLoading, isError, refetch, goHome } = flow;
  const ready = !isLoading && !isError && (current.length > 0 || previous.length > 0);

  return (
    <DockScreen title="My Orders" subtitle="Track Purchases and Returns" onBack={goHome}>
      {isLoading ? (
        <div className="flex flex-col gap-2.5 px-4 pt-4">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-24 w-full rounded-card" />
          ))}
        </div>
      ) : isError ? (
        <div className="px-4 py-8">
          <ErrorState title="Couldn't Load Orders" onRetry={() => void refetch()} />
        </div>
      ) : !ready ? (
        <div className="flex min-h-full flex-col px-4">
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
      ) : (
        <OrdersPageBody flow={flow} />
      )}
    </DockScreen>
  );
}
