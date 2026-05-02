/**
 * RankingStatsTotal.jsx — Full stats table for one ranking category (View More from Ranking).
 * Route: /ranking/stats/:statType. State: { rankingData, fromRanking }.
 * statType: 'run-scorers' | 'wicket-takers' | 'sixes' | 'fours'
 */

import { useEffect } from 'react';

import { useLocation, useNavigate, useParams } from 'react-router-dom';

import { AppSubpageHeader } from '@/components/AppSubpageHeader';
import { useToast } from '@/hooks/useToast';
import { BORDER_ALT as BORDER, HEADER_BG } from '@/lib/constants/tableStyles';
import { VALID_STAT_TYPES } from '@/pages/scorecard/statsTotalFlow';
import { Container } from '@/ui/Container';

const NO_VALUE = '-';

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

/** Converts raw ranking API rows into table rows for the given statType. mat/inns both use stats.innings. */
function getRankingStatsTotalRows(rankingData, statType) {
  if (!Array.isArray(rankingData) || rankingData.length === 0) return [];

  if (statType === 'run-scorers') {
    return rankingData.map((p, i) => ({
      rank: i + 1,
      playerName: p.player?.name ?? p.name ?? NO_VALUE,
      mat: p.stats?.innings ?? p.innings ?? NO_VALUE,
      runs: p.stats?.runs ?? p.score ?? NO_VALUE,
      inns: p.stats?.innings ?? p.innings ?? NO_VALUE,
      balls: NO_VALUE,
      hs: NO_VALUE,
      avg:
        p.stats?.average != null || p.average != null
          ? Number(p.stats?.average ?? p.average).toFixed(2)
          : NO_VALUE,
      sr: NO_VALUE,
      six: NO_VALUE,
      four: NO_VALUE,
      '50s': NO_VALUE,
      '100s': NO_VALUE,
    }));
  }

  if (statType === 'wicket-takers') {
    return rankingData.map((p, i) => ({
      rank: i + 1,
      playerName: p.player?.name ?? p.name ?? NO_VALUE,
      mat: p.stats?.innings ?? p.innings ?? NO_VALUE,
      wkts: p.stats?.wickets ?? p.wickets ?? NO_VALUE,
      balls: NO_VALUE,
      overs: NO_VALUE,
      mdns: NO_VALUE,
      runs: NO_VALUE,
      inns: p.stats?.innings ?? p.innings ?? NO_VALUE,
      bbi: NO_VALUE,
      ave: NO_VALUE,
      econ:
        p.stats?.economy != null || p.economy != null
          ? Number(p.stats?.economy ?? p.economy).toFixed(2)
          : NO_VALUE,
      sr: NO_VALUE,
      four_wkt: NO_VALUE,
      five_wkt: NO_VALUE,
    }));
  }

  if (statType === 'sixes') {
    return rankingData.map((p, i) => ({
      rank: i + 1,
      playerName: p.player?.name ?? p.name ?? NO_VALUE,
      mat: p.stats?.innings ?? p.innings ?? NO_VALUE,
      inns: p.stats?.innings ?? p.innings ?? NO_VALUE,
      six: p.stats?.sixes ?? p.stat ?? NO_VALUE,
    }));
  }

  if (statType === 'fours') {
    return rankingData.map((p, i) => ({
      rank: i + 1,
      playerName: p.player?.name ?? p.name ?? NO_VALUE,
      mat: p.stats?.innings ?? p.innings ?? NO_VALUE,
      inns: p.stats?.innings ?? p.innings ?? NO_VALUE,
      four: p.stats?.fours ?? p.stat ?? NO_VALUE,
    }));
  }

  return [];
}

export default function RankingStatsTotal() {
  const navigate = useNavigate();
  const location = useLocation();
  const { statType } = useParams();
  const toast = useToast();

  const isInvalidStatType = !statType || !VALID_STAT_TYPES.includes(statType);
  const rankingData = Array.isArray(location.state?.rankingData)
    ? location.state.rankingData
    : [];
  const normalizedType = isInvalidStatType ? 'fours' : statType;
  const rows = getRankingStatsTotalRows(rankingData, normalizedType);
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
        <h3 className="mt-0 text-left text-[13px] font-bold tracking-wide text-[#A2A6AB] uppercase">
          {subheading}
        </h3>

        {noDataDirectAccess ? (
          <p className="mt-3 text-[13px] text-[#A2A6AB]">
            No data available. Go back to Rankings to view stats.
          </p>
        ) : (
          <div className="mt-3 overflow-x-auto overflow-y-hidden border border-[#1A1A1A] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <table className="w-full min-w-max border-collapse text-[12px] text-white">
              <thead>
                <tr className={HEADER_BG}>
                  {columns.map((col, i) => (
                    <th
                      key={col.key}
                      className={`${COL_TH} ${col.width ?? ''} ${HEADER_BG} border-r border-b ${BORDER} ${
                        i === 0 ? 'border-l' : ''
                      }`}
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
                        className={`${COL_TD} border-r border-b ${BORDER} bg-transparent ${
                          i === 0 ? 'border-l' : ''
                        }`}
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
        )}
      </Container>
    </div>
  );
}
