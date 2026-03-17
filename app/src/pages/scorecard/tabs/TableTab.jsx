/**
 * TableTab.jsx  (exported as TableTab — part of the scorecard tabs module)
 *
 * Displays the tournament points table (standings) in a sticky-first-column
 * horizontally scrollable table.
 *
 * Used by ScorecardDetails and ScorecardStatusDetails as a tab panel.
 *
 * -----------------------------------------------------------------------------
 * CURSOR — File structure guide
 * -----------------------------------------------------------------------------
 *
 * Constants to consolidate
 * ─────────────────────────
 *   BORDER / HEADER_BG
 *     → move to: src/lib/constants/tableStyles.js
 *             (or src/lib/constants/rankingColumns.js where BORDER and
 *             HEADER_BG already exist with the same values)
 *     reason: identical constants (`border-[#1A1A1A]`, `bg-[#141412]`) exist
 *             in StatsTotal.jsx, RankingStatsTotal.jsx, TournamentEditSquad.jsx,
 *             and TournamentFinalSquad.jsx.  One export used everywhere
 *             prevents silent drift.
 *
 *   STICKY_TEAMS / STICKY_BODY_BG
 *     → move to the same shared constants file once created.
 *
 * Components to extract
 * ──────────────────────
 *   <StatsTable>  (the bordered scrollable table chrome)
 *     → move to: src/features/ranking/components/StatsTable.jsx
 *     reason: same bordered scrollable table pattern as StatsTotal.jsx,
 *             RankingStatsTotal.jsx, TournamentEditSquad.jsx, and
 *             TournamentFinalSquad.jsx.  A shared component would unify all
 *             five tables (see RankingStatsTotal top comment for the proposed
 *             props interface).
 *
 * Behaviour notes for Cursor
 * ──────────────────────────
 *   FIXED: `<h1>` had conflicting `text-base` (16 px) and `text-[13px]`
 *          classes on every branch — `text-[13px]` wins due to specificity
 *          but `text-base` was unintentional.  Removed `text-base`.
 *
 *   FIXED: The `<h1>{title}</h1>` header was copy-pasted across all five
 *          render branches (no tournament, loading, error, empty, normal).
 *          Extracted to a `const titleNode` variable used in all branches.
 *
 *   TODO: `focus:outline-none` on the outer wrapper div suppresses the
 *         focus ring when the tab panel itself is focused by keyboard
 *         navigation.  This harms accessibility — the focus ring exists to
 *         indicate keyboard position.  Remove `focus:outline-none` or replace
 *         with `focus-visible:outline-none` (which only suppresses for mouse
 *         users while preserving keyboard indicator).
 *
 *   TODO: The `NRR` column shows `—` when `team.nrr` is null/undefined.
 *         If the API can return a non-numeric string (e.g. `-`) consider
 *         normalising to `—` explicitly:
 *           {team.nrr != null && team.nrr !== '' ? team.nrr : '—'}
 * -----------------------------------------------------------------------------
 */

import { BORDER_ALT as BORDER, HEADER_BG } from '@/lib/constants/tableStyles';
import { useGetTournamentStandingsQuery } from '@/store/api/tournamentApi';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const STICKY_TEAMS = 'sticky left-0 z-10 min-w-[140px]';
const STICKY_BODY_BG = 'bg-black';

// ---------------------------------------------------------------------------
// Tab component
// ---------------------------------------------------------------------------

export function TableTab({ tournamentId }) {
  // TODO: replace hardcoded '2026 - POINTS TABLE' with dynamic season label.
  const title = tournamentId
    ? `${tournamentId} 2026 - POINTS TABLE`
    : 'POINTS TABLE';

  const {
    data: standings = [],
    isLoading,
    isError,
  } = useGetTournamentStandingsQuery(tournamentId, {
    skip: !tournamentId,
  });

  // Shared title node — avoids copy-pasting the <h1> in every early return.
  // Fixed: removed conflicting `text-base` class (see top).
  const titleNode = (
    <h1 className="text-left text-[13px] font-bold tracking-wide text-white uppercase">
      {title}
    </h1>
  );

  // ------------------------------------------------------------------
  // Early-return states
  // ------------------------------------------------------------------

  if (!tournamentId) {
    return (
      <div className="mt-4 pb-6 focus:outline-none">
        {titleNode}
        <p className="mt-4 text-[13px] text-[#A2A6AB]">
          No tournament selected.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="mt-4 pb-6 focus:outline-none">
        {titleNode}
        <p className="mt-4 text-[13px] text-[#A2A6AB]">Loading points table…</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="mt-4 pb-6 focus:outline-none">
        {titleNode}
        <p className="mt-4 text-[13px] text-red-400">
          Failed to load points table.
        </p>
      </div>
    );
  }

  if (!standings.length) {
    return (
      <div className="mt-4 pb-6 focus:outline-none">
        {titleNode}
        <p className="mt-4 text-[13px] text-[#A2A6AB]">
          No matches have been completed yet.
        </p>
      </div>
    );
  }

  // ------------------------------------------------------------------
  // Render
  // ------------------------------------------------------------------

  return (
    <div className="mt-4 pb-6 focus:outline-none">
      {titleNode}
      <section className="mt-4">
        {/* CURSOR: extract table chrome into <StatsTable> (see top). */}
        <div className="overflow-x-auto overflow-y-hidden border border-[#1A1A1A] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <table className="w-full min-w-max border-collapse text-[12px] text-white">
            <thead>
              <tr className={HEADER_BG}>
                <th
                  className={`${STICKY_TEAMS} ${HEADER_BG} border-r border-b border-l ${BORDER} py-3.5 pl-4 text-left font-bold`}
                >
                  Teams
                </th>
                <th
                  className={`border-r border-b ${BORDER} w-12 py-3.5 text-center font-bold`}
                >
                  M
                </th>
                <th
                  className={`border-r border-b ${BORDER} w-12 py-3.5 text-center font-bold`}
                >
                  W
                </th>
                <th
                  className={`border-r border-b ${BORDER} w-12 py-3.5 text-center font-bold`}
                >
                  L
                </th>
                <th
                  className={`border-r border-b ${BORDER} w-12 py-3.5 text-center font-bold`}
                >
                  T
                </th>
                <th
                  className={`border-r border-b ${BORDER} w-14 py-3.5 text-center font-bold`}
                >
                  PTS
                </th>
                <th
                  className={`border-r border-b ${BORDER} w-14 py-3.5 text-center font-bold`}
                >
                  NRR
                </th>
              </tr>
            </thead>
            <tbody>
              {standings.map((team, index) => (
                <tr key={team.team_id}>
                  <td
                    className={`${STICKY_TEAMS} ${STICKY_BODY_BG} border-r border-b border-l ${BORDER} py-3.5 pl-4`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span>{index + 1}</span>
                      <span>{team.team_name}</span>
                    </div>
                  </td>
                  <td
                    className={`border-r border-b ${BORDER} bg-transparent py-3.5 text-center`}
                  >
                    {team.played}
                  </td>
                  <td
                    className={`border-r border-b ${BORDER} bg-transparent py-3.5 text-center`}
                  >
                    {team.won}
                  </td>
                  <td
                    className={`border-r border-b ${BORDER} bg-transparent py-3.5 text-center`}
                  >
                    {team.lost}
                  </td>
                  <td
                    className={`border-r border-b ${BORDER} bg-transparent py-3.5 text-center`}
                  >
                    {team.tied}
                  </td>
                  <td
                    className={`border-r border-b ${BORDER} bg-transparent py-3.5 text-center`}
                  >
                    {team.points}
                  </td>
                  {/* TODO: normalise empty/null NRR values explicitly (see top). */}
                  <td
                    className={`border-r border-b ${BORDER} bg-transparent py-3.5 text-center`}
                  >
                    {team.nrr ?? '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
