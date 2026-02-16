import { useNavigate } from 'react-router-dom';

import { ScorecardTabs } from '@/components/scorecard';
import { Container } from '@/ui/Container';

import { MOCK_MATCHES } from './mockMatches';

export default function ScorecardHome() {
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
            SCORE CARD
          </h1>
        </header>

        <div className="pt-2">
          <ScorecardTabs matches={MOCK_MATCHES} />
        </div>
      </Container>
    </div>
  );
}
