import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useGetVendorBrandsQuery, useGetVendorStoreQuery } from '../api/vendorShopApi';
import { sellerBrandsCanEdit, sellerBrandsIntro } from '../lib/sellerBrands';
import { shopPaths } from '../lib/shopPaths';
import type { ShopBrand } from '../model/schemas';

/** Global brands catalog + create/edit dialog state for SellerBrandsPage. */
export function useSellerBrands() {
  const navigate = useNavigate();
  const { data: store } = useGetVendorStoreQuery();
  const { data: brands = [], isLoading, isError, refetch } = useGetVendorBrandsQuery({ all: true });
  const canEdit = sellerBrandsCanEdit(store?.status ?? '');
  const intro = sellerBrandsIntro(canEdit, store?.statusLabel);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<ShopBrand | null>(null);

  function openCreate() {
    setEditing(null);
    setDialogOpen(true);
  }

  function openEdit(brand: ShopBrand) {
    setEditing(brand);
    setDialogOpen(true);
  }

  function goSeller() {
    navigate(shopPaths.seller());
  }

  return {
    canEdit,
    intro,
    brands,
    isLoading,
    isError,
    refetch,
    dialogOpen,
    setDialogOpen,
    editing,
    openCreate,
    openEdit,
    goSeller,
  };
}
