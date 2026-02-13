import { useNavigate } from 'react-router-dom';
import { Container } from '@/ui/Container';

const ORDER_ID = '3325677';
const WHATSAPP = '+92 315 711 8511';
const BANK_NAME = 'Bank Alfalah';
const IBAN = 'PKLF457781445468799235';
const ACCOUNT_TITLE = 'Oneeb Arif';

export default function OrderDetail() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-black">
      <Container className="!px-4 !py-0">
        {/* Header: back (dark circle, white chevron) + title */}
        <header className="flex -mx-4 -mt-6 px-4 pt-6 pb-6 items-center gap-3 bg-black">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex h-[27px] w-[27px] shrink-0 items-center justify-center rounded-full bg-[#141412] text-white transition-opacity active:opacity-80"
            aria-label="Back"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="min-w-0 flex-1 text-[16px] font-bold uppercase tracking-wide text-center text-white pr-[27px]">
            ORDER DETAILS
          </h1>
        </header>

        <div className="pt-2 space-y-6">
          {/* Payment instructions */}
          <p className="text-[14px] leading-relaxed text-[#B0B0B0]">
            Make your payment directly into our bank account. Please use your{' '}
            <span className="font-semibold text-[#DA9811]">Order ID</span> and{' '}
            <span className="font-semibold text-[#DA9811]">Payment Screenshot</span>{' '}
            as the payment reference and send on this WhatsApp:{' '}
            <span className="font-bold text-[#DA9811]">{WHATSAPP}</span>. Your order
            won&apos;t be shipped until the funds have cleared in our account.
          </p>

          {/* Order ID - single white pill with label + id */}
          <div
            className="rounded-[160px] bg-white px-2 py-1 flex items-center gap-1 max-w-fit"
            aria-label={`Order ID: ${ORDER_ID}`}
          >
            <span className="text-[16px] font-bold uppercase text-[#1a1a1a]">
              YOUR ORDER ID:
            </span>
            <span className="text-[16px] font-normal text-[#1a1a1a]">{ORDER_ID}</span>
          </div>

          {/* Bank details */}
          <div className="space-y-4">
            <div>
              <p className="text-[14px] font-bold uppercase text-[#A2A6AB]">BANK NAME</p>
              <p className="mt-1 text-[14px] text-[#B0B0B0]">{BANK_NAME}</p>
            </div>
            <div>
              <p className="text-[14px] font-bold uppercase text-[#A2A6AB]">IBAN</p>
              <p className="mt-1 text-[14px] text-[#B0B0B0] break-all">{IBAN}</p>
            </div>
            <div>
              <p className="text-[14px] font-bold uppercase text-[#A2A6AB]">ACCOUNT TITLE</p>
              <p className="mt-1 text-[14px] text-[#B0B0B0]">{ACCOUNT_TITLE}</p>
            </div>
          </div>

          {/* Order Now button */}
          <button
            type="button"
            onClick={() => navigate('/order-success')}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-[#DA9811] py-3.5 text-[16px] font-bold text-black transition-opacity active:opacity-90"
          >
            Order Now
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </Container>
    </div>
  );
}
