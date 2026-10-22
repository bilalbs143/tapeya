import { useNavigate } from 'react-router-dom';

import { getApiErrorMessage } from '@/shared/api/errors';
import { toast } from '@/shared/ui/toast';

import {
  useGetShippingQuoteQuery,
  useGetShopCartQuery,
  useRemoveShopCartItemMutation,
  useUpdateShopCartItemMutation,
} from '../api/shopApi';
import { cartCheckoutLabel } from '../lib/cartPage';
import { formatPkr } from '../lib/money';
import { shopPaths } from '../lib/shopPaths';
import { cartTotals } from '../model/schemas';

/** Cart query, qty/remove mutations, shipping quote, and checkout nav. */
export function useCartPage() {
  const navigate = useNavigate();
  const cartQuery = useGetShopCartQuery();
  const { data: cart, isLoading, isError, refetch } = cartQuery;
  const { data: quote } = useGetShippingQuoteQuery(undefined, {
    skip: !cart?.items.length,
  });
  const [updateItem] = useUpdateShopCartItemMutation();
  const [removeItem] = useRemoveShopCartItemMutation();

  const lines = cart?.items ?? [];
  const groups = cart?.vendorGroups ?? [];
  const totals = cartTotals(cart?.subtotal ?? 0, quote?.amount ?? 0, 0);
  const checkoutLabel = cartCheckoutLabel(formatPkr(totals.total));

  async function setQty(cartItemId: number, quantity: number) {
    try {
      await updateItem({ cartItemId, quantity }).unwrap();
    } catch (err) {
      toast({ title: getApiErrorMessage(err, 'Could not update quantity.'), tone: 'error' });
    }
  }

  async function remove(cartItemId: number) {
    try {
      await removeItem(cartItemId).unwrap();
    } catch (err) {
      toast({ title: getApiErrorMessage(err, 'Could not remove item.'), tone: 'error' });
    }
  }

  function goHome() {
    navigate(shopPaths.home());
  }

  function goCheckout() {
    navigate(shopPaths.checkout());
  }

  return {
    isLoading,
    isError,
    refetch,
    lines,
    groups,
    totals,
    checkoutLabel,
    setQty,
    remove,
    goHome,
    goCheckout,
  };
}
