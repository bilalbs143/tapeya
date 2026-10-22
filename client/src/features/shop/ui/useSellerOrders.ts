import { useNavigate } from 'react-router-dom';

import { useGetVendorOrdersQuery, useGetVendorStoreQuery } from '../api/vendorShopApi';
import { sellerOrdersCanEdit, sellerOrdersReadOnlyNote } from '../lib/sellerOrders';
import { shopPaths } from '../lib/shopPaths';
import { splitVendorOrders } from '../model/schemas';

/** Vendor orders list with current/previous split for SellerOrdersPage. */
export function useSellerOrders() {
  const navigate = useNavigate();
  const { data: store } = useGetVendorStoreQuery();
  const {
    data: orders = [],
    isLoading,
    isError,
    refetch,
  } = useGetVendorOrdersQuery({
    all: true,
  });
  const canEdit = sellerOrdersCanEdit(store?.status ?? '');
  const { current, previous } = splitVendorOrders(orders);
  const readOnlyNote = !canEdit && store?.status ? sellerOrdersReadOnlyNote(store.statusLabel) : null;

  function goSeller() {
    navigate(shopPaths.seller());
  }

  return {
    store,
    canEdit,
    readOnlyNote,
    current,
    previous,
    isLoading,
    isError,
    refetch,
    goSeller,
  };
}
