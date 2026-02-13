import { Controller, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';

import { Container } from '@/ui/Container';
import { FormField } from '@/ui/FormField';
import { Input } from '@/ui/Input';
import { PhoneInput } from '@/ui/PhoneInput';

export default function ShopCheckout() {
  const navigate = useNavigate();

  const { register, control, handleSubmit } = useForm({
    defaultValues: {
      fullName: 'Oneeb Arif',
      phone: '+923157118511',
      email: 'sohaib@gmail.com',
      deliveryAddress: '',
    },
  });

  const onSubmit = (data) => {
    console.log('Billing details', data);
    navigate('/order-detail');
  };

  return (
    <div className="min-h-screen bg-black">
      <Container className="!px-4 !py-0">
        {/* In-page header (same pattern as My Orders / Shop Cart) */}
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

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 pt-2">
          <FormField label="Full Name" htmlFor="fullName" variant="checkout">
            <Input
              id="fullName"
              type="text"
              placeholder="Enter full name"
              autoComplete="name"
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
              {...register('email')}
            />
          </FormField>

          <FormField
            label="Delivery Address"
            htmlFor="deliveryAddress"
            variant="checkout"
          >
            <Input
              id="deliveryAddress"
              type="text"
              placeholder="Please enter full address for delivery"
              autoComplete="street-address"
              {...register('deliveryAddress')}
            />
          </FormField>

          <button
            type="submit"
            className="flex w-full items-center justify-center gap-2 rounded-full bg-[#DA9811] py-3.5 text-[16px] font-bold text-black transition-opacity active:opacity-90"
          >
            Continue
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
      </Container>
    </div>
  );
}
