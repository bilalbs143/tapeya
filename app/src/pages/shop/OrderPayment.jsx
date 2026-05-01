import { useEffect } from 'react';

import { useNavigate, useParams } from 'react-router-dom';

import { AppSubpageHeader } from '@/components/AppSubpageHeader';
import { formatPrice } from '@/lib/format';
import { useGetOrderQuery } from '@/store/api/shopApi';
import { Container } from '@/ui/Container';

const WHATSAPP = '+923001238832';
const BANK_NAME = 'NayaPay';
const IBAN = '0339 0003609';
const ACCOUNT_TITLE = 'Oneeb Arif';

export default function OrderPayment() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const {
    data: order,
    isLoading,
    isError,
  } = useGetOrderQuery(orderId, {
    skip: !orderId,
  });

  const orderNumber = order?.order_number ?? orderId;

  useEffect(() => {
    if (!orderId) navigate('/shop/orders', { replace: true });
  }, [orderId, navigate]);

  if (!orderId) return null;

  if (isLoading) return null;

  if (isError || !order) {
    return (
      <div className="bg-black">
        <AppSubpageHeader title="ORDER PAYMENT" onBack={() => navigate('/shop/orders')} />
        <Container>
          <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4">
            <p className="text-[14px] text-[#A2A6AB]">Order not found.</p>
            <button
              type="button"
              onClick={() => navigate('/shop/orders')}
              className="rounded-full bg-[#DA9811] px-6 py-2.5 text-[14px] font-bold text-black"
            >
              My Orders
            </button>
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div className="bg-black">
      <AppSubpageHeader title="ORDER PAYMENT" />
      <Container>

        <div className="space-y-6">
          <p className="text-[14px] leading-relaxed text-[#B0B0B0]">
            Make your payment directly into our bank account. Please use your{' '}
            <span className="font-semibold text-[#DA9811]">Order ID</span> and{' '}
            <span className="font-semibold text-[#DA9811]">
              Payment Screenshot
            </span>{' '}
            as the payment reference and send on this WhatsApp:{' '}
            <span className="font-bold text-[#DA9811]">{WHATSAPP}</span>. Your
            order won't be shipped until the funds have cleared in our account.
          </p>

          <div
            className="flex max-w-fit items-center gap-1 rounded-[160px] bg-white px-4 py-1"
            aria-label={`Order ID: ${orderNumber}`}
          >
            <span className="text-[16px] font-bold text-[#1a1a1a] uppercase">
              YOUR ORDER ID:
            </span>
            <span className="text-[16px] font-normal text-[#1a1a1a]">
              {orderNumber}
            </span>
          </div>

          <div>
            <p className="text-[14px] font-bold text-[#A2A6AB] uppercase">
              ORDER TOTAL
            </p>
            <p className="mt-1 text-[16px] font-bold text-[#DA9811]">
              {formatPrice(order.total)}
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <p className="text-[14px] font-bold text-[#A2A6AB] uppercase">
                BANK NAME
              </p>
              <p className="mt-1 text-[14px] text-[#B0B0B0]">{BANK_NAME}</p>
            </div>
            <div>
              <p className="text-[14px] font-bold text-[#A2A6AB] uppercase">
                Account Number
              </p>
              <p className="mt-1 text-[14px] break-all text-[#B0B0B0]">
                {IBAN}
              </p>
            </div>
            <div>
              <p className="text-[14px] font-bold text-[#A2A6AB] uppercase">
                ACCOUNT TITLE
              </p>
              <p className="mt-1 text-[14px] text-[#B0B0B0]">{ACCOUNT_TITLE}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() =>
              navigate('/shop/order-success', { state: { orderId: order.id } })
            }
            className="flex w-full items-center justify-center gap-2 rounded-[6px] bg-[#DA9811] py-3.5 text-[16px] font-bold text-black transition-opacity active:opacity-90 lg:w-auto lg:justify-start lg:px-4"
          >
            I&apos;ve Paid
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </Container>
    </div>
  );
}
