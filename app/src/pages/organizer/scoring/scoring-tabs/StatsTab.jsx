/**
 * Stats tab – shot direction distribution, batting stats bar, and Over Comparison chart.
 */
import { useMemo, useState } from 'react';

import ReactApexChart from 'react-apexcharts';
import stadiumBg from '@/assets/images/standard/stadium-bg.png';
import { getRunsFromBall } from '../scoringUtils';
import { ShotDirectionStats } from '../ShotAreaDialog';

const OFF_SIDE_ZONES = ['third_man', 'deep_point', 'deep_cover', 'long_off'];
const LEG_SIDE_ZONES = ['square_leg', 'deep_fine_leg', 'long_on', 'mid_wicket'];
const CHART_ORANGE = '#DA9811';

/** Returns runs per over for the given ball history (legal deliveries only; wd/nb don't advance over). */
function getRunsPerOver(ballHistory) {
  const runsByOver = [];
  let overRuns = 0;
  let legalInOver = 0;
  for (const b of ballHistory || []) {
    const isLegal = ['runs', 'out', 'bye', 'lb'].includes(b.type);
    if (isLegal) {
      overRuns += getRunsFromBall(b);
      legalInOver += 1;
      if (legalInOver === 6) {
        runsByOver.push(overRuns);
        overRuns = 0;
        legalInOver = 0;
      }
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
    const isLegal = ['runs', 'out', 'bye', 'lb'].includes(b.type);
    if (isLegal) legalBalls += 1;
    const r = getRunsFromBall(b);
    runs += r;
    if (b.type === 'runs' && b.shotDirection) {
      if (OFF_SIDE_ZONES.includes(b.shotDirection)) offSideRuns += b.runs ?? 0;
      if (LEG_SIDE_ZONES.includes(b.shotDirection)) legSideRuns += b.runs ?? 0;
    }
  }
  const sr = legalBalls > 0 ? ((runs / legalBalls) * 100).toFixed(1) : '0.0';
  return {
    runs,
    balls: legalBalls,
    sr,
    offSide: offSideRuns,
    legSide: legSideRuns,
  };
}

export function StatsTab({ ballHistory = [], match }) {
  const stats = useMemo(() => computeBattingStatsBar(ballHistory), [ballHistory]);
  const [chartTeam, setChartTeam] = useState('teamA');
  const teamAName = match?.teamA?.name || 'Team A';
  const teamBName = match?.teamB?.name || 'Team B';

  const teamARunsPerOver = useMemo(() => getRunsPerOver(ballHistory), [ballHistory]);
  const teamBRunsPerOver = useMemo(() => [], []);

  const chartData = chartTeam === 'teamA' ? teamARunsPerOver : teamBRunsPerOver;
  const displayLength = Math.min(20, Math.max(5, chartData.length));
  const categories = useMemo(
    () => Array.from({ length: displayLength }, (_, i) => String(i + 1)),
    [displayLength],
  );
  const seriesData = useMemo(
    () =>
      Array.from({ length: displayLength }, (_, i) => chartData[i] ?? 0),
    [displayLength, chartData],
  );

  const chartOptions = useMemo(
    () => ({
      chart: {
        type: 'line',
        background: 'transparent',
        toolbar: { show: false },
        zoom: { enabled: false },
      },
      colors: [CHART_ORANGE],
      stroke: { curve: 'smooth', width: 2 },
      dataLabels: { enabled: false },
      xaxis: {
        categories,
        labels: {
          style: { colors: '#fff', fontSize: '12px' },
        },
        axisBorder: { show: false },
        axisTicks: { show: false },
      },
      yaxis: {
        min: 0,
        max: 50,
        tickAmount: 5,
        labels: {
          style: { colors: '#fff', fontSize: '12px' },
        },
        axisBorder: { show: false },
        axisTicks: { show: false },
      },
      grid: {
        borderColor: 'rgba(255,255,255,0.2)',
        strokeDashArray: 4,
        xaxis: { lines: { show: false } },
        yaxis: { lines: { show: true } },
      },
      markers: {
        size: 4,
        colors: '#fff',
        strokeColors: CHART_ORANGE,
        strokeWidth: 2,
        hover: { size: 6 },
      },
      tooltip: {
        theme: 'dark',
        x: { show: true },
      },
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

      <section className="flex mt-4" aria-label="Batting statistics">
        <div className="flex flex-1 flex-col items-center justify-center px-3 py-2.5">
          <p className="text-[12px] font-bold uppercase tracking-wide text-[#A2A6AB]">
            RUNS
          </p>
          <p className="mt-0.5 text-[14px] font-bold text-white">{stats.runs}</p>
        </div>
        <div
          className="w-px shrink-0 self-stretch bg-gradient-to-b from-[#00000000] via-[#FFFFFF66] to-[#00000000]"
          aria-hidden
        />
        <div className="flex flex-1 flex-col items-center justify-center px-3 py-2.5">
          <p className="text-[12px] font-bold uppercase tracking-wide text-[#A2A6AB]">
            BALLS
          </p>
          <p className="mt-0.5 text-[14px] font-bold text-white">{stats.balls}</p>
        </div>
        <div
          className="w-px shrink-0 self-stretch bg-gradient-to-b from-[#00000000] via-[#FFFFFF66] to-[#00000000]"
          aria-hidden
        />
        <div className="flex flex-1 flex-col items-center justify-center px-3 py-2.5">
          <p className="text-[12px] font-bold uppercase tracking-wide text-[#A2A6AB]">
            SR
          </p>
          <p className="mt-0.5 text-[14px] font-bold text-white">{stats.sr}</p>
        </div>
        <div
          className="w-px shrink-0 self-stretch bg-gradient-to-b from-[#00000000] via-[#FFFFFF66] to-[#00000000]"
          aria-hidden
        />
        <div className="flex flex-1 flex-col items-center justify-center px-3 py-2.5">
          <p className="text-[12px] font-bold uppercase tracking-wide text-[#A2A6AB]">
            OFF-S
          </p>
          <p className="mt-0.5 text-[14px] font-bold text-white">{stats.offSide}</p>
        </div>
        <div
          className="w-px shrink-0 self-stretch bg-gradient-to-b from-[#00000000] via-[#FFFFFF66] to-[#00000000]"
          aria-hidden
        />
        <div className="flex flex-1 flex-col items-center justify-center px-3 py-2.5">
          <p className="text-[12px] font-bold uppercase tracking-wide text-[#A2A6AB]">
            LEG-S
          </p>
          <p className="mt-0.5 text-[14px] font-bold text-white">{stats.legSide}</p>
        </div>
      </section>

      {/* Over Comparison chart */}
      <section className="mt-6" aria-label="Over comparison chart">
        <div className="flex items-center justify-between gap-4 mb-3">
          <h2 className="text-[14px] font-bold uppercase tracking-wide text-[#DA9811]">
            Over Comparison
          </h2>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setChartTeam('teamA')}
              className={`text-[12px] font-semibold transition-colors ${
                chartTeam === 'teamA' ? 'text-[#DA9811]' : 'text-white'
              }`}
            >
              {teamAName}
            </button>
            <span className="text-[#A2A6AB]">|</span>
            <button
              type="button"
              onClick={() => setChartTeam('teamB')}
              className={`text-[12px] font-semibold transition-colors ${
                chartTeam === 'teamB' ? 'text-[#DA9811]' : 'text-white'
              }`}
            >
              {teamBName}
            </button>
          </div>
        </div>
        <div className="rounded-lg bg-black overflow-hidden">
          <ReactApexChart
            type="line"
            series={chartSeries}
            options={chartOptions}
            height={220}
          />
        </div>
      </section>
    </div>
  );
}
