import { type FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { getApiErrorMessage } from '@/shared/api/errors';
import { toast } from '@/shared/ui/toast';

import { useUpdateVendorOrderPaymentMutation, useUpdateVendorOrderStatusMutation } from '../api/vendorShopApi';
import {
  sellerOrderCommissionPct,
  sellerOrderShowsTracking,
  sellerOrderWhatsAppDigits,
} from '../lib/sellerOrderDetail';
import type { VendorOrder } from '../model/schemas';

type UseSellerOrderDetailArgs = {
  order: VendorOrder;
  storeApproved: boolean;
};

/** Status + tracking via POST …/status; payment via POST …/payment. */
export function useSellerOrderDetail({ order, storeApproved }: UseSellerOrderDetailArgs) {
  const navigate = useNavigate();
  const canEdit = storeApproved;
  const [updateStatus, statusState] = useUpdateVendorOrderStatusMutation();
  const [updatePayment, paymentState] = useUpdateVendorOrderPaymentMutation();

  const [status, setStatus] = useState(order.status);
  const [carrier, setCarrier] = useState(order.carrier ?? '');
  const [tracking, setTracking] = useState(order.trackingNumber ?? '');
  const [paymentStatus, setPaymentStatus] = useState(order.parent?.paymentStatus ?? 'unpaid');
  const [amountReceived, setAmountReceived] = useState(
    order.parent?.amountReceived != null ? String(order.parent.amountReceived) : ''
  );

  const showTracking = sellerOrderShowsTracking(status, order.trackingNumber, order.carrier);
  const paymentRefunded = order.parent?.paymentStatus === 'refunded';
  const canEditPayment = canEdit && !paymentRefunded;
  const canEditStatus = canEdit && !order.isTerminal;
  const busy = statusState.isLoading || paymentState.isLoading;
  const writable = canEditStatus || canEditPayment;
  const commissionPct = sellerOrderCommissionPct(order.commissionRate);
  const customer = order.customer;
  const wa = sellerOrderWhatsAppDigits(customer?.phone);

  async function onSave(e: FormEvent) {
    e.preventDefault();
    if (!writable || busy) return;

    try {
      if (canEditStatus) {
        const body: {
          status: string;
          tracking_number?: string | null;
          carrier?: string | null;
        } = { status };
        if (showTracking) {
          body.tracking_number = tracking.trim() || null;
          body.carrier = carrier.trim() || null;
        }
        await updateStatus({ id: order.id, ...body }).unwrap();
      }

      if (canEditPayment) {
        const amount = amountReceived === '' ? null : Number(amountReceived);
        await updatePayment({
          id: order.id,
          payment_status: paymentStatus,
          amount_received: amount != null && Number.isFinite(amount) ? amount : null,
        }).unwrap();
      }

      toast({ title: 'Order Saved', tone: 'success' });
    } catch (err) {
      toast({
        title: getApiErrorMessage(err, 'Could not update order.'),
        tone: 'error',
      });
    }
  }

  return {
    navigate,
    order,
    canEdit,
    status,
    setStatus,
    carrier,
    setCarrier,
    tracking,
    setTracking,
    paymentStatus,
    setPaymentStatus,
    amountReceived,
    setAmountReceived,
    showTracking,
    paymentRefunded,
    canEditPayment,
    canEditStatus,
    busy,
    writable,
    commissionPct,
    customer,
    wa,
    onSave,
  };
}
