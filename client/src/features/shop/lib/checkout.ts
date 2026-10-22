export type CheckoutFieldErrors = { address?: string; city?: string };

export function validateCheckoutAddress(address: string, city: string): CheckoutFieldErrors {
  const next: CheckoutFieldErrors = {};
  if (!address.trim()) next.address = 'A delivery address is required.';
  if (!city) next.city = 'Pick a city — shipping is quoted from it.';
  return next;
}

export function omitCheckoutError(errors: CheckoutFieldErrors, key: keyof CheckoutFieldErrors): CheckoutFieldErrors {
  if (!(key in errors)) return errors;
  const next = { ...errors };
  // eslint-disable-next-line @typescript-eslint/no-dynamic-delete -- drop one field key
  delete next[key];
  return next;
}

export function checkoutPlaceOrderLabel(city: string, totalLabel: string): string {
  return city ? `Place Order · ${totalLabel}` : 'Place Order';
}
