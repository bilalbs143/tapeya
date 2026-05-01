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
import { BORDER_ALT as BORDER, HEADER_BG } from '@/lib/constants/tableStyles';
import { useGetTournamentSeasonStatsQuery } from '@/store/api/tournamentApi';
import { Container } from '@/ui/Container';

import { VALID_STAT_TYPES } from './statsTotalFlow';

// ---------------------------------------------------------------------------
// Constants
// CURSOR: move COL_TH / COL_TD and all COLUMNS_* / TITLES
//         to src/lib/constants/rankingColumns.js — exact duplicates exist in
//         RankingStatsTotal.jsx; consolidate both files to import from there.
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
// Utils
// CURSOR: move getStatsTotalRows to src/lib/utils/rankingUtils.js (see top).
// ---------------------------------------------------------------------------

/**
 * Converts tournament season-stats API data into table rows for a given statType.
 * CURSOR: move to src/lib/utils/rankingUtils.js → export { getStatsTotalRows }
 *
 * Note: '4' and '5' keys in wicket-takers are intentional numeric strings for
 * now — see TODO at top before renaming.
 */
function getStatsTotalRows(stats, normalizedType) {
  if (!stats) return [];

  if (normalizedType === 'run-scorers') {
    return (stats.top_run_scorers ?? []).map((p, index) => ({
      rank: index + 1,
      playerName: p.name,
      mat: p.innings ?? 0,
      runs: p.runs ?? 0,
      inns: p.innings ?? 0,
      balls: p.balls_faced ?? '-',
      hs: '-',
      avg:
        p.average != null && !Number.isNaN(p.average)
          ? Number(p.average).toFixed(2)
          : '-',
      sr: '-',
      six: p.sixes ?? '-',
      four: p.fours ?? '-',
      '50s': '-',
      '100s': '-',
    }));
  }

  if (normalizedType === 'wicket-takers') {
    return (stats.top_wicket_takers ?? []).map((p, index) => ({
      rank: index + 1,
      playerName: p.name,
      mat: '-',
      wkts: p.wickets ?? 0,
      balls: '-',
      overs: p.overs ?? '-',
      mdns: '-',
      runs: p.runs_conceded ?? '-',
      inns: '-',
      bbi: '-',
      ave: '-',
      econ:
        p.economy != null && !Number.isNaN(p.economy)
          ? Number(p.economy).toFixed(2)
          : '-',
      sr: '-',
      4: '-',
      5: '-',
    }));
  }

  if (normalizedType === 'fours') {
    return (stats.most_fours ?? []).map((p, index) => ({
      rank: index + 1,
      playerName: p.name,
      mat: p.innings ?? 0,
      inns: p.innings ?? 0,
      four: p.fours ?? 0,
    }));
  }

  // sixes (default)
  return (stats.most_sixes ?? []).map((p, index) => ({
    rank: index + 1,
    playerName: p.name,
    mat: p.innings ?? 0,
    inns: p.innings ?? 0,
    six: p.sixes ?? 0,
  }));
}

// ---------------------------------------------------------------------------
// Page component
// Fixed: removed the pointless StatsTotalContent wrapper — StatsTotal is now
//        the direct default export.
// ---------------------------------------------------------------------------

export default function StatsTotal() {
  const navigate = useNavigate();
  const { tournamentId, statType } = useParams();

  const normalizedType =
    statType && VALID_STAT_TYPES.includes(statType) ? statType : 'fours';

  const {
    data: stats,
    isLoading,
    isError,
  } = useGetTournamentSeasonStatsQuery(tournamentId, {
    skip: !tournamentId,
  });

  const titles = TITLES[normalizedType] ?? TITLES.fours;
  const mainTitle = titles.main(tournamentId);
  const subheading = titles.sub;
  const columns = COLUMNS_BY_STAT_TYPE[normalizedType] ?? COLUMNS_FOURS;

  // TODO: simplify to always navigate to `/scorecard/${tournamentId}` —
  //       the fallback to `/scorecard` is dead code here (see top).
  const backToStats = () => {
    navigate(tournamentId ? `/scorecard/${tournamentId}` : '/scorecard');
  };

  const header = (
    <AppSubpageHeader
      title={subheading}
      onBack={backToStats}
    />
  );

  // ------------------------------------------------------------------
  // Early-return states
  // ------------------------------------------------------------------

  if (!tournamentId) {
    return (
      <div className="bg-black">
        {header}
        <Container className="pb-6">
          <p className="mt-4 text-center text-[13px] text-[#A2A6AB]">
            Select a tournament to view stats.
          </p>
        </Container>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="bg-black">
        {header}
        <Container className="pb-6">
          <p className="mt-4 text-center text-[13px] text-[#A2A6AB]">
            Loading stats…
          </p>
        </Container>
      </div>
    );
  }

  if (isError || !stats) {
    return (
      <div className="bg-black">
        {header}
        <Container className="pb-6">
          <p className="mt-4 text-center text-[13px] text-red-400">
            Failed to load stats.
          </p>
        </Container>
      </div>
    );
  }

  // ------------------------------------------------------------------
  // Derive rows above the return — was a 4-level nested ternary in JSX.
  // CURSOR: move to getStatsTotalRows() in src/lib/utils/rankingUtils.js (see top).
  // ------------------------------------------------------------------

  const rows = getStatsTotalRows(stats, normalizedType);

  // ------------------------------------------------------------------
  // Render
  // ------------------------------------------------------------------

  return (
    <div className="bg-black">
      {header}

      <Container className="pb-6">
        <h2 className="text-center text-base font-bold tracking-wide text-white uppercase">
          {mainTitle}
        </h2>

        <h3 className="mt-4 text-left text-[13px] font-bold tracking-wide text-[#A2A6AB] uppercase">
          {subheading}
        </h3>

        {/* CURSOR: extract into <StatsTable columns rows> shared with
                   RankingStatsTotal.jsx (see top). */}
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
              {rows.length === 0 && (
                <tr>
                  <td
                    colSpan={columns.length}
                    className={`border-r border-b border-l py-6 text-center text-[13px] text-[#A2A6AB] ${BORDER}`}
                  >
                    No stats available yet.
                  </td>
                </tr>
              )}
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
