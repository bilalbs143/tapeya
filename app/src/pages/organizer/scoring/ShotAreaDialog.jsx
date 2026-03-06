/**
 * Shot area dialog – reusable "Select Shot Area" modal with stadium and shot-direction zones.
 * Used in Scoring tab (when recording runs) and Stats tab.
 */

import { useId } from 'react';

import stadiumBg from '@/assets/images/standard/stadium-bg.png';
import {
  Dialog,
  DialogContentProfile,
  DialogScrollBody,
  DialogTitle,
} from '@/ui/Dialog';

// ─── Shot direction data (shared with ShotDirectionPicker) ─────────────────

/** Shot-direction zones matched exactly to SVG path geometry (path index = zone index). */
export const SHOT_DIRECTION_ZONES = [
  { id: 'square_leg', label: 'SQUARE LEG', labelLine1: 'SQUARE', labelLine2: 'LEG' },
  { id: 'deep_fine_leg', label: 'DEEP FINE LEG', labelLine1: 'DEEP FINE', labelLine2: 'LEG' },
  { id: 'third_man', label: 'THIRD MAN', labelLine1: 'THIRD', labelLine2: 'MAN' },
  { id: 'deep_point', label: 'DEEP POINT', labelLine1: 'DEEP', labelLine2: 'POINT' },
  { id: 'deep_cover', label: 'DEEP COVER', labelLine1: 'DEEP', labelLine2: 'COVER' },
  { id: 'long_off', label: 'LONG OFF', labelLine1: 'LONG', labelLine2: 'OFF' },
  { id: 'long_on', label: 'LONG ON', labelLine1: 'LONG', labelLine2: 'ON' },
  { id: 'mid_wicket', label: 'MID WICKET', labelLine1: 'MID', labelLine2: 'WICKET' },
];

/** SVG path data for each shot-direction segment (viewBox 0 0 273 274). */
const SHOT_DIRECTION_PATHS = [
  'M136.5 0C118.575 -2.13759e-07 100.825 3.53068 84.2637 10.3904C67.7028 17.2502 52.6551 27.3047 39.9799 39.9799L136.5 136.5L136.5 0Z',
  'M233.02 39.9799C207.421 14.3812 172.702 4.31705e-07 136.5 0L136.5 136.5L233.02 39.9799Z',
  'M273 136.5C273 118.575 269.469 100.825 262.61 84.2637C255.75 67.7028 245.695 52.6551 233.02 39.9799L136.5 136.5H273Z',
  'M233.02 233.02C245.695 220.345 255.75 205.297 262.61 188.736C269.469 172.175 273 154.425 273 136.5L136.5 136.5L233.02 233.02Z',
  'M136.5 273C154.425 273 172.175 269.469 188.736 262.61C205.297 255.75 220.345 245.695 233.02 233.02L136.5 136.5L136.5 273Z',
  'M39.9799 233.02C52.6551 245.695 67.7028 255.75 84.2637 262.61C100.825 269.469 118.575 273 136.5 273L136.5 136.5L39.9799 233.02Z',
  'M0 136.5C-1.56709e-06 154.425 3.53067 172.175 10.3904 188.736C17.2502 205.297 27.3047 220.345 39.9799 233.02L136.5 136.5L0 136.5Z',
  'M39.9799 39.9799C27.3047 52.6551 17.2502 67.7028 10.3904 84.2637C3.53067 100.825 -2.70666e-06 118.575 0 136.5L136.5 136.5L39.9799 39.9799Z',
];

const SHOT_DIRECTION_LABEL_POSITIONS = [
  { angleDeg: 247.5, r: 100 },
  { angleDeg: 292.5, r: 100 },
  { angleDeg: 337.5, r: 100 },
  { angleDeg: 22.5, r: 100 },
  { angleDeg: 67.5, r: 100 },
  { angleDeg: 112.5, r: 100 },
  { angleDeg: 157.5, r: 100 },
  { angleDeg: 202.5, r: 100 },
];

// ─── Shot direction stats (percentages from ball history) ───────────────────

/**
 * From ball history, count how many run-scoring balls had each shot direction.
 * Returns { total, percentages } where percentages[i] is the share (0–100) for SHOT_DIRECTION_ZONES[i].
 */
export function getShotDirectionPercentages(ballHistory = []) {
  const counts = SHOT_DIRECTION_ZONES.map(() => 0);
  let total = 0;
  for (const ball of ballHistory) {
    if (ball.type !== 'runs' || !ball.shotDirection) continue;
    const idx = SHOT_DIRECTION_ZONES.findIndex((z) => z.id === ball.shotDirection);
    if (idx >= 0) {
      counts[idx] += 1;
      total += 1;
    }
  }
  const percentages = total > 0
    ? counts.map((c) => Math.round((c / total) * 100))
    : counts.map(() => 0);
  return { total, percentages };
}

// ─── ShotDirectionPicker ──────────────────────────────────────────────────

/**
 * Stadium image with overlaid selectable shot-direction zones.
 * Can be used standalone (e.g. inline in Stats) or inside ShotAreaDialog.
 */
export function ShotDirectionPicker({ stadiumSrc, onSelect, className = '' }) {
  const SVG_VIEWBOX = { width: 273, height: 274 };
  const CX = 136.5;
  const CY = 136.5;
  const filterId = `shot-zone-text-shadow-${useId().replace(/[^a-zA-Z0-9-]/g, '')}`;

  return (
    <div className={`relative w-full max-w-[273px] mx-auto ${className}`}>
      <img
        src={stadiumSrc}
        alt=""
        className="block w-full h-auto rounded-lg"
        style={{ aspectRatio: `${SVG_VIEWBOX.width} / ${SVG_VIEWBOX.height}` }}
      />
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none rounded-lg"
        viewBox={`0 0 ${SVG_VIEWBOX.width} ${SVG_VIEWBOX.height}`}
        preserveAspectRatio="xMidYMid meet"
        aria-hidden
      >
        <defs>
          <filter id={filterId} x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="0" stdDeviation="1" floodColor="#000" floodOpacity="0.8" />
          </filter>
        </defs>
        {SHOT_DIRECTION_ZONES.map((zone, i) => {
          const pos = SHOT_DIRECTION_LABEL_POSITIONS[i];
          const angleDeg = pos.angleDeg;
          const r = pos.r;
          const angleRad = (angleDeg * Math.PI) / 180;
          const x = CX + r * Math.cos(angleRad);
          const y = CY + r * Math.sin(angleRad);
          const lineHeight = 11;
          const rotation = 0;
          return (
            <g
              key={zone.id}
              transform={`rotate(${rotation}, ${x}, ${y})`}
              style={{ filter: `url(#${filterId})` }}
            >
              <text
                x={x}
                y={y - lineHeight / 2}
                textAnchor="middle"
                dominantBaseline="middle"
                className="fill-white font-bold uppercase pointer-events-none"
                style={{ fontSize: 10, letterSpacing: '0.05em' }}
              >
                {zone.labelLine1}
              </text>
              <text
                x={x}
                y={y + lineHeight / 2}
                textAnchor="middle"
                dominantBaseline="middle"
                className="fill-white font-bold uppercase pointer-events-none"
                style={{ fontSize: 10, letterSpacing: '0.05em' }}
              >
                {zone.labelLine2}
              </text>
            </g>
          );
        })}
      </svg>
      <svg
        className="absolute inset-0 w-full h-full cursor-pointer rounded-lg"
        viewBox={`0 0 ${SVG_VIEWBOX.width} ${SVG_VIEWBOX.height}`}
        preserveAspectRatio="xMidYMid meet"
      >
        {SHOT_DIRECTION_PATHS.map((d, i) => {
          const zone = SHOT_DIRECTION_ZONES[i];
          return (
            <path
              key={zone.id}
              d={d}
              fill="transparent"
              stroke="white"
              strokeWidth="2"
              className="fill-transparent stroke-white opacity-40 transition-all duration-200 hover:fill-white/20 hover:opacity-80 hover:stroke-white/90 focus:fill-white/20 focus:opacity-80 focus:outline-none"
              onClick={() => onSelect(zone.id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onSelect(zone.id);
                }
              }}
              role="button"
              tabIndex={-1}
              aria-label={zone.label}
            />
          );
        })}
      </svg>
    </div>
  );
}

// ─── ShotDirectionStats (view-only percentage wheel) ────────────────────────

/**
 * View-only shot direction distribution: same circular field with percentage per segment.
 * Percentages are derived from ballHistory (run-scoring balls with shotDirection).
 */
export function ShotDirectionStats({ ballHistory = [], stadiumSrc = stadiumBg, className = '' }) {
  const SVG_VIEWBOX = { width: 273, height: 274 };
  const CX = 136.5;
  const CY = 136.5;
  const { percentages } = getShotDirectionPercentages(ballHistory);

  return (
    <div className={`relative w-full max-w-[273px] mx-auto ${className}`}>
      <img
        src={stadiumSrc}
        alt=""
        className="block w-full h-auto rounded-lg"
        style={{ aspectRatio: `${SVG_VIEWBOX.width} / ${SVG_VIEWBOX.height}` }}
      />
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none rounded-lg"
        viewBox={`0 0 ${SVG_VIEWBOX.width} ${SVG_VIEWBOX.height}`}
        preserveAspectRatio="xMidYMid meet"
        aria-hidden
      >
        {SHOT_DIRECTION_ZONES.map((zone, i) => {
          const pos = SHOT_DIRECTION_LABEL_POSITIONS[i];
          const angleDeg = pos.angleDeg;
          const r = pos.r;
          const angleRad = (angleDeg * Math.PI) / 180;
          const x = CX + r * Math.cos(angleRad);
          const y = CY + r * Math.sin(angleRad);
          const pct = percentages[i] ?? 0;
          return (
            <text
              key={zone.id}
              x={x}
              y={y}
              textAnchor="middle"
              dominantBaseline="middle"
              className="fill-white font-bold pointer-events-none"
              style={{ fontSize: 14, letterSpacing: '0.02em' }}
            >
              {pct}%
            </text>
          );
        })}
      </svg>
      {/* Segment boundaries (no hover, view-only) */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none rounded-lg"
        viewBox={`0 0 ${SVG_VIEWBOX.width} ${SVG_VIEWBOX.height}`}
        preserveAspectRatio="xMidYMid meet"
      >
        {SHOT_DIRECTION_PATHS.map((d, i) => (
          <path
            key={SHOT_DIRECTION_ZONES[i].id}
            d={d}
            fill="transparent"
            stroke="white"
            strokeWidth="2"
            style={{ opacity: 0.4 }}
          />
        ))}
      </svg>
    </div>
  );
}

// ─── ShotAreaDialog ───────────────────────────────────────────────────────

/**
 * Dialog that shows "Select Shot Area" with the stadium picker.
 * @param {{ open: boolean, onOpenChange: (open: boolean) => void, onSelect: (zoneId: string) => void, title?: string, stadiumSrc?: string }} props
 */
export function ShotAreaDialog({
  open,
  onOpenChange,
  onSelect,
  title = 'Select Shot Area',
  stadiumSrc = stadiumBg,
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContentProfile className="!h-auto !max-h-[90vh]">
        <div className="shrink-0 px-5 pt-5">
          <DialogTitle className="text-[14px] !font-bold uppercase text-center tracking-wide text-[#DA9811]">
            {title}
          </DialogTitle>
        </div>
        <DialogScrollBody className="flex flex-col items-center gap-4 py-4">
          <ShotDirectionPicker
            stadiumSrc={stadiumSrc}
            onSelect={onSelect}
            className="max-h-[50vh]"
          />
        </DialogScrollBody>
      </DialogContentProfile>
    </Dialog>
  );
}
