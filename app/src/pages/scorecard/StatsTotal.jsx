import { useNavigate, useParams } from 'react-router-dom';

import { Container } from '@/ui/Container';

import { getStatsTotalRows } from './tabs/statsData';

const BORDER = 'border-[#1A1A1A]';
const STICKY_PLAYER = 'sticky left-0 z-10 min-w-[140px]';
const HEADER_BG = 'bg-[#141412]';
const STICKY_BODY_BG = 'bg-black';

const VALID_STAT_TYPES = ['fours', 'sixes', 'run-scorers', 'wicket-takers'];

const TITLES = {
  fours: {
    main: (t) => `MOST FOURS ${t || ''} 2026 - SEASON 3`,
    sub: 'MOST FOURS',
  },
  sixes: {
    main: (t) => `MOST SIXES ${t || ''} 2026 - SEASON 3`,
    sub: 'MOST SIXES',
  },
  'run-scorers': {
    main: (t) => `TOP RUN SCORERS ${t || ''} 2026 - SEASON 3`,
    sub: 'TOP RUN SCORERS',
  },
  'wicket-takers': {
    main: (t) => `TOP WICKET TAKERS ${t || ''} 2026 - SEASON 3`,
    sub: 'TOP WICKET TAKERS',
  },
};

function StatsTotalContent() {
  const navigate = useNavigate();
  const { tournamentId, statType } = useParams();

  const normalizedType = VALID_STAT_TYPES.includes(statType)
    ? statType
    : 'fours';
  const rows = getStatsTotalRows(tournamentId, normalizedType);
  const titles = TITLES[normalizedType] ?? TITLES.fours;
  const mainTitle = titles.main(tournamentId);
  const subheading = titles.sub;

  const backToStats = () => {
    if (tournamentId) {
      navigate(`/scorecard/${tournamentId}?tab=stats`, { replace: false });
    } else {
      navigate(-1);
    }
  };

  return (
    <div className="min-h-screen bg-black">
      <header className="flex items-center gap-3 bg-black px-4 pt-6 pb-6">
        <button
          type="button"
          onClick={backToStats}
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
          {subheading}
        </h1>
      </header>

      <Container className="!px-4 pb-6">
        <h2 className="text-center text-base font-bold tracking-wide text-white uppercase">
          {mainTitle}
        </h2>

        <h3 className="mt-4 text-left text-sm font-medium tracking-wide text-white uppercase">
          {subheading}
        </h3>

        <div className="mt-3 overflow-x-auto overflow-y-hidden rounded-md border border-[#1A1A1A] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <table className="w-full min-w-max border-collapse text-[12px] text-white">
            <thead>
              <tr className={HEADER_BG}>
                <th
                  className={`${STICKY_PLAYER} ${HEADER_BG} border-r border-b border-l ${BORDER} py-3.5 pl-4 text-left font-medium`}
                >
                  Player
                </th>
                <th
                  className={`border-r border-b ${BORDER} w-12 py-3.5 text-center font-medium`}
                >
                  Mat
                </th>
                <th
                  className={`border-r border-b ${BORDER} w-12 py-3.5 text-center font-medium`}
                >
                  Inns
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.rank}>
                  <td
                    className={`${STICKY_PLAYER} ${STICKY_BODY_BG} border-r border-b border-l ${BORDER} py-3.5 pl-4`}
                  >
                    {row.rank} {row.playerName}
                  </td>
                  <td
                    className={`border-r border-b ${BORDER} bg-transparent py-3.5 text-center`}
                  >
                    {row.mat}
                  </td>
                  <td
                    className={`border-r border-b ${BORDER} bg-transparent py-3.5 text-center`}
                  >
                    {row.inns}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Container>
    </div>
  );
}

export default function StatsTotal() {
  return <StatsTotalContent />;
}
