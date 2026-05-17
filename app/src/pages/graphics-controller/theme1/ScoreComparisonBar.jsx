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

const chartOptions = {
  chart: {
    height: 280,
    type: 'bar',
    background: 'transparent',
    parentHeightOffset: 0,
    offsetX: 0,
    toolbar: { show: false },
    zoom: { enabled: false },
  },
  plotOptions: {
    bar: {
      horizontal: false,
      columnWidth: '90%',
      borderRadius: 0,
    },
  },
  colors: ['#2ACE7C', '#FFFFFF'],
  dataLabels: { enabled: false },
  legend: { show: false },
  grid: {
    show: false,
    padding: { left: 10, right: 6, top: 0, bottom: 0 },
  },
  xaxis: {
    categories: ['01', '02', '03', '04', '05', '06'],
    title: {
      text: 'Overs',
      style: { color: '#FFFFFF', fontSize: '14px', fontWeight: 500 },
    },
    labels: {
      style: { colors: '#FFFFFF', fontSize: '12px' },
    },
    axisBorder: { show: true, color: 'rgba(255,255,255,0.6)' },
    axisTicks: { show: true, color: 'rgba(255,255,255,0.6)' },
  },
  yaxis: {
    min: 0,
    max: 100,
    tickAmount: 5,
    title: {
      text: 'Runs',
      offsetX: 0,
      style: { color: '#FFFFFF', fontSize: '14px', fontWeight: 500 },
    },
    labels: {
      show: true,
      style: { colors: '#FFFFFF', fontSize: '12px' },
      minWidth: 30,
      offsetX: 2,
      formatter: (value) => String(Math.round(value)),
    },
    axisBorder: { show: true, color: 'rgba(255,255,255,0.6)' },
    axisTicks: { show: true, color: 'rgba(255,255,255,0.6)' },
  },
  tooltip: {
    theme: 'dark',
  },
  responsive: [
    {
      breakpoint: 640,
      options: {
        chart: { height: 220, offsetX: 0 },
        grid: { padding: { left: 12, right: 4, top: 0, bottom: 0 } },
        plotOptions: {
          bar: {
            columnWidth: '70%',
            borderRadius: 0,
          },
        },
        xaxis: {
          title: { style: { fontSize: '12px' } },
          labels: { style: { fontSize: '10px' } },
        },
        yaxis: {
          title: {
            text: 'Runs',
            offsetX: 0,
            style: { color: '#FFFFFF', fontSize: '14px', fontWeight: 500 },
          },
          labels: {
            style: { colors: '#FFFFFF', fontSize: '12px' },
            minWidth: 30,
            offsetX: 2,
          },
        },
      },
    },
  ],
};

export default function ScoreComparisonBar({
  chartSeries = DEFAULT_CHART_SERIES,
  summaryCards = [],
  matchLabel = '',
  overCategories = [],
  yAxisMax = 100,
  chartTitle = 'Score Comparison',
  yAxisLabel = 'Runs',
}) {
  const series = chartSeries.length > 0 ? chartSeries : DEFAULT_CHART_SERIES;

  const dynamicOptions = React.useMemo(
    () => ({
      ...chartOptions,
      xaxis: {
        ...chartOptions.xaxis,
        categories: overCategories.length > 0 ? overCategories : chartOptions.xaxis.categories,
      },
      yaxis: {
        ...chartOptions.yaxis,
        max: yAxisMax,
        title: { ...chartOptions.yaxis.title, text: yAxisLabel },
      },
    }),
    [overCategories, yAxisMax, yAxisLabel],
  );

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#1D1E22] p-3 sm:p-5">
      <section className="relative w-full max-w-[677px] overflow-hidden px-4 py-6 text-white sm:px-8 sm:py-8" style={frameStyle}>
        <div className="relative z-10">
          <h2 className="text-[20px] leading-none font-bold text-[#F5A623] uppercase sm:text-[21px]">{chartTitle}</h2>
          {matchLabel ? <p className="mt-2 text-[14px] leading-none text-white sm:text-[18px]">{matchLabel}</p> : null}

          <div className="mt-5 rounded-[12px] bg-[#0C0601] p-2.5 sm:mt-6 sm:p-4">
            <div className="h-[220px] sm:h-[280px]">
              <ReactApexChart type="bar" options={dynamicOptions} series={series} height="100%" />
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
