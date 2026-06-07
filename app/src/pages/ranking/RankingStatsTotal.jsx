/**
 * RankingStatsTotal.jsx — Full stats table for one ranking category (View More from Ranking).
 * Route: /ranking/stats/:statType. State: { rankingData, fromRanking }.
 * statType: 'run-scorers' | 'wicket-takers' | 'sixes' | 'fours'
 */

import { useEffect } from 'react';

import { useLocation, useNavigate, useParams } from 'react-router-dom';

import { AppSubpageHeader } from '@/components/AppSubpageHeader';
import { useToast } from '@/hooks/useToast';
import { BORDER_ALT, HEADER_BG } from '@/lib/constants/tableStyles';
import { formatListIndex } from '@/lib/format';
import { buildStatsTotalRows } from '@/lib/utils/rankingUtils';
import { VALID_STAT_TYPES } from '@/pages/scorecard/statsTotalFlow';
import { Container } from '@/ui/Container';

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
  { key: 'four_wkt', header: '4' },
  { key: 'five_wkt', header: '5' },
];

const COLUMNS_BY_STAT_TYPE = {
  fours: COLUMNS_FOURS,
  sixes: COLUMNS_SIXES,
  'run-scorers': COLUMNS_RUN_SCORERS,
  'wicket-takers': COLUMNS_WICKET_TAKERS,
};

const TITLES = {
  fours: 'MOST FOURS',
  sixes: 'MOST SIXES',
  'run-scorers': 'TOP RUN SCORERS',
  'wicket-takers': 'TOP WICKET TAKERS',
};

export default function RankingStatsTotal() {
  const navigate = useNavigate();
  const location = useLocation();
  const { statType } = useParams();
  const toast = useToast();

  const isInvalidStatType = !statType || !VALID_STAT_TYPES.includes(statType);
  const rankingData = Array.isArray(location.state?.rankingData) ? location.state.rankingData : [];
  const normalizedType = isInvalidStatType ? 'fours' : statType;
  const rows = buildStatsTotalRows(normalizedType, rankingData);
  const fromRanking = location.state?.fromRanking === true;
  const noDataDirectAccess = rows.length === 0 && !fromRanking;

  useEffect(() => {
    if (isInvalidStatType) {
      toast.error('Unknown stat type.');
      navigate('/ranking', { replace: true });
    }
  }, [isInvalidStatType, navigate, toast]);

  if (isInvalidStatType) {
    return null;
  }

  const subheading = TITLES[normalizedType] ?? TITLES.fours;
  const columns = COLUMNS_BY_STAT_TYPE[normalizedType] ?? COLUMNS_FOURS;

  return (
    <div className="bg-black">
      <AppSubpageHeader title="Stats" />

      <Container className="pb-6">
        <h3 className="mt-0 text-left text-[13px] font-bold tracking-wide text-muted uppercase">{subheading}</h3>

        {noDataDirectAccess ? (
          <p className="mt-3 text-[13px] text-muted">No data available. Go back to Rankings to view stats.</p>
        ) : (
          <div className="mt-3 overflow-x-auto overflow-y-hidden border border-surface-border [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <table className="w-full min-w-max border-collapse text-[12px] text-white">
              <thead>
                <tr className={HEADER_BG}>
                  {columns.map((col, i) => (
                    <th
                      key={col.key}
                      className={`${COL_TH} ${col.width ?? ''} ${HEADER_BG} border-r border-b ${BORDER_ALT} ${i === 0 ? 'border-l' : ''}`}
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
                        className={`${COL_TD} border-r border-b ${BORDER_ALT} bg-transparent ${i === 0 ? 'border-l' : ''}`}
                      >
                        {col.key === 'player' ? `${formatListIndex(row.rank)} ${row.playerName}` : row[col.key]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Container>
    </div>
  );
}
