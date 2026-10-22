import { SellerOrdersBody } from '../ui/SellerOrdersBody';
import { useSellerOrders } from '../ui/useSellerOrders';

/** Current / previous split; card shows earnings, not buyer total. */

export default function SellerOrdersPage() {
  const flow = useSellerOrders();
  return <SellerOrdersBody flow={flow} />;
}
