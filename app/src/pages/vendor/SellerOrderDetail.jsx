import { useEffect, useState } from 'react';

import { useNavigate, useParams } from 'react-router-dom';

import { AppSubpageHeader } from '@/components/AppSubpageHeader';
import { ShopContactCard } from '@/components/shop/ShopContactCard';
import { useToast } from '@/hooks/useToast';
import { getApiErrorMessage } from '@/lib/apiErrors';
import { FORM_FIELD_LABEL_CLASS } from '@/lib/constants/formLayout';
import { formatPrice } from '@/lib/format';
import { formatDate } from '@/lib/utils/dateUtils';
import {
  useGetVendorOrderQuery,
  useGetVendorStoreQuery,
  useUpdateVendorOrderPaymentMutation,
  useUpdateVendorOrderStatusMutation,
} from '@/store/api/vendorShopApi';
import { Button } from '@/ui/Button';
import { Container } from '@/ui/Container';
import { FormActions } from '@/ui/form/FormActions';
import { FormStack } from '@/ui/form/FormStack';
import { FormField } from '@/ui/FormField';
import { Input } from '@/ui/Input';
import { Label } from '@/ui/Label';
import { PageLoader } from '@/ui/Loader';
import {
  Select,
  SelectContent,
  selectContentInputClass,
  SelectItem,
  selectItemInputClass,
  SelectTrigger,
  selectTriggerInputClass,
  SelectValue,
  selectViewportInputClass,
} from '@/ui/Select';

import { OrderStatusPill } from './OrderStatusPill';

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending' },
  { value: 'processing', label: 'Processing' },
  { value: 'dispatched', label: 'Dispatched' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
];

const PAYMENT_STATUS_OPTIONS = [
  { value: 'unpaid', label: 'Unpaid' },
  { value: 'advance', label: 'Advance' },
  { value: 'paid', label: 'Paid' },
];

function orderItems(order) {
  const raw = order?.items;
  if (Array.isArray(raw)) return raw;
  if (Array.isArray(raw?.data)) return raw.data;
  return [];
}

function OrderLineItem({ item }) {
  const snapshot = item.product_snapshot ?? {};
  const name = snapshot.name ?? 'Product';
  const sku = snapshot.sku ?? snapshot.edition ?? snapshot.variant ?? '';
  const imageUrl = snapshot.image_url;
  const quantity = item.quantity ?? 1;
  const unitPrice = item.unit_price ?? 0;
  const totalPrice = item.total_price ?? unitPrice * quantity;

  return (
    <li className="bg-surface flex items-center gap-3 rounded-[17px] p-3 sm:gap-4 sm:p-4">
      <div className="h-[72px] w-[72px] shrink-0 overflow-hidden rounded-[12px] bg-white sm:h-20 sm:w-20">
        {imageUrl ? (
          <img src={imageUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          <div
            className="bg-surface-border text-brand flex h-full w-full items-center justify-center text-[20px] font-bold"
            aria-hidden
          >
            {name.charAt(0).toUpperCase() || '#'}
          </div>
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col justify-center gap-0.5">
        <p className="truncate text-[14px] leading-snug font-bold text-white sm:text-[15px]">{name}</p>
        {sku ? <p className="text-muted truncate text-[12px] leading-snug">{sku}</p> : null}
        <p className="mt-0.5 flex flex-wrap items-center gap-x-1.5 text-[13px] leading-snug">
          <span className="text-brand font-bold">{formatPrice(unitPrice)}</span>
          <span className="text-white/35" aria-hidden>
            •
          </span>
          <span className="font-medium text-white">Qty: {quantity}</span>
        </p>
      </div>

      <span className="shrink-0 rounded-[10px] bg-[#2A2A2A] px-2.5 py-1.5 text-[12px] font-bold whitespace-nowrap text-white sm:px-3 sm:text-[13px]">
        {formatPrice(totalPrice)}
      </span>
    </li>
  );
}

function DetailRow({ label, value, valueClassName = 'text-white' }) {
  if (value == null || value === '') return null;
  return (
    <div className="flex justify-between gap-3 text-[13px]">
      <dt className="text-muted shrink-0">{label}</dt>
      <dd className={`text-right font-medium ${valueClassName}`}>{value}</dd>
    </div>
  );
}

export default function SellerOrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { data: store } = useGetVendorStoreQuery();
  const { data: order, isLoading, isError, refetch } = useGetVendorOrderQuery(id, { skip: !id });
  const [updateStatus, { isLoading: isSaving }] = useUpdateVendorOrderStatusMutation();
  const [updatePayment, { isLoading: isSavingPayment }] = useUpdateVendorOrderPaymentMutation();

  const canEdit = store?.status === 'approved';
  const items = orderItems(order);
  const parent = order?.order;

  const [status, setStatus] = useState('pending');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [carrier, setCarrier] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('unpaid');
  const [amountReceived, setAmountReceived] = useState('');

  useEffect(() => {
    if (!id) navigate('/seller/orders', { replace: true });
  }, [id, navigate]);

  useEffect(() => {
    if (!order) return;
    setStatus(order.status ?? 'pending');
    setTrackingNumber(order.tracking_number ?? '');
    setCarrier(order.carrier ?? '');
    setPaymentStatus(order.order?.payment_status ?? 'unpaid');
    setAmountReceived(order.order?.amount_received != null ? String(order.order.amount_received) : '');
  }, [order]);

  const showTracking = status === 'dispatched' || status === 'delivered' || Boolean(trackingNumber || carrier);
  const isTerminal = order?.status === 'cancelled' || order?.status === 'delivered';

  const onSave = async () => {
    if (!canEdit || !order || isTerminal) return;
    try {
      const body = { status };
      if (showTracking) {
        body.tracking_number = trackingNumber.trim() || null;
        body.carrier = carrier.trim() || null;
      }
      await updateStatus({ id: order.id, ...body }).unwrap();
      toast.success('Order updated');
      refetch();
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Could not update order.'));
    }
  };

  const paymentIsRefunded = parent?.payment_status === 'refunded';
  const canEditPayment = canEdit && !paymentIsRefunded;

  const onSavePayment = async () => {
    if (!canEditPayment || !order) return;
    try {
      const amount = amountReceived === '' || amountReceived == null ? null : Number(amountReceived);
      await updatePayment({
        id: order.id,
        payment_status: paymentStatus,
        amount_received: Number.isFinite(amount) ? amount : null,
      }).unwrap();
      toast.success('Payment updated');
      refetch();
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Could not update payment.'));
    }
  };

  if (!id) return null;

  if (isLoading) {
    return (
      <div className="bg-black">
        <AppSubpageHeader sticky title="ORDER" onBack={() => navigate('/seller/orders')} />
        <Container>
          <PageLoader label="Loading order" className="min-h-[30vh] py-12" />
        </Container>
      </div>
    );
  }

  if (isError || !order) {
    return (
      <div className="bg-black">
        <AppSubpageHeader sticky title="ORDER" onBack={() => navigate('/seller/orders')} />
        <Container>
          <div className="flex min-h-[30vh] flex-col items-center justify-center gap-3">
            <p className="text-muted text-[14px]">Could not load this order.</p>
            <Button type="button" variant="orange" className="px-6 py-2.5 text-[14px]" onClick={() => refetch()}>
              Retry
            </Button>
          </div>
        </Container>
      </div>
    );
  }

  const shipTo = [parent?.address, parent?.city, parent?.country].filter(Boolean).join(', ');

  return (
    <div className="bg-black">
      <AppSubpageHeader sticky title="ORDER" onBack={() => navigate('/seller/orders')} />
      <Container className="pb-8">
        <div className="flex flex-col gap-5">
          <section className="bg-surface flex flex-col rounded-[17px] p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="truncate text-[16px] font-bold tracking-wide text-white">
                  {order.vendor_order_number ?? `#${order.id}`}
                </p>
                <p className="text-muted mt-1 text-[12px] leading-snug">
                  {[formatDate(order.created_at) || null, parent?.order_number ? `Parent - ${parent.order_number}` : null]
                    .filter(Boolean)
                    .join(' • ')}
                </p>
              </div>
              <OrderStatusPill status={order.status} statusLabel={order.status_label} className="shrink-0" />
            </div>

            <div className="my-4 border-t border-[#FFFFFF14]" />

            <dl className="grid grid-cols-1 gap-3">
              <div className="flex justify-between gap-3 text-[13px]">
                <dt className="shrink-0 text-white">Ship To</dt>
                <dd className="text-right font-medium text-white">{shipTo || '—'}</dd>
              </div>
              <div className="flex justify-between gap-3 text-[13px]">
                <dt className="shrink-0 text-white">Payment</dt>
                <dd className="text-brand text-right font-bold">
                  {parent?.payment_status_label ?? parent?.payment_status ?? '—'}
                </dd>
              </div>
              <div className="flex justify-between gap-3 text-[13px]">
                <dt className="shrink-0 text-white">Amount Received</dt>
                <dd className="text-right font-medium text-white">
                  {parent?.amount_received != null ? formatPrice(parent.amount_received) : '—'}
                </dd>
              </div>
              <div className="flex justify-between gap-3 text-[13px]">
                <dt className="shrink-0 text-white">Ordered On</dt>
                <dd className="text-right font-medium text-white">{formatDate(parent?.placed_at ?? order.created_at) || '—'}</dd>
              </div>
              {parent?.notes ? (
                <div className="flex justify-between gap-3 text-[13px]">
                  <dt className="shrink-0 text-white">Buyer Notes</dt>
                  <dd className="text-right font-medium text-white">{parent.notes}</dd>
                </div>
              ) : null}
              {(order.carrier || order.tracking_number) && !canEdit ? (
                <>
                  {order.carrier ? (
                    <div className="flex justify-between gap-3 text-[13px]">
                      <dt className="shrink-0 text-white">Carrier</dt>
                      <dd className="text-right font-medium text-white">{order.carrier}</dd>
                    </div>
                  ) : null}
                  {order.tracking_number ? (
                    <div className="flex justify-between gap-3 text-[13px]">
                      <dt className="shrink-0 text-white">Tracking</dt>
                      <dd className="text-right font-medium text-white">{order.tracking_number}</dd>
                    </div>
                  ) : null}
                </>
              ) : null}
            </dl>
          </section>

          {order.customer ? (
            <section className="flex flex-col gap-2">
              <Label className={FORM_FIELD_LABEL_CLASS}>Customer</Label>
              <ShopContactCard name={order.customer.name} phone={order.customer.phone} />
            </section>
          ) : null}

          <section className="flex flex-col gap-2">
            <Label className={FORM_FIELD_LABEL_CLASS}>Products</Label>
            {items.length > 0 ? (
              <ul className="flex flex-col gap-3">
                {items.map((item) => (
                  <OrderLineItem key={item.id ?? `${item.product_id}-${item.quantity}`} item={item} />
                ))}
              </ul>
            ) : (
              <p className="text-muted text-[13px]">No products on this order.</p>
            )}
          </section>

          <section className="flex flex-col gap-2">
            <Label className={FORM_FIELD_LABEL_CLASS}>Order Summary</Label>
            <div className="bg-surface flex flex-col rounded-[17px] p-4">
              <dl className="grid grid-cols-1 gap-2">
                <DetailRow label="Subtotal" value={formatPrice(order.subtotal)} />
                <DetailRow label="Shipping" value={formatPrice(order.shipping_amount)} />
                <DetailRow label="Commission" value={formatPrice(order.commission_amount)} />
                <DetailRow
                  label="Your Earnings"
                  value={formatPrice(order.vendor_earnings)}
                  valueClassName="text-brand font-bold"
                />
                <div className="my-1 border-t border-[#FFFFFF14]" />
                <div className="flex items-center justify-between gap-3 pt-1 text-[14px]">
                  <dt className="font-bold text-white">Order Total</dt>
                  <dd className="text-brand text-right text-[16px] font-bold">{formatPrice(order.total)}</dd>
                </div>
              </dl>
            </div>
          </section>

          {canEditPayment ? (
            <FormStack
              as="form"
              density="default"
              className="pb-2"
              onSubmit={(e) => {
                e.preventDefault();
                onSavePayment();
              }}
            >
              <div className="grid grid-cols-2 gap-x-4 gap-y-6">
                <FormField label="Amount Received" htmlFor="amount-received">
                  <Input
                    id="amount-received"
                    type="number"
                    min="0"
                    step="1"
                    value={amountReceived}
                    onChange={(e) => setAmountReceived(e.target.value)}
                    placeholder={parent?.total != null ? String(parent.total) : '0'}
                  />
                </FormField>
                <FormField label="Payment Status" htmlFor="payment-status" required>
                  <Select value={paymentStatus} onValueChange={setPaymentStatus}>
                    <SelectTrigger id="payment-status" className={selectTriggerInputClass}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent
                      className={selectContentInputClass}
                      viewportClassName={selectViewportInputClass}
                      position="popper"
                    >
                      {PAYMENT_STATUS_OPTIONS.map((opt) => (
                        <SelectItem
                          key={opt.value}
                          value={opt.value}
                          className={selectItemInputClass}
                          textClassName="!text-white"
                          indicatorClassName="!text-white"
                        >
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormField>
              </div>
              <FormActions align="stack">
                <Button type="submit" variant="auth" className="w-full" disabled={isSavingPayment} loading={isSavingPayment}>
                  {isSavingPayment ? 'Saving…' : 'Save Payment'}
                </Button>
              </FormActions>
            </FormStack>
          ) : null}

          {canEdit && !isTerminal ? (
            <FormStack
              as="form"
              density="default"
              className="pb-2"
              onSubmit={(e) => {
                e.preventDefault();
                onSave();
              }}
            >
              <FormField label="Status" htmlFor="order-status" required>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger id="order-status" className={selectTriggerInputClass}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent
                    className={selectContentInputClass}
                    viewportClassName={selectViewportInputClass}
                    position="popper"
                  >
                    {STATUS_OPTIONS.map((opt) => (
                      <SelectItem
                        key={opt.value}
                        value={opt.value}
                        className={selectItemInputClass}
                        textClassName="!text-white"
                        indicatorClassName="!text-white"
                      >
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>

              {showTracking ? (
                <>
                  <FormField label="Carrier" htmlFor="order-carrier">
                    <Input
                      id="order-carrier"
                      value={carrier}
                      onChange={(e) => setCarrier(e.target.value)}
                      placeholder="e.g. TCS, Leopards"
                    />
                  </FormField>
                  <FormField label="Tracking Number" htmlFor="order-tracking">
                    <Input
                      id="order-tracking"
                      value={trackingNumber}
                      onChange={(e) => setTrackingNumber(e.target.value)}
                      placeholder="Tracking #"
                    />
                  </FormField>
                </>
              ) : null}

              <FormActions align="stack">
                <Button type="submit" variant="auth" className="w-full" disabled={isSaving} loading={isSaving}>
                  {isSaving ? 'Saving…' : 'Update Order'}
                </Button>
              </FormActions>
            </FormStack>
          ) : null}

          {!canEdit && store?.status ? (
            <p className="text-muted text-[13px]">
              Updates are disabled while your account is {store.status_label ?? store.status}.
            </p>
          ) : null}
        </div>
      </Container>
    </div>
  );
}
