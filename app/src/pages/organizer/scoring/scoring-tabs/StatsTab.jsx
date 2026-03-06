/**
 * Stats tab – shot direction wheel, batting stats bar, and comparison charts.
 * Uses ballHistory for run distribution, strike rate, off/leg side runs, and
 * runs-per-over for Over Comparison (line) and Run Comparison (bar) charts.
 */
import { useMemo, useState } from 'react';

import ReactApexChart from 'react-apexcharts';
import stadiumBg from '@/assets/images/standard/stadium-bg.png';

import { ShotDirectionStats } from '../ShotAreaDialog';
import { getRunsFromBall } from '../scoringUtils';

// -----------------------------------------------------------------------------
// Constants
// -----------------------------------------------------------------------------

const OFF_SIDE_ZONES = ['third_man', 'deep_point', 'deep_cover', 'long_off'];
const LEG_SIDE_ZONES = ['square_leg', 'deep_fine_leg', 'long_on', 'mid_wicket'];
const CHART_ORANGE = '#DA9811';
const LEGAL_BALL_TYPES = ['runs', 'out', 'bye', 'lb'];

const CHART_CONTAINER_CLASS =
  'rounded-b-lg bg-black overflow-hidden border-0 outline-none ring-0 shadow-none focus:border-0 focus:outline-none focus:ring-0 focus:shadow-none active:border-0 active:outline-none active:ring-0 active:shadow-none [&_*]:border-0 [&_*]:outline-none [&_*]:ring-0 [&_*]:shadow-none [&_*]:focus:border-0 [&_*]:focus:outline-none [&_*]:focus:ring-0 [&_*]:focus:shadow-none [&_*]:active:border-0 [&_*]:active:outline-none [&_*]:active:ring-0 [&_*]:active:shadow-none';

const STAT_ITEMS = [
  { key: 'runs', label: 'RUNS', valueKey: 'runs' },
  { key: 'balls', label: 'BALLS', valueKey: 'balls' },
  { key: 'sr', label: 'SR', valueKey: 'sr' },
  { key: 'offSide', label: 'OFF-S', valueKey: 'offSide' },
  { key: 'legSide', label: 'LEG-S', valueKey: 'legSide' },
];

const BASE_AXIS_STYLE = { colors: '#fff', fontSize: '12px' };
const BASE_GRID = {
  borderColor: 'rgba(255,255,255,0.2)',
  strokeDashArray: 0,
  xaxis: { lines: { show: false } },
  yaxis: { lines: { show: true } },
};

// -----------------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------------

/** Returns runs per over from ball history (legal deliveries only; wd/nb do not advance over). */
function getRunsPerOver(ballHistory) {
  const runsByOver = [];
  let overRuns = 0;
  let legalInOver = 0;

  for (const b of ballHistory || []) {
    if (!LEGAL_BALL_TYPES.includes(b.type)) continue;
    overRuns += getRunsFromBall(b);
    legalInOver += 1;
    if (legalInOver === 6) {
      runsByOver.push(overRuns);
      overRuns = 0;
      legalInOver = 0;
    }
  }
  if (legalInOver > 0) runsByOver.push(overRuns);
  return runsByOver;
}

function computeBattingStatsBar(ballHistory) {
  let runs = 0;
  let legalBalls = 0;
  let offSideRuns = 0;
  let legSideRuns = 0;

  for (const b of ballHistory || []) {
    if (LEGAL_BALL_TYPES.includes(b.type)) legalBalls += 1;
    runs += getRunsFromBall(b);
    if (b.type === 'runs' && b.shotDirection) {
      if (OFF_SIDE_ZONES.includes(b.shotDirection)) offSideRuns += b.runs ?? 0;
      if (LEG_SIDE_ZONES.includes(b.shotDirection)) legSideRuns += b.runs ?? 0;
    }
  }

  const sr = legalBalls > 0 ? ((runs / legalBalls) * 100).toFixed(1) : '0.0';
  return { runs, balls: legalBalls, sr, offSide: offSideRuns, legSide: legSideRuns };
}

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export function StatsTab({ ballHistory = [], match }) {
  const teamA = match?.teamA ?? {};
  const teamB = match?.teamB ?? {};
  const teamAName = (teamA.name || '').trim() || 'Team A';
  const teamBName = (teamB.name || '').trim() || 'Team B';

  const stats = useMemo(() => computeBattingStatsBar(ballHistory), [ballHistory]);
  const [chartTeam, setChartTeam] = useState('teamA');

  const teamARunsPerOver = useMemo(() => getRunsPerOver(ballHistory), [ballHistory]);
  const teamBRunsPerOver = useMemo(() => [], []);

  const chartData = chartTeam === 'teamA' ? teamARunsPerOver : teamBRunsPerOver;
  const displayLength = Math.min(20, Math.max(5, chartData.length));
  const categories = useMemo(
    () => Array.from({ length: displayLength }, (_, i) => String(i + 1)),
    [displayLength],
  );
  const seriesData = useMemo(
    () => Array.from({ length: displayLength }, (_, i) => chartData[i] ?? 0),
    [displayLength, chartData],
  );

  const lineChartOptions = useMemo(
    () => ({
      chart: {
        type: 'line',
        background: 'transparent',
        toolbar: { show: false },
        zoom: { enabled: false },
        selection: { enabled: false },
      },
      colors: [CHART_ORANGE],
      stroke: { curve: 'smooth', width: 2 },
      dataLabels: { enabled: false },
      xaxis: {
        categories,
        labels: { style: BASE_AXIS_STYLE },
        axisBorder: { show: false },
        axisTicks: { show: false },
      },
      yaxis: {
        min: 0,
        max: 50,
        tickAmount: 5,
        labels: { style: BASE_AXIS_STYLE },
        axisBorder: { show: false },
        axisTicks: { show: false },
      },
      grid: BASE_GRID,
      markers: {
        size: 4,
        colors: '#fff',
        strokeColors: CHART_ORANGE,
        strokeWidth: 2,
        hover: { size: 6 },
      },
      tooltip: { theme: 'dark', x: { show: true } },
    }),
    [categories],
  );

  const barChartOptions = useMemo(
    () => ({
      chart: {
        type: 'bar',
        background: 'transparent',
        toolbar: { show: false },
        selection: { enabled: false },
      },
      plotOptions: {
        bar: {
          borderRadius: 6,
          borderRadiusApplication: 'end',
          columnWidth: '20%',
        },
      },
      colors: [CHART_ORANGE],
      dataLabels: { enabled: false },
      xaxis: {
        categories,
        labels: { style: BASE_AXIS_STYLE },
        axisBorder: { show: false },
        axisTicks: { show: false },
      },
      yaxis: {
        min: 0,
        max: 60,
        tickAmount: 6,
        labels: { style: BASE_AXIS_STYLE },
        axisBorder: { show: false },
        axisTicks: { show: false },
      },
      grid: BASE_GRID,
      tooltip: { theme: 'dark', x: { show: true } },
    }),
    [categories],
  );

  const chartSeries = useMemo(() => [{ name: 'Runs', data: seriesData }], [seriesData]);

  return (
    <div className="mt-4 pb-6 space-y-6">
      <ShotDirectionStats
        ballHistory={ballHistory}
        stadiumSrc={stadiumBg}
        className="max-h-[50vh]"
      />

      <BattingStatsBar stats={stats} />

      <ChartSection
        ariaLabel="Over comparison chart"
        title="Over Comparison"
        teamAName={teamAName}
        teamBName={teamBName}
        chartTeam={chartTeam}
        onSelectTeam={setChartTeam}
      >
        <ReactApexChart
          type="line"
          series={chartSeries}
          options={lineChartOptions}
          height={220}
        />
      </ChartSection>

      <ChartSection
        ariaLabel="Run comparison chart"
        title="Run Comparison"
        teamAName={teamAName}
        teamBName={teamBName}
        chartTeam={chartTeam}
        onSelectTeam={setChartTeam}
      >
        <ReactApexChart
          type="bar"
          series={chartSeries}
          options={barChartOptions}
          height={220}
        />
      </ChartSection>
    </div>
  );
}

// -----------------------------------------------------------------------------
// Subcomponents
// -----------------------------------------------------------------------------

function BattingStatsBar({ stats }) {
  return (
    <section className="mt-4 flex" aria-label="Batting statistics">
      {STAT_ITEMS.map((item, index) => (
        <span key={item.key} className="contents">
          <div className="flex flex-1 flex-col items-center justify-center px-3 py-2.5">
            <p className="text-[12px] font-bold uppercase tracking-wide text-[#A2A6AB]">
              {item.label}
            </p>
            <p className="mt-0.5 text-[14px] font-bold text-white">
              {stats[item.valueKey]}
            </p>
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

function ChartSection({
  ariaLabel,
  title,
  teamAName,
  teamBName,
  chartTeam,
  onSelectTeam,
  children,
}) {
  return (
    <section className="mt-6" aria-label={ariaLabel}>
      <div className="flex items-center justify-between gap-4 rounded-t-lg bg-[#141412] px-3 py-2">
        <h2 className="text-[12px] font-bold tracking-wide text-[#DA9811]">{title}</h2>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => onSelectTeam('teamA')}
            className={`text-[12px] font-semibold transition-colors ${
              chartTeam === 'teamA' ? 'text-[#DA9811]' : 'text-white'
            }`}
          >
            {teamAName}
          </button>
          <button
            type="button"
            onClick={() => onSelectTeam('teamB')}
            className={`text-[12px] font-semibold transition-colors ${
              chartTeam === 'teamB' ? 'text-[#DA9811]' : 'text-white'
            }`}
          >
            {teamBName}
          </button>
        </div>
      </div>
      <div
        className={CHART_CONTAINER_CLASS}
        style={{ outline: 'none', boxShadow: 'none', border: 'none' }}
      >
        {children}
      </div>
    </section>
  );
}
