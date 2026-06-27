import { useMemo, useState } from 'react';

import { StatItem, StatItemInline } from '@/features/profile/components/StatItem';
import { CONTENT_MAX_WIDTH } from '@/lib/constants/profile';
import { formatDecimal } from '@/lib/utils/displayUtils';
import { useGetEnumsQuery } from '@/store/api/enumApi';
import { useGetPlayerStatsQuery, useGetPlayerTeamsQuery } from '@/store/api/playerApi';
import { useAppSelector } from '@/store/hooks';
import { selectUser } from '@/store/selectors';
import {
  Select,
  SelectContent,
  selectContentInputClass,
  SelectItem,
  selectItemInputClass,
  SelectTrigger,
  selectTriggerInputClass,
  SelectValue,
  selectViewportInputClass,
} from '@/ui/Select';

const TEAMS_PREVIEW_COUNT = 3;
const ALL_OPTION = { value: 'all', label: 'All' };

const LABEL_CLASS = 'text-[14px] font-bold uppercase tracking-wide text-muted';

function withAllOption(options = []) {
  return [ALL_OPTION, ...options];
}

function optionLabel(options, value) {
  if (value === 'all') return 'All';
  return options.find((o) => o.value === value)?.label ?? value;
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
    { label: 'SCORE', value: batting.runs },
    { label: 'CENTURIES', value: batting.hundreds },
    { label: 'SIXES', value: batting.sixes },
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
    <>
      <div className="mt-5 h-px w-full bg-[linear-gradient(to_right,#00000000,#FFFFFF33,#00000000)]" />
      <h2 className="mt-6 text-[12px] font-bold tracking-wide text-white uppercase">{title}</h2>
      {items.length > 0 ? (
        <div className="mt-4 grid grid-cols-3 gap-x-8 gap-y-5">
          {items.map(({ label, value }) => (
            <StatItem key={label} label={label} value={value} />
          ))}
        </div>
      ) : (
        <p className="mt-4 text-sm text-white/60">{emptyMessage}</p>
      )}
    </>
  );
}

export function ProfileStats() {
  const [teamsExpanded, setTeamsExpanded] = useState(false);
  const [tournamentType, setTournamentType] = useState('all');
  const [cricketFormat, setCricketFormat] = useState('all');
  const user = useAppSelector(selectUser);
  const userId = user?.id ?? null;

  const { data: enums = {} } = useGetEnumsQuery();
  const tournamentTypeOptions = useMemo(() => withAllOption(enums.tournament_type ?? []), [enums.tournament_type]);
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

  const bucketLabel = `${optionLabel(enums.tournament_type ?? [], tournamentType)} · ${optionLabel(
    enums.cricket_format ?? [],
    cricketFormat,
  )}`;

  const summaryStats = buildSummaryStats(batting);

  const careerAverages = buildBattingCareer(batting);
  const bowlingCareer = buildBowlingCareer(bowling);
  const fieldingCareer = buildFieldingCareer(fielding);

  const isLoading = statsLoading;
  const hasAnyTeams = teamNames.length > 0;

  return (
    <div className={`mx-auto w-full ${CONTENT_MAX_WIDTH} py-6`}>
      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Select value={tournamentType} onValueChange={setTournamentType}>
          <SelectTrigger className={selectTriggerInputClass} aria-label="Tournament type">
            <SelectValue placeholder="Tournament type" />
          </SelectTrigger>
          <SelectContent className={selectContentInputClass} viewportClassName={selectViewportInputClass}>
            {tournamentTypeOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value} className={selectItemInputClass}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={cricketFormat} onValueChange={setCricketFormat}>
          <SelectTrigger className={selectTriggerInputClass} aria-label="Cricket format">
            <SelectValue placeholder="Cricket format" />
          </SelectTrigger>
          <SelectContent className={selectContentInputClass} viewportClassName={selectViewportInputClass}>
            {cricketFormatOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value} className={selectItemInputClass}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <p className="text-muted mb-4 text-[12px] font-medium tracking-wide uppercase">{bucketLabel}</p>

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
                    className="text-brand hover:text-brand-hover focus-visible:ring-brand text-sm font-normal underline underline-offset-2 transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-black focus-visible:outline-none"
                    onClick={() => setTeamsExpanded(true)}
                  >
                    MORE
                  </button>
                )}
                {showLessLink && (
                  <button
                    type="button"
                    className="text-brand hover:text-brand-hover focus-visible:ring-brand ml-1 text-sm font-normal underline underline-offset-2 transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-black focus-visible:outline-none"
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

          <CareerStatSection
            title="Career Averages (Batting)"
            items={careerAverages}
            emptyMessage="No batting stats recorded yet."
          />

          <CareerStatSection
            title="Career Averages (Bowling)"
            items={bowlingCareer}
            emptyMessage="No bowling stats recorded yet."
          />

          <CareerStatSection
            title="Career Averages (Fielding)"
            items={fieldingCareer}
            emptyMessage="No fielding stats recorded yet."
          />
        </>
      )}
    </div>
  );
}
