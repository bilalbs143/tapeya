import { useEffect, useRef } from 'react';

import { Controller, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';

import { AppSubpageHeader } from '@/components/AppSubpageHeader';
import { useToast } from '@/hooks/useToast';
import { AppEventParams, AppEvents, flushEvents, logEvent, logPurchase } from '@/lib/analytics/facebook';
import { getApiErrorMessage } from '@/lib/apiErrors';
import { DEFAULT_COUNTRY } from '@/lib/constants/geo';
import { formatPrice } from '@/lib/format';
import { useCreateOrderMutation, useGetCartQuery, useGetOrdersQuery, useGetShippingQuoteQuery } from '@/store/api/shopApi';
import { useAppSelector } from '@/store/hooks';
import { selectUser } from '@/store/selectors';
import { Container } from '@/ui/Container';
import { CountryCityFields } from '@/ui/CountryCityFields';
import { FormActions } from '@/ui/form/FormActions';
import { FormStack } from '@/ui/form/FormStack';
import { FormField } from '@/ui/FormField';
import { Input } from '@/ui/Input';
import { PhoneInput } from '@/ui/PhoneInput';

export default function ShopCheckout() {
  const navigate = useNavigate();
  const toast = useToast();
  const user = useAppSelector(selectUser);
  const checkoutTracked = useRef(false);
  const { data: cart, isLoading: cartLoading } = useGetCartQuery();
  const { data: ordersResponse } = useGetOrdersQuery({ per_page: 1 });
  const lastOrder = ordersResponse?.data?.[0] ?? null;
  const [createOrder, { isLoading: isSubmitting }] = useCreateOrderMutation();

  const { register, control, handleSubmit, reset, watch, setValue } = useForm({
    defaultValues: {
      fullName: '',
      phone: '',
      email: '',
      address: '',
      city: '',
      country: DEFAULT_COUNTRY,
      notes: '',
    },
  });

  const country = watch('country');
  const city = watch('city');

  const { data: quote, isFetching: quoteLoading } = useGetShippingQuoteQuery(
    { city: city?.trim() || undefined, country: country?.trim() || undefined },
    { skip: !city?.trim() || !country?.trim() },
  );
  const shippingAmount = quote?.amount != null ? Number(quote.amount) : 0;

  useEffect(() => {
    register('country', { required: true });
    register('city', { required: true });
  }, [register]);

  // Prefill profile + last order shipping address.
  useEffect(() => {
    const countryFromProfile = user?.country && String(user.country).trim();
    reset({
      fullName: user?.name ?? '',
      phone: user?.phone || '',
      email: user?.email ?? '',
      address: lastOrder?.address ?? '',
      city: lastOrder?.city || user?.city || '',
      country: lastOrder?.country || countryFromProfile || DEFAULT_COUNTRY,
      notes: '',
    });
  }, [user, lastOrder, reset]);

  const hasName = !!user?.name;
  const hasPhone = !!user?.phone;
  const hasEmail = !!user?.email;

  const onSubmit = async (data) => {
    try {
      const result = await createOrder({
        address: data.address,
        city: data.city,
        country: data.country,
        notes: data.notes || undefined,
      }).unwrap();
      const order = result?.data ?? result;
      if (order?.id) {
        toast.success('Order placed');
        await logPurchase(subtotal + shippingAmount, 'PKR', {
          [AppEventParams.CONTENT_ID]: String(order.id),
        });
        await flushEvents();
        navigate('/shop/order-success', { replace: true, state: { orderId: order.id } });
      }
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Checkout failed. Please try again.'));
    }
  };

  const items = cart?.items ?? [];
  const subtotal = cart?.subtotal ?? 0;
  const total = subtotal + shippingAmount;
  const canCheckout = items.length > 0 && !cartLoading;

  useEffect(() => {
    if (!canCheckout || subtotal <= 0 || checkoutTracked.current) return;
    checkoutTracked.current = true;
    logEvent(
      AppEvents.INITIATED_CHECKOUT,
      {
        [AppEventParams.CURRENCY]: 'PKR',
      },
      subtotal,
    );
  }, [canCheckout, subtotal]);

  return (
    <div className="bg-black">
      <AppSubpageHeader title="BILLING DETAILS" />
      <Container className="pb-8">
        {cartLoading ? null : !canCheckout ? (
          <div className="py-8 text-center">
            <p className="text-muted text-[14px]">Your cart is empty.</p>
            <button
              type="button"
              onClick={() => navigate('/shop/cart')}
              className="bg-brand mt-4 rounded-full px-6 py-3 text-[14px] font-bold text-black"
            >
              View Cart
            </button>
          </div>
        ) : (
          <FormStack as="form" layout="grid-3" onSubmit={handleSubmit(onSubmit)}>
            <FormField label="Full Name" htmlFor="fullName">
              <Input
                id="fullName"
                type="text"
                placeholder="Enter Full Name"
                autoComplete="name"
                readOnly={hasName}
                aria-readonly={hasName}
                className={hasName ? 'cursor-default opacity-90' : ''}
                {...register('fullName')}
              />
            </FormField>

            <FormField label="Phone" htmlFor="phone">
              <Controller
                name="phone"
                control={control}
                render={({ field }) => (
                  <PhoneInput
                    id="phone"
                    placeholder="Enter Phone Number"
                    readOnly={hasPhone}
                    aria-readonly={hasPhone}
                    className={hasPhone ? 'cursor-default opacity-90' : ''}
                    {...field}
                  />
                )}
              />
            </FormField>

            <FormField label="Email Address" htmlFor="email">
              <Input
                id="email"
                type="email"
                placeholder="Enter Email Address"
                autoComplete="email"
                readOnly={hasEmail}
                aria-readonly={hasEmail}
                className={hasEmail ? 'cursor-default opacity-90' : ''}
                {...register('email')}
              />
            </FormField>

            <FormField label="Delivery Address" htmlFor="address" required>
              <Input
                id="address"
                type="text"
                placeholder="Street Address"
                autoComplete="street-address"
                aria-required="true"
                {...register('address', {
                  required: 'Delivery address is required',
                })}
              />
            </FormField>

            <CountryCityFields
              country={country ?? ''}
              city={city ?? ''}
              onCountryChange={(v) => setValue('country', v, { shouldValidate: true })}
              onCityChange={(v) => setValue('city', v, { shouldValidate: true })}
              required
            />

            <FormField label="Notes (Optional)" htmlFor="notes">
              <Input id="notes" type="text" placeholder="Order Notes" {...register('notes')} />
            </FormField>

            <div className="bg-surface space-y-2 rounded-2xl p-4 lg:col-span-3">
              <div className="flex justify-between text-[14px]">
                <span className="text-white">
                  Subtotal ({items.length} item{items.length !== 1 ? 's' : ''}):
                </span>
                <span className="font-bold text-white">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-[14px]">
                <span className="text-white">Shipping:</span>
                <span className="font-bold text-white">
                  {quoteLoading ? '…' : city?.trim() && country?.trim() ? formatPrice(shippingAmount) : '—'}
                </span>
              </div>
              <div className="flex justify-between text-[16px]">
                <span className="font-semibold text-white">Total:</span>
                <span className="text-brand font-bold">{formatPrice(total)}</span>
              </div>
            </div>

            <FormActions align="start" className="lg:col-span-3">
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-brand flex w-full items-center justify-center gap-2 rounded-[6px] py-3.5 text-[16px] font-bold text-black transition-opacity active:opacity-90 disabled:opacity-50 lg:w-auto lg:px-4"
              >
                {isSubmitting ? 'Placing Order…' : 'Place Order'}
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </button>
            </FormActions>
          </FormStack>
        )}
      </Container>
    </div>
  );
}
