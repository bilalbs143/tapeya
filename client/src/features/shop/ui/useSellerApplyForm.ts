import { type FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useMeQuery } from '@/features/auth';

import { getApiErrorMessage } from '@/shared/api/errors';
import { DEFAULT_COUNTRY } from '@/shared/model/location';
import { toast } from '@/shared/ui/toast';

import { useApplyAsVendorMutation } from '../api/vendorShopApi';
import { parseSellerShippingAmount, type SellerApplyFieldErrors, validateSellerStoreName } from '../lib/sellerApply';
import { shopPaths } from '../lib/shopPaths';

/** Apply-as-vendor form state and POST /shop/vendor/apply. */
export function useSellerApplyForm() {
  const navigate = useNavigate();
  const { data: me } = useMeQuery();
  const [apply, { isLoading }] = useApplyAsVendorMutation();

  const [storeName, setStoreName] = useState('');
  const [description, setDescription] = useState('');
  const [phone, setPhone] = useState(() => me?.phone ?? '');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [country, setCountry] = useState(DEFAULT_COUNTRY);
  const [city, setCity] = useState('');
  const [shipping, setShipping] = useState('0');
  const [errors, setErrors] = useState<SellerApplyFieldErrors>({});

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const next = validateSellerStoreName(storeName);
    if (Object.keys(next).length) {
      setErrors(next);
      return;
    }
    setErrors({});
    try {
      await apply({
        store_name: storeName.trim(),
        description: description.trim() || undefined,
        phone: phone.trim() || undefined,
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
    setErrors({});
  }

  return {
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
  };
}
