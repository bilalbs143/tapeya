import { useState } from 'react';

import { StatItem, StatItemInline } from '@/features/profile/components/StatItem';
import { formatDecimal } from '@/lib/utils/displayUtils';
import { useGetPlayerStatsQuery, useGetPlayerTeamsQuery } from '@/store/api/playerApi';
import { useAppSelector } from '@/store/hooks';
import { selectUser } from '@/store/selectors';

import { CONTENT_MAX_WIDTH } from './constants';

const TEAMS_PREVIEW_COUNT = 3;

const LABEL_CLASS = 'text-[14px] font-bold uppercase tracking-wide text-muted';

export function ProfileStats() {
  const [teamsExpanded, setTeamsExpanded] = useState(false);
  const user = useAppSelector(selectUser);
  const userId = user?.id ?? null;

  const { data: statsData, isLoading: statsLoading } = useGetPlayerStatsQuery(
    { userId, tournament_type: 'all' },
    { skip: !userId },
  );
  const { data: teamsData = [], isLoading: teamsLoading } = useGetPlayerTeamsQuery(userId, { skip: !userId });

  const batting = statsData?.batting ?? null;
  const teams = Array.isArray(teamsData) ? teamsData : [];
  const teamNames = teams.map((t) => t?.name).filter(Boolean);
  const teamsToShow = teamsExpanded ? teamNames : teamNames.slice(0, TEAMS_PREVIEW_COUNT);
  const hasMoreTeams = teamNames.length > TEAMS_PREVIEW_COUNT;
  const showMoreLink = hasMoreTeams && !teamsExpanded;
  const showLessLink = hasMoreTeams && teamsExpanded;

  const summaryStats =
    batting != null
      ? [
          { label: 'SCORE', value: batting.runs },
          { label: 'CENTURIES', value: batting.hundreds },
          { label: 'SIXES', value: batting.sixes },
        ]
      : [];

  const careerAverages =
    batting != null
      ? [
          { label: 'MAT', value: batting.matches },
          { label: 'INNS', value: batting.innings },
          { label: 'RUNS', value: batting.runs },
          { label: 'HS', value: batting.highest_score },
          {
            label: 'AVG',
            value: batting.average != null ? formatDecimal(batting.average) : '—',
          },
          {
            label: 'SR',
            value: batting.strike_rate != null ? formatDecimal(batting.strike_rate) : '—',
          },
          { label: '100S', value: batting.hundreds },
          { label: '50S', value: batting.fifties },
          { label: 'DOTS', value: batting.dots },
          { label: '4S', value: batting.fours },
          { label: '6S', value: batting.sixes },
        ]
      : [];

  const isLoading = statsLoading;
  const hasAnyTeams = teamNames.length > 0;

  return (
    <div className={`mx-auto w-full ${CONTENT_MAX_WIDTH} py-6`}>
      {isLoading ? (
        <div className="text-sm text-white/60">Loading stats…</div>
      ) : (
        <>
          <div className="flex flex-wrap items-baseline gap-x-8">
            {summaryStats.length > 0 ? (
              summaryStats.map(({ label, value }) => <StatItemInline key={label} label={label} value={value} />)
            ) : (
              <span className="text-sm text-white/60">No batting stats yet.</span>
            )}
          </div>

          <div className="mt-4 flex flex-wrap items-baseline gap-x-1">
            <span className={LABEL_CLASS}>TEAMS:</span>
            {teamsLoading ? (
              <span className="text-sm text-white/60">Loading…</span>
            ) : hasAnyTeams ? (
              <>
                <span className="text-sm font-normal text-white/70">
                  {teamsToShow.join(', ')}
                  {showMoreLink ? '...' : ''}
                </span>
                {showMoreLink && (
                  <button
                    type="button"
                    className="text-sm font-normal text-brand underline underline-offset-2 transition-colors hover:text-brand-hover focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-black focus-visible:outline-none"
                    onClick={() => setTeamsExpanded(true)}
                  >
                    MORE
                  </button>
                )}
                {showLessLink && (
                  <button
                    type="button"
                    className="ml-1 text-sm font-normal text-brand underline underline-offset-2 transition-colors hover:text-brand-hover focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-black focus-visible:outline-none"
                    onClick={() => setTeamsExpanded(false)}
                  >
                    LESS
                  </button>
                )}
              </>
            ) : (
              <span className="text-sm font-normal text-white/70">—</span>
            )}
          </div>

          <div className="mt-5 h-px w-full bg-[linear-gradient(to_right,#00000000,#FFFFFF33,#00000000)]" />

          <h2 className="mt-6 text-[12px] font-bold tracking-wide text-white uppercase">CAREER AVERAGES (BATTING)</h2>
          {careerAverages.length > 0 ? (
            <div className="mt-4 grid grid-cols-3 gap-x-8 gap-y-5">
              {careerAverages.map(({ label, value }) => (
                <StatItem key={label} label={label} value={value} />
              ))}
            </div>
          ) : (
            <p className="mt-4 text-sm text-white/60">No career stats recorded yet.</p>
          )}
        </>
      )}
    </div>
  );
}
