/**
 * StatsTotal.jsx
 *
 * Tournament season stats table — fetches live data from the API using
 * `tournamentId` from the URL params and displays it as a scrollable table
 * for the selected stat type.
 *
 * Route: /scorecard/:tournamentId/stats/:statType
 * Valid statType values: 'run-scorers' | 'wicket-takers' | 'sixes' | 'fours'
 *
 * -----------------------------------------------------------------------------
 * CURSOR — File structure guide
 * -----------------------------------------------------------------------------
 *
 * Utils to move out of this file
 * ───────────────────────────────
 *   getStatsTotalRows(stats, normalizedType)
 *     → move to: src/lib/utils/rankingUtils.js → export { getStatsTotalRows }
 *     reason: pure data-transform, no React dependency.  Co-locate with
 *             getRankingStatsTotalRows from RankingStatsTotal.jsx — the two
 *             functions cover the same stat types but different API shapes
 *             (season-stats vs ranking-rows).
 *
 *   COLUMNS_* / TITLES / COLUMNS_BY_STAT_TYPE constants
 *     → move to: src/lib/constants/rankingColumns.js
 *     reason: **exact duplicates** of the same structures in
 *             RankingStatsTotal.jsx.  Centralise once, import in both files.
 *             The only difference is TITLES — StatsTotal has main/sub keys
 *             with a hardcoded season string; RankingStatsTotal has a flat
 *             string.  Separate the two exports if needed, but share the
 *             column definitions unconditionally.
 *
 * Components to extract into their own files
 * ───────────────────────────────────────────
 *   <PageShell>  (back button + title + optional children)
 *     → move to: src/features/scorecard/components/StatsTotalPageShell.jsx
 *             (or reuse a generic <ScreenShell> if one exists)
 *     reason: the back-button header is copy-pasted **three times** inside
 *             the early-return states (!tournamentId, isLoading, isError).
 *             A single wrapper renders it once and accepts children for the
 *             body content.
 *     props it will need:
 *       onBack    {() => void}
 *       title     {string}
 *       children  {ReactNode}
 *
 *   <StatsTable>  (the bordered scrollable table)
 *     → move to: src/features/ranking/components/StatsTable.jsx
 *     reason: identical table markup in RankingStatsTotal.jsx — extract once
 *             (see RankingStatsTotal top comment for props).
 *
 * Behaviour notes for Cursor
 * ──────────────────────────
 *   FIXED: `StatsTotalContent` wrapper rendered inside `StatsTotal` with no
 *          props — the indirection served no purpose.  Removed the wrapper;
 *          `StatsTotal` is now the direct default export.
 *
 *   FIXED: `rows` was a 4-level deeply nested ternary inside the JSX return.
 *          Moved derivation above the return statement for readability.
 *
 *   TODO: `mainTitle` contains a hardcoded `2026 - SEASON 3` string.  Replace
 *         with dynamic season data from the API (tournament name / season
 *         label) once the endpoint returns it.
 *
 *   TODO: `'4'` and `'5'` numeric string keys in the wicket-takers row shape
 *         are fragile — same issue as RankingStatsTotal.jsx.  Rename to
 *         `'four_wkt'` / `'five_wkt'` and update COLUMNS_WICKET_TAKERS
 *         together (see RankingStatsTotal top comment).
 *
 *   TODO: `backToStats` fallback to `/scorecard` is dead code in the
 *         `!tournamentId` early-return branch because that branch only
 *         renders when tournamentId is falsy — the fallback would only be
 *         reached from the other branches where tournamentId is always
 *         truthy.  Safe to simplify to `navigate(\`/scorecard/${tournamentId}\`)`.
 * -----------------------------------------------------------------------------
 */

import { useNavigate, useParams } from 'react-router-dom';

import { AppSubpageHeader } from '@/components/AppSubpageHeader';
import { BORDER_ALT, HEADER_BG } from '@/lib/constants/tableStyles';
import { formatListIndex } from '@/lib/format';
import { buildStatsTotalRows } from '@/lib/utils/rankingUtils';
import { useGetTournamentSeasonStatsQuery } from '@/store/api/tournamentApi';
import { Container } from '@/ui/Container';
import { ListEmpty, ListError } from '@/ui/ListState';
import { PageLoader } from '@/ui/Loader';

import { getStatsTotalBackPath, SCORECARD_FLOW, VALID_STAT_TYPES } from './statsTotalFlow';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

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

// TODO: rename keys '4' / '5' → 'four_wkt' / 'five_wkt' (see top).
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

// TODO: replace hardcoded '2026 - SEASON 3' with dynamic season data (see top).
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

// ---------------------------------------------------------------------------
// Page component
// Fixed: removed the pointless StatsTotalContent wrapper — StatsTotal is now
//        the direct default export.
// ---------------------------------------------------------------------------

export default function StatsTotal() {
  const navigate = useNavigate();
  const { tournamentId, statType } = useParams();

  const normalizedType = statType && VALID_STAT_TYPES.includes(statType) ? statType : 'fours';

  const {
    data: stats,
    isLoading,
    isError,
    refetch,
  } = useGetTournamentSeasonStatsQuery(tournamentId, {
    skip: !tournamentId,
  });

  const titles = TITLES[normalizedType] ?? TITLES.fours;
  const mainTitle = titles.main(tournamentId);
  const subheading = titles.sub;
  const columns = COLUMNS_BY_STAT_TYPE[normalizedType] ?? COLUMNS_FOURS;

  const backToStats = () => {
    navigate(getStatsTotalBackPath(SCORECARD_FLOW, tournamentId));
  };

  const header = <AppSubpageHeader title={subheading} onBack={backToStats} />;

  // ------------------------------------------------------------------
  // Early-return states
  // ------------------------------------------------------------------

  if (!tournamentId) {
    return (
      <div className="bg-black">
        {header}
        <Container className="pb-6">
          <ListEmpty title="No Tournament Selected." description="Select a tournament to view stats." />
        </Container>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="bg-black">
        {header}
        <Container className="pb-6">
          <PageLoader label="Loading stats" className="py-6" />
        </Container>
      </div>
    );
  }

  if (isError || !stats) {
    return (
      <div className="bg-black">
        {header}
        <Container className="pb-6">
          <ListError message="Could not load stats." onRetry={() => refetch()} />
        </Container>
      </div>
    );
  }

  const rows = buildStatsTotalRows(normalizedType, stats);

  // ------------------------------------------------------------------
  // Render
  // ------------------------------------------------------------------

  return (
    <div className="bg-black">
      {header}

      <Container className="pb-6">
        <h2 className="text-center text-base font-bold tracking-wide text-white uppercase">{mainTitle}</h2>

        <h3 className="text-muted mt-4 text-left text-[13px] font-bold tracking-wide uppercase">{subheading}</h3>

        {rows.length === 0 ? (
          <ListEmpty title="No Stats Available Yet." />
        ) : (
          <div className="border-surface-border mt-3 overflow-x-auto overflow-y-hidden border [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
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
