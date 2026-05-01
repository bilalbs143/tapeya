import { useNavigate } from 'react-router-dom';

import { AppSubpageHeader } from '@/components/AppSubpageHeader';
import { CLOUDFRONT_APP_BASE } from '@/lib/constants/assets';
import { Container } from '@/ui/Container';


const successOrderGif = `${CLOUDFRONT_APP_BASE}/images/icons/success-order.gif`;

export default function TournamentRequestSuccess() {
  const navigate = useNavigate();

  const handleGoHome = () => navigate('/home');

  return (
    <div className="flex flex-col bg-black">
      <Container fullWidth className="flex flex-1 flex-col !px-4 !py-0">
        <AppSubpageHeader
          title="REQUEST RECEIVED"
          bottomSpacing="relaxed"
          className="shrink-0 -mx-4 -mt-6 lg:mt-0"
        />

        <div className="flex flex-1 flex-col items-center justify-center px-2 py-8 text-center">
          <div className="mb-8 flex shrink-0 items-center justify-center overflow-hidden">
            <img
              src={successOrderGif}
              alt=""
              className="h-24 w-24 rounded-full object-contain"
              aria-hidden
            />
          </div>

          <h2 className="mb-3 text-[18px] font-bold tracking-wide text-[#DA9811] uppercase sm:text-[20px]">
            THANK YOU!
          </h2>

          <p className="mb-8 max-w-[280px] text-[14px] leading-relaxed font-medium text-[#A2A6AB]">
            Your tournament request has been received. We will contact you
            shortly.
          </p>

          <button
            type="button"
            onClick={handleGoHome}
            className="flex w-full items-center justify-center gap-2 rounded-[6px] bg-[#DA9811] px-8 py-3.5 text-[16px] font-bold text-black transition-opacity active:opacity-90 lg:w-auto"
          >
            Go to Home
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
