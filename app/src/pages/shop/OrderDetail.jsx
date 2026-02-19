import { useNavigate, useParams } from 'react-router-dom';

import { formatDate, formatPrice } from '@/lib/format';
import { useGetOrderQuery } from '@/store/api/shopApi';
import { Container } from '@/ui/Container';

function OrderItemCard({ item, orderStatus, orderUpdatedAt }) {
  const snapshot = item.product_snapshot ?? {};
  const name = snapshot.name ?? 'Product';
  const edition = snapshot.edition ?? snapshot.variant ?? '';
  const unitPrice = item.unit_price ?? 0;
  const quantity = item.quantity ?? 1;
  const imageUrl = snapshot.image_url ?? snapshot.image ?? null;

  const isDelivered = orderStatus === 'delivered';
  const deliveryLabel = isDelivered
    ? `Delivered on ${formatDate(orderUpdatedAt) || '—'}`
    : 'Pending';

  return (
    <div className="flex gap-3 rounded-2xl bg-[#1A1A1A] p-4">
      <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-white">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt=""
            className="h-full w-full object-contain"
          />
        ) : (
          <div
            className="flex h-full w-full items-center justify-center bg-[#141412] text-[20px] font-bold text-[#DA9811]"
            aria-hidden
          >
            {name.charAt(0).toUpperCase() || '#'}
          </div>
        )}
      </div>
      <div className="flex min-w-0 flex-1 flex-col justify-center gap-0.5">
        <p className="text-[14px] font-bold text-white">{name}</p>
        {edition && (
          <p className="text-[13px] font-normal text-white">{edition}</p>
        )}
        <p className="text-[14px] font-bold text-white">
          <span className="text-[#DA9811]">{formatPrice(unitPrice)}</span>
          <span className="font-bold text-white"> x {quantity}</span>
        </p>
        <p
          className={`flex items-center gap-1.5 text-[12px] font-normal ${isDelivered ? 'text-[#86efac]' : 'text-[#A2A6AB]'}`}
        >
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
}

export default function OrderDetail() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const {
    data: order,
    isLoading,
    isError,
  } = useGetOrderQuery(orderId, {
    skip: !orderId,
  });

  if (!orderId) {
    navigate('/shop/orders', { replace: true });
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black">
        <Container className="!px-4 !py-0">
          <header className="-mx-4 -mt-6 flex items-center gap-3 bg-black px-4 pt-6 pb-6">
            <button
              type="button"
              onClick={() => navigate(-1)}
className="flex h-[27px] w-[27px] shrink-0 items-center justify-center rounded-full bg-white text-white transition-opacity active:opacity-80"
            aria-label="Back"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="min-w-0 flex-1 pr-[27px] text-center text-[16px] font-bold tracking-wide text-white uppercase">
            SELECTED ITEMS
          </h1>
        </header>
          <div className="flex min-h-[40vh] items-center justify-center py-12">
            <p className="text-[14px] text-[#A2A6AB]">Loading order…</p>
          </div>
        </Container>
      </div>
    );
  }

  if (isError || !order) {
    return (
      <div className="min-h-screen bg-black">
        <Container className="!px-4 !py-0">
          <header className="-mx-4 -mt-6 flex items-center gap-3 bg-black px-4 pt-6 pb-6">
            <button
              type="button"
              onClick={() => navigate(-1)}
className="flex h-[27px] w-[27px] shrink-0 items-center justify-center rounded-full bg-[#2a2a2a] text-white transition-opacity active:opacity-80"
            aria-label="Back"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="min-w-0 flex-1 pr-[27px] text-center text-[16px] font-bold tracking-wide text-white uppercase">
            SELECTED ITEMS
          </h1>
        </header>
          <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4 py-12">
            <p className="text-[14px] text-[#A2A6AB]">Order not found.</p>
            <button
              type="button"
              onClick={() => navigate('/shop/orders')}
              className="rounded-full bg-[#DA9811] px-6 py-2.5 text-[14px] font-bold text-black"
            >
              My orders
            </button>
          </div>
        </Container>
      </div>
    );
  }

  const orderNumber = order.order_number ?? orderId;
  const items = order.items ?? [];
  const subtotal = Number(order.subtotal) ?? 0;
  const shipping = Number(order.shipping_amount) ?? 0;
  const discount = Number(order.discount_amount) ?? 0;
  const total = Number(order.total) ?? 0;
  const status = order.status ?? '';
  const updatedAt = order.updated_at ?? order.created_at;
  const canPay = status === 'pending' || status === 'processing';

  return (
    <div className="min-h-screen bg-black">
      <Container className="!px-4 !py-0">
        <header className="-mx-4 -mt-6 flex items-center gap-3 bg-black px-4 pt-6 pb-6">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex h-[27px] w-[27px] shrink-0 items-center justify-center rounded-full bg-white text-black transition-opacity active:opacity-80"
            aria-label="Back"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="min-w-0 flex-1 pr-[27px] text-center text-[16px] font-bold tracking-wide text-white uppercase">
            SELECTED ITEMS
          </h1>
        </header>

        <div className="pb-8 pt-2">
          <p className="mb-4 text-[16px] font-bold uppercase tracking-wide text-[#DA9811]">
            ORDER NUMBER:{' '}
            <span className="font-bold uppercase text-[#DA9811]">
              {orderNumber}
            </span>
          </p>

          <div className="flex flex-col gap-3">
            {items.length === 0 ? (
              <p className="text-[13px] text-[#A2A6AB]">No items in this order.</p>
            ) : (
              items.map((item) => (
                <OrderItemCard
                  key={item.id}
                  item={item}
                  orderStatus={status}
                  orderUpdatedAt={updatedAt}
                />
              ))
            )}
          </div>

          <div className="mt-6 space-y-2 rounded-2xl bg-[#141412] p-4">
            <div className="flex justify-between text-[14px]">
              <span className="text-white">Subtotal:</span>
              <span className="font-bold text-white">
                {subtotal.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between text-[14px]">
              <span className="text-white">Shipping:</span>
              <span className="font-bold text-white">
                {shipping.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between text-[14px]">
              <span className="text-white">Discount:</span>
              <span className="font-bold text-white">
                {discount.toLocaleString()}
              </span>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between gap-4 rounded-xl bg-[#141412] p-4">
            <div>
              <p className="text-[16px] font-semibold text-white">
                Grand Total:
              </p>
              <p className="mt-1 text-[20px] font-bold text-[#DA9811]">
                {formatPrice(total)} {order.currency ?? 'PKR'}
              </p>
            </div>
            <button
              type="button"
              onClick={() =>
                canPay
                  ? navigate(`/shop/order-payment/${order.id}`)
                  : navigate(-1)
              }
              className="shrink-0 rounded-[6px] bg-[#DA9811] px-6 py-3.5 text-[16px] font-semibold text-black transition-opacity active:opacity-90"
            >
              Pay Now
            </button>
          </div>
        </div>
      </Container>
    </div>
  );
}
