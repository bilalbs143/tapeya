import { Link, useParams } from 'react-router-dom';

import { UserAvatar } from '@/components/UserAvatar';
import { formatDecimal, getInitials } from '@/lib/utils/displayUtils';
import { statsTotalPaths } from '@/pages/scorecard/statsTotalFlow';
import { useGetTournamentSeasonStatsQuery } from '@/store/api/tournamentApi';
import { LoaderBlock } from '@/ui/Loader';

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

/**
 * SummaryCard — stat value card, renders as Link or button.
 * TODO: fix the dead <button> when `to` is absent (see top).
 */
function SummaryCard({ value, label, accent = 'yellow', to }) {
  const borderClass = accent === 'yellow' ? 'border border-[#FFC107]' : 'border border-[#03B0E7]';
  const baseClass = `flex w-full flex-1 items-center justify-between rounded-[6px] bg-transparent px-4 py-4 ${borderClass} text-left transition-opacity active:opacity-90`;

  const content = (
    <>
      <div>
        <div className="text-[16px] font-bold text-white">{value}</div>
        <div className="text-muted mt-0.5 text-[12px] font-bold tracking-wide uppercase">{label}</div>
      </div>
      {to && (
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
      )}
    </>
  );

  if (to) {
    return (
      <Link to={to} className={baseClass}>
        {content}
      </Link>
    );
  }
  return <div className={baseClass}>{content}</div>;
}

/**
 * PlayerStatCard — avatar + name/role + primary stat + innings/average.
 * TODO: decide whether to render or remove _primaryLabel (see top).
 */
function PlayerStatCard({ player, primaryStat, statSuffix = '' }) {
  // Fixed: was `player.name.split(' ').map((n) => n[0])` — throws when name
  //        is null/undefined; also undefined for empty name segments.
  const initials = getInitials(player.name);

  const averageValue = formatDecimal(player.average, 2);

  return (
    <div className="bg-surface flex items-start gap-3 rounded-[17px] p-3">
      <UserAvatar src={player.image} name={player.name} size="card" fallback={initials} />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline gap-3">
          <span className="text-[16px] font-bold text-white">{player.name}</span>
          <span className="text-[12px] font-medium text-[#DEDEDE]">
            {player.teamAbbr}, {player.playing_role}
          </span>
        </div>
        <div className="text-brand mt-1 text-[18px] font-bold">
          {primaryStat}
          {statSuffix}
        </div>
        <div className="text-muted mt-0.5 flex flex-wrap gap-x-4 gap-y-0 text-[12px]">
          <div>Innings: {player.innings}</div>
          <div>Average: {averageValue}</div>
        </div>
      </div>
    </div>
  );
}

/**
 * SectionHeader — section title with an optional View More link.
 */
function SectionHeader({ title, viewMoreTo }) {
  return (
    <div className="mb-3 flex items-center justify-between">
      <h2 className="text-muted text-[13px] font-bold tracking-wide uppercase">{title}</h2>
      {viewMoreTo && (
        <Link
          to={viewMoreTo}
          className="text-brand text-[12px] font-bold tracking-wide uppercase transition-opacity hover:opacity-90"
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

export function StatsTab({ tournamentId }) {
  const { tournamentId: paramId } = useParams();
  const id = tournamentId ?? paramId;

  const { data: stats, isLoading, isError } = useGetTournamentSeasonStatsQuery(id, { skip: !id });

  const title = id ? `${id} - SEASON STATS` : 'SEASON STATS';

  const statsTotalFours = id ? statsTotalPaths.scorecard(id, 'fours') : null;
  const statsTotalSixes = id ? statsTotalPaths.scorecard(id, 'sixes') : null;
  const statsTotalRunScorers = id ? statsTotalPaths.scorecard(id, 'run-scorers') : null;
  const statsTotalWicketTakers = id ? statsTotalPaths.scorecard(id, 'wicket-takers') : null;

  // Shared title node — avoids copy-pasting the <h1> in every early return.
  const titleNode = <h1 className="text-center text-base font-bold tracking-wide text-white uppercase">{title}</h1>;

  // ------------------------------------------------------------------
  // Early-return states
  // ------------------------------------------------------------------

  if (!id) {
    return (
      <div className="mt-4 pb-6 focus:outline-none">
        {titleNode}
        <p className="text-muted mt-4 text-center text-[13px]">Select a tournament to view season stats.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="mt-4 pb-6 focus:outline-none">
        {titleNode}
        <LoaderBlock label="Loading season stats" className="mt-4 py-4" />
      </div>
    );
  }

  if (isError || !stats) {
    return (
      <div className="mt-4 pb-6 focus:outline-none">
        {titleNode}
        <p className="mt-4 text-center text-[13px] text-red-400">Failed to load season stats.</p>
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
        <SummaryCard value={stats.total_fours ?? 0} label="TOTAL FOURS" accent="yellow" to={statsTotalFours} />
        <SummaryCard value={stats.total_sixes ?? 0} label="TOTAL SIXES" accent="blue" to={statsTotalSixes} />
      </div>

      <div className="mt-8 space-y-8 lg:grid lg:grid-cols-2 lg:items-start lg:gap-6 lg:space-y-0">
        <section>
          <SectionHeader title="TOP RUN SCORERS" viewMoreTo={statsTotalRunScorers} />
          <div className="space-y-3">
            {topRunScorers.map((player) => (
              <PlayerStatCard key={player.id} player={player} primaryStat={player.runs} />
            ))}
          </div>
        </section>

        <section>
          <SectionHeader title="TOP WICKET TAKERS" viewMoreTo={statsTotalWicketTakers} />
          <div className="space-y-3">
            {topWicketTakers.map((player) => (
              <PlayerStatCard key={player.id} player={player} primaryStat={player.wickets} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
