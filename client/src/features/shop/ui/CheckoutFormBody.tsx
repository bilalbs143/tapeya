import { Button } from '@/shared/ui/Button';
import { CountryCityFields } from '@/shared/ui/CountryCityFields';
import { FieldMessage } from '@/shared/ui/Field';
import { Form, FormSection } from '@/shared/ui/Form';
import { Input, Textarea } from '@/shared/ui/Input';
import { StickyActionBar } from '@/shared/ui/StickyActionBar';

import { formatPkr } from '../lib/money';
import { MoneyRows } from './MoneyRows';
import type { useCheckout } from './useCheckout';

type CheckoutFlow = ReturnType<typeof useCheckout>;

type CheckoutFormBodyProps = {
  flow: CheckoutFlow;
};

/** Delivery fields, order summary, and sticky Place Order. */
export function CheckoutFormBody({ flow }: CheckoutFormBodyProps) {
  const {
    me,
    address,
    city,
    country,
    notes,
    setNotes,
    errors,
    setAddressDraft,
    setCityDraft,
    setCountryDraft,
    clearAddressError,
    clearCityError,
    totals,
    placeLabel,
    placing,
    placeOrder,
  } = flow;

  return (
    <>
      <Form id="shop-checkout" density="compact" onSubmit={(e) => void placeOrder(e)} className="px-4 pt-3.5 pb-4">
        <FormSection title="Who & Where">
          <Input
            label="Full Name"
            value={me?.name ?? ''}
            readOnly
            hint="From your profile"
            className="bg-surface-raised h-12 rounded-field opacity-90"
            autoComplete="name"
          />

          <Input
            label="Phone"
            type="tel"
            value={me?.phone ?? ''}
            readOnly
            hint="From your profile"
            className="bg-surface-raised h-12 rounded-field opacity-90"
            autoComplete="tel"
          />

          <Input
            label="Email Address"
            type="email"
            value={me?.email ?? ''}
            readOnly
            hint="From your profile"
            className="bg-surface-raised h-12 rounded-field opacity-90"
            autoComplete="email"
          />

          <Textarea
            label="Address"
            required
            value={address}
            onChange={(e) => {
              setAddressDraft(e.target.value);
              clearAddressError();
            }}
            placeholder="Street Address"
            error={errors.address}
            className="min-h-20 rounded-field p-3 text-body-sm leading-normal"
          />

          <CountryCityFields
            country={country}
            city={city}
            required
            onCountryChange={(v) => {
              setCountryDraft(v);
              clearCityError();
            }}
            onCityChange={(v) => {
              setCityDraft(v);
              clearCityError();
            }}
            {...(errors.city ? { cityError: errors.city } : {})}
            layout="row"
            triggerClassName="h-12 rounded-field text-body-sm font-semibold"
          />

          <Input
            label="Notes (Optional)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Order Notes"
            className="h-12 rounded-field"
          />
        </FormSection>

        <section className="border-border-subtle bg-surface rounded-card border p-4">
          <h2 className="font-mono mb-3 text-2xs font-bold tracking-eyebrow text-ink uppercase">Order Summary</h2>
          <MoneyRows
            rows={[
              ['Subtotal', formatPkr(totals.subtotal)],
              ['Shipping', city ? formatPkr(totals.shipping) : 'Calculated on City'],
            ]}
            total={city ? formatPkr(totals.total) : `${formatPkr(totals.subtotal)} +`}
          />
        </section>

        <FieldMessage error={errors.address || errors.city} />
      </Form>

      <StickyActionBar>
        <Button
          type="submit"
          form="shop-checkout"
          size="lg"
          className="min-h-12 w-full rounded-field text-body-sm font-bold"
          loading={placing}
        >
          {placeLabel}
        </Button>
      </StickyActionBar>
    </>
  );
}
