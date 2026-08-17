import { useEffect } from 'react';

import { useForm } from 'react-hook-form';
import { Navigate, useNavigate } from 'react-router-dom';

import { AppSubpageHeader } from '@/components/AppSubpageHeader';
import { useToast } from '@/hooks/useToast';
import { getApiErrorMessage } from '@/lib/apiErrors';
import { DEFAULT_COUNTRY } from '@/lib/constants/geo';
import { userHasVendorAccess } from '@/lib/vendorAccess';
import { useGetMeQuery } from '@/store/api/authApi';
import { useApplyAsVendorMutation } from '@/store/api/vendorShopApi';
import { useAppSelector } from '@/store/hooks';
import { selectUser } from '@/store/selectors';
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

export default function SellerApply() {
  const navigate = useNavigate();
  const toast = useToast();
  const userFromStore = useAppSelector(selectUser);
  const {
    data: meResponse,
    isLoading: meLoading,
    refetch: refetchMe,
  } = useGetMeQuery(undefined, {
    skip: !userFromStore?.id,
  });
  const user = meResponse?.data ?? userFromStore;
  const [applyAsVendor, { isLoading: isSubmitting }] = useApplyAsVendorMutation();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm({ defaultValues: DEFAULT_VALUES });

  const country = watch('country');
  const city = watch('city');

  useEffect(() => {
    register('country');
    register('city');
  }, [register]);

  useEffect(() => {
    if (!user) return;
    reset({
      ...DEFAULT_VALUES,
      phone: user.phone ?? '',
      email: user.email ?? '',
      city: user.city ?? '',
      country: (user.country && String(user.country).trim()) || DEFAULT_COUNTRY,
    });
  }, [user, reset]);

  if (!meLoading && userHasVendorAccess(user)) {
    return <Navigate to="/seller" replace />;
  }

  if (!meLoading && user?.vendor != null) {
    return <Navigate to="/profile" replace />;
  }

  const onSubmit = async (data) => {
    try {
      await applyAsVendor({
        store_name: data.store_name.trim(),
        description: data.description?.trim() || undefined,
        phone: data.phone?.trim() || undefined,
        email: data.email?.trim() || undefined,
        address: data.address?.trim() || undefined,
        city: data.city?.trim() || undefined,
        country: data.country?.trim() || undefined,
        default_shipping_amount:
          data.default_shipping_amount !== '' && data.default_shipping_amount != null ? Number(data.default_shipping_amount) : 0,
      }).unwrap();
      await refetchMe();
      toast.success('Application submitted');
      navigate('/seller', { replace: true });
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Could not submit seller application.'));
    }
  };

  return (
    <div className="bg-black">
      <AppSubpageHeader sticky title="BECOME A SELLER" onBack={() => navigate('/profile')} />
      <Container className="pb-8">
        <p className="text-muted mb-4 text-[13px] leading-snug md:text-[14px]">
          Tell us about your store. Applications are reviewed before you can publish products.
        </p>

        <FormStack as="form" density="default" className="pb-10" onSubmit={handleSubmit(onSubmit)}>
          <FormField label="Store Name" htmlFor="store_name" required>
            <Input
              id="store_name"
              error={errors.store_name?.message}
              placeholder="Your Store Name"
              {...register('store_name', { required: 'Store name is required' })}
            />
          </FormField>

          <FormField label="Description" htmlFor="description">
            <Textarea id="description" rows={4} placeholder="Tell us about your store" {...register('description')} />
          </FormField>

          <FormField label="Phone" htmlFor="phone">
            <Input id="phone" type="tel" placeholder="+92 3xx xxxxxxx" inputMode="tel" {...register('phone')} />
          </FormField>

          <FormField label="Email" htmlFor="email">
            <Input id="email" type="email" placeholder="store@example.com" {...register('email')} />
          </FormField>

          <FormField label="Address" htmlFor="address">
            <Input id="address" placeholder="Street Address" {...register('address')} />
          </FormField>

          <CountryCityFields
            country={country ?? ''}
            city={city ?? ''}
            onCountryChange={(v) => setValue('country', v, { shouldDirty: true })}
            onCityChange={(v) => setValue('city', v, { shouldDirty: true })}
          />

          <FormField label="Shipping (PKR)" htmlFor="default_shipping_amount">
            <Input
              id="default_shipping_amount"
              type="number"
              min="0"
              step="0.01"
              error={errors.default_shipping_amount?.message}
              {...register('default_shipping_amount', {
                min: { value: 0, message: 'Must be 0 or greater' },
              })}
            />
          </FormField>
          <FormActions align="stack">
            <Button type="submit" variant="auth" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Submitting…' : 'Submit Application'}
            </Button>
          </FormActions>
        </FormStack>
      </Container>
    </div>
  );
}
