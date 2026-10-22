import { useParams } from 'react-router-dom';

import { ScreenBar } from '@/shared/layout';
import { EmptyState } from '@/shared/ui/states';

import { ShopFilterBody } from '../ui/ShopFilterBody';
import { useShopFilter } from '../ui/useShopFilter';

/** Collection filter — /shop/filter/:kind (popular | special-offer | featured). */

export default function ShopFilterPage() {
  const { kind: rawKind } = useParams<{ kind: string }>();
  const flow = useShopFilter(rawKind);
  const { kind, goHome } = flow;

  if (!kind) {
    return (
      <div className="bg-surface flex min-h-full flex-col">
        <ScreenBar title="Shop" subtitle="Gear and Kits" onBack={goHome} />
        <EmptyState
          className="py-16"
          title="Unknown Collection"
          description="That filter doesn't exist. Try Most Popular or Special Offer from Shop Home."
        />
      </div>
    );
  }

  return <ShopFilterBody flow={flow} />;
}
