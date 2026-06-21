/**
 * Ported from theme-controller — render-only graphic.
 */
import { useEffect, useState } from 'react';

import { cn } from '@/lib/utils';

import { fsChart } from '../../config';
import { fsFont, FSStage, GlowPanel } from '../../primitives';
import { isChartGlowEnabled } from '../../visualEffects';
import { ChartHeader } from './ChartHeader';
import { ChartRightCrests } from './ChartRightCrests';
import {
  WAGON_LEGEND_LABEL,
  WAGON_PLAYER_META,
  WAGON_PLAYER_NAME,
  WAGON_SECTION_LABEL,
  WAGON_STAT_LABEL,
  WAGON_STAT_VALUE,
  WAGON_ZONE_LABEL,
  WAGON_ZONE_VALUE,
} from './chartTypographyStyles';

/** Stable SVG gradient id — one wheel per full-screen graphic. */
const GRASS_GRADIENT_ID = 'wagon-wheel-grass';

/** Wagon wheel field diameter — Ashes reference. */
const WHEEL_SIZE = 560;

/** Left column width in the wagon wheel panel grid. */
const WHEEL_COLUMN_W = 620;

const SHOT_COLORS = {
  single: '#5fd0a8',
  multi: '#9d7bff',
  four: '#5aa0ff',
  six: '#f5c85a',
};

/** Shared full-screen chart content positioning — wagon wheel panel. */
const CHART_AREA_TOP = 210;
const CHART_AREA_LEFT = 70;
const CHART_AREA_RIGHT = 540;
const CHART_AREA_BOTTOM = 72;

const LEGEND_ITEMS = [
  ['1s & 2s', SHOT_COLORS.single],
  ['3s', SHOT_COLORS.multi],
  ['FOUR', SHOT_COLORS.four],
  ['SIX', SHOT_COLORS.six],
];

/**
 * Polar coordinate on the wagon wheel field.
 * Angle: degrees clockwise from straight down (0 = bottom of screen).
 *
 * @param {number} angle
 * @param {number} dist 0..1 fraction of field radius
 * @param {number} size wheel diameter in px
 * @returns {[number, number]}
 */
function shotPoint(angle, dist, size) {
  const cx = size / 2;
  const cy = size / 2;
  const radius = size / 2 - 18;
  const rad = (angle * Math.PI) / 180;

  return [cx + radius * dist * Math.sin(rad), cy + radius * dist * Math.cos(rad)];
}

const ZONE_BAR_COLORS = ['#5aa0ff', '#9d7bff', '#5fd0a8', '#f5c85a', '#ff7eb3', '#7ec8ff', '#c8a0ff', '#ffd27e'];

/**
 * @param {Array<{ angle: number, runs: number }>} shots
 */
function summarizeShots(shots) {
  const total = shots.reduce((sum, shot) => sum + shot.runs, 0);
  const fours = shots.filter((shot) => shot.runs === 4).length;
  const sixes = shots.filter((shot) => shot.runs === 6).length;

  return { total, fours, sixes };
}

/** @param {number} runs */
function runColor(runs) {
  if (runs === 6) return SHOT_COLORS.six;
  if (runs === 4) return SHOT_COLORS.four;
  if (runs >= 2) return SHOT_COLORS.multi;
  return SHOT_COLORS.single;
}

function WagonWheelField({ shots, size = WHEEL_SIZE, animate = true }) {
  const [drawn, setDrawn] = useState(!animate);
  const cx = size / 2;
  const cy = size / 2;
  const radius = size / 2 - 18;

  useEffect(() => {
    if (!animate) {
      setDrawn(true);
      return;
    }

    setDrawn(false);
    const frame = requestAnimationFrame(() => {
      requestAnimationFrame(() => setDrawn(true));
    });

    return () => cancelAnimationFrame(frame);
  }, [animate, shots]);

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="overflow-visible" aria-hidden="true">
      <defs>
        <radialGradient id={GRASS_GRADIENT_ID} cx="50%" cy="42%" r="62%">
          <stop offset="0%" stopColor="#16361f" />
          <stop offset="70%" stopColor="#0d2415" />
          <stop offset="100%" stopColor="#091a10" />
        </radialGradient>
      </defs>

      <circle cx={cx} cy={cy} r={radius} fill={`url(#${GRASS_GRADIENT_ID})`} stroke="rgba(150,255,190,.35)" strokeWidth="2" />
      <circle
        cx={cx}
        cy={cy}
        r={radius * 0.58}
        fill="none"
        stroke="rgba(255,255,255,.14)"
        strokeWidth="1.5"
        strokeDasharray="3 7"
      />
      <line x1={cx} y1={cy - radius} x2={cx} y2={cy + radius} stroke="rgba(255,255,255,.08)" strokeWidth="1" />
      <line x1={cx - radius} y1={cy} x2={cx + radius} y2={cy} stroke="rgba(255,255,255,.08)" strokeWidth="1" />
      <rect
        x={cx - 9}
        y={cy - 34}
        width="18"
        height="68"
        rx="3"
        fill="rgba(200,180,140,.22)"
        stroke="rgba(220,200,160,.3)"
        strokeWidth="1"
      />

      {shots.map((shot, index) => {
        const [x, y] = shotPoint(shot.angle, shot.dist, size);
        const color = runColor(shot.runs);
        const length = Math.hypot(x - cx, y - cy);
        const big = shot.runs >= 4;
        const lineDelay = 300 + index * 70;
        const dotDelay = 600 + index * 70;

        return (
          <g key={`${shot.angle}-${shot.dist}-${index}`}>
            <line
              x1={cx}
              y1={cy}
              x2={x}
              y2={y}
              stroke={color}
              strokeWidth={big ? 3 : 2}
              strokeLinecap="round"
              opacity="0.92"
              strokeDasharray={length}
              strokeDashoffset={drawn ? 0 : length}
              className={cn(!animate && 'motion-reduce:transition-none')}
              style={{
                transition: animate ? `stroke-dashoffset 0.55s ${lineDelay}ms cubic-bezier(.2,.8,.2,1)` : 'none',
                filter: big ? `drop-shadow(0 0 5px ${color})` : 'none',
              }}
            />
            <circle
              cx={x}
              cy={y}
              r={big ? 6 : 4}
              fill={color}
              style={{
                opacity: drawn ? 1 : 0,
                transition: animate ? `opacity 0.3s ${dotDelay}ms` : 'none',
                filter: big ? `drop-shadow(0 0 6px ${color})` : 'none',
              }}
            />
          </g>
        );
      })}

      <circle cx={cx} cy={cy} r="6" fill="#fff" stroke="rgba(120,150,255,.8)" strokeWidth="2" />
    </svg>
  );
}

function WagonLegend() {
  return (
    <div className="flex flex-wrap justify-center gap-x-7 gap-y-3">
      {LEGEND_ITEMS.map(([label, color]) => (
        <div key={label} className="flex items-center gap-2.5">
          <span
            className="h-1.5 w-7 rounded-sm"
            style={{
              background: color,
              boxShadow: `0 0 6px ${color}`,
            }}
          />
          <span className={WAGON_LEGEND_LABEL} style={fsFont(fsChart.wagonLegend)}>
            {label}
          </span>
        </div>
      ))}
    </div>
  );
}

function WagonBigStat({ label, value, accent, dense = false }) {
  return (
    <div className="rounded-[14px] border border-white/8 bg-white/[0.04] px-5 py-4">
      <div className={WAGON_STAT_LABEL} style={fsFont(dense ? fsChart.wagonStatLabelDense : fsChart.wagonStatLabel)}>
        {label}
      </div>
      <div
        className={WAGON_STAT_VALUE}
        style={{ ...fsFont(dense ? fsChart.wagonStatValueDense : fsChart.wagonStatValue), color: accent }}
      >
        {value}
      </div>
    </div>
  );
}

function WagonZoneBar({ label, value, total, color, compact = false }) {
  const pct = total ? Math.round((value / total) * 100) : 0;

  return (
    <div className="min-w-0">
      <div className={cn('flex items-baseline justify-between gap-2', compact ? 'mb-0' : 'mb-0.5')}>
        <span
          className={WAGON_ZONE_LABEL}
          style={fsFont(compact ? fsChart.wagonZoneLabelDense : fsChart.wagonZoneLabel)}
          title={label}
        >
          {label}
        </span>
        <span className={WAGON_ZONE_VALUE} style={fsFont(compact ? fsChart.wagonZoneValueDense : fsChart.wagonZoneValue)}>
          {value} · {pct}%
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-md bg-white/[0.06]">
        <div
          className={cn(
            'h-full rounded-md',
            'motion-safe:animate-[growW_.9s_cubic-bezier(.2,.8,.2,1)]',
            'motion-reduce:animate-none',
          )}
          style={{
            width: `${pct}%`,
            background: `linear-gradient(90deg, ${color}, var(--accentB))`,
            ...(isChartGlowEnabled() ? { boxShadow: `0 0 calc(10px * var(--glow)) ${color}` } : {}),
          }}
        />
      </div>
    </div>
  );
}

function WagonStatsPanel({ player, stats, zoneBreakdown = [] }) {
  const denseZones = zoneBreakdown.length >= 5;

  return (
    <div className={cn('flex flex-col', denseZones ? 'gap-4' : 'gap-[26px]')}>
      <div>
        <div className={WAGON_SECTION_LABEL} style={fsFont(fsChart.wagonSectionLabel)}>
          SHOT MAP
        </div>
        <div className={WAGON_PLAYER_NAME} style={fsFont(denseZones ? fsChart.wagonPlayerNameDense : fsChart.wagonPlayerName)}>
          {player.name}
        </div>
        {player.teamName || player.role ? (
          <div className={WAGON_PLAYER_META} style={fsFont(fsChart.wagonPlayerMeta)}>
            {[player.teamName, player.role].filter(Boolean).join(' · ')}
          </div>
        ) : null}
      </div>

      <div className="grid grid-cols-3 gap-3.5">
        <WagonBigStat label="RUNS" value={stats.total} accent="#dbe8ff" dense={denseZones} />
        <WagonBigStat label="FOURS" value={stats.fours} accent="#5aa0ff" dense={denseZones} />
        <WagonBigStat label="SIXES" value={stats.sixes} accent="#f5c85a" dense={denseZones} />
      </div>

      {zoneBreakdown.length > 0 ? (
        <div className="flex flex-col" style={{ gap: denseZones ? fsChart.wagonZoneRowGapDense : fsChart.wagonZoneRowGap }}>
          {zoneBreakdown.map((zone, index) => (
            <WagonZoneBar
              key={zone.id}
              label={zone.label}
              value={zone.runs}
              total={stats.total}
              color={ZONE_BAR_COLORS[index % ZONE_BAR_COLORS.length]}
              compact={zoneBreakdown.length >= 2}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function WagonWheelGraphic({ data }) {
  const { title, sub, teams, player, shots, zoneBreakdown = [] } = data;
  const stats = summarizeShots(shots);

  return (
    <FSStage>
      <ChartHeader title={title} sub={sub} />
      <ChartRightCrests top={teams.top} bottom={teams.bottom} />

      <div
        className={cn(
          'absolute',
          'motion-safe:animate-[fadeUp_.6s_cubic-bezier(.18,.9,.2,1)_both]',
          'motion-reduce:animate-none',
        )}
        style={{
          top: CHART_AREA_TOP,
          left: CHART_AREA_LEFT,
          right: CHART_AREA_RIGHT,
          bottom: CHART_AREA_BOTTOM,
        }}
      >
        <GlowPanel
          radius={26}
          className="grid h-full w-full items-center gap-12 p-11"
          style={{ gridTemplateColumns: `${WHEEL_COLUMN_W}px 1fr` }}
        >
          <div className="flex flex-col items-center gap-[22px]">
            <WagonWheelField shots={shots} />
            <WagonLegend />
          </div>

          <WagonStatsPanel player={player} stats={stats} zoneBreakdown={zoneBreakdown} />
        </GlowPanel>
      </div>
    </FSStage>
  );
}
