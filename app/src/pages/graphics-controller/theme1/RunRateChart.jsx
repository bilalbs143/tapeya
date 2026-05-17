import React from 'react';

import ReactApexChart from 'react-apexcharts';

import { CLOUDFRONT_APP_BASE } from '@/lib/constants/assets';

const controllerFrameBg = `${CLOUDFRONT_APP_BASE}/images/background/controller-frame.png`;

const frameStyle = {
  backgroundImage: `url(${controllerFrameBg})`,
  backgroundPosition: 'center',
  backgroundRepeat: 'no-repeat',
  backgroundSize: 'cover',
};

const DEFAULT_CHART_SERIES = [
  { name: 'Team A', data: [] },
  { name: 'Team B', data: [] },
];

const baseOptions = {
  chart: {
    height: 280,
    type: 'line',
    background: 'transparent',
    parentHeightOffset: 0,
    offsetX: 0,
    toolbar: { show: false },
    zoom: { enabled: false },
  },
  stroke: {
    curve: 'smooth',
    width: [2.5, 2.5, 1.5],
    dashArray: [0, 0, 6],
  },
  colors: ['#F5A623', '#4FC3F7', 'rgba(255,255,255,0.45)'],
  dataLabels: { enabled: false },
  legend: {
    show: true,
    position: 'top',
    labels: { colors: '#FFFFFF' },
    markers: { width: 10, height: 10 },
  },
  grid: {
    show: true,
    borderColor: 'rgba(255,255,255,0.08)',
    padding: { left: 10, right: 6, top: 0, bottom: 0 },
  },
  markers: {
    size: [6, 6, 0],
    strokeWidth: 0,
    hover: { size: 8 },
  },
  xaxis: {
    categories: ['01', '02', '03', '04', '05', '06'],
    title: {
      text: 'Over',
      style: { color: '#FFFFFF', fontSize: '14px', fontWeight: 500 },
    },
    labels: { style: { colors: '#FFFFFF', fontSize: '12px' } },
    axisBorder: { show: true, color: 'rgba(255,255,255,0.6)' },
    axisTicks: { show: true, color: 'rgba(255,255,255,0.6)' },
  },
  yaxis: {
    min: 0,
    max: 18,
    tickAmount: 6,
    title: {
      text: 'RPO',
      offsetX: 0,
      style: { color: '#FFFFFF', fontSize: '14px', fontWeight: 500 },
    },
    labels: {
      show: true,
      style: { colors: '#FFFFFF', fontSize: '12px' },
      minWidth: 30,
      offsetX: 2,
      formatter: (v) => v.toFixed(1),
    },
    axisBorder: { show: true, color: 'rgba(255,255,255,0.6)' },
    axisTicks: { show: true, color: 'rgba(255,255,255,0.6)' },
  },
  tooltip: { theme: 'dark', y: { formatter: (v) => `${v.toFixed(2)} RPO` } },
};

export default function RunRateChart({
  chartSeries = DEFAULT_CHART_SERIES,
  summaryCards = [],
  matchLabel = '',
  overCategories = [],
  yAxisMax = 18,
}) {
  const teamSeries = chartSeries.length > 0 ? chartSeries : DEFAULT_CHART_SERIES;

  // Append a flat "par = 6.0" reference line across all overs.
  const parLength = overCategories.length > 0 ? overCategories.length : 6;
  const parSeries = { name: 'Par (6.0)', data: Array(parLength).fill(6.0) };
  const series = [...teamSeries, parSeries];

  const dynamicOptions = React.useMemo(
    () => ({
      ...baseOptions,
      xaxis: {
        ...baseOptions.xaxis,
        categories: overCategories.length > 0 ? overCategories : baseOptions.xaxis.categories,
      },
      yaxis: {
        ...baseOptions.yaxis,
        max: Math.max(yAxisMax, 18),
      },
      // Sync dash/stroke arrays with the (potentially variable) number of series.
      stroke: {
        ...baseOptions.stroke,
        width: [...teamSeries.map(() => 2.5), 1.5],
        dashArray: [...teamSeries.map(() => 0), 6],
      },
      markers: {
        ...baseOptions.markers,
        size: [...teamSeries.map(() => 6), 0],
      },
    }),
    [overCategories, yAxisMax, teamSeries],
  );

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#1D1E22] p-3 sm:p-5">
      <section className="relative w-full max-w-[677px] overflow-hidden px-4 py-6 text-white sm:px-8 sm:py-8" style={frameStyle}>
        <div className="relative z-10">
          <h2 className="text-[20px] leading-none font-bold text-[#F5A623] uppercase sm:text-[21px]">Run Rate</h2>
          {matchLabel ? <p className="mt-2 text-[14px] leading-none text-white sm:text-[18px]">{matchLabel}</p> : null}

          <div className="mt-5 rounded-[12px] bg-[#0C0601] p-2.5 sm:mt-6 sm:p-4">
            <div className="h-[220px] sm:h-[280px]">
              <ReactApexChart type="line" options={dynamicOptions} series={series} height="100%" />
            </div>
          </div>

          {summaryCards.length > 0 ? (
            <div className="mt-3 grid grid-cols-2 gap-2 sm:mt-4 sm:flex sm:items-start sm:justify-between sm:gap-4">
              {summaryCards.map((card, index) => (
                <div
                  key={index}
                  className="w-full rounded-[10px] bg-[#0C0601] px-2.5 py-2 text-[#F5A623] sm:max-w-[214px] sm:px-4 sm:py-3"
                >
                  <div className="flex items-center justify-between text-[12px] leading-none font-medium sm:text-[16px]">
                    <span>{card.team}</span>
                    <span>{card.score}</span>
                    <span>{card.overs}</span>
                  </div>
                  <div className="mt-2 h-px bg-white/20" />
                  <div className="mt-2 flex items-center justify-between text-[12px] leading-none font-medium sm:text-[14px]">
                    <span>Six</span>
                    <span>{card.six}</span>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-[12px] leading-none font-medium sm:text-[14px]">
                    <span>Four</span>
                    <span>{card.four}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
}
