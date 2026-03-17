import { useState } from 'react';

import { useToast } from '@/hooks/useToast';
import { useAddCartItemMutation } from '@/store/api/shopApi';

/**
 * Shop add-to-cart hook. Use in listing cards and product detail.
 * Tracks which product id is currently being added so only that card shows loading.
 * @returns {{ addToCart, isAddingToCart, addingProductId, handleAddToCartForCard }}
 */
export function useAddToCart() {
  const toast = useToast();
  const [addToCart, { isLoading }] = useAddCartItemMutation();
  const [addingProductId, setAddingProductId] = useState(null);

  const isAddingToCart = addingProductId != null || isLoading;

  const handleAddToCartForCard = (e, productId, quantity = 1) => {
    e?.preventDefault?.();
    e?.stopPropagation?.();
    if (addingProductId != null || isLoading || !productId) return;
    setAddingProductId(productId);
    addToCart({ product_id: productId, quantity })
      .unwrap()
      .then(() => toast.success('Added to cart'))
      .catch(() => toast.error('Could not add to cart. Try again.'))
      .finally(() => setAddingProductId(null));
  };

  return {
    addToCart,
    isAddingToCart,
    addingProductId,
    handleAddToCartForCard,
  };
}
