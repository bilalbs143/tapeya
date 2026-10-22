import { ScreenBar } from '@/shared/layout';
import { Button } from '@/shared/ui/Button';
import { CountryCityFields } from '@/shared/ui/CountryCityFields';
import { Form, FormSection } from '@/shared/ui/Form';
import { Input, Textarea } from '@/shared/ui/Input';
import { StickyActionBar } from '@/shared/ui/StickyActionBar';

import { SELLER_APPLY_INTRO } from '../lib/sellerApply';
import type { useSellerApplyForm } from './useSellerApplyForm';

type SellerApplyFlow = ReturnType<typeof useSellerApplyForm>;

type SellerApplyFormBodyProps = {
  flow: SellerApplyFlow;
};

/** Become-a-seller fields + sticky Submit Application. */
export function SellerApplyFormBody({ flow }: SellerApplyFormBodyProps) {
  const {
    storeName,
    setStoreName,
    description,
    setDescription,
    phone,
    setPhone,
    email,
    setEmail,
    address,
    setAddress,
    country,
    setCountry,
    city,
    setCity,
    shipping,
    setShipping,
    errors,
    clearStoreNameError,
    isLoading,
    onSubmit,
    goHome,
  } = flow;

  return (
    <div className="bg-surface flex min-h-full flex-col">
      <ScreenBar title="Become a Seller" subtitle="Apply to Sell on Tapeya" onBack={goHome} />

      <Form id="seller-apply" density="compact" onSubmit={(e) => void onSubmit(e)} className="px-4 pt-4 pb-4">
        <p className="text-muted text-2xs leading-relaxed">{SELLER_APPLY_INTRO}</p>

        <FormSection title="Store Profile">
          <Input
            label="Store Name"
            value={storeName}
            onChange={(e) => {
              setStoreName(e.target.value);
              clearStoreNameError();
            }}
            error={errors.storeName}
            required
            placeholder="Sialkot Sports Co."
            className="h-12 rounded-field"
          />

          <Textarea
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Tell buyers what you sell"
            className="min-h-20 rounded-field p-3 text-body-sm"
          />

          <Input
            label="Phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+92 3xx xxxxxxx"
            className="h-12 rounded-field"
          />

          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="store@example.com"
            className="h-12 rounded-field"
          />

          <Input
            label="Address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Street Address"
            className="h-12 rounded-field"
          />

          <CountryCityFields
            country={country}
            city={city}
            onCountryChange={setCountry}
            onCityChange={setCity}
            layout="row"
            triggerClassName="h-12 rounded-field text-body-sm font-semibold"
          />

          <Input
            label="Default Shipping (PKR)"
            type="number"
            min={0}
            value={shipping}
            onChange={(e) => setShipping(e.target.value)}
            className="h-12 rounded-field"
          />
        </FormSection>
      </Form>

      <StickyActionBar>
        <Button
          type="submit"
          form="seller-apply"
          size="lg"
          className="min-h-12 w-full rounded-field text-body-sm font-bold"
          loading={isLoading}
        >
          Submit Application
        </Button>
      </StickyActionBar>
    </div>
  );
}
