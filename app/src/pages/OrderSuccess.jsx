import { useNavigate } from 'react-router-dom';
import { Container } from '@/ui/Container';

import successOrderGif from '@/assets/images/icons/success-order.gif';

export default function OrderSuccess() {
  const navigate = useNavigate();

  return (
    <div className="bg-black flex flex-col">
      <Container className="!px-4 !py-0 flex flex-col flex-1">
        {/* Header: back (white circle, black chevron) + title */}
        <header className="flex -mx-4 -mt-6 px-4 pt-6 pb-6 items-center gap-3 bg-black shrink-0">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex h-[27px] w-[27px] shrink-0 items-center justify-center rounded-full bg-white text-[#4a4a4a] transition-opacity active:opacity-80"
            aria-label="Back"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="min-w-0 flex-1 text-[16px] font-bold uppercase tracking-wide text-center text-white pr-[27px]">
            ORDER SUCCESSFUL
          </h1>
        </header>

        {/* Main content - centered */}
        <div className="flex-1 flex flex-col items-center justify-center text-center px-2 py-8">
          {/* White circle with success order image */}
          <div className="flex items-center justify-center mb-8 shrink-0 overflow-hidden">
            <img src={successOrderGif} alt="" className="w-24 h-24 rounded-full object-contain" aria-hidden />
          </div>

          <h2 className="text-[18px] sm:text-[20px] font-bold uppercase tracking-wide text-[#DA9811] mb-3">
            THANK YOU FOR YOUR ORDER!
          </h2>

          <p className="text-[14px] text-white leading-relaxed max-w-[280px] mb-10">
            We will notify you of all the details via email or WhatsApp number you provided.
          </p>

          <button
            type="button"
            onClick={() => navigate('/shop')}
            className="w-full flex items-center justify-center gap-2 rounded-full bg-[#DA9811] px-8 py-3.5 text-[16px] font-bold text-black transition-opacity active:opacity-90"
          >
            Shop Again
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </Container>
    </div>
  );
}
