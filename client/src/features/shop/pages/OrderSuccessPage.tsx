import { OrderSuccessBody } from '../ui/OrderSuccessBody';
import { useOrderSuccess } from '../ui/useOrderSuccess';

export default function OrderSuccessPage() {
  const flow = useOrderSuccess();
  return <OrderSuccessBody flow={flow} />;
}
