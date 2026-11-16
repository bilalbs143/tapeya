import { useParams } from 'react-router-dom';

import { PageDock, ScreenBar } from '@/shared/layout';
import { EmptyState } from '@/shared/ui/states';

import { ShopFilterBody, ShopFilterHeaderBelow } from '../ui/ShopFilterBody';
import { useShopFilter } from '../ui/useShopFilter';

/** Collection filter — /shop/filter/:kind (popular | special-offer | featured). */

export default function ShopFilterPage() {
  const { kind: rawKind } = useParams<{ kind: string }>();
  const flow = useShopFilter(rawKind);
  const { kind, title, goHome } = flow;
  const ready = Boolean(kind);

  return (
    <PageDock
      header={
        <div className="bg-surface shrink-0">
          <ScreenBar title="Shop" subtitle={ready ? (title ?? 'Gear and Kits') : 'Gear and Kits'} onBack={goHome} />
          {ready ? <ShopFilterHeaderBelow flow={flow} /> : null}
        </div>
      }
    >
      {!kind ? (
        <EmptyState
          size="lg"
          title="Unknown Collection"
          description="That filter doesn't exist. Try Most Popular or Special Offer from Shop Home."
        />
      ) : (
        <ShopFilterBody flow={flow} />
      )}
    </PageDock>
  );
}
