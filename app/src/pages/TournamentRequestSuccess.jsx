import { useNavigate } from 'react-router-dom';

import successOrderGif from '@/assets/images/icons/success-order.gif';
import { Container } from '@/ui/Container';

export default function TournamentRequestSuccess() {
  const navigate = useNavigate();

  const handleGoHome = () => navigate('/home');

  return (
    <div className="flex flex-col bg-black">
      <Container fullWidth className="flex flex-1 flex-col !px-4 !py-0">
        <header className="-mx-4 -mt-6 flex shrink-0 items-center gap-3 bg-black px-4 pt-6 pb-6 lg:mt-0">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex h-[27px] w-[27px] shrink-0 items-center justify-center rounded-full bg-white text-[#4a4a4a] transition-opacity active:opacity-80"
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
            REQUEST RECEIVED
          </h1>
        </header>

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
