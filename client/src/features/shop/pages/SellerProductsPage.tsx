import { SellerProductsBody } from '../ui/SellerProductsBody';
import { useSellerProducts } from '../ui/useSellerProducts';

export default function SellerProductsPage() {
  const flow = useSellerProducts();
  return <SellerProductsBody flow={flow} />;
}
