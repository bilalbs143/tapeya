import { SellerBrandsBody } from '../ui/SellerBrandsBody';
import { useSellerBrands } from '../ui/useSellerBrands';

/** Global active brands catalog; create/update when approved. */

export default function SellerBrandsPage() {
  const flow = useSellerBrands();
  return <SellerBrandsBody flow={flow} />;
}
