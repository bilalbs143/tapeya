import { useEffect } from 'react';

import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';

import { AppSubpageHeader } from '@/components/AppSubpageHeader';
import { useToast } from '@/hooks/useToast';
import { getApiErrorMessage } from '@/lib/apiErrors';
import { DEFAULT_COUNTRY } from '@/lib/constants/geo';
import { useGetVendorStoreQuery, useUpdateVendorStoreMutation } from '@/store/api/vendorShopApi';
import { Button } from '@/ui/Button';
import { Container } from '@/ui/Container';
import { CountryCityFields } from '@/ui/CountryCityFields';
import { FormActions } from '@/ui/form/FormActions';
import { FormStack } from '@/ui/form/FormStack';
import { FormField } from '@/ui/FormField';
import { Input } from '@/ui/Input';
import { Textarea } from '@/ui/Textarea';

const DEFAULT_VALUES = {
  store_name: '',
  description: '',
  phone: '',
  email: '',
  address: '',
  city: '',
  country: DEFAULT_COUNTRY,
  default_shipping_amount: '0',
};

export default function SellerStore() {
  const navigate = useNavigate();
  const toast = useToast();
  const { data: store, isLoading } = useGetVendorStoreQuery();
  const [updateStore, { isLoading: isSaving }] = useUpdateVendorStoreMutation();
  const canEdit = store?.status === 'approved';

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm({ defaultValues: DEFAULT_VALUES });

  const country = watch('country');
  const city = watch('city');

  useEffect(() => {
    register('country');
    register('city');
  }, [register]);

  useEffect(() => {
    if (!store) return;
    reset({
      store_name: store.store_name ?? '',
      description: store.description ?? '',
      phone: store.phone ?? '',
      email: store.email ?? '',
      address: store.address ?? '',
      city: store.city ?? '',
      country: store.country || DEFAULT_COUNTRY,
      default_shipping_amount: store.default_shipping_amount != null ? String(store.default_shipping_amount) : '0',
    });
  }, [store, reset]);

  const onSubmit = async (data) => {
    if (!canEdit) return;
    try {
      await updateStore({
        store_name: data.store_name.trim(),
        description: data.description?.trim() || null,
        phone: data.phone?.trim() || null,
        email: data.email?.trim() || null,
        address: data.address?.trim() || null,
        city: data.city?.trim() || null,
        country: data.country?.trim() || null,
        default_shipping_amount:
          data.default_shipping_amount !== '' && data.default_shipping_amount != null ? Number(data.default_shipping_amount) : 0,
      }).unwrap();
      toast.success('Store updated');
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Could not update store.'));
    }
  };

  if (isLoading && !store) {
    return (
      <div className="bg-black">
        <AppSubpageHeader sticky title="STORE SETTINGS" onBack={() => navigate('/seller')} />
        <Container>
          <div className="flex min-h-[30vh] items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/10 border-t-white/70" />
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div className="bg-black">
      <AppSubpageHeader sticky title="STORE SETTINGS" onBack={() => navigate('/seller')} />
      <Container className="pb-8">
        <p className="text-muted mb-4 text-[13px] leading-snug md:text-[14px]">
          {!canEdit
            ? `Store settings are read-only while your account is ${store?.status_label ?? store?.status ?? 'not approved'}.`
            : 'Update your public store profile and flat shipping amount.'}
        </p>

        <FormStack as="form" density="default" className="pb-10" onSubmit={handleSubmit(onSubmit)}>
          <FormField label="Store Name" htmlFor="store_name" required>
            <Input
              id="store_name"
              placeholder="Your Store Name"
              disabled={!canEdit}
              error={errors.store_name?.message}
              {...register('store_name', { required: 'Store name is required' })}
            />
          </FormField>

          <FormField label="Description" htmlFor="description">
            <Textarea
              id="description"
              rows={4}
              placeholder="Tell buyers about your store"
              disabled={!canEdit}
              {...register('description')}
            />
          </FormField>

          <FormField label="Phone" htmlFor="phone">
            <Input
              id="phone"
              type="tel"
              placeholder="+92 3xx xxxxxxx"
              inputMode="tel"
              disabled={!canEdit}
              {...register('phone')}
            />
          </FormField>

          <FormField label="Email" htmlFor="email">
            <Input id="email" type="email" placeholder="store@example.com" disabled={!canEdit} {...register('email')} />
          </FormField>

          <FormField label="Address" htmlFor="address">
            <Input id="address" placeholder="Street Address" disabled={!canEdit} {...register('address')} />
          </FormField>

          <CountryCityFields
            country={country ?? ''}
            city={city ?? ''}
            onCountryChange={(v) => setValue('country', v, { shouldDirty: true })}
            onCityChange={(v) => setValue('city', v, { shouldDirty: true })}
            readOnly={!canEdit}
          />

          <FormField label="Shipping (PKR)" htmlFor="default_shipping_amount">
            <Input
              id="default_shipping_amount"
              type="number"
              min="0"
              step="0.01"
              placeholder="0"
              disabled={!canEdit}
              error={errors.default_shipping_amount?.message}
              {...register('default_shipping_amount', {
                min: { value: 0, message: 'Must be 0 or greater' },
              })}
            />
          </FormField>
          {canEdit && (
            <FormActions align="stack">
              <Button type="submit" variant="auth" className="w-full" disabled={isSaving}>
                {isSaving ? 'Saving…' : 'Save Store'}
              </Button>
            </FormActions>
          )}
        </FormStack>
      </Container>
    </div>
  );
}
