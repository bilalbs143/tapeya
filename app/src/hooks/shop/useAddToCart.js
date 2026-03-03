import { useToast } from '@/hooks/useToast';
import { useAddCartItemMutation } from '@/store/api/shopApi';

/**
 * Shop add-to-cart hook. Use in listing cards and product detail.
 * @returns {{ addToCart, isAddingToCart, handleAddToCartForCard }} - mutation, loading state, and handler for card (stops propagation, adds qty 1)
 */
export function useAddToCart() {
  const toast = useToast();
  const [addToCart, { isLoading: isAddingToCart }] = useAddCartItemMutation();

  const handleAddToCartForCard = (e, productId, quantity = 1) => {
    e?.preventDefault?.();
    e?.stopPropagation?.();
    if (isAddingToCart || !productId) return;
    addToCart({ product_id: productId, quantity })
      .unwrap()
      .then(() => toast.success('Added to cart'))
      .catch(() => toast.error('Could not add to cart. Try again.'));
  };

  return {
    addToCart,
    isAddingToCart,
    handleAddToCartForCard,
  };
}
