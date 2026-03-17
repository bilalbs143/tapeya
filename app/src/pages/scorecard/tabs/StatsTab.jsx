/**
 * StatsTab.jsx  (exported as StatsTab — part of the scorecard tabs module)
 *
 * Displays season stats for a tournament: total fours/sixes summary cards and
 * top run-scorers / top wicket-takers player lists, each linking to the full
 * stats table (StatsTotal).
 *
 * Used by both ScorecardDetails and ScorecardStatusDetails as a tab panel.
 *
 * -----------------------------------------------------------------------------
 * CURSOR — File structure guide
 * -----------------------------------------------------------------------------
 *
 * Utils to move out of this file
 * ───────────────────────────────
 *   getPlayerInitials(name)
 *     → move to: src/lib/utils/displayUtils.js → export { getPlayerInitials }
 *     reason: same initials logic already exists as getInitials(name, nickname)
 *             in Login.jsx.  Consolidate both into one utility:
 *               export function getInitials(name, nickname?)
 *             and use it everywhere avatars show initials.
 *
 * Components to extract into their own files
 * ───────────────────────────────────────────
 *   <SummaryCard>
 *     → move to: src/features/scorecard/components/SummaryCard.jsx
 *     reason: a self-contained card that renders as either a <Link> or a
 *             <button> depending on whether `to` is provided.  Extracting
 *             gives a clear place to fix the dead-button TODO below.
 *     props it will need:
 *       value   {number | string}
 *       label   {string}
 *       accent  {'yellow' | 'blue'}  default 'yellow'
 *       to      {string | undefined}
 *
 *   <PlayerStatCard>
 *     → move to: src/features/scorecard/components/PlayerStatCard.jsx
 *     reason: avatar + name + primary stat + innings/average — similar to
 *             PlayerCard in Ranking.jsx.  If the two cards converge on the
 *             same design, merge them into one shared component.
 *     props it will need:
 *       player       {SeasonStatsPlayer}
 *       primaryStat  {number | string}
 *       statSuffix   {string}  default ''
 *
 *   <SectionHeader>
 *     → move to: src/ui/SectionHeader.jsx  (or src/features/scorecard/components/)
 *     reason: title + optional View More link — likely reusable across other
 *             list sections in the scorecard module.
 *     props it will need:
 *       title      {string}
 *       viewMoreTo {string | undefined}
 *
 * Behaviour notes for Cursor
 * ──────────────────────────
 *   FIXED: `player.name.split(' ').map((n) => n[0])` threw when player.name
 *          was null/undefined, and `n[0]` was undefined for empty name parts.
 *          Replaced with a safe initials helper using optional chaining.
 *
 *   FIXED: `AvatarImage` was conditionally rendered twice (once for
 *          player.image, once for the default).  `AvatarImage` handles a
 *          missing/falsy src gracefully — simplified to a single
 *          `src={player.image || defaultPlayerImage}`.
 *
 *   FIXED: The `<h1>{title}</h1>` header was copy-pasted in all three
 *          early-return branches.  Extracted to a `const titleNode` variable.
 *
 *   TODO: `_primaryLabel` is accepted as a prop (prefixed _ to signal
 *         "unused") but is never rendered.  The call sites pass
 *         `primaryLabel="Runs"` and `primaryLabel="Wickets"` which are also
 *         silently discarded.  Either:
 *           a) render it below the primaryStat in PlayerStatCard, or
 *           b) remove the prop from the signature and stop passing it at
 *              call sites to keep the interface clean.
 *
 *   TODO: `matches: _matches` is accepted but never used.  Remove from the
 *         prop signature and from all call sites once confirmed it is not
 *         needed by this component.
 *
 *   TODO: `SummaryCard` renders a `<button>` with no `onClick` when `to` is
 *         not provided — a dead interactive element that does nothing and
 *         misleads keyboard users.  Either always require `to`, or accept an
 *         `onClick` prop, or render a plain `<div>` when neither is provided.
 *
 *   TODO: `title` contains a hardcoded `2026 - SEASON 3` string — same issue
 *         as StatsTotal.jsx.  Replace with dynamic season data from the API
 *         once the endpoint returns it.
 * -----------------------------------------------------------------------------
 */

import { Link, useParams } from 'react-router-dom';

import defaultPlayerImage from '@/assets/images/standard/player-avatar.png';
import { statsTotalPaths } from '@/pages/scorecard/statsTotalFlow';
import { useGetTournamentSeasonStatsQuery } from '@/store/api/tournamentApi';
import { Avatar, AvatarFallback, AvatarImage } from '@/ui/Avatar';

// ---------------------------------------------------------------------------
// Utils
// CURSOR: consolidate with getInitials in Login.jsx →
//         src/lib/utils/displayUtils.js → export { getInitials }
// ---------------------------------------------------------------------------

/**
 * Safely derives 2-character initials from a player name string.
 * Guards against null/undefined and empty name segments.
 * CURSOR: merge with getInitials(name, nickname) from Login.jsx into
 *         src/lib/utils/displayUtils.js once extracted.
 */
function getPlayerInitials(name) {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

// ---------------------------------------------------------------------------
// Sub-components
// CURSOR: move to individual files once extracted (see top).
// ---------------------------------------------------------------------------

/**
 * SummaryCard — stat value card, renders as Link or button.
 * CURSOR: move to src/features/scorecard/components/SummaryCard.jsx
 * TODO: fix the dead <button> when `to` is absent (see top).
 */
function SummaryCard({ value, label, accent = 'yellow', to }) {
  const borderClass =
    accent === 'yellow' ? 'border border-[#FFC107]' : 'border border-[#03B0E7]';
  const baseClass = `flex w-full flex-1 items-center justify-between rounded-[6px] bg-transparent px-4 py-4 ${borderClass} text-left transition-opacity active:opacity-90`;

  const content = (
    <>
      <div>
        <div className="text-[16px] font-bold text-white">{value}</div>
        <div className="mt-0.5 text-[12px] font-bold tracking-wide text-[#A2A6AB] uppercase">
          {label}
        </div>
      </div>
      <svg
        className="h-5 w-5 shrink-0 text-white"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <path d="M9 18l6-6-6-6" />
      </svg>
    </>
  );

  if (to) {
    return (
      <Link to={to} className={baseClass}>
        {content}
      </Link>
    );
  }
  // TODO: render a <div> here instead of a dead <button> (see top).
  return (
    <button type="button" className={baseClass}>
      {content}
    </button>
  );
}

/**
 * PlayerStatCard — avatar + name/role + primary stat + innings/average.
 * CURSOR: move to src/features/scorecard/components/PlayerStatCard.jsx
 * TODO: decide whether to render or remove _primaryLabel (see top).
 */
function PlayerStatCard({
  player,
  primaryStat,

  _primaryLabel,
  statSuffix = '',
}) {
  // Fixed: was `player.name.split(' ').map((n) => n[0])` — throws when name
  //        is null/undefined; also undefined for empty name segments.
  const initials = getPlayerInitials(player.name);

  const averageValue =
    typeof player.average === 'number' && !Number.isNaN(player.average)
      ? player.average.toFixed(2)
      : '—';

  return (
    <div className="flex items-start gap-3 rounded-[17px] bg-[#141412] p-3">
      <Avatar className="h-12 w-12 shrink-0 overflow-hidden rounded-full border border-[#1A1A1A]">
        {/* Fixed: was two conditional AvatarImage renders — simplified to one
            since AvatarImage handles a falsy src via the AvatarFallback. */}
        <AvatarImage src={player.image || defaultPlayerImage} alt="" />
        <AvatarFallback className="bg-[#1A1A1A] text-xs font-medium text-white">
          {initials}
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline gap-3">
          <span className="text-[16px] font-bold text-white">
            {player.name}
          </span>
          <span className="text-[12px] font-medium text-[#DEDEDE]">
            {player.teamAbbr}, {player.role}
          </span>
        </div>
        <div className="mt-1 text-[18px] font-bold text-[#DA9811]">
          {primaryStat}
          {statSuffix}
        </div>
        <div className="mt-0.5 flex flex-wrap gap-x-4 gap-y-0 text-[12px] text-[#A2A6AB]">
          <div>Innings: {player.innings}</div>
          <div>Average: {averageValue}</div>
        </div>
      </div>
    </div>
  );
}

/**
 * SectionHeader — section title with an optional View More link.
 * CURSOR: move to src/ui/SectionHeader.jsx → export { SectionHeader }
 */
function SectionHeader({ title, viewMoreTo }) {
  return (
    <div className="mb-3 flex items-center justify-between">
      <h2 className="text-[13px] font-bold tracking-wide text-[#A2A6AB] uppercase">
        {title}
      </h2>
      {viewMoreTo && (
        <Link
          to={viewMoreTo}
          className="text-[12px] font-bold tracking-wide text-[#DA9811] uppercase transition-opacity hover:opacity-90"
        >
          VIEW MORE
        </Link>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Tab component
// ---------------------------------------------------------------------------

export function StatsTab({ tournamentId, matches: _matches }) {
  const { tournamentId: paramId } = useParams();
  const id = tournamentId ?? paramId;

  const {
    data: stats,
    isLoading,
    isError,
  } = useGetTournamentSeasonStatsQuery(id, { skip: !id });

  // TODO: replace hardcoded '2026 - SEASON 3' with dynamic season data (see top).
  const title = id ? `${id} 2026 - SEASON 3` : 'SEASON 3';

  const statsTotalFours = id ? statsTotalPaths.scorecard(id, 'fours') : null;
  const statsTotalSixes = id ? statsTotalPaths.scorecard(id, 'sixes') : null;
  const statsTotalRunScorers = id
    ? statsTotalPaths.scorecard(id, 'run-scorers')
    : null;
  const statsTotalWicketTakers = id
    ? statsTotalPaths.scorecard(id, 'wicket-takers')
    : null;

  // Shared title node — avoids copy-pasting the <h1> in every early return.
  // CURSOR: once <StatsTabShell> is extracted, pass title as a prop instead.
  const titleNode = (
    <h1 className="text-center text-base font-bold tracking-wide text-white uppercase">
      {title}
    </h1>
  );

  // ------------------------------------------------------------------
  // Early-return states
  // ------------------------------------------------------------------

  if (!id) {
    return (
      <div className="mt-4 pb-6 focus:outline-none">
        {titleNode}
        <p className="mt-4 text-center text-[13px] text-[#A2A6AB]">
          Select a tournament to view season stats.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="mt-4 pb-6 focus:outline-none">
        {titleNode}
        <p className="mt-4 text-center text-[13px] text-[#A2A6AB]">
          Loading season stats…
        </p>
      </div>
    );
  }

  if (isError || !stats) {
    return (
      <div className="mt-4 pb-6 focus:outline-none">
        {titleNode}
        <p className="mt-4 text-center text-[13px] text-red-400">
          Failed to load season stats.
        </p>
      </div>
    );
  }

  // ------------------------------------------------------------------
  // Render
  // ------------------------------------------------------------------

  const topRunScorers = stats.top_run_scorers ?? [];
  const topWicketTakers = stats.top_wicket_takers ?? [];

  return (
    <div className="mt-4 pb-6 focus:outline-none">
      {titleNode}

      <div className="mt-4 flex gap-3">
        <SummaryCard
          value={stats.total_fours ?? 0}
          label="TOTAL FOURS"
          accent="yellow"
          to={statsTotalFours}
        />
        <SummaryCard
          value={stats.total_sixes ?? 0}
          label="TOTAL SIXES"
          accent="blue"
          to={statsTotalSixes}
        />
      </div>

      <section className="mt-8">
        <SectionHeader
          title="TOP RUN SCORERS"
          viewMoreTo={statsTotalRunScorers}
        />
        <div className="space-y-3">
          {topRunScorers.map((player) => (
            <PlayerStatCard
              key={player.id}
              player={player}
              primaryStat={player.runs}
              primaryLabel="Runs"
            />
          ))}
        </div>
      </section>

      <section className="mt-8">
        <SectionHeader
          title="TOP WICKET TAKERS"
          viewMoreTo={statsTotalWicketTakers}
        />
        <div className="space-y-3">
          {topWicketTakers.map((player) => (
            <PlayerStatCard
              key={player.id}
              player={player}
              primaryStat={player.wickets}
              primaryLabel="Wickets"
            />
          ))}
        </div>
      </section>
    </div>
  );
}
