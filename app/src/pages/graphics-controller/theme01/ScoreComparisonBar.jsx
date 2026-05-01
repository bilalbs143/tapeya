import ReactApexChart from 'react-apexcharts';

const CLOUDFRONT_APP_BASE = 'https://d1nmw2vhka3zp0.cloudfront.net/app';
const controllerFrameBg = `${CLOUDFRONT_APP_BASE}/images/background/controller-frame.png`;

const frameStyle = {
  backgroundImage: `url(${controllerFrameBg})`,
  backgroundPosition: 'center',
  backgroundRepeat: 'no-repeat',
  backgroundSize: 'cover',
};

const TEAM_COLORS = Object.freeze({
  A: '#2ACE7C',
  B: '#E6E6E6',
});

const chartSeries = [
  {
    name: 'Team A',
    data: [18, 14, 35, 27, 55, 51],
  },
  {
    name: 'Team B',
    data: [10, 29, 64, 56, 68, 87],
  },
];

const OVER_CATEGORIES = ['01', '02', '03', '04', '05', '06'];
const SUMMARY_CARDS = [
  { team: 'KKR', score: '197-4', overs: 'Over 7.4', six: '10', four: '12' },
  { team: 'KKR', score: '197-4', overs: 'Over 7.4', six: '10', four: '12' },
];

// Wicket marker dots rendered above bars.
const wicketEvents = [
  { overIndex: 2, team: 'A', count: 2 }, // Over 03, Team A
  { overIndex: 2, team: 'B', count: 1 }, // Over 03, Team B
  { overIndex: 4, team: 'B', count: 1 }, // Over 05, Team B
];

function buildWicketAnnotationPoints({ markerSize = 8, xOffsetScale = 2 }) {
  return wicketEvents.flatMap(({ overIndex, team, count }) => {
    const seriesIndex = team === 'A' ? 0 : 1;
    const y = chartSeries[seriesIndex].data[overIndex] + 4;

    return Array.from({ length: count }, (_, markerIndex) => ({
      x: OVER_CATEGORIES[overIndex],
      y,
      seriesIndex,
      marker: {
        size: markerSize,
        fillColor: TEAM_COLORS[team],
        strokeWidth: 0,
        // For multiple wickets, start from bar-left with a minor gap.
        offsetX: (count === 1 ? 0 : -7 + markerIndex * 5) * xOffsetScale,
        offsetY: 0,
      },
    }));
  });
}

const wicketAnnotationPoints = buildWicketAnnotationPoints({ markerSize: 5 });
const mobileWicketAnnotationPoints = buildWicketAnnotationPoints({
  markerSize: 3,
  xOffsetScale: 0.85,
});

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
  annotations: {
    points: wicketAnnotationPoints,
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
        annotations: {
          points: mobileWicketAnnotationPoints,
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

export default function ScoreComparisonBar() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#1D1E22] p-3 sm:p-5">
      <section
        className="relative w-full max-w-[677px] overflow-hidden px-4 py-6 text-white sm:px-8 sm:py-8"
        style={frameStyle}
      >
        <div className="relative z-10">
          <h2 className="text-[20px] leading-none font-bold text-[#DA9811] uppercase sm:text-[21px]">
            Score Comparison
          </h2>
          <p className="mt-2 text-[14px] leading-none text-white sm:text-[18px]">
            Tournament (Match -7)
          </p>

          <div className="mt-5 rounded-[12px] bg-[#0C0601] p-2.5 sm:mt-6 sm:p-4">
            <div className="h-[220px] sm:h-[280px]">
              <ReactApexChart
                type="bar"
                options={chartOptions}
                series={chartSeries}
                height="100%"
              />
            </div>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2 sm:mt-4 sm:flex sm:items-start sm:justify-between sm:gap-4">
            {SUMMARY_CARDS.map((card, index) => (
              <div
                key={index}
                className="w-full rounded-[10px] bg-[#0C0601] px-2.5 py-2 text-[#DA9811] sm:max-w-[214px] sm:px-4 sm:py-3"
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
        </div>
      </section>
    </div>
  );
}
