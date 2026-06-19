/**
 * Ported from theme-controller — render-only graphic.
 */
import { useEffect, useState } from 'react';

import { cn } from '@/lib/utils';

import { DISPLAY_FONT, FSStage, GlowPanel, UI_FONT } from '../../primitives';
import { ChartRightCrests } from './ChartRightCrests';

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

/** Shared full-screen chart content positioning — matches worm / Manhattan / wagon wheel. */
const CHART_AREA_LEFT = 70;
const CHART_AREA_TOP = 220;
const CHART_AREA_RIGHT = 540;
const CHART_AREA_BOTTOM = 72;

const chartTitleClass = cn('m-0 text-[76px] font-extrabold leading-[0.95] text-white uppercase whitespace-nowrap', DISPLAY_FONT);

const chartSubClass = cn('mt-2.5 mb-0 text-[24px] font-semibold tracking-[0.06em] text-[var(--muted)] uppercase', UI_FONT);

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

/**
 * @param {Array<{ angle: number, runs: number }>} shots
 */
function summarizeShots(shots) {
  const total = shots.reduce((sum, shot) => sum + shot.runs, 0);
  const fours = shots.filter((shot) => shot.runs === 4).length;
  const sixes = shots.filter((shot) => shot.runs === 6).length;
  const offSide = shots.filter((shot) => shot.angle > 0).reduce((sum, shot) => sum + shot.runs, 0);
  const legSide = shots.filter((shot) => shot.angle <= 0).reduce((sum, shot) => sum + shot.runs, 0);

  return { total, fours, sixes, offSide, legSide };
}

/** @param {number} runs */
function runColor(runs) {
  if (runs === 6) return SHOT_COLORS.six;
  if (runs === 4) return SHOT_COLORS.four;
  if (runs >= 2) return SHOT_COLORS.multi;
  return SHOT_COLORS.single;
}

function ChartHeader({ title, sub }) {
  return (
    <div className="absolute top-14 right-[520px] left-[70px] z-[3]">
      <h2 className={chartTitleClass}>{title}</h2>
      {sub ? <p className={chartSubClass}>{sub}</p> : null}
    </div>
  );
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
    <div className="flex flex-wrap gap-[22px]">
      {LEGEND_ITEMS.map(([label, color]) => (
        <div key={label} className="flex items-center gap-2">
          <span
            className="h-1 w-[22px] rounded-sm"
            style={{
              background: color,
              boxShadow: `0 0 6px ${color}`,
            }}
          />
          <span className={cn('text-[16px] font-semibold tracking-[0.04em] text-[var(--muted)]', UI_FONT)}>{label}</span>
        </div>
      ))}
    </div>
  );
}

function WagonBigStat({ label, value, accent }) {
  return (
    <div className="rounded-[14px] border border-white/8 bg-white/[0.04] px-[18px] py-4">
      <div className={cn('text-[13px] font-semibold tracking-[0.14em] text-[var(--faint)] uppercase', UI_FONT)}>{label}</div>
      <div className={cn('mt-1 text-[46px] leading-none font-extrabold', DISPLAY_FONT)} style={{ color: accent }}>
        {value}
      </div>
    </div>
  );
}

function WagonZoneBar({ label, value, total, color }) {
  const pct = total ? Math.round((value / total) * 100) : 0;

  return (
    <div>
      <div className="mb-1.5 flex justify-between">
        <span className={cn('text-[16px] font-semibold tracking-[0.08em] text-[var(--muted)] uppercase', UI_FONT)}>{label}</span>
        <span className={cn('text-[16px] text-[var(--text)]', '[font-family:var(--font-mono)]')}>
          {value} runs · {pct}%
        </span>
      </div>
      <div className="h-2.5 overflow-hidden rounded-md bg-white/[0.06]">
        <div
          className={cn(
            'h-full rounded-md',
            'motion-safe:animate-[growW_.9s_cubic-bezier(.2,.8,.2,1)]',
            'motion-reduce:animate-none',
          )}
          style={{
            width: `${pct}%`,
            background: `linear-gradient(90deg, ${color}, var(--accentB))`,
            boxShadow: `0 0 calc(10px * var(--glow)) ${color}`,
          }}
        />
      </div>
    </div>
  );
}

function WagonStatsPanel({ player, stats }) {
  return (
    <div className="flex flex-col gap-[26px]">
      <div>
        <div className={cn('text-[16px] font-bold tracking-[0.2em] text-[#9db4ff] uppercase', UI_FONT)}>SHOT MAP</div>
        <div className={cn('mt-1.5 text-[58px] leading-none font-extrabold text-white', DISPLAY_FONT)}>{player.name}</div>
        {player.teamName || player.role ? (
          <div className={cn('mt-1 text-[20px] text-[var(--muted)]', UI_FONT)}>
            {[player.teamName, player.role].filter(Boolean).join(' · ')}
          </div>
        ) : null}
      </div>

      <div className="grid grid-cols-3 gap-3.5">
        <WagonBigStat label="RUNS" value={stats.total} accent="#dbe8ff" />
        <WagonBigStat label="FOURS" value={stats.fours} accent="#5aa0ff" />
        <WagonBigStat label="SIXES" value={stats.sixes} accent="#f5c85a" />
      </div>

      <div className="flex flex-col gap-3">
        <WagonZoneBar label="OFF SIDE" value={stats.offSide} total={stats.total} color="#5aa0ff" />
        <WagonZoneBar label="LEG SIDE" value={stats.legSide} total={stats.total} color="#9d7bff" />
      </div>
    </div>
  );
}

export function WagonWheelGraphic({ data }) {
  const { title, sub, teams, player, shots } = data;
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

          <WagonStatsPanel player={player} stats={stats} />
        </GlowPanel>
      </div>
    </FSStage>
  );
}
