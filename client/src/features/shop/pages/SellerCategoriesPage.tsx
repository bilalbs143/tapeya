import { SellerCategoriesBody } from '../ui/SellerCategoriesBody';
import { useSellerCategories } from '../ui/useSellerCategories';

export default function SellerCategoriesPage() {
  const flow = useSellerCategories();
  return <SellerCategoriesBody flow={flow} />;
}
