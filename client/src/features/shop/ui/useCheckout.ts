import { type FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useMeQuery } from '@/features/auth';

import { getApiErrorMessage } from '@/shared/api/errors';
import { DEFAULT_COUNTRY } from '@/shared/model/location';
import { toast } from '@/shared/ui/toast';

import {
  useCreateShopOrderMutation,
  useGetShippingQuoteQuery,
  useGetShopCartQuery,
  useGetShopOrdersQuery,
} from '../api/shopApi';
import {
  type CheckoutFieldErrors,
  checkoutPlaceOrderLabel,
  omitCheckoutError,
  validateCheckoutAddress,
} from '../lib/checkout';
import { formatPkr } from '../lib/money';
import { shopPaths } from '../lib/shopPaths';
import { cartTotals } from '../model/schemas';

/** Cart gates, address drafts, shipping quote, and place order for CheckoutPage. */
export function useCheckout() {
  const navigate = useNavigate();
  const { data: me } = useMeQuery();
  const cartQuery = useGetShopCartQuery();
  const { data: cart, isLoading, isError, refetch } = cartQuery;
  const { data: recentOrders } = useGetShopOrdersQuery({ perPage: 1 });
  const [createOrder, { isLoading: placing }] = useCreateShopOrderMutation();

  const lastOrder = recentOrders?.[0] ?? null;

  // null = follow seed from profile / last order (no prefill effect).
  const [addressDraft, setAddressDraft] = useState<string | null>(null);
  const [cityDraft, setCityDraft] = useState<string | null>(null);
  const [countryDraft, setCountryDraft] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<CheckoutFieldErrors>({});

  const seededAddress = lastOrder?.address ?? '';
  const seededCity = lastOrder?.city || me?.city || '';
  const seededCountry = lastOrder?.country || me?.country?.trim() || DEFAULT_COUNTRY;

  const address = addressDraft ?? seededAddress;
  const city = cityDraft ?? seededCity;
  const country = countryDraft ?? seededCountry;

  const lines = cart?.items ?? [];
  const { data: quote } = useGetShippingQuoteQuery({ city, country }, { skip: !city || !lines.length });
  const totals = cartTotals(cart?.subtotal ?? 0, quote?.amount ?? 0, 0);
  const placeLabel = checkoutPlaceOrderLabel(city, formatPkr(totals.total));

  async function placeOrder(e: FormEvent) {
    e.preventDefault();
    const next = validateCheckoutAddress(address, city);
    if (Object.keys(next).length) {
      setErrors(next);
      return;
    }
    setErrors({});
    try {
      const order = await createOrder({
        address: address.trim(),
        city,
        country,
        ...(notes.trim() ? { notes: notes.trim() } : {}),
      }).unwrap();
      navigate(shopPaths.orderSuccess(), {
        replace: true,
        state: { total: order.total, orderId: order.id },
      });
    } catch (err) {
      toast({ title: getApiErrorMessage(err, 'Could not place order.'), tone: 'error' });
    }
  }

  function goCart() {
    navigate(shopPaths.cart());
  }

  return {
    me,
    cartQuery,
    isLoading,
    isError,
    refetch,
    lines,
    address,
    city,
    country,
    notes,
    setNotes,
    errors,
    setAddressDraft,
    setCityDraft,
    setCountryDraft,
    clearAddressError: () => setErrors((prev) => omitCheckoutError(prev, 'address')),
    clearCityError: () => setErrors((prev) => omitCheckoutError(prev, 'city')),
    totals,
    placeLabel,
    placing,
    placeOrder,
    goCart,
  };
}
