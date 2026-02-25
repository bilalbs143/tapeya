import { useNavigate } from 'react-router-dom';

import { Button } from '@/ui/Button';
import { Container } from '@/ui/Container';

export default function Organizer() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-black">
      <Container className="!px-4 !py-0">
        <header className="-mx-4 -mt-6 flex items-center gap-3 bg-black px-4 pt-6 pb-6">
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
            Organizer - Create Team
          </h1>
        </header>

        <div className="flex h-[calc(100vh-120px)] items-center justify-center">
          <Button
            type="button"
            variant="card"
            onClick={() => navigate('/organizer-tournament/add-team')}
            className="flex h-[120px] w-[158px] flex-col items-center !bg-[#141412] justify-center gap-3 rounded-[18px] px-0 py-0"
          >
            <span className="flex h-[44px] w-[44px] items-center justify-center rounded-full bg-[#DA9811] text-[32px] font-bold text-[#080807]">
              +
            </span>
            <span className="text-[16px] font-bold text-[#A2A6AB]">
              Create Teams
            </span>
          </Button>
        </div>
      </Container>
    </div>
  );
}
