import { useNavigate, useParams } from 'react-router-dom';

import { Container } from '@/ui/Container';

import { VALID_STAT_TYPES } from './statsTotalFlow';
import { getStatsTotalRows } from './tabs/statsData';

const BORDER = 'border-[#1A1A1A]';
const HEADER_BG = 'bg-[#141412]';
const COL_TH = 'min-w-[80px] py-3.5 pl-4 text-left font-bold';
const COL_TD = 'py-3.5 pl-4 text-left';

const COLUMNS_FOURS = [
  { key: 'player', header: 'Player', width: 'min-w-[120px]' },
  { key: 'mat', header: 'Mat' },
  { key: 'inns', header: 'Inns' },
  { key: 'four', header: 'Fours' },
];

const COLUMNS_SIXES = [
  { key: 'player', header: 'Player', width: 'min-w-[120px]' },
  { key: 'mat', header: 'Mat' },
  { key: 'inns', header: 'Inns' },
  { key: 'six', header: 'Six' },
];

const COLUMNS_RUN_SCORERS = [
  { key: 'player', header: 'Player', width: 'min-w-[120px]' },
  { key: 'mat', header: 'Mat' },
  { key: 'runs', header: 'Runs' },
  { key: 'inns', header: 'Inns' },
  { key: 'balls', header: 'Balls' },
  { key: 'hs', header: 'HS' },
  { key: 'avg', header: 'Avg' },
  { key: 'sr', header: 'SR' },
  { key: 'six', header: 'Six' },
  { key: 'four', header: 'Four' },
  { key: '50s', header: '50s' },
  { key: '100s', header: '100s' },
];

const COLUMNS_WICKET_TAKERS = [
  { key: 'player', header: 'Player', width: 'min-w-[120px]' },
  { key: 'mat', header: 'Mat' },
  { key: 'wkts', header: 'Wkts' },
  { key: 'balls', header: 'Balls' },
  { key: 'overs', header: 'Overs' },
  { key: 'mdns', header: 'Mdns' },
  { key: 'runs', header: 'Runs' },
  { key: 'inns', header: 'Inns' },
  { key: 'bbi', header: 'BBI' },
  { key: 'ave', header: 'Ave' },
  { key: 'econ', header: 'Econ' },
  { key: 'sr', header: 'SR' },
  { key: '4', header: '4' },
  { key: '5', header: '5' },
];

const COLUMNS_BY_STAT_TYPE = {
  fours: COLUMNS_FOURS,
  sixes: COLUMNS_SIXES,
  'run-scorers': COLUMNS_RUN_SCORERS,
  'wicket-takers': COLUMNS_WICKET_TAKERS,
};

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

  const normalizedType =
    statType && VALID_STAT_TYPES.includes(statType) ? statType : 'fours';

  const rows = getStatsTotalRows(tournamentId, normalizedType);

  const titles = TITLES[normalizedType] ?? TITLES.fours;
  const mainTitle = titles.main(tournamentId);
  const subheading = titles.sub;
  const columns = COLUMNS_BY_STAT_TYPE[normalizedType] ?? COLUMNS_FOURS;

  const backToStats = () => {
    if (tournamentId) {
      navigate(`/scorecard/${tournamentId}`);
    } else {
      navigate('/scorecard');
    }
  };

  return (
    <div className="bg-black">
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

        <h3 className="mt-4 text-left text-[13px] font-bold tracking-wide text-[#A2A6AB] uppercase">
          {subheading}
        </h3>

        <div className="mt-3 overflow-x-auto overflow-y-hidden border border-[#1A1A1A] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <table className="w-full min-w-max border-collapse text-[12px] text-white">
            <thead>
              <tr className={HEADER_BG}>
                {columns.map((col, i) => (
                  <th
                    key={col.key}
                    className={`${COL_TH} ${col.width ?? ''} ${HEADER_BG} border-r border-b ${BORDER} ${i === 0 ? 'border-l' : ''}`}
                  >
                    {col.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.rank}>
                  {columns.map((col, i) => (
                    <td
                      key={col.key}
                      className={`${COL_TD} border-r border-b ${BORDER} bg-transparent ${i === 0 ? 'border-l' : ''}`}
                    >
                      {col.key === 'player'
                        ? `${row.rank} ${row.playerName}`
                        : row[col.key]}
                    </td>
                  ))}
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
