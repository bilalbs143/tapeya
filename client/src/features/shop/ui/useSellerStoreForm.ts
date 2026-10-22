import { type FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { getApiErrorMessage } from '@/shared/api/errors';
import { DEFAULT_COUNTRY } from '@/shared/model/location';
import { toast } from '@/shared/ui/toast';

import { useUpdateVendorStoreMutation } from '../api/vendorShopApi';
import {
  parseSellerShippingAmount,
  sellerStoreCanEdit,
  type SellerStoreFieldErrors,
  sellerStoreIntro,
  sellerStoreSlugLine,
  validateSellerStoreName,
} from '../lib/sellerStore';
import { shopPaths } from '../lib/shopPaths';
import type { VendorStore } from '../model/schemas';

type UseSellerStoreFormArgs = {
  store: VendorStore;
};

/** Store profile drafts and PATCH when approved. */
export function useSellerStoreForm({ store }: UseSellerStoreFormArgs) {
  const navigate = useNavigate();
  const [updateStore, { isLoading: saving }] = useUpdateVendorStoreMutation();
  const canEdit = sellerStoreCanEdit(store.status);

  const [storeName, setStoreName] = useState(store.storeName);
  const [description, setDescription] = useState(store.description ?? '');
  const [phone, setPhone] = useState(store.phone ?? '');
  const [email, setEmail] = useState(store.email ?? '');
  const [address, setAddress] = useState(store.address ?? '');
  const [country, setCountry] = useState(store.country?.trim() || DEFAULT_COUNTRY);
  const [city, setCity] = useState(store.city ?? '');
  const [shipping, setShipping] = useState(String(store.defaultShippingAmount ?? 0));
  const [errors, setErrors] = useState<SellerStoreFieldErrors>({});

  const intro = sellerStoreIntro(canEdit, store.statusLabel);
  const slugLine = sellerStoreSlugLine(store.slug);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!canEdit) return;
    const next = validateSellerStoreName(storeName);
    if (Object.keys(next).length) {
      setErrors(next);
      return;
    }
    setErrors({});
    try {
      await updateStore({
        store_name: storeName.trim(),
        description: description.trim() || null,
        phone: phone.trim() || null,
        email: email.trim() || null,
        address: address.trim() || null,
        city: city.trim() || null,
        country: country.trim() || null,
        default_shipping_amount: parseSellerShippingAmount(shipping),
      }).unwrap();
      toast({ title: 'Store Updated', tone: 'success' });
    } catch (err) {
      toast({ title: getApiErrorMessage(err, 'Could not update store.'), tone: 'error' });
    }
  }

  function goSeller() {
    navigate(shopPaths.seller());
  }

  function clearStoreNameError() {
    setErrors({});
  }

  return {
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
    saving,
    onSubmit,
    goSeller,
  };
}
