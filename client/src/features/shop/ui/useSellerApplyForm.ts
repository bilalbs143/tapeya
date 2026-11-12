import { type FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { countryByCode, optionalNationalError, splitE164, toE164, useMeQuery } from '@/features/auth';

import { getApiErrorMessage } from '@/shared/api/errors';
import { DEFAULT_COUNTRY } from '@/shared/model/location';
import { toast } from '@/shared/ui/toast';

import { useApplyAsVendorMutation } from '../api/vendorShopApi';
import {
  omitSellerErrorKey,
  parseSellerShippingAmount,
  type SellerApplyFieldErrors,
  validateSellerStoreName,
} from '../lib/sellerApply';
import { shopPaths } from '../lib/shopPaths';

/** Apply-as-vendor form state and POST /shop/vendor/apply. */
export function useSellerApplyForm() {
  const navigate = useNavigate();
  const { data: me } = useMeQuery();
  const [apply, { isLoading }] = useApplyAsVendorMutation();

  const seeded = splitE164(me?.phone);
  const [storeName, setStoreName] = useState('');
  const [description, setDescription] = useState('');
  const [countryCode, setCountryCode] = useState(seeded.code);
  const [national, setNational] = useState(seeded.national);
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [country, setCountry] = useState(DEFAULT_COUNTRY);
  const [city, setCity] = useState('');
  const [shipping, setShipping] = useState('0');
  const [errors, setErrors] = useState<SellerApplyFieldErrors>({});

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const dial = countryByCode(countryCode).dial;
    const next: SellerApplyFieldErrors = { ...validateSellerStoreName(storeName) };
    const phoneError = optionalNationalError(national, countryCode);
    if (phoneError) next.phone = phoneError;
    if (Object.keys(next).length) {
      setErrors(next);
      return;
    }
    setErrors({});
    const phone = national.trim() ? toE164(dial, national) : undefined;
    try {
      await apply({
        store_name: storeName.trim(),
        description: description.trim() || undefined,
        phone,
        email: email.trim() || undefined,
        address: address.trim() || undefined,
        city: city.trim() || undefined,
        country: country.trim() || undefined,
        default_shipping_amount: parseSellerShippingAmount(shipping),
      }).unwrap();
      toast({ title: 'Application Submitted', tone: 'success' });
      navigate(shopPaths.seller(), { replace: true });
    } catch (err) {
      toast({ title: getApiErrorMessage(err, 'Could not submit seller application.'), tone: 'error' });
    }
  }

  function goHome() {
    navigate(shopPaths.home());
  }

  function clearStoreNameError() {
    setErrors((prev) => omitSellerErrorKey(prev, 'storeName'));
  }

  function clearPhoneError() {
    setErrors((prev) => omitSellerErrorKey(prev, 'phone'));
  }

  return {
    storeName,
    setStoreName,
    description,
    setDescription,
    countryCode,
    setCountryCode,
    national,
    setNational,
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
    clearPhoneError,
    isLoading,
    onSubmit,
    goHome,
  };
}
