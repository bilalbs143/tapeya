import { ShopHomeBody } from '../ui/ShopHomeBody';
import { useShopHome } from '../ui/useShopHome';

export default function ShopHomePage() {
  const flow = useShopHome();
  return <ShopHomeBody flow={flow} />;
}
