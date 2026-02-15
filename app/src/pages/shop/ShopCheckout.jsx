import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';

import { formatPrice } from '@/lib/format';
import { useCreateOrderMutation, useGetCartQuery } from '@/store/api/shopApi';
import { useAppSelector } from '@/store/hooks';
import { Container } from '@/ui/Container';
import { FormField } from '@/ui/FormField';
import { Input } from '@/ui/Input';
import { PhoneInput } from '@/ui/PhoneInput';

export default function ShopCheckout() {
  const navigate = useNavigate();
  const user = useAppSelector((state) => state.auth?.user);
  const { data: cart, isLoading: cartLoading } = useGetCartQuery();
  const [createOrder, { isLoading: isSubmitting }] = useCreateOrderMutation();
  const [checkoutError, setCheckoutError] = useState(null);

  const { register, control, handleSubmit, reset } = useForm({
    defaultValues: {
      fullName: '',
      phone: '',
      email: '',
      address: '',
      city: '',
      country: '',
      notes: '',
    },
  });

  useEffect(() => {
    reset({
      fullName: user?.name ?? '',
      phone: user?.phone ?? '',
      email: user?.email ?? '',
      address: '',
      city: user?.city ?? '',
      country: user?.country ?? '',
      notes: '',
    });
  }, [user, reset]);

  const hasName = !!user?.name;
  const hasPhone = !!user?.phone;
  const hasEmail = !!user?.email;
  const hasCity = !!user?.city;
  const hasCountry = !!user?.country;

  const onSubmit = async (data) => {
    setCheckoutError(null);
    try {
      const result = await createOrder({
        address: data.address,
        city: data.city,
        country: data.country,
        notes: data.notes || undefined,
        shipping_amount: 0,
      }).unwrap();
      const order = result?.data ?? result;
      if (order?.id) navigate(`/shop/orders/${order.id}`, { replace: true });
    } catch (err) {
      const message =
        err?.data?.message ??
        err?.message ??
        'Checkout failed. Please try again.';
      setCheckoutError(message);
    }
  };

  const items = cart?.items ?? [];
  const subtotal = cart?.subtotal ?? 0;
  const canCheckout = items.length > 0 && !cartLoading;

  return (
    <div className="min-h-screen bg-black">
      <Container className="!px-4 !py-0">
        <header className="-mx-4 -mt-6 flex items-center gap-3 bg-black px-4 pt-6 pb-6">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex h-[27px] w-[27px] shrink-0 items-center justify-center rounded-full bg-white text-[#4a4a4a] transition-opacity active:opacity-80"
            aria-label="Back"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="min-w-0 flex-1 pr-[27px] text-center text-[16px] font-bold tracking-wide text-white uppercase">
            BILLING DETAILS
          </h1>
        </header>

        {cartLoading ? null : !canCheckout ? (
          <div className="py-8 text-center">
            <p className="text-[14px] text-[#A2A6AB]">Your cart is empty.</p>
            <button
              type="button"
              onClick={() => navigate('/shop/cart')}
              className="mt-4 rounded-full bg-[#DA9811] px-6 py-3 text-[14px] font-bold text-black"
            >
              View cart
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 pt-2">
            <FormField label="Full Name" htmlFor="fullName" variant="checkout">
              <Input
                id="fullName"
                type="text"
                placeholder="Enter full name"
                autoComplete="name"
                readOnly={hasName}
                aria-readonly={hasName}
                className={hasName ? 'cursor-default opacity-90' : ''}
                {...register('fullName')}
              />
            </FormField>

            <FormField label="Phone" htmlFor="phone" variant="checkout">
              <Controller
                name="phone"
                control={control}
                render={({ field }) => (
                  <PhoneInput
                    id="phone"
                    placeholder="Enter phone number"
                    readOnly={hasPhone}
                    aria-readonly={hasPhone}
                    className={hasPhone ? 'cursor-default opacity-90' : ''}
                    {...field}
                  />
                )}
              />
            </FormField>

            <FormField label="Email Address" htmlFor="email" variant="checkout">
              <Input
                id="email"
                type="email"
                placeholder="Enter email address"
                autoComplete="email"
                readOnly={hasEmail}
                aria-readonly={hasEmail}
                className={hasEmail ? 'cursor-default opacity-90' : ''}
                {...register('email')}
              />
            </FormField>

            <FormField
              label="Delivery Address"
              htmlFor="address"
              variant="checkout"
            >
              <Input
                id="address"
                type="text"
                placeholder="Street address"
                autoComplete="street-address"
                {...register('address', { required: true })}
              />
            </FormField>

            <FormField label="City" htmlFor="city" variant="checkout">
              <Input
                id="city"
                type="text"
                placeholder="City"
                autoComplete="address-level2"
                readOnly={hasCity}
                aria-readonly={hasCity}
                className={hasCity ? 'cursor-default opacity-90' : ''}
                {...register('city', { required: true })}
              />
            </FormField>

            <FormField label="Country" htmlFor="country" variant="checkout">
              <Input
                id="country"
                type="text"
                placeholder="Country"
                autoComplete="country-name"
                readOnly={hasCountry}
                aria-readonly={hasCountry}
                className={hasCountry ? 'cursor-default opacity-90' : ''}
                {...register('country', { required: true })}
              />
            </FormField>

            <FormField
              label="Notes (optional)"
              htmlFor="notes"
              variant="checkout"
            >
              <Input
                id="notes"
                type="text"
                placeholder="Order notes"
                {...register('notes')}
              />
            </FormField>

            {checkoutError && (
              <p className="text-[14px] text-red-400" role="alert">
                {checkoutError}
              </p>
            )}

            <p className="text-[14px] text-[#A2A6AB]">
              Subtotal:{' '}
              <strong className="text-[#DA9811]">
                {formatPrice(subtotal)}
              </strong>{' '}
              ({items.length} item{items.length !== 1 ? 's' : ''})
            </p>

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-[#DA9811] py-3.5 text-[16px] font-bold text-black transition-opacity active:opacity-90 disabled:opacity-50"
            >
              {isSubmitting ? 'Placing order…' : 'Place order'}
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
          </form>
        )}
      </Container>
    </div>
  );
}
