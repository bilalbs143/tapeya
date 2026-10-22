import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useGetVendorCategoriesQuery, useGetVendorStoreQuery } from '../api/vendorShopApi';
import { sellerCategoriesCanEdit, sellerCategoriesIntro, sellerCategoryNameById } from '../lib/sellerCategories';
import { shopPaths } from '../lib/shopPaths';
import type { ShopCategory } from '../model/schemas';

/** Vendor categories list + create/edit dialog state for SellerCategoriesPage. */
export function useSellerCategories() {
  const navigate = useNavigate();
  const { data: store } = useGetVendorStoreQuery();
  const { data: categories = [], isLoading, isError, refetch } = useGetVendorCategoriesQuery({ all: true });
  const canEdit = sellerCategoriesCanEdit(store?.status ?? '');
  const intro = sellerCategoriesIntro(canEdit, store?.statusLabel);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<ShopCategory | null>(null);

  const nameById = useMemo(() => sellerCategoryNameById(categories), [categories]);

  function openCreate() {
    setEditing(null);
    setDialogOpen(true);
  }

  function openEdit(category: ShopCategory) {
    setEditing(category);
    setDialogOpen(true);
  }

  function goSeller() {
    navigate(shopPaths.seller());
  }

  return {
    canEdit,
    intro,
    categories,
    nameById,
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
