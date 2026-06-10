import { useMemo, useState } from 'react';

import ReactApexChart from 'react-apexcharts';

import { MatchPlayerStatsTables } from '@/components/scoring/MatchPlayerStatsTables';
import { WagonWheelChart } from '@/components/scoring/WagonWheelChart';
import { useScoringMatch } from '@/context/ScoringMatchContext';
import { useMatchSquads } from '@/hooks/useMatchSquads';
import { CLOUDFRONT_APP_BASE } from '@/lib/constants/assets';
import { buildMatchPlayerNameMap, calculateStrikeRate } from '@/lib/utils/matchPlayerStatsUtils';
import { getShotPositionOptions, scorecardInningsToBallHistory } from '@/lib/utils/scoringMappers';
import { getRunsFromBall } from '@/lib/utils/scoringUtils';
import { useGetEnumsQuery } from '@/store/api/enumApi';
import { useGetMatchPlayerStatsQuery, useGetScorecardQuery } from '@/store/api/matchApi';

// ─── Constants ────────────────────────────────────────────────────────────────

const stadiumBg = `${CLOUDFRONT_APP_BASE}/images/standard/stadium-bg.png`;

/** Zone IDs classed as off-side for the stats bar. */
const OFF_SIDE_ZONES = ['third_man', 'deep_point', 'deep_cover', 'long_off'];

/** Zone IDs classed as leg-side for the stats bar. */
const LEG_SIDE_ZONES = ['square_leg', 'deep_fine_leg', 'long_on', 'mid_wicket'];

const CHART_ORANGE = '#DA9811';

/** Ball types that count as legal deliveries (WD and NB do not). */
const LEGAL_BALL_TYPES = ['runs', 'out', 'bye', 'lb'];

/**
 * Tailwind class string applied to each chart wrapper.
 * The long chain removes all default border / focus / shadow artefacts that
 * some ApexCharts versions inject into the SVG container.
 */
const CHART_CONTAINER_CLASS =
  'rounded-b-lg bg-black overflow-hidden border-0 outline-none ring-0 shadow-none ' +
  'focus:border-0 focus:outline-none focus:ring-0 focus:shadow-none ' +
  'active:border-0 active:outline-none active:ring-0 active:shadow-none ' +
  '[&_*]:border-0 [&_*]:outline-none [&_*]:ring-0 [&_*]:shadow-none ' +
  '[&_*]:focus:border-0 [&_*]:focus:outline-none [&_*]:focus:ring-0 [&_*]:focus:shadow-none ' +
  '[&_*]:active:border-0 [&_*]:active:outline-none [&_*]:active:ring-0 [&_*]:active:shadow-none';

/** Stat items rendered in the BattingStatsBar. */
const STAT_ITEMS = [
  { key: 'runs', label: 'RUNS', valueKey: 'runs' },
  { key: 'balls', label: 'BALLS', valueKey: 'balls' },
  { key: 'sr', label: 'SR', valueKey: 'sr' },
  { key: 'offSide', label: 'OFF-S', valueKey: 'offSide' },
  { key: 'legSide', label: 'LEG-S', valueKey: 'legSide' },
];

/** Shared axis label style for all charts. */
const BASE_AXIS_STYLE = Object.freeze({ colors: '#fff', fontSize: '12px' });

/** Shared grid config for all charts. */
const BASE_GRID = Object.freeze({
  borderColor: 'rgba(255,255,255,0.2)',
  strokeDashArray: 0,
  xaxis: Object.freeze({ lines: Object.freeze({ show: false }) }),
  yaxis: Object.freeze({ lines: Object.freeze({ show: true }) }),
});

/** Bar chart column width: narrow so two series remain readable side by side. */
const BAR_CHART_COLUMN_WIDTH = '20%';

// ─── Chart option factory ─────────────────────────────────────────────────────

/**
 * Builds a base ApexCharts options object and deep-merges type-specific
 * overrides on top.  Eliminates the ~70% duplication between line and bar
 * chart option objects.
 *
 * @param {string} type        ApexCharts chart type ('line' | 'bar').
 * @param {string[]} categories  X-axis category labels.
 * @param {object}  overrides  Type-specific fields that replace the defaults.
 * @returns {object}
 */
function makeChartOptions(type, categories, overrides = {}) {
  return {
    chart: {
      type,
      background: 'transparent',
      toolbar: { show: false },
      zoom: { enabled: false },
      selection: { enabled: false },
      ...overrides.chart,
    },
    colors: [CHART_ORANGE, '#FFFFFF'],
    dataLabels: { enabled: false },
    xaxis: {
      categories,
      labels: { style: BASE_AXIS_STYLE },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      min: 0,
      tickAmount: 5,
      labels: { style: BASE_AXIS_STYLE },
      axisBorder: { show: false },
      axisTicks: { show: false },
      ...overrides.yaxis,
    },
    grid: BASE_GRID,
    tooltip: { theme: 'dark', x: { show: true } },
    legend: { show: false },
    ...overrides,
  };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Computes runs per completed (and in-progress) over from a ball history array.
 * Only legal deliveries (runs, out, bye, lb) advance the over counter;
 * WD and NB do not.
 *
 * @param {object[]} ballHistory
 * @returns {number[]}  Array of per-over run totals; last entry may be partial.
 */
function getRunsPerOver(ballHistory) {
  const runsByOver = [];
  let overRuns = 0;
  let legalInOver = 0;

  for (const b of ballHistory ?? []) {
    if (!LEGAL_BALL_TYPES.includes(b.type)) continue;
    overRuns += getRunsFromBall(b);
    legalInOver += 1;

    if (legalInOver === 6) {
      runsByOver.push(overRuns);
      overRuns = 0;
      legalInOver = 0;
    }
  }

  // Append in-progress over if any legal balls have been bowled.
  if (legalInOver > 0) runsByOver.push(overRuns);

  return runsByOver;
}

/**
 * Computes the five values shown in the BattingStatsBar from a ball history.
 *
 * @param {object[]} ballHistory
 * @returns {{ runs: number, balls: number, sr: string, offSide: number, legSide: number }}
 */
function computeBattingStatsBar(ballHistory) {
  let runs = 0;
  let legalBalls = 0;
  let offSideRuns = 0;
  let legSideRuns = 0;

  for (const b of ballHistory ?? []) {
    if (LEGAL_BALL_TYPES.includes(b.type)) legalBalls += 1;
    runs += getRunsFromBall(b);

    if (b.type === 'runs' && b.shotDirection) {
      if (OFF_SIDE_ZONES.includes(b.shotDirection)) offSideRuns += b.runs ?? 0;
      if (LEG_SIDE_ZONES.includes(b.shotDirection)) legSideRuns += b.runs ?? 0;
    }
  }

  const sr = calculateStrikeRate(runs, legalBalls);
  return {
    runs,
    balls: legalBalls,
    sr,
    offSide: offSideRuns,
    legSide: legSideRuns,
  };
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * @param {object}   props
 * @param {object[]} props.innings1BallHistory  Innings 1 ball history.
 * @param {object[]} props.innings2BallHistory  Innings 2 ball history (team B batting).
 * @param {object}   props.match
 * @param {string}   [props.matchId]
 * @param {Record<string, string>} [props.playerNameMap]
 * @param {boolean}  [props.wagonWheelEnabled]
 */
export function StatsTab() {
  const { matchId, match, wagonWheelEnabled } = useScoringMatch();
  const { data: scorecard } = useGetScorecardQuery(matchId, { skip: !matchId });
  const { innings1Squads, innings2Squads } = useMatchSquads();

  const innings1BallHistory = useMemo(
    () => (scorecard?.innings?.[0] ? scorecardInningsToBallHistory(scorecard.innings[0], innings1Squads.nameMap) : []),
    [scorecard?.innings, innings1Squads.nameMap],
  );
  const innings2BallHistory = useMemo(
    () => (scorecard?.innings?.[1] ? scorecardInningsToBallHistory(scorecard.innings[1], innings2Squads.nameMap) : []),
    [scorecard?.innings, innings2Squads.nameMap],
  );
  const playerNameMap = useMemo(
    () =>
      buildMatchPlayerNameMap(
        [
          ...innings1Squads.battingSquad,
          ...innings1Squads.bowlingSquad,
          ...innings2Squads.battingSquad,
          ...innings2Squads.bowlingSquad,
        ],
        scorecard?.innings ?? [],
      ),
    [innings1Squads, innings2Squads, scorecard?.innings],
  );

  const ballHistory = innings1BallHistory;
  const { data: enums = {} } = useGetEnumsQuery();
  const {
    data: matchPlayerStats,
    isLoading: isLoadingPlayerStats,
    isError: isPlayerStatsError,
  } = useGetMatchPlayerStatsQuery(matchId, { skip: !matchId });

  const shotPositionZones = useMemo(() => getShotPositionOptions(enums.shot_position), [enums.shot_position]);

  const teamA = match?.teamA;
  const teamB = match?.teamB;
  const teamAName = (teamA?.name ?? '').trim() || '—';
  const teamBName = (teamB?.name ?? '').trim() || '—';

  const [chartTeam, setChartTeam] = useState('both');

  // ── Stats bar ────────────────────────────────────────────────────────────────

  const statsA = useMemo(() => computeBattingStatsBar(ballHistory), [ballHistory]);
  const statsB = useMemo(() => computeBattingStatsBar(innings2BallHistory), [innings2BallHistory]);

  // ── Runs per over ────────────────────────────────────────────────────────────

  const teamARunsPerOver = useMemo(() => getRunsPerOver(ballHistory), [ballHistory]);
  const teamBRunsPerOver = useMemo(() => getRunsPerOver(innings2BallHistory), [innings2BallHistory]);

  const hasChartData = teamARunsPerOver.length > 0 || teamBRunsPerOver.length > 0;
  const displayLength = hasChartData ? Math.min(20, Math.max(5, teamARunsPerOver.length, teamBRunsPerOver.length)) : 0;

  const categories = useMemo(() => Array.from({ length: displayLength }, (_, i) => String(i + 1)), [displayLength]);

  const seriesDataA = useMemo(
    () => Array.from({ length: displayLength }, (_, i) => teamARunsPerOver[i] ?? 0),
    [displayLength, teamARunsPerOver],
  );

  const seriesDataB = useMemo(
    () => Array.from({ length: displayLength }, (_, i) => teamBRunsPerOver[i] ?? 0),
    [displayLength, teamBRunsPerOver],
  );

  const chartSeries = useMemo(() => {
    if (chartTeam === 'teamA') return [{ name: teamAName, data: seriesDataA }];
    if (chartTeam === 'teamB') return [{ name: teamBName, data: seriesDataB }];
    return [
      { name: teamAName, data: seriesDataA },
      { name: teamBName, data: seriesDataB },
    ];
  }, [chartTeam, teamAName, teamBName, seriesDataA, seriesDataB]);

  const yMax = useMemo(() => {
    const maxVal = Math.max(10, ...seriesDataA, ...seriesDataB);
    return Math.ceil(maxVal * 1.2);
  }, [seriesDataA, seriesDataB]);

  const lineChartOptions = useMemo(
    () =>
      makeChartOptions('line', categories, {
        stroke: { curve: 'smooth', width: 2 },
        markers: {
          size: 4,
          colors: ['#fff', '#fff'],
          strokeColors: [CHART_ORANGE, '#FFFFFF'],
          strokeWidth: 2,
          hover: { size: 6 },
        },
        yaxis: { max: yMax },
      }),
    [categories, yMax],
  );

  const barChartOptions = useMemo(
    () =>
      makeChartOptions('bar', categories, {
        plotOptions: {
          bar: {
            borderRadius: 6,
            borderRadiusApplication: 'end',
            columnWidth: BAR_CHART_COLUMN_WIDTH,
          },
        },
        yaxis: { min: 0, max: yMax, tickAmount: 6 },
      }),
    [categories, yMax],
  );

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <div className="mt-4 space-y-6 pb-6">
      {wagonWheelEnabled ? (
        <div className="space-y-2">
          <p className="text-brand text-center text-[11px] font-semibold tracking-wide uppercase">Wagon Wheel</p>
          <WagonWheelChart
            ballHistory={ballHistory}
            zones={shotPositionZones.length > 0 ? shotPositionZones : undefined}
            stadiumSrc={stadiumBg}
            className="max-h-[50vh]"
          />
        </div>
      ) : null}

      {/* Team-aggregate bars (client ball history) */}
      <div className="space-y-4">
        <div>
          <p className="text-brand mb-1 text-[11px] font-semibold tracking-wide uppercase">{teamAName}</p>
          <BattingStatsBar stats={statsA} />
        </div>
        <div>
          <p className="text-brand mb-1 text-[11px] font-semibold tracking-wide uppercase">{teamBName}</p>
          <BattingStatsBar stats={statsB} />
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-brand text-center text-[11px] font-semibold tracking-wide uppercase">Player Stats (Match)</p>
        <MatchPlayerStatsTables
          data={matchPlayerStats}
          playerNameMap={playerNameMap}
          isLoading={isLoadingPlayerStats}
          isError={isPlayerStatsError}
        />
      </div>

      {hasChartData ? (
        <>
          <ChartSection
            ariaLabel="Over comparison chart"
            title="Over Comparison"
            teamAName={teamAName}
            teamBName={teamBName}
            chartTeam={chartTeam}
            onSelectTeam={setChartTeam}
          >
            <ReactApexChart type="line" series={chartSeries} options={lineChartOptions} height={220} />
          </ChartSection>
          <ChartSection
            ariaLabel="Run comparison chart"
            title="Run Comparison"
            teamAName={teamAName}
            teamBName={teamBName}
            chartTeam={chartTeam}
            onSelectTeam={setChartTeam}
          >
            <ReactApexChart type="bar" series={chartSeries} options={barChartOptions} height={220} />
          </ChartSection>
        </>
      ) : (
        <section className="bg-surface mt-6 rounded-lg px-4 py-8 text-center" aria-label="No Chart Data Yet">
          <p className="text-muted text-[14px] font-medium">No over data yet. Start scoring to see comparison charts.</p>
        </section>
      )}
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

/**
 * Horizontal bar of five batting statistics with gradient dividers between columns.
 */
function BattingStatsBar({ stats }) {
  return (
    <section className="mt-4 flex" aria-label="Batting Statistics">
      {STAT_ITEMS.map((item, index) => (
        <span key={item.key} className="contents">
          <div className="flex flex-1 flex-col items-center justify-center px-3 py-2.5">
            <p className="text-muted text-[12px] font-bold tracking-wide uppercase">{item.label}</p>
            {/* Fixed: was stats[item.valueKey] with no fallback — would render
                "undefined" as text if the key is missing. */}
            <p className="mt-0.5 text-[14px] font-bold text-white">{stats[item.valueKey] ?? '—'}</p>
          </div>
          {index < STAT_ITEMS.length - 1 && (
            <div
              className="w-px shrink-0 self-stretch bg-gradient-to-b from-[#00000000] via-[#FFFFFF66] to-[#00000000]"
              aria-hidden
            />
          )}
        </span>
      ))}
    </section>
  );
}

/**
 * Card wrapper for a chart with an optional team toggle in the header.
 * Toggle: Team A | Team B (default shows both teams; neither button highlighted).
 * When onSelectTeam is not passed, no toggle is shown.
 */
function ChartSection({ ariaLabel, title, teamAName, teamBName, chartTeam, onSelectTeam, children }) {
  const showTeamToggle = typeof onSelectTeam === 'function';
  return (
    <section className="mt-6" aria-label={ariaLabel}>
      <div className="bg-surface flex items-center justify-between gap-4 rounded-t-lg px-3 py-2">
        <h2 className="text-brand text-[12px] font-bold tracking-wide">{title}</h2>
        {showTeamToggle && (
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => onSelectTeam(chartTeam === 'teamA' ? 'both' : 'teamA')}
              className={`text-[12px] font-semibold transition-colors ${chartTeam === 'teamA' ? 'text-brand' : 'text-white'}`}
            >
              {teamAName}
            </button>
            <button
              type="button"
              onClick={() => onSelectTeam(chartTeam === 'teamB' ? 'both' : 'teamB')}
              className={`text-[12px] font-semibold transition-colors ${chartTeam === 'teamB' ? 'text-brand' : 'text-white'}`}
            >
              {teamBName}
            </button>
          </div>
        )}
      </div>
      {/* Fixed: removed inline style={{ outline, boxShadow, border }} — these are
          already set by CHART_CONTAINER_CLASS via Tailwind utility classes. */}
      <div className={CHART_CONTAINER_CLASS}>{children}</div>
    </section>
  );
}
