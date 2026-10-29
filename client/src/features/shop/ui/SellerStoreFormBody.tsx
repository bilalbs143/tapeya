import { createContext, type FormEvent, type ReactNode, useContext } from 'react';

import { Button } from '@/shared/ui/Button';
import { CountryCityFields } from '@/shared/ui/CountryCityFields';
import { Form, FormSection } from '@/shared/ui/Form';
import { Input, Textarea } from '@/shared/ui/Input';
import { StickyActionBar } from '@/shared/ui/StickyActionBar';

import type { VendorStore } from '../model/schemas';
import { useSellerStoreForm } from './useSellerStoreForm';

type SellerStoreFormFlow = ReturnType<typeof useSellerStoreForm>;

const SellerStoreFormFlowContext = createContext<SellerStoreFormFlow | null>(null);

function useSellerStoreFormFlow(): SellerStoreFormFlow {
  const flow = useContext(SellerStoreFormFlowContext);
  if (!flow) {
    throw new Error('SellerStoreFormFlowProvider is required');
  }
  return flow;
}

type SellerStoreFormFlowProviderProps = {
  store: VendorStore;
  children: ReactNode;
};

/** Shares one form flow between DockScreen body and footer. */
export function SellerStoreFormFlowProvider({ store, children }: SellerStoreFormFlowProviderProps) {
  const flow = useSellerStoreForm({ store });
  return <SellerStoreFormFlowContext value={flow}>{children}</SellerStoreFormFlowContext>;
}

/** Sticky Save — page owns DockScreen. */
export function SellerStoreFormFooter() {
  const { canEdit, saving } = useSellerStoreFormFlow();
  if (!canEdit) return null;
  return (
    <StickyActionBar>
      <Button type="submit" form="seller-store" className="w-full font-bold" loading={saving}>
        Save Store
      </Button>
    </StickyActionBar>
  );
}

/** Store profile fields — page owns DockScreen. */
export function SellerStoreFormBody() {
  const {
    canEdit,
    intro,
    slugLine,
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
    onSubmit,
  } = useSellerStoreFormFlow();

  return (
    <Form id="seller-store" density="compact" onSubmit={(e: FormEvent) => void onSubmit(e)} className="px-4 pt-4 pb-4">
      <p className="text-muted text-2xs leading-relaxed">{intro}</p>

      <FormSection title="Store Profile">
        {slugLine ? <p className="text-dim font-mono text-3xs tracking-[.06em]">{slugLine}</p> : null}

        <Input
          label="Store Name"
          value={storeName}
          onChange={(e) => {
            setStoreName(e.target.value);
            clearStoreNameError();
          }}
          error={errors.storeName}
          required
          disabled={!canEdit}
          placeholder="Sialkot Sports Co."
          className="h-12 rounded-field"
        />

        <Textarea
          label="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={!canEdit}
          placeholder="Tell buyers what you sell"
          className="min-h-20 rounded-field p-3 text-body-sm"
        />

        <Input
          label="Phone"
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          disabled={!canEdit}
          placeholder="+92 3xx xxxxxxx"
          className="h-12 rounded-field"
        />

        <Input
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={!canEdit}
          placeholder="store@example.com"
          className="h-12 rounded-field"
        />

        <Input
          label="Address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          disabled={!canEdit}
          placeholder="Street Address"
          className="h-12 rounded-field"
        />

        <CountryCityFields
          country={country}
          city={city}
          onCountryChange={setCountry}
          onCityChange={setCity}
          readOnly={!canEdit}
          layout="row"
          triggerClassName="h-12 rounded-field text-body-sm font-semibold"
        />

        <Input
          label="Default Shipping (PKR)"
          type="number"
          min={0}
          value={shipping}
          onChange={(e) => setShipping(e.target.value)}
          disabled={!canEdit}
          className="h-12 rounded-field"
        />
      </FormSection>
    </Form>
  );
}
