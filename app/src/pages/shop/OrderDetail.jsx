import { memo, useEffect, useMemo } from 'react';

import { useNavigate, useParams } from 'react-router-dom';

import { AppSubpageHeader } from '@/components/AppSubpageHeader';
import { ShopContactCard } from '@/components/shop/ShopContactCard';
import { useToast } from '@/hooks/useToast';
import { getApiErrorMessage } from '@/lib/apiErrors';
import { formatPrice } from '@/lib/format';
import { formatDate } from '@/lib/utils/dateUtils';
import { useCancelOrderMutation, useGetOrderQuery } from '@/store/api/shopApi';
import { Container } from '@/ui/Container';

const OrderItemCard = memo(function OrderItemCard({ item, vendorOrderStatus, vendorOrderUpdatedAt }) {
  const snapshot = item.product_snapshot ?? {};
  const name = snapshot.name ?? 'Product';
  const edition = snapshot.edition ?? snapshot.variant ?? '';
  const unitPrice = item.unit_price ?? 0;
  const quantity = item.quantity ?? 1;
  const imageUrl = snapshot.image_url;

  const isDelivered = vendorOrderStatus === 'delivered';
  const deliveryLabel = isDelivered ? `Delivered on ${formatDate(vendorOrderUpdatedAt) || '—'}` : 'Pending';

  return (
    <div className="bg-surface flex gap-3 rounded-[17px] p-4">
      <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-white">
        {imageUrl ? (
          <img src={imageUrl} alt="" className="h-full w-full object-contain" />
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
        <p className="text-[14px] font-bold text-white">{name}</p>
        {edition && <p className="text-[13px] font-normal text-white">{edition}</p>}
        <p className="text-[14px] font-bold text-white">
          <span className="text-brand">{formatPrice(unitPrice)}</span>
          <span className="font-bold text-white"> x {quantity}</span>
        </p>
        <p className={`flex items-center gap-1.5 text-[12px] font-normal ${isDelivered ? 'text-[#86EFAC]' : 'text-muted'}`}>
          {isDelivered && (
            <svg
              className="h-3.5 w-3.5 shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M5 13l4 4L19 7" />
            </svg>
          )}
          {deliveryLabel}
        </p>
      </div>
    </div>
  );
});

export default function OrderDetail() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [cancelOrder, { isLoading: isCancelling }] = useCancelOrderMutation();
  const {
    data: order,
    isLoading,
    isError,
  } = useGetOrderQuery(orderId, {
    skip: !orderId,
  });

  useEffect(() => {
    if (!orderId) navigate('/shop/orders', { replace: true });
  }, [orderId, navigate]);

  const vendorOrdersById = useMemo(() => {
    const map = new Map();
    for (const vo of order?.vendor_orders ?? []) {
      map.set(vo.id, vo);
    }
    return map;
  }, [order?.vendor_orders]);

  const itemGroups = useMemo(() => {
    const items = order?.items ?? [];
    if (items.length === 0) return [];

    const vendorOrders = order?.vendor_orders ?? [];
    if (vendorOrders.length > 0) {
      const grouped = vendorOrders.map((vo) => ({
        key: vo.id,
        header: vo.vendor?.store_name || vo.vendor_order_number || `Vendor Order #${vo.id}`,
        vendorOrder: vo,
        items: items.filter((item) => item.vendor_order_id === vo.id),
      }));
      const orphanItems = items.filter((item) => !item.vendor_order_id || !vendorOrdersById.has(item.vendor_order_id));
      if (orphanItems.length > 0) {
        grouped.push({ key: 'other', header: null, vendorOrder: null, items: orphanItems });
      }
      return grouped.filter((g) => g.items.length > 0);
    }

    return [{ key: 'all', header: null, vendorOrder: null, items }];
  }, [order?.items, order?.vendor_orders, vendorOrdersById]);

  if (!orderId) return null;

  if (isLoading) {
    return (
      <div className="bg-black">
        <AppSubpageHeader title="ORDER DETAIL" />
        <Container>
          <div className="flex min-h-[40vh] items-center justify-center py-12">
            <p className="text-muted text-[14px]">Loading order…</p>
          </div>
        </Container>
      </div>
    );
  }

  if (isError || !order) {
    return (
      <div className="bg-black">
        <AppSubpageHeader title="ORDER DETAIL" />
        <Container>
          <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4 py-12">
            <p className="text-muted text-[14px]">Order not found.</p>
            <button
              type="button"
              onClick={() => navigate('/shop/orders')}
              className="bg-brand rounded-full px-6 py-2.5 text-[14px] font-bold text-black"
            >
              My Orders
            </button>
          </div>
        </Container>
      </div>
    );
  }

  const orderNumber = order.order_number ?? orderId;
  const subtotal = order.subtotal;
  const shipping = order.shipping_amount;
  const discount = order.discount_amount;
  const total = order.total;
  const paymentStatus = order.payment_status;
  const paymentStatusLabel = order.payment_status_label;
  const hasRecordedPayment = paymentStatus === 'paid' || paymentStatus === 'advance';

  const vendorOrdersList = order.vendor_orders ?? [];
  const allVendorOrdersPending = vendorOrdersList.length > 0 && vendorOrdersList.every((vo) => vo.status === 'pending');
  const canCancel = order.status !== 'cancelled' && !hasRecordedPayment && (allVendorOrdersPending || order.status === 'pending');

  const onCancel = async () => {
    if (!canCancel || !window.confirm('Cancel this order? Stock will be restored.')) return;
    try {
      await cancelOrder(order.id).unwrap();
      toast.success('Order cancelled');
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Could not cancel order.'));
    }
  };

  return (
    <div className="bg-black">
      <AppSubpageHeader title="ORDER DETAIL" />
      <Container>
        <div className="pb-8">
          <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
            <p className="text-brand text-[16px] font-bold tracking-wide uppercase">
              ORDER NUMBER: <span className="text-brand font-bold uppercase">{orderNumber}</span>
            </p>
            {paymentStatusLabel && (
              <p className="text-muted text-[12px] font-normal">
                {hasRecordedPayment ? `Payment: ${paymentStatusLabel}` : paymentStatusLabel}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-5">
            {itemGroups.length === 0 ? (
              <p className="text-muted text-[13px]">No items in this order.</p>
            ) : (
              itemGroups.map((group) => (
                <section key={group.key} className="space-y-3">
                  {group.vendorOrder?.vendor?.store_name ? (
                    <ShopContactCard
                      name={group.vendorOrder.vendor.store_name}
                      phone={group.vendorOrder.vendor.phone}
                      href={group.vendorOrder.vendor.slug ? `/shop/vendors/${group.vendorOrder.vendor.slug}` : undefined}
                    />
                  ) : group.header ? (
                    <h2 className="px-0.5 text-[13px] font-bold tracking-wide text-white uppercase">{group.header}</h2>
                  ) : null}
                  {group.items.map((item) => {
                    const vo = group.vendorOrder ?? vendorOrdersById.get(item.vendor_order_id);
                    return (
                      <OrderItemCard
                        key={item.id}
                        item={item}
                        vendorOrderStatus={vo?.status}
                        vendorOrderUpdatedAt={vo?.updated_at}
                      />
                    );
                  })}
                </section>
              ))
            )}
          </div>

          <div className="bg-surface mt-3 space-y-2 rounded-2xl p-4">
            <div className="flex justify-between text-[14px]">
              <span className="text-white">Subtotal:</span>
              <span className="font-bold text-white">{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between text-[14px]">
              <span className="text-white">Shipping:</span>
              <span className="font-bold text-white">{formatPrice(shipping)}</span>
            </div>
            <div className="flex justify-between text-[14px]">
              <span className="text-white">Discount:</span>
              <span className="font-bold text-white">{formatPrice(discount)}</span>
            </div>
          </div>

          <div className="bg-surface mt-3 flex items-center justify-between gap-4 rounded-xl p-4">
            <div>
              <p className="text-[16px] font-semibold text-white">Grand Total:</p>
              <p className="text-brand mt-1 text-[20px] font-bold">{formatPrice(total)}</p>
            </div>
            <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
              {canCancel && (
                <button
                  type="button"
                  disabled={isCancelling}
                  onClick={onCancel}
                  className="rounded-[6px] border border-red-500/40 bg-red-950/30 px-6 py-3.5 text-[16px] font-semibold text-red-300 transition-opacity active:opacity-90 disabled:opacity-50"
                >
                  {isCancelling ? 'Cancelling…' : 'Cancel Order'}
                </button>
              )}
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
