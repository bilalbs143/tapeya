import { DockScreen } from '@/shared/layout';

import { OrderSuccessBody } from '../ui/OrderSuccessBody';
import { useOrderSuccess } from '../ui/useOrderSuccess';

export default function OrderSuccessPage() {
  const flow = useOrderSuccess();
  const { goHome } = flow;

  return (
    <DockScreen title="Order Successful" subtitle="Thanks — we're on it" onBack={goHome}>
      <OrderSuccessBody flow={flow} />
    </DockScreen>
  );
}
