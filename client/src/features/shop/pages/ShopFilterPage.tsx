import { useParams } from 'react-router-dom';

import { DockScreen } from '@/shared/layout';
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
    <DockScreen
      title="Shop"
      subtitle={ready ? (title ?? 'Gear and Kits') : 'Gear and Kits'}
      onBack={goHome}
      below={ready ? <ShopFilterHeaderBelow flow={flow} /> : undefined}
    >
      {!kind ? (
        <EmptyState
          className="py-16"
          title="Unknown Collection"
          description="That filter doesn't exist. Try Most Popular or Special Offer from Shop Home."
        />
      ) : (
        <ShopFilterBody flow={flow} />
      )}
    </DockScreen>
  );
}
