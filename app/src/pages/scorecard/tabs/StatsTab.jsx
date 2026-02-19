import { Link, useParams } from 'react-router-dom';

import defaultPlayerImage from '@/assets/images/standard/player-avatar.png';

import { Avatar, AvatarFallback, AvatarImage } from '@/ui/Avatar';

import { getSeasonStats } from './statsData';

function SummaryCard({ value, label, accent = 'yellow', to }) {
  const borderClass =
    accent === 'yellow'
      ? 'border-2 border-[#FFC107]'
      : 'border-2 border-[#03B0E7]';
  const baseClass = `flex w-full flex-1 items-center justify-between rounded-[6px] bg-transparent px-4 py-4 ${borderClass} text-left transition-opacity active:opacity-90`;
  const content = (
    <>
      <div>
        <div className="text-xl font-bold text-white">{value}</div>
        <div className="mt-0.5 text-[11px] font-medium uppercase tracking-wide text-[#AAAAAA]">
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
  return (
    <button type="button" className={baseClass}>
      {content}
    </button>
  );
}

function PlayerStatCard({ player, primaryStat, primaryLabel, statSuffix = '' }) {
  const initials = player.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2);
  return (
    <div className="flex items-start gap-3 rounded-[17px] bg-[#141412] p-3">
      <Avatar className="h-12 w-12 shrink-0 overflow-hidden rounded-full border border-[#1A1A1A]">
        {player.image ? (
          <AvatarImage src={player.image} alt="" />
        ) : (
          <AvatarImage src={defaultPlayerImage} alt="" />
        )}
        <AvatarFallback className="bg-[#1A1A1A] text-xs font-medium text-white">
          {initials}
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline gap-1.5">
          <span className="text-[16px] font-bold text-white">{player.name}</span>
          <span className="text-[12px] font-medium text-[#DEDEDE]">
            {player.teamAbbr}, {player.role}
          </span>
        </div>
        <div className="mt-1 text-[16px] font-bold text-[#FFC107]">
          {primaryStat}
          {statSuffix}
        </div>
        <div className="mt-0.5 text-[12px] text-[#A2A6AB]">
          Innings: {player.innings} Average: {player.average.toFixed(2)}
        </div>
      </div>
    </div>
  );
}

function SectionHeader({ title, viewMoreTo }) {
  return (
    <div className="mb-3 flex items-center justify-between">
      <h2 className="text-[13px] font-bold uppercase tracking-wide text-[#A2A6AB]">
        {title}
      </h2>
      {viewMoreTo && (
        <Link
          to={viewMoreTo}
          className="text-[12px] font-
          bold uppercase tracking-wide text-[#DA9811] transition-opacity hover:opacity-90"
        >
          VIEW MORE
        </Link>
      )}
    </div>
  );
}

export function StatsTab({ tournamentId, matches }) {
  const { tournamentId: paramId } = useParams();
  const id = tournamentId ?? paramId;
  const stats = getSeasonStats(id);
  const title = id ? `${id} 2026 - SEASON 3` : 'SEASON 3';
  const basePath = id ? `/scorecard/${id}` : '/scorecard';
  const statsTotalFours = id ? `${basePath}/stats-total/fours` : null;
  const statsTotalSixes = id ? `${basePath}/stats-total/sixes` : null;
  const statsTotalRunScorers = id ? `${basePath}/stats-total/run-scorers` : null;
  const statsTotalWicketTakers = id ? `${basePath}/stats-total/wicket-takers` : null;

  return (
    <div className="mt-4 pb-6 focus:outline-none">
      <h1 className="text-center text-base font-medium uppercase tracking-wide text-white">
        {title}
      </h1>

      <div className="mt-4 flex gap-3">
        <SummaryCard
          value={stats.totalFours}
          label="TOTAL FOURS"
          accent="yellow"
          to={statsTotalFours}
        />
        <SummaryCard
          value={stats.totalSixes}
          label="TOTAL SIXES"
          accent="blue"
          to={statsTotalSixes}
        />
      </div>

      <section className="mt-8">
        <SectionHeader title="TOP RUN SCORERS" viewMoreTo={statsTotalRunScorers} />
        <div className="space-y-3">
          {stats.topRunScorers.map((player) => (
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
        <SectionHeader title="TOP WICKET TAKERS" viewMoreTo={statsTotalWicketTakers} />
        <div className="space-y-3">
          {stats.topWicketTakers.map((player) => (
            <PlayerStatCard
              key={player.id}
              player={player}
              primaryStat={player.wickets}
              primaryLabel="Wickets"
              statSuffix=""
            />
          ))}
        </div>
      </section>
    </div>
  );
}
