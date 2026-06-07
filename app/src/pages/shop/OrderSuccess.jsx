import { useLocation, useNavigate } from 'react-router-dom';

import { AppSubpageHeader } from '@/components/AppSubpageHeader';
import { CLOUDFRONT_APP_BASE } from '@/lib/constants/assets';

const successOrderGif = `${CLOUDFRONT_APP_BASE}/images/icons/success-order.gif`;

export default function OrderSuccess() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const orderId = state?.orderId;

  const handleShopAgain = () => navigate('/shop');
  const handleViewOrders = () => navigate('/shop/orders');

  return (
    <div className="flex min-h-[calc(100vh-144px)] flex-col bg-black">
      <AppSubpageHeader title="ORDER SUCCESSFUL" />

      {/* Main content - centered */}
      <div className="flex flex-1 flex-col items-center justify-center px-4 py-8 text-center">
        {/* White circle with success order image */}
        <div className="mb-8 flex shrink-0 items-center justify-center overflow-hidden">
          <img src={successOrderGif} alt="" className="h-24 w-24 rounded-full object-contain" aria-hidden />
        </div>

        <h2 className="mb-3 text-[18px] font-bold tracking-wide text-brand uppercase sm:text-[20px]">
          THANK YOU FOR YOUR ORDER!
        </h2>

        <p className="mb-4 max-w-[280px] text-[14px] leading-relaxed font-medium text-muted">
          We will notify you of all the details via email or WhatsApp number you provided.
        </p>

        <div className="flex w-full flex-col gap-4 lg:flex-row lg:justify-center lg:gap-4">
          {orderId != null ? (
            <button
              type="button"
              onClick={handleViewOrders}
              className="flex w-full items-center justify-center gap-2 rounded-[6px] border-2 border-brand bg-transparent py-3.5 text-[16px] font-bold text-brand transition-opacity active:opacity-90 lg:w-auto lg:px-8"
            >
              View My Orders
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
          ) : null}

          <button
            type="button"
            onClick={handleShopAgain}
            className="flex w-full items-center justify-center gap-2 rounded-[6px] bg-brand px-8 py-3.5 text-[16px] font-bold text-black transition-opacity active:opacity-90 lg:w-auto"
          >
            Shop Again
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
      </div>
    </div>
  );
}
