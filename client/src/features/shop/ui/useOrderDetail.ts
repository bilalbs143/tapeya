import { useNavigate } from 'react-router-dom';

import { getApiErrorMessage } from '@/shared/api/errors';
import { confirm } from '@/shared/dialogs';
import { toast } from '@/shared/ui/toast';

import { useCancelShopOrderMutation, useGetShopOrderQuery } from '../api/shopApi';
import {
  ORDER_CANCEL_CONFIRM_MESSAGE,
  orderBuyerVendorBrief,
  orderCancelConfirmTitle,
  orderItemsHeading,
  orderNonCancelNote,
} from '../lib/orderDetail';
import { shopPaths } from '../lib/shopPaths';

/** Buyer order query + cancel confirm for OrderDetailPage. */
export function useOrderDetail(orderId: number | null) {
  const navigate = useNavigate();
  const valid = orderId != null;
  const orderQuery = useGetShopOrderQuery(orderId ?? 0, { skip: !valid });
  const { data: order, isLoading, isError, refetch } = orderQuery;
  const [cancelOrder, { isLoading: cancelling }] = useCancelShopOrderMutation();

  const vendor = order ? orderBuyerVendorBrief(order.vendorName, order.vendorPhone) : null;
  const itemsHeading = order ? orderItemsHeading(order.items.length) : '';
  const nonCancelNote = order ? orderNonCancelNote(order.paid) : '';

  async function onCancel() {
    if (!order) return;
    const ok = await confirm({
      title: orderCancelConfirmTitle(order.orderNumber),
      message: ORDER_CANCEL_CONFIRM_MESSAGE,
      confirmLabel: 'Cancel This Order',
      cancelLabel: 'Keep It',
      tone: 'danger',
    });
    if (!ok) return;
    try {
      await cancelOrder(order.id).unwrap();
      toast({ title: 'Order Cancelled', tone: 'success' });
    } catch (err) {
      toast({ title: getApiErrorMessage(err, 'Could not cancel order.'), tone: 'error' });
    }
  }

  function goOrders() {
    navigate(shopPaths.orders());
  }

  return {
    order,
    isLoading,
    isError,
    refetch,
    vendor,
    itemsHeading,
    nonCancelNote,
    cancelling,
    onCancel,
    goOrders,
  };
}
