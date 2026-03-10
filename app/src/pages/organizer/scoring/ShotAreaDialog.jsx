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

import {
  getShotDirectionPercentages,
  SHOT_DIRECTION_ZONES,
  SHOT_ZONE_GEOMETRY,
} from './shotAreaUtils';

// ─── ShotDirectionPicker ──────────────────────────────────────────────────

/**
 * Stadium image with overlaid selectable shot-direction zones.
 * @param {Array} [zones] - Zones from API (getShotPositionOptions) or default SHOT_DIRECTION_ZONES. Each { id, label, labelLine1, labelLine2 }.
 */
export function ShotDirectionPicker({
  zones: zonesProp,
  stadiumSrc,
  onSelect,
  className = '',
}) {
  const SVG_VIEWBOX = { width: 273, height: 274 };
  const CX = 136.5;
  const CY = 136.5;
  const filterId = `shot-zone-text-shadow-${useId().replace(/[^a-zA-Z0-9-]/g, '')}`;
  const zones =
    Array.isArray(zonesProp) && zonesProp.length > 0
      ? zonesProp.filter((z) => SHOT_ZONE_GEOMETRY[z.id ?? z.value])
      : SHOT_DIRECTION_ZONES;

  return (
    <div className={`relative mx-auto w-full max-w-[273px] ${className}`}>
      <img
        src={stadiumSrc}
        alt=""
        className="block h-auto w-full rounded-lg"
        style={{ aspectRatio: `${SVG_VIEWBOX.width} / ${SVG_VIEWBOX.height}` }}
      />
      <svg
        className="pointer-events-none absolute inset-0 h-full w-full rounded-lg"
        viewBox={`0 0 ${SVG_VIEWBOX.width} ${SVG_VIEWBOX.height}`}
        preserveAspectRatio="xMidYMid meet"
        aria-hidden
      >
        <defs>
          <filter id={filterId} x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow
              dx="0"
              dy="0"
              stdDeviation="1"
              floodColor="#000"
              floodOpacity="0.8"
            />
          </filter>
        </defs>
        {zones.map((zone) => {
          const geom = SHOT_ZONE_GEOMETRY[zone.id ?? zone.value];
          if (!geom?.position) return null;
          const { angleDeg, r } = geom.position;
          const angleRad = (angleDeg * Math.PI) / 180;
          const x = CX + r * Math.cos(angleRad);
          const y = CY + r * Math.sin(angleRad);
          const lineHeight = 11;
          const rotation = 0;
          return (
            <g
              key={zone.id ?? zone.value}
              transform={`rotate(${rotation}, ${x}, ${y})`}
              style={{ filter: `url(#${filterId})` }}
            >
              <text
                x={x}
                y={y - lineHeight / 2}
                textAnchor="middle"
                dominantBaseline="middle"
                className="pointer-events-none fill-white font-bold uppercase"
                style={{ fontSize: 10, letterSpacing: '0.05em' }}
              >
                {zone.labelLine1 ?? zone.label ?? ''}
              </text>
              {(zone.labelLine2 ?? '') && (
                <text
                  x={x}
                  y={y + lineHeight / 2}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="pointer-events-none fill-white font-bold uppercase"
                  style={{ fontSize: 10, letterSpacing: '0.05em' }}
                >
                  {zone.labelLine2}
                </text>
              )}
            </g>
          );
        })}
      </svg>
      <svg
        className="absolute inset-0 h-full w-full cursor-pointer rounded-lg"
        viewBox={`0 0 ${SVG_VIEWBOX.width} ${SVG_VIEWBOX.height}`}
        preserveAspectRatio="xMidYMid meet"
      >
        {zones.map((zone) => {
          const geom = SHOT_ZONE_GEOMETRY[zone.id ?? zone.value];
          if (!geom?.path) return null;
          const zoneId = zone.id ?? zone.value;
          return (
            <path
              key={zoneId}
              d={geom.path}
              fill="transparent"
              stroke="white"
              strokeWidth="2"
              className="fill-transparent stroke-white opacity-40 transition-all duration-200 hover:fill-white/20 hover:stroke-white/90 hover:opacity-80 focus:fill-white/20 focus:opacity-80 focus:outline-none"
              onClick={() => onSelect(zoneId)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onSelect(zoneId);
                }
              }}
              role="button"
              tabIndex={-1}
              aria-label={zone.label ?? zoneId}
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
 * @param {Array} [zones] - Zones from API or default; order must match getShotDirectionPercentages.
 */
export function ShotDirectionStats({
  ballHistory = [],
  zones: zonesProp,
  stadiumSrc = stadiumBg,
  className = '',
}) {
  const SVG_VIEWBOX = { width: 273, height: 274 };
  const CX = 136.5;
  const CY = 136.5;
  const zones =
    Array.isArray(zonesProp) && zonesProp.length > 0
      ? zonesProp.filter((z) => SHOT_ZONE_GEOMETRY[z.id ?? z.value])
      : SHOT_DIRECTION_ZONES;
  const { percentages } = getShotDirectionPercentages(ballHistory, zones);

  return (
    <div className={`relative mx-auto w-full max-w-[273px] ${className}`}>
      <img
        src={stadiumSrc}
        alt=""
        className="block h-auto w-full rounded-lg"
        style={{ aspectRatio: `${SVG_VIEWBOX.width} / ${SVG_VIEWBOX.height}` }}
      />
      <svg
        className="pointer-events-none absolute inset-0 h-full w-full rounded-lg"
        viewBox={`0 0 ${SVG_VIEWBOX.width} ${SVG_VIEWBOX.height}`}
        preserveAspectRatio="xMidYMid meet"
        aria-hidden
      >
        {zones.map((zone, i) => {
          const geom = SHOT_ZONE_GEOMETRY[zone.id ?? zone.value];
          if (!geom?.position) return null;
          const { angleDeg, r } = geom.position;
          const angleRad = (angleDeg * Math.PI) / 180;
          const x = CX + r * Math.cos(angleRad);
          const y = CY + r * Math.sin(angleRad);
          const pct = percentages[i] ?? 0;
          return (
            <text
              key={zone.id ?? zone.value}
              x={x}
              y={y}
              textAnchor="middle"
              dominantBaseline="middle"
              className="pointer-events-none fill-white font-bold"
              style={{ fontSize: 14, letterSpacing: '0.02em' }}
            >
              {pct}%
            </text>
          );
        })}
      </svg>
      <svg
        className="pointer-events-none absolute inset-0 h-full w-full rounded-lg"
        viewBox={`0 0 ${SVG_VIEWBOX.width} ${SVG_VIEWBOX.height}`}
        preserveAspectRatio="xMidYMid meet"
      >
        {zones.map((zone) => {
          const geom = SHOT_ZONE_GEOMETRY[zone.id ?? zone.value];
          if (!geom?.path) return null;
          return (
            <path
              key={zone.id ?? zone.value}
              d={geom.path}
              fill="transparent"
              stroke="white"
              strokeWidth="2"
              style={{ opacity: 0.4 }}
            />
          );
        })}
      </svg>
    </div>
  );
}

// ─── ShotAreaDialog ───────────────────────────────────────────────────────

/**
 * Dialog that shows "Select Shot Area" with the stadium picker.
 * @param {{ open: boolean, onOpenChange: (open: boolean) => void, onSelect: (zoneId: string) => void, title?: string, stadiumSrc?: string, zones?: Array }} props
 * zones: from getShotPositionOptions(enums.shot_position) when using API; otherwise default zones used.
 */
export function ShotAreaDialog({
  open,
  onOpenChange,
  onSelect,
  title = 'Select Shot Area',
  stadiumSrc = stadiumBg,
  zones: zonesProp,
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContentProfile className="!h-auto !max-h-[90vh]">
        <div className="shrink-0 px-5 pt-5">
          <DialogTitle className="text-center text-[14px] !font-bold tracking-wide text-[#DA9811] uppercase">
            {title}
          </DialogTitle>
        </div>
        <DialogScrollBody className="flex flex-col items-center gap-4 py-4">
          <ShotDirectionPicker
            zones={zonesProp}
            stadiumSrc={stadiumSrc}
            onSelect={onSelect}
            className="max-h-[50vh]"
          />
        </DialogScrollBody>
      </DialogContentProfile>
    </Dialog>
  );
}
