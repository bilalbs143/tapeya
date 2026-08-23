import { useMemo, useState } from 'react';

import { useNavigate } from 'react-router-dom';

import { StatItem } from '@/features/profile/components/StatItem';
import { formatDecimal, formatNum } from '@/lib/utils/displayUtils';
import { useGetEnumsQuery } from '@/store/api/enumApi';
import { useGetPlayerStatsQuery, useGetPlayerTeamsQuery } from '@/store/api/playerApi';
import { useAppSelector } from '@/store/hooks';
import { selectUser } from '@/store/selectors';
import { Button } from '@/ui/Button';
import { FilterPillSelect, FilterPillSelectGroup } from '@/ui/FilterPillSelect';
import { ListEmpty } from '@/ui/ListState';
import { Loader, LoaderBlock } from '@/ui/Loader';

const TEAMS_PREVIEW_COUNT = 3;
const ALL_OPTION = { value: 'all', label: 'All' };

function withAllOption(options = []) {
  return [ALL_OPTION, ...options];
}

function hasBattingActivity(stats) {
  return stats != null && (stats.innings > 0 || stats.runs > 0);
}

function hasBowlingActivity(stats) {
  return stats != null && (stats.innings > 0 || stats.wickets > 0 || stats.overs > 0);
}

function hasFieldingActivity(stats) {
  return stats != null && (stats.catches > 0 || stats.run_outs > 0 || stats.stumpings > 0);
}

function buildSummaryStats(batting) {
  if (!hasBattingActivity(batting)) return [];

  return [
    { label: 'Runs', value: batting.runs },
    { label: 'Centuries', value: batting.hundreds },
    { label: 'Sixes', value: batting.sixes },
  ];
}

function buildBattingCareer(batting) {
  if (!hasBattingActivity(batting)) return [];

  return [
    { label: 'MAT', value: batting.matches },
    { label: 'INNS', value: batting.innings },
    { label: 'RUNS', value: batting.runs },
    { label: 'HS', value: batting.highest_score },
    { label: 'AVG', value: batting.average != null ? formatDecimal(batting.average) : '—' },
    { label: 'SR', value: batting.strike_rate != null ? formatDecimal(batting.strike_rate) : '—' },
    { label: '100S', value: batting.hundreds },
    { label: '50S', value: batting.fifties },
    { label: 'DOTS', value: batting.dots },
    { label: '4S', value: batting.fours },
    { label: '6S', value: batting.sixes },
  ];
}

function buildBowlingCareer(bowling) {
  if (!hasBowlingActivity(bowling)) return [];

  return [
    { label: 'MAT', value: bowling.matches },
    { label: 'INNS', value: bowling.innings },
    { label: 'OVERS', value: formatDecimal(bowling.overs, 1) },
    { label: 'WKTS', value: bowling.wickets },
    { label: 'BBI', value: bowling.best_bowling_innings },
    { label: 'BBM', value: bowling.best_bowling_match },
    { label: 'AVG', value: bowling.average != null ? formatDecimal(bowling.average) : '—' },
    { label: 'ECON', value: bowling.economy != null ? formatDecimal(bowling.economy) : '—' },
    { label: 'SR', value: bowling.strike_rate != null ? formatDecimal(bowling.strike_rate) : '—' },
    { label: '5W', value: bowling.five_wickets },
    { label: '10W', value: bowling.ten_wickets },
  ];
}

function buildFieldingCareer(fielding) {
  if (!hasFieldingActivity(fielding)) return [];

  return [
    { label: 'MAT', value: fielding.matches },
    { label: 'CT', value: fielding.catches },
    { label: 'RO', value: fielding.run_outs },
    { label: 'ST', value: fielding.stumpings },
  ];
}

function CareerStatSection({ title, items, emptyMessage }) {
  return (
    <section className="bg-surface rounded-[17px] px-4 py-5 sm:px-5">
      <h2 className="text-[13px] font-bold tracking-wide text-white uppercase">{title}</h2>
      {items.length > 0 ? (
        <div className="mt-4 grid grid-cols-3 gap-x-6 gap-y-5 sm:gap-x-8">
          {items.map(({ label, value }) => (
            <StatItem key={label} label={label} value={value} />
          ))}
        </div>
      ) : (
        <p className="text-muted mt-3 text-[13px]">{emptyMessage}</p>
      )}
    </section>
  );
}

function SummaryHighlight({ label, value }) {
  return (
    <div className="bg-surface flex min-w-0 flex-col items-center justify-center rounded-[17px] px-3 py-5 text-center">
      <p className="text-brand text-[22px] leading-none font-bold sm:text-[26px]">{formatNum(value)}</p>
      <p className="text-muted mt-2 text-[11px] font-bold tracking-wide uppercase sm:text-[12px]">{label}</p>
    </div>
  );
}

/**
 * Career batting / bowling / fielding stats for the signed-in user.
 * Used on the standalone `/stats` page.
 */
export function ProfileStats() {
  const navigate = useNavigate();
  const [teamsExpanded, setTeamsExpanded] = useState(false);
  const [tournamentType, setTournamentType] = useState('all');
  const [cricketFormat, setCricketFormat] = useState('all');
  const user = useAppSelector(selectUser);
  const userId = user?.id ?? null;

  const { data: enums = {} } = useGetEnumsQuery();
  const tournamentTypeOptions = useMemo(
    () => withAllOption(enums.stats_bucket ?? enums.tournament_type ?? []),
    [enums.stats_bucket, enums.tournament_type],
  );
  const cricketFormatOptions = useMemo(() => withAllOption(enums.cricket_format ?? []), [enums.cricket_format]);

  const { data: statsData, isLoading: statsLoading } = useGetPlayerStatsQuery(
    { userId, tournament_type: tournamentType, cricket_format: cricketFormat },
    { skip: !userId },
  );
  const { data: teamsData = [], isLoading: teamsLoading } = useGetPlayerTeamsQuery(userId, { skip: !userId });

  const batting = statsData?.batting ?? null;
  const bowling = statsData?.bowling ?? null;
  const fielding = statsData?.fielding ?? null;
  const teams = Array.isArray(teamsData) ? teamsData : [];
  const teamNames = teams.map((t) => t?.name).filter(Boolean);
  const teamsToShow = teamsExpanded ? teamNames : teamNames.slice(0, TEAMS_PREVIEW_COUNT);
  const hasMoreTeams = teamNames.length > TEAMS_PREVIEW_COUNT;
  const showMoreLink = hasMoreTeams && !teamsExpanded;
  const showLessLink = hasMoreTeams && teamsExpanded;

  const summaryStats = buildSummaryStats(batting);
  const careerAverages = buildBattingCareer(batting);
  const bowlingCareer = buildBowlingCareer(bowling);
  const fieldingCareer = buildFieldingCareer(fielding);

  if (!userId) {
    return (
      <ListEmpty
        title="Sign In to See Stats."
        description="Your career batting, bowling, and fielding stats live here."
        action={
          <Button type="button" variant="orange" onClick={() => navigate('/profile')}>
            Go to Profile
          </Button>
        }
      />
    );
  }

  return (
    <div className="flex flex-col gap-5 pb-8">
      <FilterPillSelectGroup>
        <FilterPillSelect
          label="Type"
          segment="left"
          value={tournamentType}
          onValueChange={setTournamentType}
          options={tournamentTypeOptions}
          ariaLabel="Tournament type"
        />
        <FilterPillSelect
          label="Format"
          segment="right"
          value={cricketFormat}
          onValueChange={setCricketFormat}
          options={cricketFormatOptions}
          ariaLabel="Cricket format"
        />
      </FilterPillSelectGroup>

      {statsLoading ? (
        <LoaderBlock label="Loading stats" className="py-10" />
      ) : (
        <>
          {summaryStats.length > 0 ? (
            <div className="grid grid-cols-3 gap-3">
              {summaryStats.map(({ label, value }) => (
                <SummaryHighlight key={label} label={label} value={value} />
              ))}
            </div>
          ) : (
            <ListEmpty title="No Batting Highlights Yet." description="Play matches to build your record." />
          )}

          <section className="bg-surface rounded-[17px] px-4 py-4 sm:px-5">
            <h2 className="text-[13px] font-bold tracking-wide text-white uppercase">Teams</h2>
            <div className="mt-3 flex flex-wrap items-baseline gap-x-1 gap-y-1">
              {teamsLoading ? (
                <Loader label="Loading teams" />
              ) : teamNames.length > 0 ? (
                <>
                  <span className="text-[14px] font-normal text-white/80">
                    {teamsToShow.join(', ')}
                    {showMoreLink ? '…' : ''}
                  </span>
                  {showMoreLink ? (
                    <button
                      type="button"
                      className="text-brand hover:text-brand-hover focus-visible:ring-brand text-sm font-normal underline underline-offset-2 transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-black focus-visible:outline-none"
                      onClick={() => setTeamsExpanded(true)}
                    >
                      More
                    </button>
                  ) : null}
                  {showLessLink ? (
                    <button
                      type="button"
                      className="text-brand hover:text-brand-hover focus-visible:ring-brand ml-1 text-sm font-normal underline underline-offset-2 transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-black focus-visible:outline-none"
                      onClick={() => setTeamsExpanded(false)}
                    >
                      Less
                    </button>
                  ) : null}
                </>
              ) : (
                <span className="text-muted text-[14px]">No teams yet</span>
              )}
            </div>
          </section>

          <CareerStatSection title="Batting" items={careerAverages} emptyMessage="No batting stats recorded yet." />

          <CareerStatSection title="Bowling" items={bowlingCareer} emptyMessage="No bowling stats recorded yet." />

          <CareerStatSection title="Fielding" items={fieldingCareer} emptyMessage="No fielding stats recorded yet." />
        </>
      )}
    </div>
  );
}
